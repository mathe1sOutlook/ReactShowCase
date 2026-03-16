import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {Colors, Radius, Spacing} from '../theme';

type CalendarMode = 'month' | 'week' | 'day' | 'agenda';
type GestureMode = 'swipe' | 'pinch' | 'rotate';
type SettingKey = 'notifications' | 'autoplay' | 'biometrics';
type StrokePoint = {x: number; y: number};
type Stroke = {id: string; points: StrokePoint[]};
type Message = {id: string; from: 'you' | 'team'; text: string; time: string; read?: boolean};
type NotificationItem = {id: string; title: string; detail: string; unread: boolean};

const EVENTS = [
  {day: 4, title: 'Sprint Planning', time: '09:00', tag: 'Team'},
  {day: 7, title: 'Design Review', time: '13:30', tag: 'UI'},
  {day: 12, title: 'Client Demo', time: '16:00', tag: 'Sales'},
  {day: 15, title: 'Deployment Window', time: '20:30', tag: 'Ops'},
  {day: 18, title: 'Research Sync', time: '11:00', tag: 'Lab'},
  {day: 23, title: 'Billing Cycle', time: '08:15', tag: 'Finance'},
];

const MARKDOWN_LINES = [
  '# Showcase Utilities',
  'Build a **single utility deck** that covers scheduling, content, gestures and flows.',
  '- Markdown preview',
  '- Syntax highlight',
  '- In-app browser shell',
  '> Keep the interactions compact and fast to scan.',
  '```ts',
  'const deck = features.filter(item => item.enabled);',
  'return deck.map(renderCard);',
  '```',
];

const PAGES = [
  {
    url: 'https://showcase.cfd.dev/docs',
    title: 'Showcase Docs',
    summary: 'Reference guides, setup notes and demo walkthroughs for the portfolio app.',
  },
  {
    url: 'https://showcase.cfd.dev/blog/ui-lab',
    title: 'UI Lab Notes',
    summary: 'Patterns for bold demo screens, motion systems and responsive card composition.',
  },
  {
    url: 'https://showcase.cfd.dev/support',
    title: 'Client Support',
    summary: 'Contact links, onboarding checklists and release notes inside an in-app browser shell.',
  },
];

const TRACKS = [
  {title: 'City Lights', artist: 'Ari North', duration: 214},
  {title: 'Blueprint', artist: 'Mono Pulse', duration: 186},
  {title: 'Morning Sweep', artist: 'Studio Nine', duration: 241},
];

const CALC_KEYS = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'];

function withAlpha(color: string, alpha: number) {
  const hex = Math.round(alpha * 255).toString(16).padStart(2, '0').toUpperCase();
  return `${color}${hex}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function buildPath(points: StrokePoint[]) {
  if (points.length === 0) {
    return '';
  }
  return points.reduce(
    (path, point, index) => `${path}${index === 0 ? 'M' : ' L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`,
    '',
  );
}

function tokenize(line: string) {
  const regex = /(\/\/.*$)|(\"(?:[^\"\\]|\\.)*\"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(const|let|return|map|filter)\b|(\d+)/g;
  const tokens: Array<{text: string; type: 'plain' | 'comment' | 'string' | 'keyword' | 'number'}> = [];
  let cursor = 0;
  for (const match of line.matchAll(regex)) {
    const index = match.index ?? 0;
    if (index > cursor) {
      tokens.push({text: line.slice(cursor, index), type: 'plain'});
    }
    const token = match[0];
    const type = match[1] ? 'comment' : match[2] ? 'string' : match[3] ? 'keyword' : 'number';
    tokens.push({text: token, type});
    cursor = index + token.length;
  }
  if (cursor < line.length) {
    tokens.push({text: line.slice(cursor), type: 'plain'});
  }
  return tokens;
}

function renderInlineMarkdown(text: string, keyPrefix: string) {
  return text
    .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
    .filter(Boolean)
    .map((chunk, index) => {
      if (chunk.startsWith('**') && chunk.endsWith('**')) {
        return <Text key={`${keyPrefix}-${index}`} style={styles.markdownBold}>{chunk.slice(2, -2)}</Text>;
      }
      if (chunk.startsWith('`') && chunk.endsWith('`')) {
        return <Text key={`${keyPrefix}-${index}`} style={styles.inlineCode}>{chunk.slice(1, -1)}</Text>;
      }
      return <Text key={`${keyPrefix}-${index}`} style={styles.markdownText}>{chunk}</Text>;
    });
}

function SortableRow({label, index, lastIndex, onMove}: {label: string; index: number; lastIndex: number; onMove: (from: number, to: number) => void;}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        Animated.spring(scale, {toValue: 1.03, useNativeDriver: true}).start();
      },
      onPanResponderMove: (_, gesture) => {
        translateY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy < -48 && index > 0) {
          onMove(index, index - 1);
        } else if (gesture.dy > 48 && index < lastIndex) {
          onMove(index, index + 1);
        }
        Animated.parallel([
          Animated.spring(translateY, {toValue: 0, useNativeDriver: true}),
          Animated.spring(scale, {toValue: 1, useNativeDriver: true}),
        ]).start();
      },
    }),
  ).current;
  return (
    <Animated.View {...responder.panHandlers} style={[styles.sortableRow, {transform: [{translateY}, {scale}]}]}>
      <Text style={styles.sortableLabel}>{label}</Text>
      <Text style={styles.sortableHint}>Drag up or down</Text>
    </Animated.View>
  );
}

export default function UtilitiesScreen() {
  const {width} = useWindowDimensions();
  const fullWidth = width - Spacing.lg * 2;
  const splitWidth = width >= 1080 ? (fullWidth - Spacing.lg * 2 - Spacing.md) / 2 : fullWidth - Spacing.lg * 2;
  const thirdWidth = width >= 1360 ? (fullWidth - Spacing.lg * 2 - Spacing.md * 2) / 3 : splitWidth;

  const [calendarMode, setCalendarMode] = useState<CalendarMode>('month');
  const [selectedDay, setSelectedDay] = useState(12);
  const [countdown, setCountdown] = useState(150);
  const [countdownRunning, setCountdownRunning] = useState(false);
  const [stopwatch, setStopwatch] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [calculatorDisplay, setCalculatorDisplay] = useState('0');
  const [storedValue, setStoredValue] = useState<number | null>(null);
  const [pendingOperator, setPendingOperator] = useState<string | null>(null);
  const [replaceDisplay, setReplaceDisplay] = useState(true);
  const [pipeline, setPipeline] = useState(['Collect requirements', 'Prototype layout', 'Review motion', 'Ship release']);
  const [gestureMode, setGestureMode] = useState<GestureMode>('swipe');
  const [gestureStatus, setGestureStatus] = useState('Swipe the card, pinch-zoom it, rotate it, or long-press.');
  const gestureTranslateX = useRef(new Animated.Value(0)).current;
  const gestureScale = useRef(new Animated.Value(1)).current;
  const gestureRotate = useRef(new Animated.Value(0)).current;
  const [rating, setRating] = useState(4);
  const [signatureStrokes, setSignatureStrokes] = useState<Stroke[]>([]);
  const signaturePointsRef = useRef<StrokePoint[]>([]);
  const [, refreshSignature] = useState(0);
  const [browserHistory, setBrowserHistory] = useState([0]);
  const [browserIndex, setBrowserIndex] = useState(0);
  const [trackIndex, setTrackIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(54);
  const [messages, setMessages] = useState<Message[]>([
    {id: '1', from: 'team', text: 'Status on the utilities deck?', time: '09:18'},
    {id: '2', from: 'you', text: 'Calendar, markdown and flows are live.', time: '09:19', read: true},
    {id: '3', from: 'team', text: 'Push the polish card after lunch.', time: '09:20'},
  ]);
  const [chatInput, setChatInput] = useState('Shipping the remaining polish card now.');
  const [likes, setLikes] = useState(128);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [settings, setSettings] = useState<Record<SettingKey, boolean>>({notifications: true, autoplay: false, biometrics: true});
  const [language, setLanguage] = useState<'EN' | 'PT' | 'ES'>('EN');
  const [profileName, setProfileName] = useState('Mathe Costa');
  const [profileEmail, setProfileEmail] = useState('mathe@showcase.dev');
  const [profileBio, setProfileBio] = useState('Building dense cross-platform demo decks for clients.');
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {id: 'n1', title: 'Design review approved', detail: 'The interaction lab passed the latest stakeholder review.', unread: true},
    {id: 'n2', title: 'Release candidate ready', detail: 'Package v0.9.4 is waiting for screenshot capture.', unread: true},
    {id: 'n3', title: 'Profile updated', detail: 'Avatar and bio synced across the sales portal.', unread: false},
  ]);

  const track = TRACKS[trackIndex];
  const page = PAGES[browserHistory[browserIndex]];
  const selectedEvents = EVENTS.filter(event => event.day === selectedDay);
  const agendaEvents = [...EVENTS].sort((left, right) => left.day - right.day);
  const days = Array.from({length: 35}, (_, index) => {
    const value = index - 1;
    return value < 1 || value > 30 ? null : value;
  });

  useEffect(() => {
    if (!countdownRunning) {
      return;
    }
    const timer = setInterval(() => {
      setCountdown(current => {
        if (current <= 1) {
          setCountdownRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdownRunning]);

  useEffect(() => {
    if (!stopwatchRunning) {
      return;
    }
    const timer = setInterval(() => {
      setStopwatch(current => current + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [stopwatchRunning]);

  useEffect(() => {
    if (!playing) {
      return;
    }
    const timer = setInterval(() => {
      setProgress(current => {
        if (current >= track.duration) {
          setPlaying(false);
          return track.duration;
        }
        return current + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [playing, track.duration]);

  const signatureResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: event => {
        signaturePointsRef.current = [{x: event.nativeEvent.locationX, y: event.nativeEvent.locationY}];
        refreshSignature(current => current + 1);
      },
      onPanResponderMove: event => {
        signaturePointsRef.current = [...signaturePointsRef.current, {x: event.nativeEvent.locationX, y: event.nativeEvent.locationY}];
        refreshSignature(current => current + 1);
      },
      onPanResponderRelease: () => {
        if (signaturePointsRef.current.length > 1) {
          setSignatureStrokes(current => [...current, {id: `${Date.now()}-${current.length}`, points: signaturePointsRef.current}]);
        }
        signaturePointsRef.current = [];
        refreshSignature(current => current + 1);
      },
    }),
  ).current;

  const gestureResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        if (gestureMode === 'swipe') {
          gestureTranslateX.setValue(gesture.dx);
        } else if (gestureMode === 'pinch') {
          gestureScale.setValue(clamp(1 + gesture.dx / 220, 0.75, 1.6));
        } else {
          gestureRotate.setValue(gesture.dx);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gestureMode === 'swipe') {
          setGestureStatus(gesture.dx > 90 ? 'Swipe right detected.' : gesture.dx < -90 ? 'Swipe left detected.' : 'Swipe reset.');
          Animated.spring(gestureTranslateX, {toValue: 0, useNativeDriver: true}).start();
        } else if (gestureMode === 'pinch') {
          setGestureStatus(`Pinch or zoom settled at ${Math.round(clamp(1 + gesture.dx / 220, 0.75, 1.6) * 100)}%.`);
        } else {
          setGestureStatus(`Rotate settled near ${Math.round(gesture.dx)} degrees.`);
        }
      },
    }),
  ).current;

  const execute = (nextValue: number) => {
    if (storedValue === null || pendingOperator === null) {
      return nextValue;
    }
    if (pendingOperator === '+') {
      return storedValue + nextValue;
    }
    if (pendingOperator === '-') {
      return storedValue - nextValue;
    }
    if (pendingOperator === '*') {
      return storedValue * nextValue;
    }
    if (pendingOperator === '/') {
      return nextValue === 0 ? 0 : storedValue / nextValue;
    }
    return nextValue;
  };

  const handleCalc = (key: string) => {
    if (/^\d$/.test(key) || key === '.') {
      setCalculatorDisplay(current => (replaceDisplay ? key : `${current === '0' && key !== '.' ? '' : current}${key}`));
      setReplaceDisplay(false);
      return;
    }
    if (key === '=') {
      const result = execute(Number(calculatorDisplay));
      setCalculatorDisplay(result.toFixed(2).replace(/\.00$/, ''));
      setStoredValue(null);
      setPendingOperator(null);
      setReplaceDisplay(true);
      return;
    }
    const nextValue = Number(calculatorDisplay);
    const computed = storedValue === null ? nextValue : execute(nextValue);
    setStoredValue(computed);
    setPendingOperator(key);
    setCalculatorDisplay(computed.toFixed(2).replace(/\.00$/, ''));
    setReplaceDisplay(true);
  };

  const renderedSignature = buildPath(signaturePointsRef.current);

  return (
    <ScreenContainer>
      <View style={styles.root}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>PHASE 8.5</Text>
          <Text style={styles.title}>Advanced Utilities</Text>
          <Text style={styles.body}>
            A dense utility deck covering calendar layouts, drag and gesture labs, markdown and browser previews,
            commerce surfaces, onboarding, settings, profile flows and notifications.
          </Text>
          <View style={styles.pills}>
            <View style={styles.pill}><Text style={styles.pillText}>20 demos</Text></View>
            <View style={styles.pill}><Text style={styles.pillText}>{notifications.filter(item => item.unread).length} unread</Text></View>
            <View style={styles.pill}><Text style={styles.pillText}>{calendarMode}</Text></View>
          </View>
        </View>

        <View style={[styles.card, {width: fullWidth}]}> 
          <Text style={styles.cardTitle}>Productivity Suite</Text>
          <Text style={styles.cardSubtitle}>Calendar views, timers and a functional calculator grouped into one planning surface.</Text>
          <View style={styles.subgrid}>
            <View style={[styles.panel, {width: splitWidth}]}> 
              <Text style={styles.panelTitle}>Calendar</Text>
              <View style={styles.wrap}>
                {(['month', 'week', 'day', 'agenda'] as CalendarMode[]).map(mode => (
                  <Pressable key={mode} style={[styles.chip, calendarMode === mode && styles.chipActive]} onPress={() => setCalendarMode(mode)}>
                    <Text style={[styles.chipText, calendarMode === mode && styles.chipTextActive]}>{mode}</Text>
                  </Pressable>
                ))}
              </View>
              {calendarMode === 'month' ? (
                <View style={styles.monthGrid}>
                  {days.map((day, index) => (
                    <Pressable key={index} style={[styles.dayCell, day === selectedDay && styles.dayCellActive]} onPress={() => day && setSelectedDay(day)} disabled={!day}>
                      <Text style={[styles.dayCellText, day === selectedDay && styles.dayCellTextActive, !day && styles.dayMuted]}>{day ?? ''}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
              {calendarMode === 'week' ? (
                <View style={styles.weekRow}>
                  {Array.from({length: 7}, (_, index) => {
                    const day = clamp(selectedDay - ((selectedDay - 1) % 7) + index, 1, 30);
                    return (
                      <Pressable key={day} style={[styles.weekCard, day === selectedDay && styles.weekCardActive]} onPress={() => setSelectedDay(day)}>
                        <Text style={styles.weekLabel}>Day {day}</Text>
                        <Text style={styles.weekMeta}>{EVENTS.filter(event => event.day === day).length} items</Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
              {calendarMode === 'day' ? (
                <View style={styles.list}>
                  {selectedEvents.length === 0 ? <Text style={styles.note}>No events for day {selectedDay}.</Text> : selectedEvents.map(event => (
                    <View key={event.title} style={styles.timelineRow}>
                      <Text style={styles.timelineTime}>{event.time}</Text>
                      <View style={styles.timelineCopy}>
                        <Text style={styles.timelineTitle}>{event.title}</Text>
                        <Text style={styles.timelineMeta}>{event.tag}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : null}
              {calendarMode === 'agenda' ? (
                <View style={styles.list}>
                  {agendaEvents.map(event => (
                    <View key={`${event.day}-${event.title}`} style={styles.timelineRow}>
                      <Text style={styles.timelineTime}>D{event.day}</Text>
                      <View style={styles.timelineCopy}>
                        <Text style={styles.timelineTitle}>{event.title}</Text>
                        <Text style={styles.timelineMeta}>{event.time} · {event.tag}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>

            <View style={[styles.panel, {width: splitWidth}]}> 
              <Text style={styles.panelTitle}>Timers + Calculator</Text>
              <View style={styles.timerRow}>
                <View style={styles.timerCard}>
                  <Text style={styles.timerLabel}>Countdown</Text>
                  <Text style={styles.timerValue}>{formatClock(countdown)}</Text>
                  <View style={styles.inlineActions}>
                    <Pressable style={styles.smallButton} onPress={() => setCountdownRunning(current => !current)}><Text style={styles.smallButtonText}>{countdownRunning ? 'Pause' : 'Start'}</Text></Pressable>
                    <Pressable style={styles.smallButton} onPress={() => { setCountdown(150); setCountdownRunning(false); }}><Text style={styles.smallButtonText}>Reset</Text></Pressable>
                  </View>
                </View>
                <View style={styles.timerCard}>
                  <Text style={styles.timerLabel}>Stopwatch</Text>
                  <Text style={styles.timerValue}>{formatClock(stopwatch)}</Text>
                  <View style={styles.inlineActions}>
                    <Pressable style={styles.smallButton} onPress={() => setStopwatchRunning(current => !current)}><Text style={styles.smallButtonText}>{stopwatchRunning ? 'Pause' : 'Start'}</Text></Pressable>
                    <Pressable style={styles.smallButton} onPress={() => { setStopwatch(0); setStopwatchRunning(false); }}><Text style={styles.smallButtonText}>Reset</Text></Pressable>
                  </View>
                </View>
              </View>
              <View style={styles.calcDisplay}><Text style={styles.calcText}>{calculatorDisplay}</Text></View>
              <View style={styles.calcGrid}>
                <Pressable style={[styles.calcKey, styles.calcWide]} onPress={() => { setCalculatorDisplay('0'); setStoredValue(null); setPendingOperator(null); setReplaceDisplay(true); }}><Text style={styles.calcKeyText}>C</Text></Pressable>
                {CALC_KEYS.map(key => (
                  <Pressable key={key} style={styles.calcKey} onPress={() => handleCalc(key)}><Text style={styles.calcKeyText}>{key}</Text></Pressable>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.card, {width: fullWidth}]}> 
          <Text style={styles.cardTitle}>Interaction Lab</Text>
          <Text style={styles.cardSubtitle}>Reordering, gesture demos, rating feedback and a signature pad in one interaction deck.</Text>
          <View style={styles.subgrid}>
            <View style={[styles.panel, {width: splitWidth}]}> 
              <Text style={styles.panelTitle}>Drag + gesture sandbox</Text>
              <View style={styles.list}>
                {pipeline.map((item, index) => (
                  <SortableRow
                    key={item}
                    label={item}
                    index={index}
                    lastIndex={pipeline.length - 1}
                    onMove={(from, to) => setPipeline(current => {
                      const next = current.slice();
                      const [moved] = next.splice(from, 1);
                      next.splice(to, 0, moved);
                      return next;
                    })}
                  />
                ))}
              </View>
              <View style={styles.wrap}>
                {(['swipe', 'pinch', 'rotate'] as GestureMode[]).map(mode => (
                  <Pressable key={mode} style={[styles.chip, gestureMode === mode && styles.chipActive]} onPress={() => setGestureMode(mode)}>
                    <Text style={[styles.chipText, gestureMode === mode && styles.chipTextActive]}>{mode}</Text>
                  </Pressable>
                ))}
              </View>
              <Pressable {...gestureResponder.panHandlers} delayLongPress={280} onLongPress={() => setGestureStatus('Long press registered on the sandbox card.')} style={styles.gestureStage}>
                <Animated.View
                  style={[
                    styles.gestureCard,
                    {
                      transform: [
                        {translateX: gestureTranslateX},
                        {scale: gestureScale},
                        {rotate: gestureRotate.interpolate({inputRange: [-180, 180], outputRange: ['-180deg', '180deg']})},
                      ],
                    },
                  ]}>
                  <Text style={styles.gestureTitle}>Gesture Card</Text>
                  <Text style={styles.gestureBody}>Swipe, pinch or rotate this stage.</Text>
                </Animated.View>
              </Pressable>
              <Text style={styles.note}>{gestureStatus}</Text>
            </View>

            <View style={[styles.panel, {width: splitWidth}]}> 
              <Text style={styles.panelTitle}>Rating + signature</Text>
              <View style={styles.ratingRow}>
                {Array.from({length: 5}, (_, index) => index + 1).map(value => (
                  <Pressable key={value} onPress={() => setRating(value)}><Text style={[styles.star, value <= rating && styles.starActive]}>?</Text></Pressable>
                ))}
              </View>
              <Text style={styles.note}>Rated {rating} / 5</Text>
              <View style={styles.signaturePad} {...signatureResponder.panHandlers}>
                <Svg width="100%" height="180">
                  {signatureStrokes.map(stroke => <Path key={stroke.id} d={buildPath(stroke.points)} stroke={Colors.primary} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />)}
                  {renderedSignature ? <Path d={renderedSignature} stroke={Colors.secondary} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" /> : null}
                </Svg>
              </View>
              <View style={styles.inlineActions}>
                <Pressable style={styles.smallButton} onPress={() => setSignatureStrokes(current => current.slice(0, -1))}><Text style={styles.smallButtonText}>Undo</Text></Pressable>
                <Pressable style={styles.smallButton} onPress={() => { setSignatureStrokes([]); signaturePointsRef.current = []; refreshSignature(current => current + 1); }}><Text style={styles.smallButtonText}>Clear</Text></Pressable>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.card, {width: fullWidth}]}> 
          <Text style={styles.cardTitle}>Content + Browser</Text>
          <Text style={styles.cardSubtitle}>Markdown rendering, syntax highlighting and an in-app browser shell for docs and links.</Text>
          <View style={styles.subgrid}>
            <View style={[styles.panel, {width: splitWidth}]}> 
              <Text style={styles.panelTitle}>Markdown + syntax</Text>
              <View style={styles.markdownCard}>
                {MARKDOWN_LINES.map((line, index) => {
                  if (!line.trim()) {
                    return <View key={index} style={{height: Spacing.xs}} />;
                  }
                  if (line.startsWith('# ')) {
                    return <Text key={index} style={styles.markdownHeading}>{line.slice(2)}</Text>;
                  }
                  if (line.startsWith('- ')) {
                    return <Text key={index} style={styles.markdownBullet}>• {line.slice(2)}</Text>;
                  }
                  if (line.startsWith('> ')) {
                    return <Text key={index} style={styles.markdownQuote}>{line.slice(2)}</Text>;
                  }
                  if (line.startsWith('```')) {
                    return null;
                  }
                  if (index > MARKDOWN_LINES.indexOf('```ts') && index < MARKDOWN_LINES.lastIndexOf('```')) {
                    return (
                      <View key={index} style={styles.codeLine}>
                        {tokenize(line).map((token, tokenIndex) => (
                          <Text key={tokenIndex} style={[styles.codeToken, token.type === 'keyword' && styles.codeKeyword, token.type === 'string' && styles.codeString, token.type === 'number' && styles.codeNumber, token.type === 'comment' && styles.codeComment]}>{token.text}</Text>
                        ))}
                      </View>
                    );
                  }
                  return <Text key={index} style={styles.markdownParagraph}>{renderInlineMarkdown(line, `md-${index}`)}</Text>;
                })}
              </View>
            </View>

            <View style={[styles.panel, {width: splitWidth}]}> 
              <Text style={styles.panelTitle}>In-app browser</Text>
              <View style={styles.browserShell}>
                <View style={styles.browserBar}>
                  <Pressable style={styles.browserButton} onPress={() => setBrowserIndex(current => Math.max(0, current - 1))}><Text style={styles.browserButtonText}>?</Text></Pressable>
                  <Pressable style={styles.browserButton} onPress={() => setBrowserIndex(current => Math.min(browserHistory.length - 1, current + 1))}><Text style={styles.browserButtonText}>?</Text></Pressable>
                  <TextInput style={styles.browserInput} value={page.url} editable={false} />
                  <Pressable style={styles.browserButton} onPress={() => setBrowserIndex(current => current)}><Text style={styles.browserButtonText}>?</Text></Pressable>
                </View>
                <View style={styles.browserContent}>
                  <Text style={styles.browserTitle}>{page.title}</Text>
                  <Text style={styles.browserSummary}>{page.summary}</Text>
                </View>
                <View style={styles.wrap}>
                  {PAGES.map((item, index) => (
                    <Pressable key={item.url} style={styles.browserChip} onPress={() => {
                      setBrowserHistory(current => {
                        const next = current.slice(0, browserIndex + 1);
                        next.push(index);
                        return next.slice(-5);
                      });
                      setBrowserIndex(current => Math.min(current + 1, 4));
                    }}>
                      <Text style={styles.browserChipText}>{item.title}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.card, {width: fullWidth}]}> 
          <Text style={styles.cardTitle}>Surfaces</Text>
          <Text style={styles.cardSubtitle}>Music player, chat, e-commerce, social feed and dashboard analytics cards grouped into one showcase.</Text>
          <View style={styles.subgrid}>
            <View style={[styles.panel, {width: thirdWidth}]}> 
              <Text style={styles.panelTitle}>Music player</Text>
              <Text style={styles.musicTrack}>{track.title}</Text>
              <Text style={styles.musicArtist}>{track.artist}</Text>
              <View style={styles.progressTrack}><View style={[styles.progressFill, {width: `${(progress / track.duration) * 100}%`}]} /></View>
              <Text style={styles.note}>{formatClock(progress)} / {formatClock(track.duration)}</Text>
              <View style={styles.inlineActions}>
                <Pressable style={styles.smallButton} onPress={() => { setTrackIndex(current => (current - 1 + TRACKS.length) % TRACKS.length); setProgress(0); }}><Text style={styles.smallButtonText}>Prev</Text></Pressable>
                <Pressable style={styles.smallButton} onPress={() => setPlaying(current => !current)}><Text style={styles.smallButtonText}>{playing ? 'Pause' : 'Play'}</Text></Pressable>
                <Pressable style={styles.smallButton} onPress={() => { setTrackIndex(current => (current + 1) % TRACKS.length); setProgress(0); }}><Text style={styles.smallButtonText}>Next</Text></Pressable>
              </View>
            </View>

            <View style={[styles.panel, {width: thirdWidth}]}> 
              <Text style={styles.panelTitle}>Chat</Text>
              <View style={styles.chatList}>
                {messages.map(message => (
                  <View key={message.id} style={[styles.chatBubble, message.from === 'you' ? styles.chatOwn : styles.chatPeer]}>
                    <Text style={styles.chatText}>{message.text}</Text>
                    <Text style={styles.chatMeta}>{message.time}{message.from === 'you' ? ` · ${message.read ? 'read' : 'sent'}` : ''}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.inlineRow}>
                <TextInput style={[styles.input, styles.chatInput]} value={chatInput} onChangeText={setChatInput} />
                <Pressable style={styles.smallButton} onPress={() => {
                  if (!chatInput.trim()) {
                    return;
                  }
                  setMessages(current => [...current, {id: `${Date.now()}`, from: 'you', text: chatInput.trim(), time: '09:24', read: false}]);
                  setChatInput('');
                }}><Text style={styles.smallButtonText}>Send</Text></Pressable>
              </View>
            </View>

            <View style={[styles.panel, {width: thirdWidth}]}> 
              <Text style={styles.panelTitle}>Product + feed + dashboard</Text>
              <View style={styles.productCard}>
                <Text style={styles.productTitle}>Neon Mesh Lamp</Text>
                <Text style={styles.productPrice}>$149</Text>
                <Text style={styles.productBody}>Smart ambient lighting with scene presets and USB-C charging dock.</Text>
              </View>
              <View style={styles.socialCard}>
                <Text style={styles.socialAuthor}>Studio Nine</Text>
                <Text style={styles.socialBody}>We just shipped the new utility deck with markdown, chat and dashboard demos.</Text>
                <Pressable onPress={() => setLikes(current => current + 1)}><Text style={styles.socialMeta}>{likes} likes · Tap to like</Text></Pressable>
              </View>
              <View style={styles.dashboardRow}>
                {[62, 78, 54].map((value, index) => (
                  <View key={index} style={styles.dashboardCard}>
                    <Text style={styles.dashboardLabel}>KPI {index + 1}</Text>
                    <View style={styles.dashboardTrack}><View style={[styles.dashboardFill, {height: `${value}%`}]} /></View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.card, {width: fullWidth}]}> 
          <Text style={styles.cardTitle}>App Flows</Text>
          <Text style={styles.cardSubtitle}>Onboarding, settings, profile editing and a notification center in one flow-oriented panel.</Text>
          <View style={styles.subgrid}>
            <View style={[styles.panel, {width: splitWidth}]}> 
              <Text style={styles.panelTitle}>Onboarding + settings</Text>
              <View style={styles.onboardingCard}>
                <Text style={styles.onboardingStep}>Step {onboardingStep + 1} / 3</Text>
                <Text style={styles.onboardingTitle}>{['Welcome', 'Customize', 'Launch'][onboardingStep]}</Text>
                <Text style={styles.onboardingBody}>{['Introduce the utility deck and highlight the product breadth.', 'Tune notifications, playback and biometric defaults before first run.', 'Ship users into the dashboard with profile and preferences already set.'][onboardingStep]}</Text>
                <View style={styles.inlineActions}>
                  <Pressable style={styles.smallButton} onPress={() => setOnboardingStep(current => Math.max(0, current - 1))}><Text style={styles.smallButtonText}>Back</Text></Pressable>
                  <Pressable style={styles.smallButton} onPress={() => setOnboardingStep(current => Math.min(2, current + 1))}><Text style={styles.smallButtonText}>Next</Text></Pressable>
                </View>
              </View>
              {(['notifications', 'autoplay', 'biometrics'] as SettingKey[]).map(key => (
                <Pressable key={key} style={styles.settingRow} onPress={() => setSettings(current => ({...current, [key]: !current[key]}))}>
                  <View>
                    <Text style={styles.settingLabel}>{key}</Text>
                    <Text style={styles.settingHint}>Toggle app behavior for this demo profile.</Text>
                  </View>
                  <View style={[styles.settingSwitch, settings[key] && styles.settingSwitchActive]} />
                </Pressable>
              ))}
              <View style={styles.wrap}>
                {(['EN', 'PT', 'ES'] as const).map(option => (
                  <Pressable key={option} style={[styles.chip, language === option && styles.chipActive]} onPress={() => setLanguage(option)}>
                    <Text style={[styles.chipText, language === option && styles.chipTextActive]}>{option}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={[styles.panel, {width: splitWidth}]}> 
              <Text style={styles.panelTitle}>Profile + notifications</Text>
              <TextInput style={styles.input} value={profileName} onChangeText={setProfileName} />
              <TextInput style={styles.input} value={profileEmail} onChangeText={setProfileEmail} />
              <TextInput style={[styles.input, styles.textArea]} value={profileBio} onChangeText={setProfileBio} multiline />
              <View style={styles.list}>
                {notifications.map(item => (
                  <Pressable key={item.id} style={styles.notificationRow} onPress={() => setNotifications(current => current.map(entry => (entry.id === item.id ? {...entry, unread: !entry.unread} : entry)))}>
                    <View style={styles.notificationCopy}>
                      <Text style={styles.notificationTitle}>{item.title}</Text>
                      <Text style={styles.notificationDetail}>{item.detail}</Text>
                    </View>
                    <View style={[styles.notificationDot, item.unread && styles.notificationDotActive]} />
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  root: {paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, gap: Spacing.lg},
  hero: {backgroundColor: Colors.bgCard, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, padding: Spacing.xl, gap: Spacing.md},
  eyebrow: {fontSize: 11, fontWeight: '800', letterSpacing: 1.8, color: Colors.primary},
  title: {fontSize: 30, fontWeight: '900', color: Colors.textPrimary},
  body: {fontSize: 14, lineHeight: 22, color: Colors.textSecondary},
  pills: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm},
  pill: {backgroundColor: Colors.surface, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: Colors.border},
  pillText: {fontSize: 12, fontWeight: '700', color: Colors.textPrimary},
  card: {backgroundColor: Colors.bgCard, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg, gap: Spacing.md},
  cardTitle: {fontSize: 18, fontWeight: '800', color: Colors.textPrimary},
  cardSubtitle: {fontSize: 12, lineHeight: 18, color: Colors.textSecondary},
  subgrid: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md},
  panel: {borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface, padding: Spacing.lg, gap: Spacing.md},
  panelTitle: {fontSize: 16, fontWeight: '800', color: Colors.textPrimary},
  wrap: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm},
  chip: {paddingHorizontal: 12, paddingVertical: 9, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard},
  chipActive: {backgroundColor: Colors.primary, borderColor: Colors.primary},
  chipText: {fontSize: 12, fontWeight: '800', color: Colors.textPrimary},
  chipTextActive: {color: Colors.bg},
  monthGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm},
  dayCell: {width: 42, height: 42, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center'},
  dayCellActive: {backgroundColor: Colors.secondary, borderColor: Colors.secondary},
  dayCellText: {fontSize: 12, fontWeight: '800', color: Colors.textPrimary},
  dayCellTextActive: {color: Colors.bg},
  dayMuted: {color: Colors.textMuted},
  weekRow: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm},
  weekCard: {flex: 1, minWidth: 92, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard, padding: Spacing.md, gap: 4},
  weekCardActive: {borderColor: Colors.primary},
  weekLabel: {fontSize: 12, fontWeight: '800', color: Colors.textPrimary},
  weekMeta: {fontSize: 11, color: Colors.textSecondary},
  list: {gap: Spacing.sm},
  timelineRow: {flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start'},
  timelineTime: {width: 56, fontSize: 12, fontWeight: '800', color: Colors.primary},
  timelineCopy: {flex: 1, gap: 2},
  timelineTitle: {fontSize: 13, fontWeight: '800', color: Colors.textPrimary},
  timelineMeta: {fontSize: 11, color: Colors.textSecondary},
  timerRow: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md},
  timerCard: {flex: 1, minWidth: 160, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard, padding: Spacing.md, gap: Spacing.sm},
  timerLabel: {fontSize: 12, fontWeight: '800', color: Colors.textSecondary, textTransform: 'uppercase'},
  timerValue: {fontSize: 26, fontWeight: '900', color: Colors.textPrimary},
  inlineActions: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm},
  smallButton: {paddingHorizontal: 12, paddingVertical: 9, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard},
  smallButtonText: {fontSize: 12, fontWeight: '800', color: Colors.textPrimary},
  calcDisplay: {borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard, paddingHorizontal: 16, paddingVertical: 18, alignItems: 'flex-end'},
  calcText: {fontSize: 28, fontWeight: '900', color: Colors.textPrimary},
  calcGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm},
  calcKey: {width: 54, height: 54, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center'},
  calcWide: {width: 116},
  calcKeyText: {fontSize: 16, fontWeight: '900', color: Colors.textPrimary},
  sortableRow: {borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  sortableLabel: {fontSize: 13, fontWeight: '800', color: Colors.textPrimary},
  sortableHint: {fontSize: 11, color: Colors.textSecondary},
  gestureStage: {borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, backgroundColor: withAlpha(Colors.primary, 0.06), minHeight: 160, alignItems: 'center', justifyContent: 'center'},
  gestureCard: {width: 180, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.primary, backgroundColor: Colors.bgCard, padding: Spacing.lg, gap: 4, alignItems: 'center'},
  gestureTitle: {fontSize: 16, fontWeight: '800', color: Colors.textPrimary},
  gestureBody: {fontSize: 12, textAlign: 'center', color: Colors.textSecondary},
  note: {fontSize: 12, lineHeight: 18, color: Colors.textSecondary},
  ratingRow: {flexDirection: 'row', gap: Spacing.sm},
  star: {fontSize: 30, color: Colors.textMuted},
  starActive: {color: Colors.warning},
  signaturePad: {height: 180, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard, overflow: 'hidden'},
  markdownCard: {borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard, padding: Spacing.lg, gap: 6},
  markdownHeading: {fontSize: 22, fontWeight: '900', color: Colors.textPrimary},
  markdownParagraph: {fontSize: 13, lineHeight: 20, color: Colors.textSecondary},
  markdownText: {color: Colors.textSecondary},
  markdownBold: {color: Colors.textPrimary, fontWeight: '900'},
  inlineCode: {color: Colors.primary, fontFamily: 'monospace'},
  markdownBullet: {fontSize: 13, lineHeight: 20, color: Colors.textPrimary},
  markdownQuote: {fontSize: 13, lineHeight: 20, color: Colors.secondary, borderLeftWidth: 3, borderLeftColor: Colors.secondary, paddingLeft: 12},
  codeLine: {flexDirection: 'row', flexWrap: 'wrap', backgroundColor: withAlpha(Colors.primary, 0.06), borderRadius: Radius.md, paddingHorizontal: 10, paddingVertical: 8},
  codeToken: {fontSize: 12, color: Colors.textPrimary, fontFamily: 'monospace'},
  codeKeyword: {color: Colors.primary},
  codeString: {color: Colors.warning},
  codeNumber: {color: Colors.secondary},
  codeComment: {color: Colors.success},
  browserShell: {borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard, padding: Spacing.lg, gap: Spacing.md},
  browserBar: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm},
  browserButton: {width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center'},
  browserButtonText: {fontSize: 14, fontWeight: '800', color: Colors.textPrimary},
  browserInput: {flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.full, backgroundColor: Colors.surface, color: Colors.textPrimary, paddingHorizontal: 14, paddingVertical: 10, fontSize: 12},
  browserContent: {gap: Spacing.xs},
  browserTitle: {fontSize: 18, fontWeight: '800', color: Colors.textPrimary},
  browserSummary: {fontSize: 13, lineHeight: 20, color: Colors.textSecondary},
  browserChip: {borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface, paddingHorizontal: 12, paddingVertical: 9},
  browserChipText: {fontSize: 12, fontWeight: '800', color: Colors.textPrimary},
  musicTrack: {fontSize: 18, fontWeight: '900', color: Colors.textPrimary},
  musicArtist: {fontSize: 13, color: Colors.textSecondary},
  progressTrack: {height: 8, borderRadius: Radius.full, backgroundColor: withAlpha(Colors.primary, 0.14), overflow: 'hidden'},
  progressFill: {height: '100%', backgroundColor: Colors.primary},
  chatList: {gap: Spacing.sm},
  chatBubble: {borderRadius: Radius.lg, paddingHorizontal: 12, paddingVertical: 10, maxWidth: '88%', gap: 4},
  chatOwn: {alignSelf: 'flex-end', backgroundColor: withAlpha(Colors.primary, 0.18)},
  chatPeer: {alignSelf: 'flex-start', backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border},
  chatText: {fontSize: 13, color: Colors.textPrimary},
  chatMeta: {fontSize: 11, color: Colors.textSecondary},
  inlineRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm},
  chatInput: {flex: 1},
  input: {borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, backgroundColor: Colors.bgCard, color: Colors.textPrimary, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14},
  productCard: {borderRadius: Radius.xl, backgroundColor: withAlpha(Colors.warning, 0.08), padding: Spacing.md, gap: 4},
  productTitle: {fontSize: 16, fontWeight: '800', color: Colors.textPrimary},
  productPrice: {fontSize: 22, fontWeight: '900', color: Colors.warning},
  productBody: {fontSize: 12, lineHeight: 18, color: Colors.textSecondary},
  socialCard: {borderRadius: Radius.xl, backgroundColor: withAlpha(Colors.secondary, 0.08), padding: Spacing.md, gap: 4},
  socialAuthor: {fontSize: 13, fontWeight: '800', color: Colors.textPrimary},
  socialBody: {fontSize: 12, lineHeight: 18, color: Colors.textSecondary},
  socialMeta: {fontSize: 12, fontWeight: '700', color: Colors.secondary},
  dashboardRow: {flexDirection: 'row', gap: Spacing.sm},
  dashboardCard: {flex: 1, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard, padding: Spacing.sm, gap: Spacing.sm, alignItems: 'center'},
  dashboardLabel: {fontSize: 11, fontWeight: '800', color: Colors.textSecondary, textTransform: 'uppercase'},
  dashboardTrack: {width: 22, height: 92, borderRadius: Radius.full, backgroundColor: withAlpha(Colors.primary, 0.14), justifyContent: 'flex-end', overflow: 'hidden'},
  dashboardFill: {width: '100%', backgroundColor: Colors.primary},
  onboardingCard: {borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard, padding: Spacing.lg, gap: Spacing.sm},
  onboardingStep: {fontSize: 11, fontWeight: '800', color: Colors.secondary, letterSpacing: 0.6, textTransform: 'uppercase'},
  onboardingTitle: {fontSize: 22, fontWeight: '900', color: Colors.textPrimary},
  onboardingBody: {fontSize: 13, lineHeight: 20, color: Colors.textSecondary},
  settingRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard, paddingHorizontal: 14, paddingVertical: 12},
  settingLabel: {fontSize: 13, fontWeight: '800', color: Colors.textPrimary, textTransform: 'capitalize'},
  settingHint: {fontSize: 11, color: Colors.textSecondary},
  settingSwitch: {width: 40, height: 22, borderRadius: 11, backgroundColor: Colors.border},
  settingSwitchActive: {backgroundColor: Colors.success},
  textArea: {minHeight: 92, textAlignVertical: 'top'},
  notificationRow: {flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard, padding: Spacing.md},
  notificationCopy: {flex: 1, gap: 4},
  notificationTitle: {fontSize: 13, fontWeight: '800', color: Colors.textPrimary},
  notificationDetail: {fontSize: 12, lineHeight: 18, color: Colors.textSecondary},
  notificationDot: {width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: Colors.border, marginTop: 4},
  notificationDotActive: {backgroundColor: Colors.primary, borderColor: Colors.primary},
});
