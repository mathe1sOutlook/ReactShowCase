import React, {useRef, useState} from 'react';
import {
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Colors} from '../theme';
import {Section} from '../components/common/Section';
import {ScreenContainer} from '../components/common/ScreenContainer';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// ─── Types ──────────────────────────────────────────────────────────────────

interface DrawPoint {
  x: number;
  y: number;
}

interface DrawLine {
  points: DrawPoint[];
  color: string;
}

// ─── Drawing Canvas ─────────────────────────────────────────────────────────

function DrawingCanvas() {
  const [lines, setLines] = useState<DrawLine[]>([]);
  const [currentLine, setCurrentLine] = useState<DrawPoint[]>([]);
  const [brushColor, setBrushColor] = useState(Colors.primary);
  const brushColors = [Colors.primary, Colors.secondary, Colors.accent, Colors.success, Colors.warning, Colors.orange, Colors.pink, Colors.white];

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const {locationX, locationY} = evt.nativeEvent;
        setCurrentLine([{x: locationX, y: locationY}]);
      },
      onPanResponderMove: (evt) => {
        const {locationX, locationY} = evt.nativeEvent;
        setCurrentLine(prev => [...prev, {x: locationX, y: locationY}]);
      },
      onPanResponderRelease: () => {
        setLines(prev => [...prev, {points: currentLine, color: brushColor}]);
        setCurrentLine([]);
      },
    }),
  ).current;

  const clearCanvas = () => {
    setLines([]);
    setCurrentLine([]);
  };

  const renderLine = (line: DrawLine, lineIndex: number) => {
    return line.points.map((point, i) => {
      if (i === 0) return null;
      const prev = line.points[i - 1];
      const dx = point.x - prev.x;
      const dy = point.y - prev.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      return (
        <View
          key={`${lineIndex}-${i}`}
          style={{
            position: 'absolute',
            left: prev.x,
            top: prev.y - 1.5,
            width: Math.max(dist, 1),
            height: 3,
            backgroundColor: line.color,
            borderRadius: 1.5,
            transform: [{rotate: `${angle}deg`}],
            transformOrigin: '0% 50%',
          }}
        />
      );
    });
  };

  const renderCurrentLine = () => {
    return currentLine.map((point, i) => {
      if (i === 0) return null;
      const prev = currentLine[i - 1];
      const dx = point.x - prev.x;
      const dy = point.y - prev.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      return (
        <View
          key={`current-${i}`}
          style={{
            position: 'absolute',
            left: prev.x,
            top: prev.y - 1.5,
            width: Math.max(dist, 1),
            height: 3,
            backgroundColor: brushColor,
            borderRadius: 1.5,
            transform: [{rotate: `${angle}deg`}],
            transformOrigin: '0% 50%',
          }}
        />
      );
    });
  };

  return (
    <Section title="Drawing Canvas">
      <Text style={styles.hintText}>Draw with your finger on the canvas below</Text>

      {/* Brush color picker */}
      <View style={styles.brushRow}>
        {brushColors.map((c, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => setBrushColor(c)}
            style={[
              styles.brushDot,
              {backgroundColor: c},
              brushColor === c && styles.brushDotActive,
            ]}
          />
        ))}
        <TouchableOpacity onPress={clearCanvas} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>CLEAR</Text>
        </TouchableOpacity>
      </View>

      {/* Canvas */}
      <View style={styles.canvas} {...panResponder.panHandlers}>
        {/* Grid lines for visual flair */}
        {Array.from({length: 10}).map((_, i) => (
          <View
            key={`hg-${i}`}
            style={[
              styles.canvasGridH,
              {top: (i + 1) * 20},
            ]}
          />
        ))}
        {Array.from({length: Math.floor((SCREEN_WIDTH - 64) / 20)}).map((_, i) => (
          <View
            key={`vg-${i}`}
            style={[
              styles.canvasGridV,
              {left: (i + 1) * 20},
            ]}
          />
        ))}
        {lines.map((line, i) => renderLine(line, i))}
        {renderCurrentLine()}
        {lines.length === 0 && currentLine.length === 0 && (
          <View style={styles.canvasPlaceholder}>
            <Text style={styles.canvasPlaceholderText}>Touch to draw</Text>
          </View>
        )}
      </View>
    </Section>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function CanvasScreen() {
  return (
    <ScreenContainer>
      <DrawingCanvas />
    </ScreenContainer>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  hintText: {
    fontSize: 12,
    color: '#8888aa',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  brushRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  brushDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  brushDotActive: {
    borderColor: Colors.white,
    transform: [{scale: 1.2}],
  },
  clearBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: Colors.error + '33',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.error + '66',
    marginLeft: 'auto',
  },
  clearBtnText: {
    color: Colors.error,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  canvas: {
    height: 220,
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  canvasGridH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.border + '33',
  },
  canvasGridV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: Colors.border + '33',
  },
  canvasPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvasPlaceholderText: {
    color: Colors.textMuted,
    fontSize: 16,
    fontStyle: 'italic',
  },
});
