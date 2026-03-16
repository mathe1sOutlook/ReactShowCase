import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, {Line, Rect} from 'react-native-svg';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {Colors, Radius, Spacing} from '../theme';

type ScanKind = 'qr' | 'barcode';
type BarcodeFormat = 'CODE128' | 'EAN13' | 'UPCA';
type HistoryFilter = 'all' | ScanKind;

type ScanSample = {
  label: string;
  payload: string;
};

type HistoryItem = {
  id: string;
  kind: ScanKind;
  label: string;
  payload: string;
  source: 'camera' | 'generator';
  timestamp: string;
};

const QR_CAMERA_SAMPLES: ScanSample[] = [
  {
    label: 'Event Ticket',
    payload: 'showcase://event/alpha?seat=A-17',
  },
  {
    label: 'Wi-Fi Setup',
    payload: 'WIFI:T:WPA;S:ShowcaseLab;P:demo12345;;',
  },
  {
    label: 'Profile Card',
    payload: 'MECARD:N:Mathe;TEL:+55 11 99999-1111;EMAIL:mathe@showcase.dev;;',
  },
  {
    label: 'App Deep Link',
    payload: 'cfdandroid://codes?from=qr-demo',
  },
];

const BARCODE_CAMERA_SAMPLES: ScanSample[] = [
  {
    label: 'Warehouse Bin',
    payload: 'INV-2048-ALPHA',
  },
  {
    label: 'Retail Pack',
    payload: '7894900011517',
  },
  {
    label: 'Shipping Label',
    payload: 'PKG-8821-4412',
  },
  {
    label: 'UPC Shelf Tag',
    payload: '725272730706',
  },
];

const BARCODE_FORMATS: BarcodeFormat[] = ['CODE128', 'EAN13', 'UPCA'];
const HISTORY_FILTERS: HistoryFilter[] = ['all', 'qr', 'barcode'];

function withAlpha(color: string, alpha: number) {
  const hex = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();
  return `${color}${hex}`;
}

function pickTextColor(color: string) {
  const normalized = color.replace('#', '');
  if (normalized.length !== 6) {
    return '#081018';
  }
  const red = parseInt(normalized.slice(0, 2), 16);
  const green = parseInt(normalized.slice(2, 4), 16);
  const blue = parseInt(normalized.slice(4, 6), 16);
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000;
  return luminance >= 150 ? '#081018' : '#FFFFFF';
}

function toTimestamp(date = new Date()) {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function normalizeBarcodeInput(value: string, format: BarcodeFormat) {
  if (format === 'CODE128') {
    const sanitized = value.toUpperCase().replace(/[^A-Z0-9\-./ ]/g, '');
    return sanitized || 'SHOWCASE-128';
  }

  const digits = value.replace(/\D/g, '');
  if (format === 'EAN13') {
    return digits.padEnd(13, '0').slice(0, 13) || '7894900011517';
  }
  return digits.padEnd(12, '0').slice(0, 12) || '725272730706';
}

function buildQrMatrix(payload: string, size = 25) {
  const matrix = Array.from({length: size}, () =>
    Array<boolean | null>(size).fill(null),
  );
  const seed = hashString(payload);

  const placeFinder = (startRow: number, startCol: number) => {
    for (let row = 0; row < 7; row += 1) {
      for (let col = 0; col < 7; col += 1) {
        const targetRow = startRow + row;
        const targetCol = startCol + col;
        const outer =
          row === 0 || row === 6 || col === 0 || col === 6;
        const inner = row >= 2 && row <= 4 && col >= 2 && col <= 4;
        matrix[targetRow][targetCol] = outer || inner;
      }
    }
  };

  const placeAlignment = (startRow: number, startCol: number) => {
    for (let row = 0; row < 5; row += 1) {
      for (let col = 0; col < 5; col += 1) {
        const outer =
          row === 0 || row === 4 || col === 0 || col === 4;
        const center = row === 2 && col === 2;
        matrix[startRow + row][startCol + col] = outer || center;
      }
    }
  };

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);
  placeAlignment(size - 9, size - 9);

  for (let index = 8; index < size - 8; index += 1) {
    matrix[6][index] = index % 2 === 0;
    matrix[index][6] = index % 2 === 0;
  }

  matrix[size - 8][8] = true;

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (matrix[row][col] !== null) {
        continue;
      }
      const noise =
        (seed ^
          Math.imul(row + 11, 73856093) ^
          Math.imul(col + 17, 19349663) ^
          Math.imul(row + col + 19, 83492791)) >>>
        0;
      matrix[row][col] = noise % 7 < 3;
    }
  }

  return matrix as boolean[][];
}

function buildBarcodeModules(payload: string, format: BarcodeFormat) {
  const normalized = normalizeBarcodeInput(payload, format);
  const salt = format === 'CODE128' ? 17 : format === 'EAN13' ? 29 : 37;
  const modules: boolean[] = Array.from({length: 10}, () => false);

  const appendPattern = (pattern: string) => {
    pattern.split('').forEach(bit => modules.push(bit === '1'));
    modules.push(false);
  };

  appendPattern('101011');

  normalized.split('').forEach((char, index) => {
    const value = char.charCodeAt(0) + salt + index * 11;
    const bits = Array.from({length: 8}, (_, bit) =>
      ((value >> bit) ^ (index % 2 === 0 ? 1 : 0)) & 1 ? '1' : '0',
    ).join('');
    appendPattern(bits.replace(/0{3,}/g, '010'));
  });

  appendPattern('1101011');
  modules.push(...Array.from({length: 10}, () => false));

  return modules;
}

function OptionChip({
  label,
  active,
  accent,
  onPress,
}: {
  label: string;
  active: boolean;
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.optionChip,
        active && {
          borderColor: accent,
          backgroundColor: withAlpha(accent, 0.14),
        },
      ]}
      onPress={onPress}>
      <Text style={[styles.optionChipText, active && {color: accent}]}>
        {label}
      </Text>
    </Pressable>
  );
}

function QrGraphic({
  payload,
  accent,
  background,
  size = 180,
}: {
  payload: string;
  accent: string;
  background: string;
  size?: number;
}) {
  const matrix = buildQrMatrix(payload);
  const viewSize = matrix.length + 4;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${viewSize} ${viewSize}`}>
      <Rect
        x={0}
        y={0}
        width={viewSize}
        height={viewSize}
        rx={3}
        fill={background}
      />
      {matrix.map((row, rowIndex) =>
        row.map((cell, columnIndex) =>
          cell ? (
            <Rect
              key={`${rowIndex}-${columnIndex}`}
              x={columnIndex + 2}
              y={rowIndex + 2}
              width={1}
              height={1}
              fill={accent}
            />
          ) : null,
        ),
      )}
    </Svg>
  );
}

function BarcodeGraphic({
  payload,
  format,
  accent,
  background,
  width = 260,
  height = 120,
}: {
  payload: string;
  format: BarcodeFormat;
  accent: string;
  background: string;
  width?: number;
  height?: number;
}) {
  const modules = buildBarcodeModules(payload, format);
  const moduleWidth = width / modules.length;
  const barHeight = height - 22;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Rect x={0} y={0} width={width} height={height} rx={12} fill={background} />
      {modules.map((filled, index) =>
        filled ? (
          <Rect
            key={index}
            x={index * moduleWidth}
            y={10}
            width={moduleWidth}
            height={barHeight}
            fill={accent}
          />
        ) : null,
      )}
      <Line
        x1={0}
        y1={height - 10}
        x2={width}
        y2={height - 10}
        stroke={withAlpha(accent, 0.18)}
        strokeWidth={1}
      />
    </Svg>
  );
}

export default function CodesScreen() {
  const {width} = useWindowDimensions();
  const fullWidth = width - Spacing.lg * 2;
  const halfWidth = width >= 1080 ? (fullWidth - Spacing.md) / 2 : fullWidth;
  const generatorWidth =
    width >= 1080
      ? (fullWidth - Spacing.lg * 2 - Spacing.md) / 2
      : fullWidth - Spacing.lg * 2;
  const [scannerKind, setScannerKind] = useState<ScanKind>('qr');
  const [barcodeFormat, setBarcodeFormat] = useState<BarcodeFormat>('CODE128');
  const [qrSampleIndex, setQrSampleIndex] = useState(0);
  const [barcodeSampleIndex, setBarcodeSampleIndex] = useState(0);
  const [qrInput, setQrInput] = useState('showcase://codes/generate?palette=neon');
  const [barcodeInput, setBarcodeInput] = useState('SHOWCASE-128');
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all');
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: 'seed-qr',
      kind: 'qr',
      label: 'Event Ticket',
      payload: QR_CAMERA_SAMPLES[0].payload,
      source: 'camera',
      timestamp: '09:12',
    },
    {
      id: 'seed-barcode',
      kind: 'barcode',
      label: 'Warehouse Bin',
      payload: BARCODE_CAMERA_SAMPLES[0].payload,
      source: 'camera',
      timestamp: '09:16',
    },
  ]);
  const [status, setStatus] = useState('Scanner ready. Aim at a QR or barcode target.');
  const sweepAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sweepAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(sweepAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [sweepAnim]);

  const activeSamples =
    scannerKind === 'qr' ? QR_CAMERA_SAMPLES : BARCODE_CAMERA_SAMPLES;
  const activeSampleIndex =
    scannerKind === 'qr' ? qrSampleIndex : barcodeSampleIndex;
  const activeSample = activeSamples[activeSampleIndex];
  const scannerAccent = scannerKind === 'qr' ? Colors.primary : Colors.warning;
  const scannerBackground = scannerKind === 'qr' ? '#FFFFFF' : '#FFF7E8';
  const scannerButtonText = pickTextColor(scannerAccent);
  const normalizedBarcode = normalizeBarcodeInput(barcodeInput, barcodeFormat);

  const addHistory = (
    kind: ScanKind,
    label: string,
    payload: string,
    source: 'camera' | 'generator',
  ) => {
    setHistory(current => [
      {
        id: `${Date.now()}-${kind}-${current.length}`,
        kind,
        label,
        payload,
        source,
        timestamp: toTimestamp(),
      },
      ...current,
    ].slice(0, 12));
  };

  const scanCurrentTarget = () => {
    addHistory(scannerKind, activeSample.label, activeSample.payload, 'camera');
    if (scannerKind === 'qr') {
      setQrInput(activeSample.payload);
    } else {
      setBarcodeInput(activeSample.payload);
    }
    setStatus(
      `Captured ${scannerKind === 'qr' ? 'QR' : 'barcode'} sample "${activeSample.label}".`,
    );
  };

  const advanceTarget = () => {
    if (scannerKind === 'qr') {
      setQrSampleIndex(previous => (previous + 1) % QR_CAMERA_SAMPLES.length);
    } else {
      setBarcodeSampleIndex(
        previous => (previous + 1) % BARCODE_CAMERA_SAMPLES.length,
      );
    }
  };

  const filteredHistory = history.filter(item =>
    historyFilter === 'all' ? true : item.kind === historyFilter,
  );

  return (
    <ScreenContainer>
      <View style={styles.root}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>PHASE 8.4</Text>
          <Text style={styles.title}>QR & Barcode</Text>
          <Text style={styles.body}>
            Camera-style scanning, SVG generators for QR and barcode payloads, multiple barcode
            formats and a persistent scan history flow inside one lab.
          </Text>
          <View style={styles.pills}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>5 demos</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{history.length} history items</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{scannerKind.toUpperCase()} scanner</Text>
            </View>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={[styles.card, {width: halfWidth}]}>
            <Text style={styles.cardTitle}>Scanner viewport</Text>
            <Text style={styles.cardSubtitle}>
              Toggle between QR and barcode scanning, step through sample targets and capture them
              into history.
            </Text>

            <View style={styles.wrap}>
              {(['qr', 'barcode'] as ScanKind[]).map(kind => (
                <OptionChip
                  key={kind}
                  label={kind === 'qr' ? 'QR camera' : 'Barcode reader'}
                  active={scannerKind === kind}
                  accent={kind === 'qr' ? Colors.primary : Colors.warning}
                  onPress={() => setScannerKind(kind)}
                />
              ))}
            </View>

            <View style={styles.scannerShell}>
              <View
                style={[
                  styles.scannerFrame,
                  {
                    borderColor: scannerAccent,
                    backgroundColor: withAlpha(scannerAccent, 0.07),
                  },
                ]}>
                <View style={styles.scannerCorners}>
                  {[
                    styles.cornerTopLeft,
                    styles.cornerTopRight,
                    styles.cornerBottomLeft,
                    styles.cornerBottomRight,
                  ].map((cornerStyle, index) => (
                    <View
                      key={index}
                      style={[
                        styles.corner,
                        cornerStyle,
                        {borderColor: scannerAccent},
                      ]}
                    />
                  ))}
                </View>
                <View style={styles.scannerTarget}>
                  {scannerKind === 'qr' ? (
                    <QrGraphic
                      payload={activeSample.payload}
                      accent={scannerAccent}
                      background={scannerBackground}
                      size={156}
                    />
                  ) : (
                    <BarcodeGraphic
                      payload={activeSample.payload}
                      format={
                        /^\d{13}$/.test(activeSample.payload)
                          ? 'EAN13'
                          : /^\d{12}$/.test(activeSample.payload)
                            ? 'UPCA'
                            : 'CODE128'
                      }
                      accent={scannerAccent}
                      background={scannerBackground}
                      width={240}
                      height={108}
                    />
                  )}
                </View>
                <Animated.View
                  style={[
                    styles.scanBeam,
                    {
                      backgroundColor: withAlpha(scannerAccent, 0.58),
                      transform: [
                        {
                          translateY: sweepAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-110, 110],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.sampleList}>
              {activeSamples.map((sample, index) => (
                <OptionChip
                  key={sample.label}
                  label={sample.label}
                  active={activeSampleIndex === index}
                  accent={scannerAccent}
                  onPress={() =>
                    scannerKind === 'qr'
                      ? setQrSampleIndex(index)
                      : setBarcodeSampleIndex(index)
                  }
                />
              ))}
            </View>

            <View style={styles.inlineRow}>
              <Pressable
                style={[styles.primaryButton, {backgroundColor: scannerAccent}]}
                onPress={scanCurrentTarget}>
                <Text style={[styles.primaryButtonText, {color: scannerButtonText}]}>
                  Scan current target
                </Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={advanceTarget}>
                <Text style={styles.secondaryButtonText}>Next target</Text>
              </Pressable>
            </View>

            <Text style={styles.note}>{status}</Text>
          </View>

          <View style={[styles.card, {width: halfWidth}]}>
            <Text style={styles.cardTitle}>Scan history</Text>
            <Text style={styles.cardSubtitle}>
              Filter captures by type, review recent payloads and tap an item to reopen it in the
              generator area.
            </Text>

            <View style={styles.wrap}>
              {HISTORY_FILTERS.map(filter => (
                <OptionChip
                  key={filter}
                  label={filter === 'all' ? 'All' : filter.toUpperCase()}
                  active={historyFilter === filter}
                  accent={Colors.secondary}
                  onPress={() => setHistoryFilter(filter)}
                />
              ))}
              <Pressable
                style={styles.clearAction}
                onPress={() => {
                  setHistory([]);
                  setStatus('History cleared. Scanner remains ready.');
                }}>
                <Text style={styles.clearActionText}>Clear history</Text>
              </Pressable>
            </View>

            <View style={styles.historyList}>
              {filteredHistory.length === 0 ? (
                <View style={styles.emptyHistory}>
                  <Text style={styles.emptyHistoryTitle}>No scans in this filter</Text>
                  <Text style={styles.emptyHistoryText}>
                    Capture a new target or store a generated code to populate the timeline.
                  </Text>
                </View>
              ) : (
                filteredHistory.map(item => (
                  <Pressable
                    key={item.id}
                    style={styles.historyItem}
                    onPress={() => {
                      if (item.kind === 'qr') {
                        setQrInput(item.payload);
                      } else {
                        setBarcodeInput(item.payload);
                      }
                      setStatus(`Loaded "${item.label}" from history into the generator.`);
                    }}>
                    <View
                      style={[
                        styles.historyKind,
                        {
                          backgroundColor:
                            item.kind === 'qr'
                              ? withAlpha(Colors.primary, 0.14)
                              : withAlpha(Colors.warning, 0.14),
                        },
                      ]}>
                      <Text
                        style={[
                          styles.historyKindText,
                          {
                            color:
                              item.kind === 'qr'
                                ? Colors.primary
                                : Colors.warning,
                          },
                        ]}>
                        {item.kind.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.historyCopy}>
                      <Text style={styles.historyTitle}>{item.label}</Text>
                      <Text style={styles.historyPayload}>{item.payload}</Text>
                    </View>
                    <View style={styles.historyMeta}>
                      <Text style={styles.historyMetaText}>{item.source}</Text>
                      <Text style={styles.historyMetaText}>{item.timestamp}</Text>
                    </View>
                  </Pressable>
                ))
              )}
            </View>
          </View>
        </View>

        <View style={[styles.card, {width: fullWidth}]}>
          <Text style={styles.cardTitle}>Generators</Text>
          <Text style={styles.cardSubtitle}>
            Generate QR payloads and multiple barcode formats, then push them into scan history for
            a complete round trip.
          </Text>

          <View style={styles.grid}>
            <View style={[styles.generatorPanel, {width: generatorWidth}]}>
              <Text style={styles.generatorTitle}>QR code generator</Text>
              <TextInput
                style={styles.input}
                value={qrInput}
                onChangeText={setQrInput}
                placeholder="Enter any URI, text or Wi-Fi payload"
                placeholderTextColor={Colors.textSecondary}
              />
              <View style={styles.generatorPreview}>
                <QrGraphic
                  payload={qrInput.trim() || 'showcase://codes/default'}
                  accent={Colors.primary}
                  background="#FFFFFF"
                  size={200}
                />
              </View>
              <View style={styles.inlineRow}>
                <Pressable
                  style={[styles.primaryButton, {backgroundColor: Colors.primary}]}
                  onPress={() => {
                    addHistory('qr', 'Generated QR', qrInput.trim() || 'showcase://codes/default', 'generator');
                    setStatus('Generated QR stored in scan history.');
                  }}>
                  <Text
                    style={[
                      styles.primaryButtonText,
                      {color: pickTextColor(Colors.primary)},
                    ]}>
                    Store QR
                  </Text>
                </Pressable>
                <Pressable
                  style={styles.secondaryButton}
                  onPress={() => {
                    setScannerKind('qr');
                    setStatus('Scanner switched to QR mode for the generated payload.');
                  }}>
                  <Text style={styles.secondaryButtonText}>Open in scanner</Text>
                </Pressable>
              </View>
            </View>

            <View style={[styles.generatorPanel, {width: generatorWidth}]}>
              <Text style={styles.generatorTitle}>Barcode generator</Text>
              <TextInput
                style={styles.input}
                value={barcodeInput}
                onChangeText={setBarcodeInput}
                placeholder="Inventory code, UPC or EAN payload"
                placeholderTextColor={Colors.textSecondary}
              />
              <View style={styles.wrap}>
                {BARCODE_FORMATS.map(format => (
                  <OptionChip
                    key={format}
                    label={format}
                    active={barcodeFormat === format}
                    accent={Colors.warning}
                    onPress={() => setBarcodeFormat(format)}
                  />
                ))}
              </View>
              <View style={styles.generatorPreviewWide}>
                <BarcodeGraphic
                  payload={normalizedBarcode}
                  format={barcodeFormat}
                  accent={Colors.warning}
                  background="#FFF7E8"
                  width={280}
                  height={124}
                />
                <Text style={styles.generatorCaption}>{normalizedBarcode}</Text>
              </View>
              <View style={styles.inlineRow}>
                <Pressable
                  style={[styles.primaryButton, {backgroundColor: Colors.warning}]}
                  onPress={() => {
                    addHistory('barcode', `Generated ${barcodeFormat}`, normalizedBarcode, 'generator');
                    setStatus(`${barcodeFormat} barcode stored in scan history.`);
                  }}>
                  <Text
                    style={[
                      styles.primaryButtonText,
                      {color: pickTextColor(Colors.warning)},
                    ]}>
                    Store barcode
                  </Text>
                </Pressable>
                <Pressable
                  style={styles.secondaryButton}
                  onPress={() => {
                    setScannerKind('barcode');
                    setStatus('Scanner switched to barcode mode for the generated payload.');
                  }}>
                  <Text style={styles.secondaryButtonText}>Open in scanner</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.lg,
  },
  hero: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.8,
    color: Colors.primary,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  pill: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  optionChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  scannerShell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerFrame: {
    width: '100%',
    minHeight: 320,
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  scannerCorners: {
    ...StyleSheet.absoluteFillObject,
  },
  corner: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderWidth: 4,
  },
  cornerTopLeft: {
    top: 16,
    left: 16,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerTopRight: {
    top: 16,
    right: 16,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  cornerBottomLeft: {
    bottom: 16,
    left: 16,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  cornerBottomRight: {
    bottom: 16,
    right: 16,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scannerTarget: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  scanBeam: {
    position: 'absolute',
    left: 24,
    right: 24,
    height: 2,
    shadowOpacity: 1,
    shadowOffset: {width: 0, height: 0},
    shadowRadius: 8,
  },
  sampleList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  inlineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  primaryButton: {
    borderRadius: Radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 152,
  },
  primaryButtonText: {
    fontSize: 12,
    fontWeight: '900',
  },
  secondaryButton: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 152,
  },
  secondaryButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  note: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  clearAction: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: withAlpha(Colors.error, 0.08),
  },
  clearActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.error,
  },
  historyList: {
    gap: Spacing.sm,
  },
  emptyHistory: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  emptyHistoryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  emptyHistoryText: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  historyItem: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  historyKind: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  historyKindText: {
    fontSize: 10,
    fontWeight: '900',
  },
  historyCopy: {
    gap: 4,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  historyPayload: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  historyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  historyMetaText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  generatorPanel: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  generatorTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: Colors.bgCard,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  generatorPreview: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: withAlpha(Colors.primary, 0.05),
  },
  generatorPreviewWide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: withAlpha(Colors.warning, 0.05),
    gap: Spacing.sm,
  },
  generatorCaption: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.4,
  },
});
