import React, {useRef, useState} from 'react';
import {
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, {
  Circle,
  Line,
  Path,
  Polygon,
  Rect,
  Text as SvgText,
  SvgXml,
} from 'react-native-svg';
import {SectionWrapper} from '../components/common/SectionWrapper';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {Colors, Radius, Spacing, Typography, fluentShadow} from '../theme';

const CANVAS_HEIGHT = 320;
const GRID_SIZE = 24;
const SNAPSHOT_LIMIT = 3;

type Tool = 'draw' | 'text' | 'rect' | 'circle' | 'line' | 'arrow';
type BackgroundPreset = 'blank' | 'blueprint' | 'sunrise' | 'poster';

type Point = {
  x: number;
  y: number;
};

type CanvasSize = {
  width: number;
  height: number;
};

type StrokeElement = {
  id: string;
  kind: 'stroke';
  color: string;
  width: number;
  points: Point[];
};

type ShapeElement = {
  id: string;
  kind: 'shape';
  shape: Exclude<Tool, 'draw' | 'text'>;
  color: string;
  width: number;
  start: Point;
  end: Point;
};

type TextElement = {
  id: string;
  kind: 'text';
  color: string;
  fontSize: number;
  point: Point;
  value: string;
};

type CanvasElement = StrokeElement | ShapeElement | TextElement;

type Snapshot = {
  id: string;
  label: string;
  xml: string;
};

const TOOL_OPTIONS: Array<{id: Tool; label: string; hint: string}> = [
  {id: 'draw', label: 'Pencil', hint: 'Freehand lines and single-point dots.'},
  {id: 'text', label: 'Text', hint: 'Tap the stage to place the current label.'},
  {id: 'rect', label: 'Rect', hint: 'Drag diagonally to size a rectangle.'},
  {id: 'circle', label: 'Circle', hint: 'Drag a box and fit a circle inside it.'},
  {id: 'line', label: 'Line', hint: 'Drag from the first anchor to the last point.'},
  {id: 'arrow', label: 'Arrow', hint: 'Great for annotating background images.'},
];

const BACKGROUND_OPTIONS: Array<{id: BackgroundPreset; label: string}> = [
  {id: 'blank', label: 'Blank'},
  {id: 'blueprint', label: 'Blueprint'},
  {id: 'sunrise', label: 'Sunrise'},
  {id: 'poster', label: 'Poster'},
];

const PALETTE = [
  Colors.primary,
  Colors.secondary,
  Colors.accent,
  Colors.success,
  Colors.warning,
  Colors.error,
  '#ff7a00',
  Colors.textPrimary,
];

const BRUSH_SIZES = [2, 4, 6, 10];

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function clampValue(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function roundValue(value: number) {
  return Number(value.toFixed(1));
}

function clampPoint(point: Point, size: CanvasSize): Point {
  return {
    x: clampValue(point.x, 0, size.width),
    y: clampValue(point.y, 0, size.height),
  };
}

function snapPoint(point: Point, enabled: boolean): Point {
  if (!enabled) {
    return point;
  }

  return {
    x: Math.round(point.x / GRID_SIZE) * GRID_SIZE,
    y: Math.round(point.y / GRID_SIZE) * GRID_SIZE,
  };
}

function samePoint(a: Point | undefined, b: Point) {
  if (!a) {
    return false;
  }

  return Math.abs(a.x - b.x) < 0.5 && Math.abs(a.y - b.y) < 0.5;
}

function buildStrokePath(points: Point[]) {
  return points
    .map((point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${command} ${roundValue(point.x)} ${roundValue(point.y)}`;
    })
    .join(' ');
}

function getRectMetrics(start: Point, end: Point) {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
  };
}

function getCircleMetrics(start: Point, end: Point) {
  const rect = getRectMetrics(start, end);
  const radius = Math.max(2, Math.min(rect.width, rect.height) / 2);

  return {
    cx: rect.x + rect.width / 2,
    cy: rect.y + rect.height / 2,
    radius,
  };
}

function getArrowHeadPoints(start: Point, end: Point, width: number) {
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const length = Math.max(12, width * 3.2);
  const spread = length * 0.55;

  const left = {
    x: end.x - length * Math.cos(angle) + spread * Math.sin(angle),
    y: end.y - length * Math.sin(angle) - spread * Math.cos(angle),
  };
  const right = {
    x: end.x - length * Math.cos(angle) - spread * Math.sin(angle),
    y: end.y - length * Math.sin(angle) + spread * Math.cos(angle),
  };

  return `${roundValue(end.x)},${roundValue(end.y)} ${roundValue(left.x)},${roundValue(left.y)} ${roundValue(right.x)},${roundValue(right.y)}`;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildGridPositions(limit: number) {
  return Array.from({length: Math.ceil(limit / GRID_SIZE) + 1}, (_, index) => ({
    position: index * GRID_SIZE,
    strong: index % 4 === 0,
  }));
}

function buildBackgroundMarkup(
  background: BackgroundPreset,
  size: CanvasSize,
  fill: string,
) {
  const width = roundValue(size.width);
  const height = roundValue(size.height);

  if (background === 'blank') {
    return `<rect x="0" y="0" width="${width}" height="${height}" fill="${fill}" />`;
  }

  if (background === 'blueprint') {
    return `
      <defs>
        <linearGradient id="bgBlueprint" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#081224" />
          <stop offset="100%" stop-color="#10294f" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${width}" height="${height}" fill="url(#bgBlueprint)" />
      <circle cx="${roundValue(width * 0.82)}" cy="${roundValue(height * 0.2)}" r="${roundValue(Math.min(width, height) * 0.11)}" fill="#6ee7ff" fill-opacity="0.14" />
      <path d="M 0 ${roundValue(height * 0.76)} Q ${roundValue(width * 0.25)} ${roundValue(height * 0.56)} ${roundValue(width * 0.52)} ${roundValue(height * 0.74)} T ${width} ${roundValue(height * 0.62)}" fill="none" stroke="#8be9fd" stroke-width="6" stroke-opacity="0.12" />
      <path d="M ${roundValue(width * 0.08)} ${roundValue(height * 0.14)} L ${roundValue(width * 0.3)} ${roundValue(height * 0.14)}" stroke="#8be9fd" stroke-width="2" stroke-opacity="0.25" />
      <path d="M ${roundValue(width * 0.08)} ${roundValue(height * 0.18)} L ${roundValue(width * 0.24)} ${roundValue(height * 0.18)}" stroke="#8be9fd" stroke-width="2" stroke-opacity="0.16" />
    `;
  }

  if (background === 'sunrise') {
    return `
      <defs>
        <linearGradient id="bgSunrise" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2a1143" />
          <stop offset="55%" stop-color="#ff7a59" />
          <stop offset="100%" stop-color="#ffd36b" />
        </linearGradient>
        <linearGradient id="bgHaze" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0" />
          <stop offset="50%" stop-color="#ffffff" stop-opacity="0.18" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${width}" height="${height}" fill="url(#bgSunrise)" />
      <circle cx="${roundValue(width * 0.8)}" cy="${roundValue(height * 0.24)}" r="${roundValue(Math.min(width, height) * 0.11)}" fill="#fff4c2" fill-opacity="0.72" />
      <path d="M 0 ${roundValue(height * 0.7)} Q ${roundValue(width * 0.2)} ${roundValue(height * 0.62)} ${roundValue(width * 0.45)} ${roundValue(height * 0.7)} T ${width} ${roundValue(height * 0.64)} L ${width} ${height} L 0 ${height} Z" fill="#25152f" fill-opacity="0.35" />
      <rect x="0" y="${roundValue(height * 0.38)}" width="${width}" height="${roundValue(height * 0.22)}" fill="url(#bgHaze)" />
    `;
  }

  return `
    <defs>
      <linearGradient id="bgPoster" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#17141f" />
        <stop offset="100%" stop-color="#261a45" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${width}" height="${height}" fill="url(#bgPoster)" />
    <rect x="${roundValue(width * -0.08)}" y="${roundValue(height * 0.08)}" width="${roundValue(width * 0.46)}" height="${roundValue(height * 1.05)}" fill="#6d28d9" fill-opacity="0.28" transform="rotate(-12 ${roundValue(width * 0.15)} ${roundValue(height * 0.55)})" />
    <rect x="${roundValue(width * 0.54)}" y="${roundValue(height * -0.05)}" width="${roundValue(width * 0.34)}" height="${roundValue(height * 0.92)}" fill="#06b6d4" fill-opacity="0.2" transform="rotate(10 ${roundValue(width * 0.7)} ${roundValue(height * 0.4)})" />
    <circle cx="${roundValue(width * 0.76)}" cy="${roundValue(height * 0.24)}" r="${roundValue(Math.min(width, height) * 0.14)}" fill="#ffffff" fill-opacity="0.08" />
    <path d="M ${roundValue(width * 0.08)} ${roundValue(height * 0.78)} L ${roundValue(width * 0.34)} ${roundValue(height * 0.78)}" stroke="#ffffff" stroke-width="4" stroke-opacity="0.25" />
  `;
}

function buildBackgroundSvg(
  background: BackgroundPreset,
  size: CanvasSize,
  fill: string,
) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${roundValue(size.width)}" height="${roundValue(size.height)}" viewBox="0 0 ${roundValue(size.width)} ${roundValue(size.height)}">
      ${buildBackgroundMarkup(background, size, fill)}
    </svg>
  `;
}

function buildGridMarkup(
  size: CanvasSize,
  stroke: string,
  strongStroke: string,
) {
  const vertical = buildGridPositions(size.width)
    .map(
      line => `
        <line x1="${roundValue(line.position)}" y1="0" x2="${roundValue(line.position)}" y2="${roundValue(size.height)}" stroke="${line.strong ? strongStroke : stroke}" stroke-width="1" stroke-opacity="${line.strong ? 0.28 : 0.14}" />
      `,
    )
    .join('');

  const horizontal = buildGridPositions(size.height)
    .map(
      line => `
        <line x1="0" y1="${roundValue(line.position)}" x2="${roundValue(size.width)}" y2="${roundValue(line.position)}" stroke="${line.strong ? strongStroke : stroke}" stroke-width="1" stroke-opacity="${line.strong ? 0.28 : 0.14}" />
      `,
    )
    .join('');

  return vertical + horizontal;
}

function renderCanvasElement(element: CanvasElement) {
  if (element.kind === 'stroke') {
    if (element.points.length < 2) {
      const point = element.points[0];

      return (
        <Circle
          key={element.id}
          cx={point.x}
          cy={point.y}
          r={element.width / 2}
          fill={element.color}
        />
      );
    }

    return (
      <Path
        key={element.id}
        d={buildStrokePath(element.points)}
        fill="none"
        stroke={element.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={element.width}
      />
    );
  }

  if (element.kind === 'text') {
    return (
      <SvgText
        key={element.id}
        x={element.point.x}
        y={element.point.y}
        fill={element.color}
        fontSize={element.fontSize}
        fontWeight="700">
        {element.value}
      </SvgText>
    );
  }

  if (element.shape === 'rect') {
    const rect = getRectMetrics(element.start, element.end);

    return (
      <Rect
        key={element.id}
        x={rect.x}
        y={rect.y}
        width={rect.width}
        height={rect.height}
        rx={10}
        fill="none"
        stroke={element.color}
        strokeWidth={element.width}
      />
    );
  }

  if (element.shape === 'circle') {
    const circle = getCircleMetrics(element.start, element.end);

    return (
      <Circle
        key={element.id}
        cx={circle.cx}
        cy={circle.cy}
        r={circle.radius}
        fill="none"
        stroke={element.color}
        strokeWidth={element.width}
      />
    );
  }

  if (element.shape === 'line') {
    return (
      <Line
        key={element.id}
        x1={element.start.x}
        y1={element.start.y}
        x2={element.end.x}
        y2={element.end.y}
        stroke={element.color}
        strokeLinecap="round"
        strokeWidth={element.width}
      />
    );
  }

  return (
    <React.Fragment key={element.id}>
      <Line
        x1={element.start.x}
        y1={element.start.y}
        x2={element.end.x}
        y2={element.end.y}
        stroke={element.color}
        strokeLinecap="round"
        strokeWidth={element.width}
      />
      <Polygon points={getArrowHeadPoints(element.start, element.end, element.width)} fill={element.color} />
    </React.Fragment>
  );
}

function buildElementMarkup(element: CanvasElement) {
  if (element.kind === 'stroke') {
    if (element.points.length < 2) {
      const point = element.points[0];

      return `<circle cx="${roundValue(point.x)}" cy="${roundValue(point.y)}" r="${roundValue(element.width / 2)}" fill="${element.color}" />`;
    }

    return `<path d="${buildStrokePath(element.points)}" fill="none" stroke="${element.color}" stroke-width="${element.width}" stroke-linecap="round" stroke-linejoin="round" />`;
  }

  if (element.kind === 'text') {
    return `<text x="${roundValue(element.point.x)}" y="${roundValue(element.point.y)}" fill="${element.color}" font-size="${roundValue(element.fontSize)}" font-weight="700">${escapeXml(element.value)}</text>`;
  }

  if (element.shape === 'rect') {
    const rect = getRectMetrics(element.start, element.end);

    return `<rect x="${roundValue(rect.x)}" y="${roundValue(rect.y)}" width="${roundValue(rect.width)}" height="${roundValue(rect.height)}" rx="10" fill="none" stroke="${element.color}" stroke-width="${element.width}" />`;
  }

  if (element.shape === 'circle') {
    const circle = getCircleMetrics(element.start, element.end);

    return `<circle cx="${roundValue(circle.cx)}" cy="${roundValue(circle.cy)}" r="${roundValue(circle.radius)}" fill="none" stroke="${element.color}" stroke-width="${element.width}" />`;
  }

  if (element.shape === 'line') {
    return `<line x1="${roundValue(element.start.x)}" y1="${roundValue(element.start.y)}" x2="${roundValue(element.end.x)}" y2="${roundValue(element.end.y)}" stroke="${element.color}" stroke-width="${element.width}" stroke-linecap="round" />`;
  }

  return `
    <line x1="${roundValue(element.start.x)}" y1="${roundValue(element.start.y)}" x2="${roundValue(element.end.x)}" y2="${roundValue(element.end.y)}" stroke="${element.color}" stroke-width="${element.width}" stroke-linecap="round" />
    <polygon points="${getArrowHeadPoints(element.start, element.end, element.width)}" fill="${element.color}" />
  `;
}

function buildSceneSvg(
  size: CanvasSize,
  background: BackgroundPreset,
  elements: CanvasElement[],
  showGrid: boolean,
  fill: string,
  gridStroke: string,
  strongStroke: string,
) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${roundValue(size.width)}" height="${roundValue(size.height)}" viewBox="0 0 ${roundValue(size.width)} ${roundValue(size.height)}">
      ${buildBackgroundMarkup(background, size, fill)}
      ${showGrid ? buildGridMarkup(size, gridStroke, strongStroke) : ''}
      ${elements.map(buildElementMarkup).join('')}
    </svg>
  `;
}

function DrawingCanvas() {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [redoStack, setRedoStack] = useState<CanvasElement[]>([]);
  const [draftElement, setDraftElement] = useState<StrokeElement | ShapeElement | null>(null);
  const [tool, setTool] = useState<Tool>('draw');
  const [brushColor, setBrushColor] = useState(Colors.primary);
  const [brushSize, setBrushSize] = useState(4);
  const [textValue, setTextValue] = useState('React Native');
  const [background, setBackground] = useState<BackgroundPreset>('blank');
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [stageSize, setStageSize] = useState<CanvasSize>({
    width: 0,
    height: CANVAS_HEIGHT,
  });
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const toolRef = useRef(tool);
  const brushColorRef = useRef(brushColor);
  const brushSizeRef = useRef(brushSize);
  const textValueRef = useRef(textValue);
  const snapToGridRef = useRef(snapToGrid);
  const stageSizeRef = useRef(stageSize);
  const draftElementRef = useRef<StrokeElement | ShapeElement | null>(null);

  toolRef.current = tool;
  brushColorRef.current = brushColor;
  brushSizeRef.current = brushSize;
  textValueRef.current = textValue;
  snapToGridRef.current = snapToGrid;
  stageSizeRef.current = stageSize;

  const gridStroke = Colors.borderLight;
  const strongGridStroke = Colors.primary;
  const currentTool = TOOL_OPTIONS.find(option => option.id === tool) ?? TOOL_OPTIONS[0];
  const drawableElements = draftElement ? [...elements, draftElement] : elements;
  const canSave = stageSize.width > 0 && (elements.length > 0 || background !== 'blank');

  const commitElement = (element: CanvasElement) => {
    setElements(prev => [...prev, element]);
    setRedoStack([]);
  };

  const getCanvasPoint = (locationX: number, locationY: number) => {
    const clamped = clampPoint({x: locationX, y: locationY}, stageSizeRef.current);
    return snapPoint(clamped, snapToGridRef.current);
  };

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: event => {
      const activeTool = toolRef.current;
      const point = getCanvasPoint(
        event.nativeEvent.locationX,
        event.nativeEvent.locationY,
      );

      if (activeTool === 'draw') {
        const stroke: StrokeElement = {
          id: createId('stroke'),
          kind: 'stroke',
          color: brushColorRef.current,
          width: brushSizeRef.current,
          points: [point],
        };
        draftElementRef.current = stroke;
        setDraftElement(stroke);
        return;
      }

      if (activeTool === 'text') {
        draftElementRef.current = null;
        setDraftElement(null);
        return;
      }

      const shape: ShapeElement = {
        id: createId(activeTool),
        kind: 'shape',
        shape: activeTool,
        color: brushColorRef.current,
        width: brushSizeRef.current,
        start: point,
        end: point,
      };
      draftElementRef.current = shape;
      setDraftElement(shape);
    },
    onPanResponderMove: event => {
      const point = getCanvasPoint(
        event.nativeEvent.locationX,
        event.nativeEvent.locationY,
      );

      setDraftElement(prev => {
        if (!prev) {
          return prev;
        }

        if (prev.kind === 'stroke') {
          if (samePoint(prev.points[prev.points.length - 1], point)) {
            return prev;
          }

          const next: StrokeElement = {
            ...prev,
            points: [...prev.points, point],
          };
          draftElementRef.current = next;
          return next;
        }

        const next: ShapeElement = {
          ...prev,
          end: point,
        };
        draftElementRef.current = next;
        return next;
      });
    },
    onPanResponderRelease: event => {
      const activeTool = toolRef.current;
      const point = getCanvasPoint(
        event.nativeEvent.locationX,
        event.nativeEvent.locationY,
      );

      if (activeTool === 'text') {
        commitElement({
          id: createId('text'),
          kind: 'text',
          color: brushColorRef.current,
          fontSize: brushSizeRef.current * 3 + 10,
          point,
          value: textValueRef.current.trim() || 'Label',
        });
        draftElementRef.current = null;
        setDraftElement(null);
        return;
      }

      if (draftElementRef.current?.kind === 'stroke') {
        commitElement(draftElementRef.current);
      }

      if (draftElementRef.current?.kind === 'shape') {
        commitElement({
          ...draftElementRef.current,
          end: point,
        });
      }

      draftElementRef.current = null;
      setDraftElement(null);
    },
    onPanResponderTerminate: () => {
      draftElementRef.current = null;
      setDraftElement(null);
    },
  })).current;

  const saveSnapshot = () => {
    if (!canSave) {
      return;
    }

    setSnapshots(prev => [
      {
        id: createId('snapshot'),
        label: `SVG ${new Date().toLocaleTimeString()}`,
        xml: buildSceneSvg(
          stageSize,
          background,
          elements,
          showGrid,
          Colors.bgCardAlt,
          gridStroke,
          strongGridStroke,
        ),
      },
      ...prev,
    ].slice(0, SNAPSHOT_LIMIT));
  };

  const undo = () => {
    if (!elements.length) {
      return;
    }

    const next = [...elements];
    const last = next.pop();
    if (!last) {
      return;
    }

    setElements(next);
    setRedoStack(prev => [last, ...prev]);
  };

  const redo = () => {
    if (!redoStack.length) {
      return;
    }

    const [restored, ...remaining] = redoStack;
    setRedoStack(remaining);
    setElements(prev => [...prev, restored]);
  };

  const clearStage = () => {
    setElements([]);
    setRedoStack([]);
    draftElementRef.current = null;
    setDraftElement(null);
  };

  return (
    <SectionWrapper
      title="Canvas Studio"
      subtitle="SVG sketch pad with undo/redo, text, shapes, saved previews, and background overlays.">
      <View style={styles.card}>
        <Text style={styles.groupTitle}>Tooling</Text>
        <View style={styles.wrapRow}>
          {TOOL_OPTIONS.map(option => (
            <Pressable
              key={option.id}
              onPress={() => setTool(option.id)}
              style={[
                styles.pillButton,
                tool === option.id && styles.pillButtonActive,
              ]}>
              <Text
                style={[
                  styles.pillButtonText,
                  tool === option.id && styles.pillButtonTextActive,
                ]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.helperText}>{currentTool.hint}</Text>

        <Text style={styles.groupTitle}>Ink & Text</Text>
        <View style={styles.wrapRow}>
          {PALETTE.map(color => (
            <Pressable
              key={color}
              onPress={() => setBrushColor(color)}
              style={[
                styles.colorSwatch,
                {backgroundColor: color},
                brushColor === color && styles.colorSwatchActive,
              ]}
            />
          ))}
        </View>
        <View style={styles.wrapRow}>
          {BRUSH_SIZES.map(size => (
            <Pressable
              key={size}
              onPress={() => setBrushSize(size)}
              style={[
                styles.sizeButton,
                brushSize === size && styles.sizeButtonActive,
              ]}>
              <View
                style={[
                  styles.sizeDot,
                  {
                    width: size * 2,
                    height: size * 2,
                    borderRadius: size,
                    backgroundColor:
                      brushSize === size ? Colors.primary : Colors.textSecondary,
                  },
                ]}
              />
              <Text style={styles.sizeLabel}>{size}px</Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          value={textValue}
          onChangeText={setTextValue}
          maxLength={24}
          placeholder="Canvas label"
          placeholderTextColor={Colors.textMuted}
          style={styles.textInput}
        />

        <Text style={styles.groupTitle}>Background Image</Text>
        <View style={styles.backgroundGrid}>
          {BACKGROUND_OPTIONS.map(option => (
            <Pressable
              key={option.id}
              onPress={() => setBackground(option.id)}
              style={[
                styles.backgroundCard,
                background === option.id && styles.backgroundCardActive,
              ]}>
              <View style={styles.backgroundPreview}>
                <SvgXml
                  xml={buildBackgroundSvg(
                    option.id,
                    {width: 120, height: 72},
                    Colors.bgCardAlt,
                  )}
                  width={120}
                  height={72}
                />
              </View>
              <Text style={styles.backgroundLabel}>{option.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.wrapRow}>
          <Pressable
            onPress={() => setShowGrid(value => !value)}
            style={[
              styles.toggleButton,
              showGrid && styles.toggleButtonActive,
            ]}>
            <Text
              style={[
                styles.toggleButtonText,
                showGrid && styles.toggleButtonTextActive,
              ]}>
              Grid
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setSnapToGrid(value => {
                const next = !value;
                if (next) {
                  setShowGrid(true);
                }
                return next;
              });
            }}
            style={[
              styles.toggleButton,
              snapToGrid && styles.toggleButtonActive,
            ]}>
            <Text
              style={[
                styles.toggleButtonText,
                snapToGrid && styles.toggleButtonTextActive,
              ]}>
              Snap to grid
            </Text>
          </Pressable>
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            onPress={undo}
            disabled={!elements.length}
            style={[
              styles.actionButton,
              !elements.length && styles.actionButtonDisabled,
            ]}>
            <Text style={styles.actionButtonText}>Undo</Text>
          </Pressable>
          <Pressable
            onPress={redo}
            disabled={!redoStack.length}
            style={[
              styles.actionButton,
              !redoStack.length && styles.actionButtonDisabled,
            ]}>
            <Text style={styles.actionButtonText}>Redo</Text>
          </Pressable>
          <Pressable onPress={clearStage} style={styles.secondaryActionButton}>
            <Text style={styles.secondaryActionText}>Clear</Text>
          </Pressable>
          <Pressable
            onPress={saveSnapshot}
            disabled={!canSave}
            style={[
              styles.primaryActionButton,
              !canSave && styles.actionButtonDisabled,
            ]}>
            <Text style={styles.primaryActionText}>Save Image</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.metricsRow}>
          <View style={styles.metricChip}>
            <Text style={styles.metricLabel}>Elements</Text>
            <Text style={styles.metricValue}>{elements.length}</Text>
          </View>
          <View style={styles.metricChip}>
            <Text style={styles.metricLabel}>Background</Text>
            <Text style={styles.metricValue}>
              {BACKGROUND_OPTIONS.find(option => option.id === background)?.label}
            </Text>
          </View>
          <View style={styles.metricChip}>
            <Text style={styles.metricLabel}>Snap</Text>
            <Text style={styles.metricValue}>{snapToGrid ? 'On' : 'Off'}</Text>
          </View>
        </View>

        <View
          style={styles.canvasFrame}
          onLayout={event => {
            const nextSize = {
              width: event.nativeEvent.layout.width,
              height: CANVAS_HEIGHT,
            };
            stageSizeRef.current = nextSize;
            setStageSize(nextSize);
          }}
          {...panResponder.panHandlers}>
          {stageSize.width > 0 && (
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
              <SvgXml
                xml={buildBackgroundSvg(background, stageSize, Colors.bgCardAlt)}
                width={stageSize.width}
                height={stageSize.height}
              />
            </View>
          )}

          {stageSize.width > 0 && (
            <Svg
              pointerEvents="none"
              width={stageSize.width}
              height={stageSize.height}
              style={StyleSheet.absoluteFill}>
              {showGrid &&
                buildGridPositions(stageSize.width).map(line => (
                  <Line
                    key={`v-${line.position}`}
                    x1={line.position}
                    y1={0}
                    x2={line.position}
                    y2={stageSize.height}
                    stroke={line.strong ? strongGridStroke : gridStroke}
                    strokeOpacity={line.strong ? 0.28 : 0.14}
                    strokeWidth={1}
                  />
                ))}
              {showGrid &&
                buildGridPositions(stageSize.height).map(line => (
                  <Line
                    key={`h-${line.position}`}
                    x1={0}
                    y1={line.position}
                    x2={stageSize.width}
                    y2={line.position}
                    stroke={line.strong ? strongGridStroke : gridStroke}
                    strokeOpacity={line.strong ? 0.28 : 0.14}
                    strokeWidth={1}
                  />
                ))}
              {drawableElements.map(renderCanvasElement)}
            </Svg>
          )}

          {!drawableElements.length && (
            <View pointerEvents="none" style={styles.placeholder}>
              <Text style={styles.placeholderTitle}>Tap or drag to create</Text>
              <Text style={styles.placeholderText}>
                Pencil, text, shapes, grid snap, and background image tracing.
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.canvasFootnote}>
          "Save Image" stores an SVG snapshot preview below so you can compare
          versions without leaving the app.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.groupTitle}>Saved SVG Snapshots</Text>
        {snapshots.length > 0 ? (
          <View style={styles.snapshotGrid}>
            {snapshots.map(snapshot => (
              <View key={snapshot.id} style={styles.snapshotCard}>
                <View style={styles.snapshotPreview}>
                  <SvgXml xml={snapshot.xml} width={150} height={96} />
                </View>
                <Text style={styles.snapshotLabel}>{snapshot.label}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No exported images yet</Text>
            <Text style={styles.emptyStateText}>
              Sketch something, then save a snapshot to validate the export
              flow.
            </Text>
          </View>
        )}
      </View>
    </SectionWrapper>
  );
}

export default function CanvasScreen() {
  return (
    <ScreenContainer>
      <DrawingCanvas />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.md,
    ...fluentShadow('md'),
  },
  groupTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  helperText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: -4,
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  pillButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  pillButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '18',
  },
  pillButtonText: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  pillButtonTextActive: {
    color: Colors.primary,
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchActive: {
    borderColor: Colors.textPrimary,
    transform: [{scale: 1.08}],
  },
  sizeButton: {
    minWidth: 70,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    gap: 6,
  },
  sizeButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '12',
  },
  sizeDot: {
    minWidth: 4,
    minHeight: 4,
  },
  sizeLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  backgroundGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  backgroundCard: {
    width: 128,
    padding: 6,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
    gap: 8,
  },
  backgroundCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '12',
  },
  backgroundPreview: {
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  backgroundLabel: {
    ...Typography.caption,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  toggleButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  toggleButtonActive: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + '16',
  },
  toggleButtonText: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  toggleButtonTextActive: {
    color: Colors.success,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  actionButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  actionButtonDisabled: {
    opacity: 0.45,
  },
  actionButtonText: {
    ...Typography.label,
    color: Colors.textPrimary,
  },
  secondaryActionButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.error + '66',
    backgroundColor: Colors.error + '12',
  },
  secondaryActionText: {
    ...Typography.label,
    color: Colors.error,
  },
  primaryActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
  },
  primaryActionText: {
    ...Typography.label,
    color: Colors.white,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  metricChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
    gap: 2,
  },
  metricLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  metricValue: {
    ...Typography.label,
    color: Colors.textPrimary,
  },
  canvasFrame: {
    height: CANVAS_HEIGHT,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
    backgroundColor: Colors.bgCardAlt,
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  placeholderTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  placeholderText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  canvasFootnote: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  snapshotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  snapshotCard: {
    width: 160,
    gap: 8,
  },
  snapshotPreview: {
    width: 160,
    height: 104,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  snapshotLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  emptyState: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed',
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    gap: 4,
  },
  emptyStateTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  emptyStateText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
});
