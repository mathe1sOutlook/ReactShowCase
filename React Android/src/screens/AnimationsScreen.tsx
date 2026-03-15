import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  LayoutAnimation,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LottieView from 'lottie-react-native';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {Section} from '../components/common/Section';
import {Colors, Neon, Radius, Spacing, Typography} from '../theme';

const CARDS = [
  {title: 'Commerce', body: 'Shared-style reveal with matching accent.', accent: Colors.primary},
  {title: 'Health', body: 'Hero expands into a richer detail state.', accent: Colors.secondary},
  {title: 'Travel', body: 'Same card identity carried into the overlay.', accent: Colors.success},
];

const BASE_TILES = [
  {id: '1', label: 'Shared', accent: Colors.primary},
  {id: '2', label: 'Layout', accent: Colors.secondary},
  {id: '3', label: 'Gesture', accent: Colors.accent},
  {id: '4', label: 'Confetti', accent: Colors.success},
];

const SHARED_ITEMS = [
  {id: 'music', icon: '\u{1F3B5}', title: 'Music', color: Colors.primary, desc: 'Stream your favorite tunes with adaptive audio quality and seamless playback.'},
  {id: 'photo', icon: '\u{1F4F7}', title: 'Photos', color: Colors.secondary, desc: 'AI-powered gallery with smart albums, auto-tagging, and pro editing tools.'},
  {id: 'chat', icon: '\u{1F4AC}', title: 'Chat', color: Colors.success, desc: 'Real-time messaging with end-to-end encryption, voice notes, and reactions.'},
];

const LOTTIE_ANIMS = [
  {source: require('../assets/lottie/pulse.json'), label: 'Pulse'},
  {source: require('../assets/lottie/spinner.json'), label: 'Spinner'},
  {source: require('../assets/lottie/bounce.json'), label: 'Bounce'},
];

export default function AnimationsScreen() {
  const hero = useRef(new Animated.Value(0)).current;
  const counter = useRef(new Animated.Value(0)).current;
  const detail = useRef(new Animated.Value(0)).current;
  const morph = useRef(new Animated.Value(0)).current;
  const flag = useRef(new Animated.Value(0)).current;
  const likeScale = useRef(new Animated.Value(1)).current;
  const starSpin = useRef(new Animated.Value(0)).current;
  const confetti = useRef(Array.from({length: 10}, () => new Animated.Value(0))).current;
  const tx = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const [typed, setTyped] = useState('');
  const [count, setCount] = useState(0);
  const [tiles, setTiles] = useState(BASE_TILES);
  const [selected, setSelected] = useState<(typeof CARDS)[number] | null>(null);
  const [liked, setLiked] = useState(false);
  const [starred, setStarred] = useState(false);
  const [sharedItem, setSharedItem] = useState<(typeof SHARED_ITEMS)[number] | null>(null);
  const sharedAnim = useRef(new Animated.Value(0)).current;
  const lottieRef = useRef<LottieView>(null);
  const [lottieIndex, setLottieIndex] = useState(0);
  const [lottieSpeed, setLottieSpeed] = useState(1);
  const [lottiePlaying, setLottiePlaying] = useState(true);
  const [kpi, setKpi] = useState(76);
  const [balls, setBalls] = useState([
    {x: 18, y: 18, vx: 2.4, vy: 0, color: Colors.primary},
    {x: 118, y: 30, vx: -2, vy: 0, color: Colors.secondary},
  ]);
  const dragBase = useRef({x: 0, y: 0, scale: 1, rotate: 0, distance: 1, angle: 0});

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(hero, {toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: false}),
        Animated.timing(hero, {toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: false}),
      ]),
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(morph, {toValue: 1, duration: 1300, easing: Easing.inOut(Easing.sin), useNativeDriver: false}),
        Animated.timing(morph, {toValue: 0, duration: 1300, easing: Easing.inOut(Easing.sin), useNativeDriver: false}),
      ]),
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(flag, {toValue: 1, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true}),
        Animated.timing(flag, {toValue: 0, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true}),
      ]),
    ).start();
    const listener = counter.addListener(({value}) => setCount(Math.round(value)));
    Animated.timing(counter, {toValue: 128, duration: 1800, easing: Easing.out(Easing.cubic), useNativeDriver: false}).start();
    let i = 0;
    const msg = 'Gestures, morphs, counters, particles, and physics.';
    const timer = setInterval(() => {
      i += 1;
      setTyped(msg.slice(0, i));
      if (i >= msg.length) clearInterval(timer);
    }, 36);
    return () => {
      clearInterval(timer);
      counter.removeListener(listener);
    };
  }, [counter, flag, hero, morph]);

  useEffect(() => {
    const id = setInterval(() => {
      setBalls(current =>
        current.map((ball, index, all) => {
          let vx = ball.vx;
          let vy = ball.vy + 0.34;
          let x = ball.x + vx;
          let y = ball.y + vy;
          if (x <= 0 || x >= 188) vx *= -0.92;
          if (y <= 0) vy *= -0.92;
          if (y >= 128) {
            y = 128;
            vy *= -0.82;
          }
          const other = all[(index + 1) % all.length];
          if (Math.abs(x - other.x) < 34 && Math.abs(y - other.y) < 24) vx *= -1;
          return {...ball, x: Math.max(0, Math.min(188, x)), y: Math.max(0, y), vx, vy};
        }),
      );
    }, 32);
    return () => clearInterval(id);
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: e => {
          dragBase.current = {
            x: (tx as any).__getValue(),
            y: (ty as any).__getValue(),
            scale: (scale as any).__getValue(),
            rotate: (rotate as any).__getValue(),
            distance:
              e.nativeEvent.touches.length > 1
                ? Math.hypot(
                    e.nativeEvent.touches[0].pageX - e.nativeEvent.touches[1].pageX,
                    e.nativeEvent.touches[0].pageY - e.nativeEvent.touches[1].pageY,
                  )
                : 1,
            angle:
              e.nativeEvent.touches.length > 1
                ? Math.atan2(
                    e.nativeEvent.touches[1].pageY - e.nativeEvent.touches[0].pageY,
                    e.nativeEvent.touches[1].pageX - e.nativeEvent.touches[0].pageX,
                  )
                : 0,
          };
        },
        onPanResponderMove: (e, g) => {
          if (e.nativeEvent.touches.length > 1) {
            const distance = Math.hypot(
              e.nativeEvent.touches[0].pageX - e.nativeEvent.touches[1].pageX,
              e.nativeEvent.touches[0].pageY - e.nativeEvent.touches[1].pageY,
            );
            const angle = Math.atan2(
              e.nativeEvent.touches[1].pageY - e.nativeEvent.touches[0].pageY,
              e.nativeEvent.touches[1].pageX - e.nativeEvent.touches[0].pageX,
            );
            scale.setValue(Math.max(0.7, Math.min(1.9, dragBase.current.scale * (distance / dragBase.current.distance))));
            rotate.setValue(dragBase.current.rotate + (angle - dragBase.current.angle));
            return;
          }
          tx.setValue(dragBase.current.x + g.dx);
          ty.setValue(dragBase.current.y + g.dy);
        },
        onPanResponderRelease: () => {
          Animated.parallel([
            Animated.spring(tx, {toValue: 0, damping: 14, stiffness: 120, mass: 0.8, useNativeDriver: true}),
            Animated.spring(ty, {toValue: 0, damping: 14, stiffness: 120, mass: 0.8, useNativeDriver: true}),
          ]).start();
        },
      }),
    [rotate, scale, tx, ty],
  );

  const toggleLike = () => {
    setLiked(v => !v);
    Animated.sequence([
      Animated.spring(likeScale, {toValue: 1.28, tension: 220, friction: 4, useNativeDriver: true}),
      Animated.spring(likeScale, {toValue: 1, tension: 200, friction: 6, useNativeDriver: true}),
    ]).start();
  };

  const toggleStar = () => {
    setStarred(v => !v);
    starSpin.setValue(0);
    Animated.timing(starSpin, {toValue: 1, duration: 500, easing: Easing.out(Easing.back(1.1)), useNativeDriver: true}).start();
  };

  const celebrate = () => {
    confetti.forEach(v => v.setValue(0));
    Animated.stagger(18, confetti.map(v => Animated.timing(v, {toValue: 1, duration: 1100, easing: Easing.out(Easing.cubic), useNativeDriver: true}))).start();
  };

  const openDetail = (card: (typeof CARDS)[number]) => {
    setSelected(card);
    detail.setValue(0);
    Animated.spring(detail, {toValue: 1, damping: 16, stiffness: 160, mass: 0.8, useNativeDriver: true}).start();
  };

  const closeDetail = () => {
    Animated.timing(detail, {toValue: 0, duration: 180, useNativeDriver: true}).start(() => setSelected(null));
  };

  const openShared = (item: (typeof SHARED_ITEMS)[number]) => {
    setSharedItem(item);
    sharedAnim.setValue(0);
    Animated.spring(sharedAnim, {toValue: 1, damping: 18, stiffness: 140, mass: 0.9, useNativeDriver: true}).start();
  };

  const closeShared = () => {
    Animated.timing(sharedAnim, {toValue: 0, duration: 200, useNativeDriver: true}).start(() => setSharedItem(null));
  };

  const toggleLottie = () => {
    if (lottiePlaying) {
      lottieRef.current?.pause();
    } else {
      lottieRef.current?.resume();
    }
    setLottiePlaying(!lottiePlaying);
  };

  return (
    <ScreenContainer>
      <Animated.View
        style={[
          styles.hero,
          {
            backgroundColor: hero.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: ['#0c1234', '#131b49', '#2a123e'],
            }),
          },
        ]}>
        <Text style={styles.kicker}>Phase 3.1</Text>
        <Text style={styles.heroTitle}>Advanced Animations</Text>
        <Text style={styles.heroBody}>
          Layout transitions, gestures, morphing shapes, counters, typewriter
          copy, confetti, micro-interactions, waving ribbon, and physics.
        </Text>
        <View style={styles.heroRow}>
          <View style={styles.metric}><Text style={styles.metricLabel}>Counter</Text><Text style={styles.metricValue}>{count}</Text></View>
          <View style={styles.metric}><Text style={styles.metricLabel}>Scenes</Text><Text style={styles.metricValue}>15</Text></View>
          <Animated.View style={[styles.ribbon, {transform: [{rotate: flag.interpolate({inputRange: [0, 1], outputRange: ['-5deg', '5deg']})}]}]}><Text style={styles.ribbonText}>Waving ribbon</Text></Animated.View>
        </View>
        <View style={styles.terminal}><Text style={styles.terminalText}>{typed}<Text style={styles.cursor}>|</Text></Text></View>
      </Animated.View>

      <Section title="Transitions">
        <Text style={styles.body}>Tap a card to open a shared-element-style reveal overlay. This keeps the same accent and identity between states.</Text>
        <View style={styles.grid}>
          {CARDS.map(card => (
            <Pressable key={card.title} style={[styles.card, {borderColor: card.accent + '66'}]} onPress={() => openDetail(card)}>
              <View style={[styles.bar, {backgroundColor: card.accent}]} />
              <Text style={[styles.cardTitle, {color: card.accent}]}>{card.title}</Text>
              <Text style={styles.cardBody}>{card.body}</Text>
            </Pressable>
          ))}
        </View>
      </Section>

      <Section title="Layout and Gestures">
        <Text style={styles.body}>Add, shuffle, or remove nodes for `LayoutAnimation`. Drag with one finger; pinch and rotate with two fingers.</Text>
        <View style={styles.row}>
          <Pressable style={styles.button} onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setTiles(t => [...t, {id: String(Date.now()), label: `Node ${t.length + 1}`, accent: Neon[t.length % Neon.length]}]); }}><Text style={styles.buttonText}>Add</Text></Pressable>
          <Pressable style={styles.button} onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.spring); setTiles(t => [...t].reverse()); }}><Text style={styles.buttonText}>Shuffle</Text></Pressable>
          <Pressable style={styles.button} onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setTiles(t => t.slice(0, -1)); }}><Text style={styles.buttonText}>Remove</Text></Pressable>
        </View>
        <View style={styles.tileGrid}>{tiles.map(tile => <View key={tile.id} style={[styles.tile, {borderColor: tile.accent + '44'}]}><Text style={[styles.tileText, {color: tile.accent}]}>{tile.label}</Text></View>)}</View>
        <View style={styles.gestureWrap}>
          <View style={styles.gestureStage}>
            <Animated.View
              {...panResponder.panHandlers}
              style={[
                styles.token,
                {
                  transform: [
                    {translateX: tx},
                    {translateY: ty},
                    {scale},
                    {rotate: rotate.interpolate({inputRange: [-Math.PI, Math.PI], outputRange: ['-180deg', '180deg']})},
                  ],
                },
              ]}>
              <Text style={styles.tokenText}>Gesture</Text>
            </Animated.View>
          </View>
          <View style={styles.morph}>
            <Animated.View style={[styles.shape, {borderRadius: morph.interpolate({inputRange: [0, 0.5, 1], outputRange: [16, 52, 10]}), backgroundColor: morph.interpolate({inputRange: [0, 0.5, 1], outputRange: [Colors.primary, Colors.secondary, Colors.success]}), transform: [{rotate: morph.interpolate({inputRange: [0, 0.5, 1], outputRange: ['0deg', '45deg', '90deg']})}, {scale: morph.interpolate({inputRange: [0, 0.5, 1], outputRange: [1, 1.22, 0.92]})}]}]} />
            <View style={styles.loader}>{[0, 1, 2].map(i => <Animated.View key={i} style={[styles.dot, {backgroundColor: Neon[i], transform: [{translateY: morph.interpolate({inputRange: [0, 0.5, 1], outputRange: [i === 0 ? 0 : 8, i === 1 ? -10 : 8, i === 2 ? -6 : 10]})}]}]} />)}</View>
            <Text style={styles.caption}>Morph + custom loader</Text>
          </View>
        </View>
      </Section>

      <Section title="Interactions and Physics">
        <Text style={styles.body}>Typewriter, counter, micro-interactions, confetti, and a tiny gravity + collision sandbox.</Text>
        <View style={styles.socialRow}>
          <Pressable style={styles.social} onPress={toggleLike}><Animated.Text style={[styles.icon, {color: liked ? Colors.error : Colors.textPrimary, transform: [{scale: likeScale}]}]}>{'\u2665'}</Animated.Text><Text style={styles.caption}>Like</Text></Pressable>
          <Pressable style={styles.social} onPress={toggleStar}><Animated.Text style={[styles.icon, {color: starred ? Colors.warning : Colors.textPrimary, transform: [{rotate: starSpin.interpolate({inputRange: [0, 1], outputRange: ['0deg', '360deg']})}]}]}>{'\u2605'}</Animated.Text><Text style={styles.caption}>Favorite</Text></Pressable>
          <Pressable style={styles.social} onPress={() => setKpi(v => v + 23)}><Text style={styles.counter}>{kpi}</Text><Text style={styles.caption}>Ticker</Text></Pressable>
        </View>
        <Pressable style={styles.primary} onPress={celebrate}><Text style={styles.primaryText}>Celebrate</Text></Pressable>
        <View style={styles.confettiBox}>{confetti.map((v, i) => <Animated.View key={i} style={[styles.piece, {left: `${8 + i * 8}%`, backgroundColor: Neon[i % Neon.length], opacity: v.interpolate({inputRange: [0, 0.8, 1], outputRange: [0, 1, 0]}), transform: [{translateY: v.interpolate({inputRange: [0, 1], outputRange: [0, 120 + i * 4]})}, {translateX: v.interpolate({inputRange: [0, 1], outputRange: [0, (i % 2 === 0 ? 1 : -1) * (18 + i * 2)]})}, {rotate: v.interpolate({inputRange: [0, 1], outputRange: ['0deg', `${(i % 2 === 0 ? 1 : -1) * 180}deg`]})}]}]} />)}</View>
        <View style={styles.physics}>{balls.map((b, i) => <View key={i} style={[styles.ball, {backgroundColor: b.color, transform: [{translateX: b.x}, {translateY: b.y}]}]} />)}</View>
      </Section>

      <Section title="Shared Element Transition">
        <Text style={styles.body}>Tap a card — the icon and accent travel from source to destination, simulating a cross-screen shared element transition.</Text>
        <View style={[styles.grid, {flexDirection: 'row', flexWrap: 'wrap'}]}>
          {SHARED_ITEMS.map(item => (
            <Pressable key={item.id} style={[styles.sharedCard, {borderColor: item.color + '55'}]} onPress={() => openShared(item)}>
              <Text style={styles.sharedIcon}>{item.icon}</Text>
              <Text style={[styles.sharedTitle, {color: item.color}]}>{item.title}</Text>
            </Pressable>
          ))}
        </View>
      </Section>

      <Section title="Lottie Animations">
        <Text style={styles.body}>Native Lottie player rendering After Effects animations at 60 fps. Switch animations, control speed, and play/pause.</Text>
        <View style={styles.lottieContainer}>
          <LottieView
            ref={lottieRef}
            source={LOTTIE_ANIMS[lottieIndex].source}
            autoPlay
            loop
            speed={lottieSpeed}
            style={styles.lottiePlayer}
          />
        </View>
        <View style={styles.row}>
          {LOTTIE_ANIMS.map((a, i) => (
            <Pressable key={a.label} style={[styles.button, lottieIndex === i && {borderColor: Colors.primary, backgroundColor: Colors.primary + '22'}]} onPress={() => { setLottieIndex(i); setLottiePlaying(true); }}>
              <Text style={[styles.buttonText, lottieIndex === i && {color: Colors.primary}]}>{a.label}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.row}>
          <Pressable style={[styles.button, {borderColor: lottiePlaying ? Colors.error + '66' : Colors.success + '66'}]} onPress={toggleLottie}>
            <Text style={[styles.buttonText, {color: lottiePlaying ? Colors.error : Colors.success}]}>{lottiePlaying ? '\u23F8 Pause' : '\u25B6 Play'}</Text>
          </Pressable>
          {[0.5, 1, 2].map(s => (
            <Pressable key={s} style={[styles.button, lottieSpeed === s && {borderColor: Colors.warning, backgroundColor: Colors.warning + '22'}]} onPress={() => setLottieSpeed(s)}>
              <Text style={[styles.buttonText, lottieSpeed === s && {color: Colors.warning}]}>{s}x</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.note}>
          <Text style={styles.noteTitle}>Phase 3.1 Complete</Text>
          <Text style={styles.noteBody}>All advanced animation items implemented: Animated API demos, Reanimated worklets, shared element transitions, and Lottie animations.</Text>
        </View>
      </Section>

      {selected ? (
        <Animated.View style={[styles.overlay, {opacity: detail}]}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={closeDetail} />
          <Animated.View style={[styles.detail, {transform: [{scale: detail.interpolate({inputRange: [0, 1], outputRange: [0.88, 1]})}, {translateY: detail.interpolate({inputRange: [0, 1], outputRange: [28, 0]})}]}]}>
            <View style={[styles.detailGlow, {backgroundColor: selected.accent + '22'}]} />
            <Text style={[styles.detailTitle, {color: selected.accent}]}>{selected.title}</Text>
            <Text style={styles.detailBody}>{selected.body}</Text>
            <Text style={styles.caption}>Shared-element-style reveal state</Text>
            <Pressable style={styles.button} onPress={closeDetail}><Text style={styles.buttonText}>Close</Text></Pressable>
          </Animated.View>
        </Animated.View>
      ) : null}

      {sharedItem ? (
        <Animated.View style={[styles.overlay, {opacity: sharedAnim}]}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={closeShared} />
          <Animated.View style={[styles.sharedDetail, {transform: [{scale: sharedAnim.interpolate({inputRange: [0, 1], outputRange: [0.5, 1]})}, {translateY: sharedAnim.interpolate({inputRange: [0, 1], outputRange: [60, 0]})}]}]}>
            <View style={[styles.detailGlow, {backgroundColor: sharedItem.color + '22'}]} />
            <Animated.Text style={[styles.sharedDetailIcon, {transform: [{scale: sharedAnim.interpolate({inputRange: [0, 0.6, 1], outputRange: [2.5, 1.1, 1]})}]}]}>{sharedItem.icon}</Animated.Text>
            <Text style={[styles.detailTitle, {color: sharedItem.color}]}>{sharedItem.title}</Text>
            <Text style={styles.detailBody}>{sharedItem.desc}</Text>
            <Text style={styles.caption}>Shared element transition</Text>
            <Pressable style={styles.button} onPress={closeShared}><Text style={styles.buttonText}>Close</Text></Pressable>
          </Animated.View>
        </Animated.View>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
    padding: Spacing.lg,
    gap: Spacing.sm,
    overflow: 'hidden',
  },
  kicker: {
    ...Typography.label,
    color: Colors.primary,
  },
  heroTitle: {
    ...Typography.h2,
    color: Colors.white,
  },
  heroBody: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  heroRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  metric: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  metricLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  metricValue: {
    ...Typography.h4,
    color: Colors.white,
  },
  ribbon: {
    marginLeft: 'auto',
    borderRadius: Radius.full,
    backgroundColor: Colors.warning,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  ribbonText: {
    ...Typography.caption,
    color: Colors.bg,
    fontWeight: '700',
  },
  terminal: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: '#090d20',
    padding: Spacing.md,
  },
  terminalText: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    minHeight: 18,
  },
  cursor: {
    color: Colors.primary,
  },
  body: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginHorizontal: 16,
    marginBottom: Spacing.md,
  },
  grid: {
    marginHorizontal: 16,
    gap: Spacing.md,
  },
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    backgroundColor: Colors.bgCard,
    padding: Spacing.lg,
  },
  bar: {
    width: 40,
    height: 4,
    borderRadius: Radius.full,
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    ...Typography.h4,
    marginBottom: 4,
  },
  cardBody: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginHorizontal: 16,
    marginBottom: Spacing.md,
  },
  button: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  buttonText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginHorizontal: 16,
    marginBottom: Spacing.md,
  },
  tile: {
    width: '47%',
    minHeight: 72,
    borderRadius: Radius.lg,
    borderWidth: 1,
    backgroundColor: Colors.bgCard,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  tileText: {
    ...Typography.h4,
  },
  gestureWrap: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginHorizontal: 16,
  },
  gestureStage: {
    flex: 1.2,
    minHeight: 220,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  token: {
    width: 116,
    height: 116,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenText: {
    ...Typography.label,
    color: Colors.primary,
  },
  morph: {
    flex: 1,
    minHeight: 220,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  shape: {
    width: 86,
    height: 86,
  },
  loader: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-end',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: Radius.full,
  },
  caption: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  socialRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginHorizontal: 16,
    marginBottom: Spacing.md,
  },
  social: {
    flex: 1,
    minHeight: 140,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  icon: {
    fontSize: 32,
  },
  counter: {
    ...Typography.h2,
    color: Colors.primary,
  },
  primary: {
    marginHorizontal: 16,
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  primaryText: {
    ...Typography.label,
    color: Colors.bg,
  },
  confettiBox: {
    height: 140,
    marginHorizontal: 16,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.bgCard,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  piece: {
    position: 'absolute',
    top: 0,
    width: 10,
    height: 18,
    borderRadius: 3,
  },
  physics: {
    height: 170,
    marginHorizontal: 16,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.bgCard,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  ball: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  note: {
    marginHorizontal: 16,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
  },
  noteTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  noteBody: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  sharedCard: {
    flex: 1,
    minWidth: 90,
    borderRadius: Radius.xl,
    borderWidth: 1,
    backgroundColor: Colors.bgCard,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sharedIcon: {
    fontSize: 36,
  },
  sharedTitle: {
    ...Typography.label,
  },
  sharedDetail: {
    width: '84%',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.bgCard,
    padding: Spacing.lg,
    gap: Spacing.sm,
    overflow: 'hidden',
    alignItems: 'center',
  },
  sharedDetailIcon: {
    fontSize: 64,
    marginVertical: Spacing.md,
  },
  lottieContainer: {
    marginHorizontal: 16,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  lottiePlayer: {
    width: 160,
    height: 160,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detail: {
    width: '84%',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.bgCard,
    padding: Spacing.lg,
    gap: Spacing.sm,
    overflow: 'hidden',
  },
  detailGlow: {
    position: 'absolute',
    top: -40,
    right: -10,
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  detailTitle: {
    ...Typography.h2,
  },
  detailBody: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});
