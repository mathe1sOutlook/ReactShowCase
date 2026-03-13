import React, {useEffect, useRef, useState} from 'react';
import {Animated, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {Colors, Radius, Spacing, Typography, neonShadow} from '../../theme';

type DemoCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

type ExpandablePanelProps = {
  open: boolean;
  maxHeight: number;
  children: React.ReactNode;
};

type TimeValue = {
  hour24: number;
  minute: number;
};

type HslColor = {
  h: number;
  s: number;
  l: number;
};

type RgbColor = {
  r: number;
  g: number;
  b: number;
};

type SelectOption = {
  label: string;
  detail: string;
};

type FileFilter = 'All' | 'Docs' | 'Media' | 'Archive';

type FileItem = {
  name: string;
  type: string;
  size: string;
  updated: string;
  category: Exclude<FileFilter, 'All'>;
};

type ImageSourceKind = 'Gallery' | 'Camera';

type ImageItem = {
  id: string;
  title: string;
  source: ImageSourceKind;
  tint: string;
  resolution: string;
  aspect: string;
  note: string;
};

type CountryItem = {
  iso: string;
  name: string;
  dial: string;
  sample: string;
};

type TimeZone = 'BRT' | 'UTC' | 'EST';

const SELECT_OPTIONS: SelectOption[] = [
  {
    label: 'Discovery sprint',
    detail: 'Align scope, users, and constraints before visual design.',
  },
  {
    label: 'Pilot release',
    detail: 'Ship a controlled launch with fast feedback loops.',
  },
  {
    label: 'Operations cockpit',
    detail: 'Prioritize dense dashboards for daily field execution.',
  },
  {
    label: 'Client portal',
    detail: 'Optimize handoff flows, approvals, and branded reports.',
  },
];

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const HOUR_OPTIONS = [8, 9, 10, 11, 12, 1, 2, 3, 4, 5];
const MINUTE_OPTIONS = [0, 15, 30, 45];
const TIMEZONE_OPTIONS: TimeZone[] = ['BRT', 'UTC', 'EST'];
const FILE_FILTERS: FileFilter[] = ['All', 'Docs', 'Media', 'Archive'];
const COLOR_PRESETS = [
  Colors.primary,
  Colors.secondary,
  Colors.accent,
  Colors.success,
  Colors.orange,
  Colors.pink,
];

const FILE_LIBRARY: FileItem[] = [
  {
    name: 'proposal-v4.pdf',
    type: 'PDF',
    size: '2.4 MB',
    updated: 'Updated 2h ago',
    category: 'Docs',
  },
  {
    name: 'launch-checklist.docx',
    type: 'DOCX',
    size: '860 KB',
    updated: 'Updated yesterday',
    category: 'Docs',
  },
  {
    name: 'brand-assets.zip',
    type: 'ZIP',
    size: '18.2 MB',
    updated: 'Updated 4d ago',
    category: 'Archive',
  },
  {
    name: 'ops-kpi-export.csv',
    type: 'CSV',
    size: '320 KB',
    updated: 'Updated 30m ago',
    category: 'Docs',
  },
  {
    name: 'facility-hero.png',
    type: 'PNG',
    size: '4.9 MB',
    updated: 'Updated 1d ago',
    category: 'Media',
  },
];

const GALLERY_IMAGES: ImageItem[] = [
  {
    id: 'gallery-1',
    title: 'Warehouse hero',
    source: 'Gallery',
    tint: '#00F0FF',
    resolution: '1600 x 900',
    aspect: '16:9',
    note: 'Wide banner crop for dashboard headers.',
  },
  {
    id: 'gallery-2',
    title: 'Team profile',
    source: 'Gallery',
    tint: '#FF00C8',
    resolution: '1080 x 1350',
    aspect: '4:5',
    note: 'Portrait crop suited for cards and social previews.',
  },
  {
    id: 'gallery-3',
    title: 'Device detail',
    source: 'Gallery',
    tint: '#39FF14',
    resolution: '1200 x 1200',
    aspect: '1:1',
    note: 'Square product image for catalog surfaces.',
  },
];

const CAMERA_IMAGES: ImageItem[] = [
  {
    id: 'camera-1',
    title: 'Field capture 01',
    source: 'Camera',
    tint: '#FF6600',
    resolution: '1920 x 1080',
    aspect: '16:9',
    note: 'Simulated capture from an on-site inspection.',
  },
  {
    id: 'camera-2',
    title: 'Field capture 02',
    source: 'Camera',
    tint: '#A855F7',
    resolution: '1440 x 1440',
    aspect: '1:1',
    note: 'Square capture for quick report thumbnails.',
  },
  {
    id: 'camera-3',
    title: 'Field capture 03',
    source: 'Camera',
    tint: '#FFE600',
    resolution: '1280 x 720',
    aspect: '16:9',
    note: 'Landscape shot for shift handoff summaries.',
  },
];

const COUNTRY_OPTIONS: CountryItem[] = [
  {iso: 'BR', name: 'Brazil', dial: '+55', sample: '11 98765-4321'},
  {iso: 'US', name: 'United States', dial: '+1', sample: '415 555 0182'},
  {iso: 'GB', name: 'United Kingdom', dial: '+44', sample: '20 7946 0958'},
  {iso: 'DE', name: 'Germany', dial: '+49', sample: '30 901820'},
  {iso: 'AE', name: 'United Arab Emirates', dial: '+971', sample: '50 123 4567'},
  {iso: 'JP', name: 'Japan', dial: '+81', sample: '90 1234 5678'},
];

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function toMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function shiftMonth(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function buildCalendarDays(cursor: Date) {
  const firstWeekday = new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay();
  const totalDays = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells: Array<Date | null> = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

function formatDate(date: Date) {
  return `${MONTH_LABELS[date.getMonth()].slice(0, 3)} ${date.getDate()}, ${date.getFullYear()}`;
}

function formatMonth(date: Date) {
  return `${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`;
}

function to24Hour(hour12: number, period: 'AM' | 'PM') {
  if (period === 'AM') {
    return hour12 === 12 ? 0 : hour12;
  }

  return hour12 === 12 ? 12 : hour12 + 12;
}

function formatTime(value: TimeValue) {
  const period = value.hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = ((value.hour24 + 11) % 12) + 1;
  return `${hour12}:${pad(value.minute)} ${period}`;
}

function hslToRgb({h, s, l}: HslColor): RgbColor {
  const normalizedHue = h / 360;
  const saturation = s / 100;
  const lightness = l / 100;

  if (saturation === 0) {
    const grayscale = Math.round(lightness * 255);
    return {r: grayscale, g: grayscale, b: grayscale};
  }

  const hueToChannel = (p: number, q: number, t: number) => {
    let channel = t;

    if (channel < 0) {
      channel += 1;
    }

    if (channel > 1) {
      channel -= 1;
    }

    if (channel < 1 / 6) {
      return p + (q - p) * 6 * channel;
    }

    if (channel < 1 / 2) {
      return q;
    }

    if (channel < 2 / 3) {
      return p + (q - p) * (2 / 3 - channel) * 6;
    }

    return p;
  };

  const q =
    lightness < 0.5
      ? lightness * (1 + saturation)
      : lightness + saturation - lightness * saturation;
  const p = 2 * lightness - q;

  return {
    r: Math.round(hueToChannel(p, q, normalizedHue + 1 / 3) * 255),
    g: Math.round(hueToChannel(p, q, normalizedHue) * 255),
    b: Math.round(hueToChannel(p, q, normalizedHue - 1 / 3) * 255),
  };
}

function rgbToHsl({r, g, b}: RgbColor): HslColor {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;

  if (max === min) {
    return {h: 0, s: 0, l: Math.round(lightness * 100)};
  }

  const delta = max - min;
  const saturation =
    lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

  let hue = 0;

  switch (max) {
    case red:
      hue = (green - blue) / delta + (green < blue ? 6 : 0);
      break;
    case green:
      hue = (blue - red) / delta + 2;
      break;
    case blue:
      hue = (red - green) / delta + 4;
      break;
    default:
      hue = 0;
  }

  return {
    h: Math.round((hue / 6) * 360),
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100),
  };
}

function rgbToHex({r, g, b}: RgbColor) {
  const toHex = (value: number) =>
    clampNumber(Math.round(value), 0, 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function hexToRgb(value: string): RgbColor | null {
  const sanitized = value.trim().replace('#', '');

  if (!/^[0-9A-Fa-f]{6}$/.test(sanitized)) {
    return null;
  }

  return {
    r: parseInt(sanitized.slice(0, 2), 16),
    g: parseInt(sanitized.slice(2, 4), 16),
    b: parseInt(sanitized.slice(4, 6), 16),
  };
}

function DemoCard({eyebrow, title, description, children}: DemoCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
      {children}
    </View>
  );
}

function ExpandablePanel({open, maxHeight, children}: ExpandablePanelProps) {
  const animation = useRef(new Animated.Value(open ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: open ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [animation, open]);

  return (
    <Animated.View
      style={[
        styles.expandablePanel,
        {
          maxHeight: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, maxHeight],
          }),
          opacity: animation,
          transform: [
            {
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [-8, 0],
              }),
            },
          ],
        },
      ]}>
      {children}
    </Animated.View>
  );
}

function ChoiceChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.choiceChip, active && styles.choiceChipActive]}>
      <Text style={[styles.choiceChipText, active && styles.choiceChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function PickersShowcase() {
  const baseDate = useRef(new Date()).current;
  const defaultDate = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate() + 3,
  );
  const initialHsl: HslColor = {h: 188, s: 100, l: 50};
  const [selectedFlow, setSelectedFlow] = useState<SelectOption>(SELECT_OPTIONS[1]);
  const [selectOpen, setSelectOpen] = useState(false);
  const selectAnimation = useRef(new Animated.Value(0)).current;
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [calendarCursor, setCalendarCursor] = useState(toMonthStart(defaultDate));
  const [selectedTime, setSelectedTime] = useState<TimeValue>({hour24: 14, minute: 30});
  const [timezone, setTimezone] = useState<TimeZone>('BRT');
  const [countryQuery, setCountryQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>(COUNTRY_OPTIONS[0]);
  const [phoneLocal, setPhoneLocal] = useState(COUNTRY_OPTIONS[0].sample);
  const [colorHsl, setColorHsl] = useState<HslColor>(initialHsl);
  const [hexInput, setHexInput] = useState(rgbToHex(hslToRgb(initialHsl)));
  const [fileFilter, setFileFilter] = useState<FileFilter>('All');
  const [filePickerOpen, setFilePickerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem>(FILE_LIBRARY[0]);
  const [imageMode, setImageMode] = useState<ImageSourceKind>('Gallery');
  const [cameraIndex, setCameraIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<ImageItem>(GALLERY_IMAGES[0]);

  useEffect(() => {
    Animated.timing(selectAnimation, {
      toValue: selectOpen ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [selectAnimation, selectOpen]);

  const calendarCells = buildCalendarDays(calendarCursor);
  const activePeriod = selectedTime.hour24 >= 12 ? 'PM' : 'AM';
  const activeHour = ((selectedTime.hour24 + 11) % 12) + 1;
  const rgbColor = hslToRgb(colorHsl);
  const resolvedHex = rgbToHex(rgbColor);
  const hexValid = hexInput.length === 0 || hexToRgb(hexInput) !== null;
  const fileChoices = FILE_LIBRARY.filter(
    item => fileFilter === 'All' || item.category === fileFilter,
  );
  const visibleImages = imageMode === 'Gallery' ? GALLERY_IMAGES : CAMERA_IMAGES;
  const countryMatches = COUNTRY_OPTIONS.filter(item => {
    const query = countryQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      item.name.toLowerCase().includes(query) ||
      item.iso.toLowerCase().includes(query) ||
      item.dial.includes(query)
    );
  }).slice(0, 5);

  const setHour = (hour12: number) => {
    setSelectedTime(current => ({
      ...current,
      hour24: to24Hour(hour12, current.hour24 >= 12 ? 'PM' : 'AM'),
    }));
  };

  const setPeriod = (period: 'AM' | 'PM') => {
    setSelectedTime(current => ({
      ...current,
      hour24: to24Hour(((current.hour24 + 11) % 12) + 1, period),
    }));
  };

  const setMinute = (minute: number) => {
    setSelectedTime(current => ({
      ...current,
      minute,
    }));
  };

  const applySchedulePreset = (
    label: string,
    dayOffset: number,
    hour24: number,
    minute: number,
    zone: TimeZone,
  ) => {
    const nextDate = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate() + dayOffset,
    );
    setSelectedFlow(
      SELECT_OPTIONS.find(option => option.label.toLowerCase().includes(label.toLowerCase())) ??
        selectedFlow,
    );
    setSelectedDate(nextDate);
    setCalendarCursor(toMonthStart(nextDate));
    setSelectedTime({hour24, minute});
    setTimezone(zone);
  };

  const updateHsl = (field: keyof HslColor, delta: number) => {
    setColorHsl(current => {
      const next: HslColor = {
        ...current,
        [field]:
          field === 'h'
            ? (current.h + delta + 360) % 360
            : clampNumber(current[field] + delta, 0, 100),
      };
      setHexInput(rgbToHex(hslToRgb(next)));
      return next;
    });
  };

  const applyHex = (value: string) => {
    const sanitized = value.toUpperCase().replace(/[^0-9A-F]/g, '').slice(0, 6);
    const nextValue = sanitized ? `#${sanitized}` : '';
    setHexInput(nextValue);

    const parsed = hexToRgb(nextValue);

    if (parsed) {
      setColorHsl(rgbToHsl(parsed));
    }
  };

  const applySwatch = (hex: string) => {
    const parsed = hexToRgb(hex);

    if (!parsed) {
      return;
    }

    setColorHsl(rgbToHsl(parsed));
    setHexInput(rgbToHex(parsed));
  };

  const selectCountry = (item: CountryItem) => {
    setSelectedCountry(item);
    setPhoneLocal(item.sample);
  };

  const switchImageMode = (mode: ImageSourceKind) => {
    setImageMode(mode);

    if (mode === 'Gallery' && selectedImage.source !== 'Gallery') {
      setSelectedImage(GALLERY_IMAGES[0]);
    }

    if (mode === 'Camera' && selectedImage.source !== 'Camera') {
      setSelectedImage(CAMERA_IMAGES[cameraIndex]);
    }
  };

  const captureImage = () => {
    const nextIndex = (cameraIndex + 1) % CAMERA_IMAGES.length;
    setCameraIndex(nextIndex);
    setImageMode('Camera');
    setSelectedImage(CAMERA_IMAGES[nextIndex]);
  };

  return (
    <View style={styles.stack}>
      <DemoCard
        eyebrow="Phase 1.3 live"
        title="Pickers, selectors, and intake flows"
        description="Phase 1.3 adds the missing picker layer to the Components screen: animated select, date and time controls, combined scheduling, color tooling, device-style file and image flows, and phone code selection.">
        <View style={styles.statGrid}>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>checklist items delivered</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>new dependencies added</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>1.3</Text>
            <Text style={styles.statLabel}>phase completed</Text>
          </View>
        </View>

        <View style={styles.checklistWrap}>
          {[
            'Animated dropdown',
            'Calendar picker',
            'Time slots',
            'Date + time payload',
            'HSL / RGB / HEX',
            'File picker',
            'Image picker',
            'Country codes',
          ].map(item => (
            <View key={item} style={styles.checklistChip}>
              <Text style={styles.checklistChipText}>{item}</Text>
            </View>
          ))}
        </View>
      </DemoCard>

      <DemoCard
        eyebrow="Selection patterns"
        title="Animated dropdown and country / phone code picker"
        description="Use the animated select for quick category changes, then pair searchable country codes with a local number field for international onboarding flows.">
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={styles.valueCopy}>
              <Text style={styles.sectionTitle}>Dropdown / select with animation</Text>
              <Text style={styles.sectionDescription}>
                The trigger animates open and the option sheet slides into view without a modal.
              </Text>
            </View>
            <Text style={styles.valueBadge}>4 options</Text>
          </View>

          <Pressable
            onPress={() => setSelectOpen(current => !current)}
            style={[styles.selectTrigger, selectOpen && styles.selectTriggerOpen]}>
            <View style={styles.optionCopy}>
              <Text style={styles.selectLabel}>Project mode</Text>
              <Text style={styles.selectValue}>{selectedFlow.label}</Text>
              <Text style={styles.selectMeta}>{selectedFlow.detail}</Text>
            </View>
            <Animated.View
              style={[
                styles.caretShell,
                {
                  transform: [
                    {
                      rotate: selectAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '180deg'],
                      }),
                    },
                  ],
                },
              ]}>
              <Text style={styles.caretText}>v</Text>
            </Animated.View>
          </Pressable>

          <ExpandablePanel open={selectOpen} maxHeight={220}>
            <View style={styles.optionList}>
              {SELECT_OPTIONS.map(option => {
                const selected = option.label === selectedFlow.label;

                return (
                  <Pressable
                    key={option.label}
                    onPress={() => {
                      setSelectedFlow(option);
                      setSelectOpen(false);
                    }}
                    style={[styles.optionRow, selected && styles.optionRowActive]}>
                    <View style={styles.optionCopy}>
                      <Text style={[styles.optionTitle, selected && styles.optionTitleActive]}>
                        {option.label}
                      </Text>
                      <Text style={styles.optionDetail}>{option.detail}</Text>
                    </View>
                    <Text style={[styles.optionIndicator, selected && styles.optionIndicatorActive]}>
                      {selected ? 'LIVE' : 'SET'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ExpandablePanel>
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={styles.valueCopy}>
              <Text style={styles.sectionTitle}>Country / phone code picker</Text>
              <Text style={styles.sectionDescription}>
                Search by country, ISO, or dial code and keep the final number preview visible.
              </Text>
            </View>
            <Text style={styles.valueBadge}>{selectedCountry.dial}</Text>
          </View>

          <View style={styles.searchShell}>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setCountryQuery}
              placeholder="Search country or dial code"
              placeholderTextColor={Colors.textMuted}
              selectionColor={Colors.primary}
              style={styles.searchInput}
              value={countryQuery}
            />
          </View>

          <View style={styles.countryList}>
            {countryMatches.map(item => {
              const selected = item.iso === selectedCountry.iso;

              return (
                <Pressable
                  key={item.iso}
                  onPress={() => selectCountry(item)}
                  style={[styles.countryRow, selected && styles.countryRowActive]}>
                  <View style={styles.countryCodePill}>
                    <Text style={styles.countryCodeText}>{item.iso}</Text>
                  </View>
                  <View style={styles.optionCopy}>
                    <Text style={[styles.optionTitle, selected && styles.optionTitleActive]}>
                      {item.name}
                    </Text>
                    <Text style={styles.optionDetail}>{item.sample}</Text>
                  </View>
                  <Text style={styles.countryDial}>{item.dial}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.phoneComposer}>
            <Text style={styles.phonePrefix}>{selectedCountry.dial}</Text>
            <TextInput
              autoCorrect={false}
              keyboardType="phone-pad"
              onChangeText={setPhoneLocal}
              placeholder={selectedCountry.sample}
              placeholderTextColor={Colors.textMuted}
              selectionColor={Colors.primary}
              style={styles.phoneInput}
              value={phoneLocal}
            />
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Dial preview</Text>
            <Text style={styles.summaryText}>
              {selectedCountry.name} ({selectedCountry.iso})
            </Text>
            <Text style={styles.summaryMeta}>
              {selectedCountry.dial} {phoneLocal || selectedCountry.sample}
            </Text>
          </View>
        </View>
      </DemoCard>

      <DemoCard
        eyebrow="Scheduling layer"
        title="Date picker, time picker, and a combined date-time payload"
        description="The calendar, time controls, and combined scheduler all share the same state so the final payload is ready for forms, reminders, or booking flows.">
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={styles.valueCopy}>
              <Text style={styles.sectionTitle}>Date picker calendar</Text>
              <Text style={styles.sectionDescription}>
                Navigate between months and keep today plus the selected date clearly visible.
              </Text>
            </View>
            <Text style={styles.valueBadge}>{formatDate(selectedDate)}</Text>
          </View>

          <View style={styles.calendarHeader}>
            <Pressable
              onPress={() => setCalendarCursor(current => shiftMonth(current, -1))}
              style={styles.calendarNavButton}>
              <Text style={styles.calendarNavText}>{'<'}</Text>
            </Pressable>
            <Text style={styles.monthLabel}>{formatMonth(calendarCursor)}</Text>
            <Pressable
              onPress={() => setCalendarCursor(current => shiftMonth(current, 1))}
              style={styles.calendarNavButton}>
              <Text style={styles.calendarNavText}>{'>'}</Text>
            </Pressable>
          </View>

          <View style={styles.weekdayRow}>
            {DAY_LABELS.map(label => (
              <Text key={label} style={styles.weekdayText}>
                {label}
              </Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {calendarCells.map((day, index) => {
              if (!day) {
                return <View key={`empty-${index}`} style={[styles.dayCell, styles.dayCellEmpty]} />;
              }

              const selected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, baseDate);

              return (
                <Pressable
                  key={day.toISOString()}
                  onPress={() => setSelectedDate(day)}
                  style={[
                    styles.dayCell,
                    selected && styles.dayCellSelected,
                    isToday && !selected && styles.dayCellToday,
                  ]}>
                  <Text style={[styles.dayNumber, selected && styles.dayNumberSelected]}>
                    {day.getDate()}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={styles.valueCopy}>
              <Text style={styles.sectionTitle}>Time picker</Text>
              <Text style={styles.sectionDescription}>
                Mix period, hour, and minute chips to mirror a compact picker flow.
              </Text>
            </View>
            <Text style={styles.valueBadge}>{formatTime(selectedTime)}</Text>
          </View>

          <View style={styles.choiceWrap}>
            {(['AM', 'PM'] as const).map(period => (
              <ChoiceChip
                key={period}
                active={period === activePeriod}
                label={period}
                onPress={() => setPeriod(period)}
              />
            ))}
          </View>

          <View style={styles.choiceWrap}>
            {HOUR_OPTIONS.map(hour => (
              <ChoiceChip
                key={`hour-${hour}`}
                active={hour === activeHour}
                label={`${hour}`}
                onPress={() => setHour(hour)}
              />
            ))}
          </View>

          <View style={styles.choiceWrap}>
            {MINUTE_OPTIONS.map(minute => (
              <ChoiceChip
                key={`minute-${minute}`}
                active={minute === selectedTime.minute}
                label={pad(minute)}
                onPress={() => setMinute(minute)}
              />
            ))}
          </View>
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={styles.valueCopy}>
              <Text style={styles.sectionTitle}>DateTime picker combined</Text>
              <Text style={styles.sectionDescription}>
                Turn the selected day and time into a single scheduling payload with timezone context.
              </Text>
            </View>
            <Text style={styles.valueBadge}>{timezone}</Text>
          </View>

          <View style={styles.choiceWrap}>
            <ChoiceChip
              active={false}
              label="Kickoff"
              onPress={() => applySchedulePreset('pilot', 2, 10, 0, 'BRT')}
            />
            <ChoiceChip
              active={false}
              label="Client demo"
              onPress={() => applySchedulePreset('client', 5, 15, 30, 'EST')}
            />
            <ChoiceChip
              active={false}
              label="Launch window"
              onPress={() => applySchedulePreset('discovery', 8, 9, 15, 'UTC')}
            />
          </View>

          <View style={styles.choiceWrap}>
            {TIMEZONE_OPTIONS.map(option => (
              <ChoiceChip
                key={option}
                active={option === timezone}
                label={option}
                onPress={() => setTimezone(option)}
              />
            ))}
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Ready payload</Text>
            <Text style={styles.summaryText}>
              {selectedFlow.label} on {formatDate(selectedDate)}
            </Text>
            <Text style={styles.summaryMeta}>
              {formatTime(selectedTime)} {timezone} for the next stakeholder handoff.
            </Text>
          </View>
        </View>
      </DemoCard>

      <DemoCard
        eyebrow="Color tooling"
        title="Advanced color picker with HSL, RGB, HEX, and live preview"
        description="Use steppers for HSL, inspect the derived RGB and HEX output, then preview the color as if it were an accent token in a production UI system.">
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={styles.valueCopy}>
              <Text style={styles.sectionTitle}>Color picker advanced</Text>
              <Text style={styles.sectionDescription}>
                Change hue, saturation, and lightness while keeping HEX editable and RGB visible.
              </Text>
            </View>
            <Text style={styles.valueBadge}>{resolvedHex}</Text>
          </View>

          <View style={styles.stepperGrid}>
            {([
              ['h', 'Hue', colorHsl.h, 12],
              ['s', 'Saturation', colorHsl.s, 5],
              ['l', 'Lightness', colorHsl.l, 5],
            ] as const).map(([field, label, value, step]) => (
              <View key={field} style={styles.stepperRow}>
                <Text style={styles.stepperLabel}>{label}</Text>
                <View style={styles.stepperControls}>
                  <Pressable onPress={() => updateHsl(field, -step)} style={styles.stepperButton}>
                    <Text style={styles.stepperButtonText}>-</Text>
                  </Pressable>
                  <View style={styles.stepperValueBadge}>
                    <Text style={styles.stepperValue}>{value}</Text>
                  </View>
                  <Pressable onPress={() => updateHsl(field, step)} style={styles.stepperButton}>
                    <Text style={styles.stepperButtonText}>+</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.hexField}>
            <Text style={styles.stepperLabel}>HEX</Text>
            <TextInput
              autoCapitalize="characters"
              autoCorrect={false}
              onChangeText={applyHex}
              placeholder="#00F0FF"
              placeholderTextColor={Colors.textMuted}
              selectionColor={Colors.primary}
              style={[styles.hexInput, !hexValid && styles.hexInputError]}
              value={hexInput}
            />
            <Text style={[styles.hexStatus, !hexValid && styles.hexStatusError]}>
              {hexValid ? 'Valid 6-digit HEX value.' : 'Enter a full 6-digit HEX value.'}
            </Text>
          </View>

          <View style={styles.rgbGrid}>
            {([
              ['R', rgbColor.r],
              ['G', rgbColor.g],
              ['B', rgbColor.b],
            ] as const).map(([label, value]) => (
              <View key={label} style={styles.rgbPill}>
                <Text style={styles.rgbLabel}>{label}</Text>
                <Text style={styles.rgbValue}>{value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.choiceWrap}>
            {COLOR_PRESETS.map(color => (
              <Pressable
                key={color}
                onPress={() => applySwatch(color)}
                style={[
                  styles.swatchButton,
                  {backgroundColor: color},
                  resolvedHex === color.toUpperCase() && styles.swatchButtonActive,
                ]}
              />
            ))}
          </View>

          <View style={styles.colorPreviewCard}>
            <View style={[styles.colorPreviewSwatch, {backgroundColor: resolvedHex}]} />
            <View style={styles.valueCopy}>
              <Text style={styles.sectionTitle}>Preview token</Text>
              <Text style={styles.sectionDescription}>
                Accent for CTA buttons, active tabs, and highlighted metrics.
              </Text>
            </View>
          </View>
        </View>
      </DemoCard>

      <DemoCard
        eyebrow="Device-like flows"
        title="File picker and image picker"
        description="These demos model native handoff points without requiring extra libraries yet, so the UI system is ready before device integrations are wired.">
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={styles.valueCopy}>
              <Text style={styles.sectionTitle}>File picker</Text>
              <Text style={styles.sectionDescription}>
                Filter the device library and keep the selected file metadata visible for attach flows.
              </Text>
            </View>
            <Text style={styles.valueBadge}>{selectedFile.type}</Text>
          </View>

          <View style={styles.choiceWrap}>
            {FILE_FILTERS.map(filter => (
              <ChoiceChip
                key={filter}
                active={filter === fileFilter}
                label={filter}
                onPress={() => setFileFilter(filter)}
              />
            ))}
          </View>

          <Pressable
            onPress={() => setFilePickerOpen(current => !current)}
            style={[styles.selectTrigger, filePickerOpen && styles.selectTriggerOpen]}>
            <View style={styles.optionCopy}>
              <Text style={styles.selectLabel}>Device library</Text>
              <Text style={styles.selectValue}>{selectedFile.name}</Text>
              <Text style={styles.selectMeta}>
                {fileChoices.length} files available in this filter.
              </Text>
            </View>
            <Text style={styles.optionIndicator}>{filePickerOpen ? 'OPEN' : 'BROWSE'}</Text>
          </Pressable>

          <ExpandablePanel open={filePickerOpen} maxHeight={280}>
            <View style={styles.optionList}>
              {fileChoices.map(file => {
                const selected = file.name === selectedFile.name;

                return (
                  <Pressable
                    key={file.name}
                    onPress={() => {
                      setSelectedFile(file);
                      setFilePickerOpen(false);
                    }}
                    style={[styles.optionRow, selected && styles.optionRowActive]}>
                    <View style={styles.optionCopy}>
                      <Text
                        style={[styles.optionTitle, selected && styles.optionTitleActive]}
                        numberOfLines={1}>
                        {file.name}
                      </Text>
                      <Text style={styles.optionDetail}>
                        {file.size} · {file.updated}
                      </Text>
                    </View>
                    <Text style={[styles.optionIndicator, selected && styles.optionIndicatorActive]}>
                      {file.type}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ExpandablePanel>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Selected file</Text>
            <Text style={styles.summaryText}>{selectedFile.name}</Text>
            <Text style={styles.summaryMeta}>
              {selectedFile.type} · {selectedFile.size} · {selectedFile.updated}
            </Text>
          </View>
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={styles.valueCopy}>
              <Text style={styles.sectionTitle}>Image picker</Text>
              <Text style={styles.sectionDescription}>
                Switch between gallery and camera, then preview the selected asset before upload.
              </Text>
            </View>
            <Text style={styles.valueBadge}>{selectedImage.source}</Text>
          </View>

          <View style={styles.choiceWrap}>
            {(['Gallery', 'Camera'] as const).map(mode => (
              <ChoiceChip
                key={mode}
                active={mode === imageMode}
                label={mode}
                onPress={() => switchImageMode(mode)}
              />
            ))}
          </View>

          {imageMode === 'Camera' ? (
            <Pressable onPress={captureImage} style={styles.captureButton}>
              <Text style={styles.captureButtonText}>Capture new frame</Text>
            </Pressable>
          ) : null}

          <View style={styles.thumbnailGrid}>
            {visibleImages.map(item => {
              const selected = item.id === selectedImage.id;

              return (
                <Pressable
                  key={item.id}
                  onPress={() => setSelectedImage(item)}
                  style={[styles.thumbnailTile, selected && styles.thumbnailTileActive]}>
                  <View style={[styles.thumbnailArt, {backgroundColor: `${item.tint}30`}]} />
                  <Text style={styles.thumbnailTitle}>{item.title}</Text>
                  <Text style={styles.thumbnailMeta}>{item.aspect}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.previewCard}>
            <View style={[styles.previewFrame, {backgroundColor: `${selectedImage.tint}24`}]} />
            <View style={styles.valueCopy}>
              <Text style={styles.sectionTitle}>{selectedImage.title}</Text>
              <Text style={styles.sectionDescription}>
                {selectedImage.resolution} · {selectedImage.aspect}
              </Text>
              <Text style={styles.previewNote}>{selectedImage.note}</Text>
            </View>
          </View>
        </View>
      </DemoCard>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  eyebrow: {
    ...Typography.label,
    color: Colors.secondary,
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  cardDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statPill: {
    flexGrow: 1,
    minWidth: 110,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  statValue: {
    ...Typography.h4,
    color: Colors.white,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  checklistWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  checklistChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgLight,
  },
  checklistChipText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  panel: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  valueCopy: {
    flex: 1,
    gap: 2,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  sectionDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  valueBadge: {
    ...Typography.caption,
    color: Colors.secondary,
    backgroundColor: Colors.secondary + '16',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  selectTrigger: {
    minHeight: 72,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  selectTriggerOpen: {
    borderColor: Colors.primary,
    ...neonShadow(Colors.primary, 6),
  },
  selectLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  selectValue: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  selectMeta: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  caretShell: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgCard,
  },
  caretText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '700',
  },
  expandablePanel: {
    overflow: 'hidden',
  },
  optionList: {
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  optionRowActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  optionCopy: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  optionTitleActive: {
    color: Colors.primary,
  },
  optionDetail: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  optionIndicator: {
    ...Typography.caption,
    color: Colors.textSecondary,
    backgroundColor: Colors.bgCard,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  optionIndicatorActive: {
    color: Colors.primary,
    backgroundColor: Colors.primary + '16',
  },
  searchShell: {
    minHeight: 52,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgLight,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  searchInput: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  countryList: {
    gap: Spacing.sm,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  countryRowActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  countryCodePill: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryCodeText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  countryDial: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '700',
  },
  phoneComposer: {
    minHeight: 56,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgLight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  phonePrefix: {
    ...Typography.h4,
    color: Colors.primary,
  },
  phoneInput: {
    ...Typography.body,
    flex: 1,
    color: Colors.textPrimary,
  },
  summaryBox: {
    backgroundColor: Colors.bgLight,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  summaryTitle: {
    ...Typography.caption,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  summaryText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  summaryMeta: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calendarNavButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarNavText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '700',
  },
  monthLabel: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  weekdayText: {
    ...Typography.caption,
    flex: 1,
    textAlign: 'center',
    color: Colors.textMuted,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  dayCell: {
    width: '13.3%',
    aspectRatio: 1,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellEmpty: {
    opacity: 0,
  },
  dayCellSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '18',
    ...neonShadow(Colors.primary, 4),
  },
  dayCellToday: {
    borderColor: Colors.secondary,
  },
  dayNumber: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  dayNumberSelected: {
    color: Colors.primary,
  },
  choiceWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  choiceChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgLight,
  },
  choiceChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '16',
  },
  choiceChipText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  choiceChipTextActive: {
    color: Colors.primary,
  },
  stepperGrid: {
    gap: Spacing.sm,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  stepperLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    minWidth: 84,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  stepperButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: {
    ...Typography.h4,
    color: Colors.primary,
  },
  stepperValueBadge: {
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.bgLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  stepperValue: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  hexField: {
    gap: Spacing.xs,
  },
  hexInput: {
    ...Typography.body,
    minHeight: 52,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgLight,
    paddingHorizontal: Spacing.md,
    color: Colors.textPrimary,
  },
  hexInputError: {
    borderColor: Colors.error,
  },
  hexStatus: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  hexStatusError: {
    color: Colors.error,
  },
  rgbGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  rgbPill: {
    flex: 1,
    minWidth: 86,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  rgbLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  rgbValue: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  swatchButton: {
    width: 34,
    height: 34,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: Colors.borderLight,
  },
  swatchButtonActive: {
    borderColor: Colors.white,
  },
  colorPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgLight,
    padding: Spacing.md,
  },
  colorPreviewSwatch: {
    width: 64,
    height: 64,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  captureButton: {
    minHeight: 48,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  captureButtonText: {
    ...Typography.bodySmall,
    color: Colors.bg,
    fontWeight: '800',
  },
  thumbnailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  thumbnailTile: {
    flexGrow: 1,
    minWidth: 110,
    maxWidth: '31%',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgLight,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  thumbnailTileActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  thumbnailArt: {
    height: 78,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surfaceElevated,
  },
  thumbnailTitle: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  thumbnailMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  previewCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgLight,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  previewFrame: {
    height: 148,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  previewNote: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
});
