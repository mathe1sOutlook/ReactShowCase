import React, {useRef, useState} from 'react';
import {
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Colors, Radius} from '../theme';
import {SectionWrapper} from '../components/common/SectionWrapper';
import {ScreenContainer} from '../components/common/ScreenContainer';

interface Point {
  x: number;
  y: number;
}
interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

function DrawingCanvas() {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [brushColor, setBrushColor] = useState(Colors.primary);
  const [brushWidth, setBrushWidth] = useState(3);

  const colors = [Colors.primary, '#ef4444', '#10b981', '#f59e0b', Colors.accent, '#1a1a1a'];
  const widths = [2, 3, 5, 8];

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: evt => {
        const {locationX, locationY} = evt.nativeEvent;
        const newStroke: Stroke = {
          points: [{x: locationX, y: locationY}],
          color: brushColor,
          width: brushWidth,
        };
        setCurrentStroke(newStroke);
      },
      onPanResponderMove: evt => {
        const {locationX, locationY} = evt.nativeEvent;
        setCurrentStroke(prev => {
          if (!prev) return null;
          return {
            ...prev,
            points: [...prev.points, {x: locationX, y: locationY}],
          };
        });
      },
      onPanResponderRelease: () => {
        setCurrentStroke(prev => {
          if (prev) {
            setStrokes(s => [...s, prev]);
          }
          return null;
        });
      },
    }),
  ).current;

  const allStrokes = currentStroke
    ? [...strokes, currentStroke]
    : strokes;

  return (
    <SectionWrapper
      title="Drawing Canvas"
      subtitle="PanResponder-based drawing with color and brush controls">
      {/* Toolbar */}
      <View style={styles.canvasToolbar}>
        <View style={styles.canvasToolGroup}>
          <Text style={styles.canvasToolLabel}>Color:</Text>
          {colors.map(c => (
            <Pressable
              key={c}
              onPress={() => setBrushColor(c)}
              style={[
                styles.canvasColorBtn,
                {backgroundColor: c},
                brushColor === c && styles.canvasColorBtnActive,
              ]}
            />
          ))}
        </View>
        <View style={styles.canvasToolGroup}>
          <Text style={styles.canvasToolLabel}>Size:</Text>
          {widths.map(w => (
            <Pressable
              key={w}
              onPress={() => setBrushWidth(w)}
              style={[
                styles.canvasSizeBtn,
                brushWidth === w && styles.canvasSizeBtnActive,
              ]}>
              <View
                style={[
                  styles.canvasSizeDot,
                  {
                    width: w * 2 + 4,
                    height: w * 2 + 4,
                    borderRadius: w + 2,
                    backgroundColor:
                      brushWidth === w ? Colors.primary : Colors.textSecondary,
                  },
                ]}
              />
            </Pressable>
          ))}
        </View>
        <Pressable
          onPress={() => {
            setStrokes([]);
            setCurrentStroke(null);
          }}
          style={styles.canvasClearBtn}>
          <Text style={styles.canvasClearText}>Clear</Text>
        </Pressable>
      </View>
      {/* Canvas */}
      <View style={styles.canvasContainer} {...panResponder.panHandlers}>
        <View style={styles.canvasInner}>
          {/* Grid dots for visual reference */}
          {Array.from({length: 8}, (_, row) =>
            Array.from({length: 12}, (_, col) => (
              <View
                key={`${row}-${col}`}
                style={[
                  styles.canvasGridDot,
                  {
                    left: (col + 1) * (100 / 13) + '%' as any,
                    top: (row + 1) * (100 / 9) + '%' as any,
                  },
                ]}
              />
            )),
          )}
          {/* Render strokes as series of dots */}
          {allStrokes.map((stroke, si) =>
            stroke.points.map((point, pi) => (
              <View
                key={`${si}-${pi}`}
                style={[
                  styles.canvasDot,
                  {
                    left: point.x - stroke.width,
                    top: point.y - stroke.width,
                    width: stroke.width * 2,
                    height: stroke.width * 2,
                    borderRadius: stroke.width,
                    backgroundColor: stroke.color,
                  },
                ]}
              />
            )),
          )}
          {strokes.length === 0 && !currentStroke && (
            <View style={styles.canvasPlaceholder}>
              <Text style={styles.canvasPlaceholderIcon}>~</Text>
              <Text style={styles.canvasPlaceholderText}>
                Draw here with mouse or touch
              </Text>
            </View>
          )}
        </View>
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
  canvasToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  canvasToolGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  canvasToolLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginRight: 4,
  },
  canvasColorBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  canvasColorBtnActive: {
    borderColor: Colors.textPrimary,
    borderWidth: 3,
  },
  canvasSizeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  canvasSizeBtnActive: {
    backgroundColor: Colors.primary + '15',
  },
  canvasSizeDot: {
    borderRadius: 10,
  },
  canvasClearBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#ef444415',
    marginLeft: 'auto',
  },
  canvasClearText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  canvasContainer: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  canvasInner: {
    height: 250,
    position: 'relative',
    overflow: 'hidden',
  },
  canvasGridDot: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  canvasDot: {
    position: 'absolute',
  },
  canvasPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvasPlaceholderIcon: {
    fontSize: 40,
    color: 'rgba(0,0,0,0.08)',
    marginBottom: 8,
  },
  canvasPlaceholderText: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.2)',
    fontWeight: '500',
  },
});
