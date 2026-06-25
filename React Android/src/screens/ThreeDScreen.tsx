import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, {Circle, Polygon, Rect} from 'react-native-svg';
import {Section} from '../components/common/Section';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {Colors, Radius, Spacing, Typography} from '../theme';
import {clamp, shadeColor} from '../utils';
import {
  createSphereMesh,
  createSurfaceMesh,
  crossProduct,
  dotProduct,
  faceCentroid,
  normalizeVector,
  parseObjMesh,
  projectVector,
  rotateVector,
  subtractVector,
  triangleArea,
  type Mesh,
  type Vector3,
} from '../utils/software3d';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const STAGE_HEIGHT = 230;
const CARD_WIDTH = Math.min(172, SCREEN_WIDTH * 0.42);

const LIGHT_PRESETS = [
  {id: 'studio', label: 'Studio', accent: Colors.primary, vector: {x: -0.55, y: 0.8, z: 1}},
  {id: 'sunset', label: 'Sunset', accent: Colors.warning, vector: {x: 1, y: 0.25, z: 0.7}},
  {id: 'neon', label: 'Neon', accent: Colors.secondary, vector: {x: -1, y: -0.15, z: 0.9}},
] as const;

type LightPresetId = (typeof LIGHT_PRESETS)[number]['id'];

const EXPLORER_OBJ = `
# explorer.obj
v 0 0 1.6
v -1.05 -0.15 0.2
v 0 0.9 0.15
v 1.05 -0.15 0.2
v 0 -0.95 0
v -0.55 0.2 -1.2
v 0.55 0.2 -1.2
v 0 0.62 -1.35
v 0 -0.4 -1.15
f 1 3 2
f 1 4 3
f 1 5 4
f 1 2 5
f 2 3 6
f 3 8 6
f 3 4 7
f 3 7 8
f 4 5 7
f 5 9 7
f 2 6 9
f 2 9 5
f 6 8 7
f 6 7 9
`;

const OBJ_MESH = parseObjMesh(EXPLORER_OBJ, 'Explorer.obj');
const SPHERE_MESH = createSphereMesh('Planet mesh');
const SURFACE_MESH = createSurfaceMesh('Shader plane');

function sampleModelColor(_: Vector3, faceIndex: number) {
  const swatches = [
    Colors.primary,
    Colors.secondary,
    Colors.accent,
    Colors.success,
    Colors.warning,
  ];

  return swatches[faceIndex % swatches.length];
}

function samplePlanetColor(point: Vector3, _: number, time: number) {
  const radius = Math.max(0.001, Math.sqrt(point.x * point.x + point.y * point.y + point.z * point.z));
  const latitude = Math.asin(point.y / radius);
  const longitude = Math.atan2(point.z, point.x) + time * 0.18;
  const band = Math.sin(longitude * 4) + Math.cos(latitude * 5);

  if (Math.abs(latitude) > 1.05) {
    return '#dbeafe';
  }

  if (band > 1.05) {
    return Colors.success;
  }

  if (band > 0.25) {
    return '#2dd4bf';
  }

  if (band < -0.7) {
    return '#f59e0b';
  }

  return Colors.primary;
}

function sampleSurfaceColor(point: Vector3, _: number, time: number) {
  const wave =
    Math.sin(point.x * 2.4 + time * 1.6) +
    Math.cos(point.z * 2.1 - time * 1.2) +
    point.y * 2.8;

  if (wave > 1.2) {
    return Colors.warning;
  }

  if (wave > 0.35) {
    return Colors.secondary;
  }

  if (wave > -0.4) {
    return Colors.accent;
  }

  return Colors.primary;
}

function deformSurface(vertex: Vector3, time: number): Vector3 {
  return {
    ...vertex,
    y:
      Math.sin(vertex.x * 2.4 + time * 1.5) * 0.24 +
      Math.cos(vertex.z * 2.1 - time * 1.2) * 0.22,
  };
}

type MeshStageProps = {
  accent: string;
  autoSpin: Vector3;
  badges: string[];
  description: string;
  faceColor: (point: Vector3, faceIndex: number, time: number) => string;
  info: string;
  initialRotation: Vector3;
  light: Vector3;
  mesh: Mesh;
  time: number;
  title: string;
  deformVertex?: (vertex: Vector3, time: number) => Vector3;
};

function MeshStage({
  accent,
  autoSpin,
  badges,
  description,
  faceColor,
  info,
  initialRotation,
  light,
  mesh,
  time,
  title,
  deformVertex,
}: MeshStageProps) {
  const [stageWidth, setStageWidth] = useState(0);
  const [manualRotation, setManualRotation] = useState(initialRotation);
  const dragOriginRef = useRef(initialRotation);
  const manualRotationRef = useRef(initialRotation);
  manualRotationRef.current = manualRotation;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) + Math.abs(gestureState.dy) > 4,
      onPanResponderGrant: () => {
        dragOriginRef.current = manualRotationRef.current;
      },
      onPanResponderMove: (_, gestureState) => {
        setManualRotation({
          x: dragOriginRef.current.x + gestureState.dy * 0.01,
          y: dragOriginRef.current.y + gestureState.dx * 0.012,
          z: dragOriginRef.current.z,
        });
      },
    }),
  ).current;

  const rotation = {
    x: manualRotation.x + autoSpin.x * time,
    y: manualRotation.y + autoSpin.y * time,
    z: manualRotation.z + autoSpin.z * time,
  };
  const normalizedLight = normalizeVector(light);
  const transformedVertices = mesh.vertices.map(vertex =>
    rotateVector(deformVertex ? deformVertex(vertex, time) : vertex, rotation),
  );
  const projectedFaces = mesh.faces
    .map((face, faceIndex) => {
      const world = face.indices.map(index => transformedVertices[index]);
      const centroid = faceCentroid(world);
      const normal = normalizeVector(
        crossProduct(
          subtractVector(world[1], world[0]),
          subtractVector(world[2], world[0]),
        ),
      );
      const projected = world.map(point =>
        projectVector(point, Math.max(stageWidth, 1), STAGE_HEIGHT, 245, 6.2),
      );
      const baseColor = faceColor(centroid, faceIndex, time);
      const brightness = clamp(
        0.22 + Math.max(0, dotProduct(normal, normalizedLight)) * 0.92,
        0.18,
        1,
      );
      const facing = triangleArea(projected) < 0 ? 1 : 0.78;

      return {
        depth: centroid.z,
        fill: shadeColor(baseColor, Math.round((brightness - 0.5) * 120)),
        opacity: clamp((0.42 + brightness * 0.55) * facing, 0.3, 0.96),
        points: projected
          .map(point => `${point.x.toFixed(1)},${point.y.toFixed(1)}`)
          .join(' '),
        stroke: shadeColor(baseColor, -72),
      };
    })
    .sort((left, right) => left.depth - right.depth);

  return (
    <View style={styles.meshCard}>
      <View style={styles.meshHeader}>
        <View style={styles.meshCopy}>
          <Text style={[styles.meshTitle, {color: accent}]}>{title}</Text>
          <Text style={styles.meshDescription}>{description}</Text>
        </View>
        <View style={[styles.meshBadge, {backgroundColor: accent + '22'}]}>
          <Text style={[styles.meshBadgeText, {color: accent}]}>
            {mesh.faces.length} faces
          </Text>
        </View>
      </View>

      <View style={styles.meshBadgesRow}>
        {badges.map(badge => (
          <View key={badge} style={styles.infoPill}>
            <Text style={styles.infoPillText}>{badge}</Text>
          </View>
        ))}
      </View>

      <View
        style={styles.stageFrame}
        onLayout={event => {
          setStageWidth(event.nativeEvent.layout.width);
        }}
        {...panResponder.panHandlers}>
        {stageWidth > 0 && (
          <Svg width={stageWidth} height={STAGE_HEIGHT} style={StyleSheet.absoluteFill}>
            <Rect
              x={0}
              y={0}
              width={stageWidth}
              height={STAGE_HEIGHT}
              fill={Colors.bgCardAlt}
            />
            <Circle
              cx={stageWidth * 0.2}
              cy={STAGE_HEIGHT * 0.22}
              r={54}
              fill={accent}
              opacity={0.08}
            />
            <Circle
              cx={stageWidth * 0.78}
              cy={STAGE_HEIGHT * 0.76}
              r={72}
              fill={Colors.secondary}
              opacity={0.06}
            />
            {projectedFaces.map((face, index) => (
              <Polygon
                key={`${title}-${index}`}
                points={face.points}
                fill={face.fill}
                fillOpacity={face.opacity}
                stroke={face.stroke}
                strokeOpacity={0.55}
                strokeWidth={0.9}
                strokeLinejoin="round"
              />
            ))}
          </Svg>
        )}
        <View pointerEvents="none" style={styles.stageOverlay}>
          <Text style={styles.stageHint}>Drag to orbit</Text>
        </View>
      </View>

      <Text style={styles.meshInfo}>{info}</Text>
    </View>
  );
}

function Card3D({
  title,
  color,
  emoji,
}: {
  title: string;
  color: string;
  emoji: string;
}) {
  const rotateX = useRef(new Animated.Value(0)).current;
  const rotateY = useRef(new Animated.Value(0)).current;
  const autoRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(autoRotate, {
        toValue: 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [autoRotate]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        rotateY.setValue(gestureState.dx * 0.5);
        rotateX.setValue(-gestureState.dy * 0.5);
      },
      onPanResponderRelease: () => {
        Animated.parallel([
          Animated.spring(rotateX, {
            toValue: 0,
            tension: 40,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.spring(rotateY, {
            toValue: 0,
            tension: 40,
            friction: 7,
            useNativeDriver: true,
          }),
        ]).start();
      },
    }),
  ).current;

  const rotXStr = rotateX.interpolate({
    inputRange: [-180, 180],
    outputRange: ['-30deg', '30deg'],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.card3d,
        {borderColor: color + '55'},
        {
          transform: [
            {perspective: 800},
            {rotateX: rotXStr},
            {
              rotateY: Animated.add(
                rotateY.interpolate({
                  inputRange: [-180, 180],
                  outputRange: [-30, 30],
                  extrapolate: 'clamp',
                }),
                autoRotate.interpolate({
                  inputRange: [0, 0.25, 0.5, 0.75, 1],
                  outputRange: [0, 8, 0, -8, 0],
                }),
              ).interpolate({
                inputRange: [-38, 38],
                outputRange: ['-38deg', '38deg'],
              }),
            },
          ],
        },
      ]}>
      <Text style={styles.card3dEmoji}>{emoji}</Text>
      <Text style={[styles.card3dTitle, {color}]}>{title}</Text>
      <View style={[styles.card3dLine, {backgroundColor: color}]} />
      <Text style={styles.card3dHint}>Drag to rotate</Text>
    </Animated.View>
  );
}

function TransformationsSection() {
  return (
    <Section title="3D Transformations">
      <Text style={styles.hintText}>Touch-driven perspective cards with depth.</Text>
      <View style={styles.card3dRow}>
        <Card3D title="Depth" color={Colors.primary} emoji={'\u{1F30A}'} />
        <Card3D title="Orbit" color={Colors.secondary} emoji={'\u{1F680}'} />
      </View>
      <View style={styles.card3dRow}>
        <Card3D title="Prism" color={Colors.accent} emoji={'\u{1F48E}'} />
        <Card3D title="Pulse" color={Colors.success} emoji={'\u{26A1}'} />
      </View>
    </Section>
  );
}

function Software3DSection() {
  const [time, setTime] = useState(0);
  const [activeLight, setActiveLight] = useState<LightPresetId>('studio');

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(previous => previous + 0.06);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const lightPreset =
    LIGHT_PRESETS.find(preset => preset.id === activeLight) ?? LIGHT_PRESETS[0];

  return (
    <Section title="Software 3D Lab">
      <Text style={styles.sectionCopy}>
        SVG fallback renderer with OBJ parsing, lighting presets, textured
        sphere shading, and a procedural shader-like surface.
      </Text>

      <View style={styles.noticeCard}>
        <Text style={styles.noticeTitle}>GL fallback active</Text>
        <Text style={styles.noticeText}>
          The native WebGL bridge is still pending on some targets, so this
          phase is rendered in JS + SVG to keep the mobile showcase consistent.
        </Text>
      </View>

      <View style={styles.lightRow}>
        {LIGHT_PRESETS.map(preset => (
          <Pressable
            key={preset.id}
            onPress={() => setActiveLight(preset.id)}
            style={[
              styles.lightChip,
              activeLight === preset.id && {
                borderColor: preset.accent,
                backgroundColor: preset.accent + '1a',
              },
            ]}>
            <Text
              style={[
                styles.lightChipText,
                activeLight === preset.id && {color: preset.accent},
              ]}>
              {preset.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <MeshStage
        accent={Colors.primary}
        autoSpin={{x: 0.18, y: 0.95, z: 0}}
        badges={['OBJ parser', 'Touch orbit', lightPreset.label]}
        description="Embedded OBJ source parsed and projected into SVG polygons."
        faceColor={sampleModelColor}
        info="Perspective projection + Lambert shading without a native GL runtime."
        initialRotation={{x: -0.35, y: 0.45, z: 0}}
        light={lightPreset.vector}
        mesh={OBJ_MESH}
        time={time}
        title="OBJ Model Viewer"
      />

      <MeshStage
        accent={Colors.secondary}
        autoSpin={{x: 0.12, y: 0.72, z: 0}}
        badges={['Sphere mesh', 'Procedural texture', lightPreset.label]}
        description="Latitude/longitude sphere with animated texture bands and rim shading."
        faceColor={samplePlanetColor}
        info="The color sampler acts like a texture map while the shared light preset drives the highlights."
        initialRotation={{x: 0.22, y: -0.3, z: 0}}
        light={lightPreset.vector}
        mesh={SPHERE_MESH}
        time={time}
        title="Textured Sphere"
      />

      <MeshStage
        accent={Colors.accent}
        autoSpin={{x: -0.28, y: 0.58, z: 0.12}}
        badges={['Wave mesh', 'Shader-like color', 'Lighting']}
        description="A deformed surface grid with procedural color sampling and animated motion."
        faceColor={sampleSurfaceColor}
        info="This is a software shader fallback: wave deformation + custom color logic per face."
        initialRotation={{x: -0.8, y: 0.3, z: 0}}
        light={lightPreset.vector}
        mesh={SURFACE_MESH}
        time={time}
        title="Shader Surface"
        deformVertex={deformSurface}
      />
    </Section>
  );
}

export default function ThreeDScreen() {
  return (
    <ScreenContainer>
      <TransformationsSection />
      <Software3DSection />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hintText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  sectionCopy: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  noticeCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: 6,
    marginBottom: 12,
  },
  noticeTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  noticeText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  lightRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  lightChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  lightChipText: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  card3dRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card3d: {
    width: CARD_WIDTH,
    height: 140,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  card3dEmoji: {
    fontSize: 34,
    marginBottom: 8,
  },
  card3dTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  card3dLine: {
    width: 30,
    height: 2,
    borderRadius: 1,
    marginTop: 8,
  },
  card3dHint: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 8,
    fontStyle: 'italic',
  },
  meshCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: 10,
    marginBottom: 12,
  },
  meshHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  meshCopy: {
    flex: 1,
    gap: 4,
  },
  meshTitle: {
    ...Typography.h4,
  },
  meshDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  meshBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  meshBadgeText: {
    ...Typography.label,
  },
  meshBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoPill: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  infoPillText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  stageFrame: {
    height: STAGE_HEIGHT,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.bgCardAlt,
  },
  stageOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    padding: 10,
  },
  stageHint: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  meshInfo: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
});
