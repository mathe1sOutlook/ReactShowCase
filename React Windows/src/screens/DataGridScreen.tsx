import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  NativeModules,
  PanResponder,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {Colors, Radius, Spacing, Typography} from '../theme';

type RowStatus = 'Active' | 'Pending' | 'Blocked' | 'Review';
type GroupById = 'none' | 'team' | 'status' | 'city';
type ColumnId =
  | 'id'
  | 'owner'
  | 'team'
  | 'city'
  | 'score'
  | 'progress'
  | 'joined'
  | 'revenue'
  | 'website'
  | 'status';
type CenterColumnId = Exclude<ColumnId, 'id' | 'owner' | 'status'>;

type GridRow = {
  id: number;
  owner: string;
  email: string;
  avatarLabel: string;
  avatarTone: string;
  avatarBackground: string;
  team: string;
  city: string;
  score: number;
  progress: number;
  joined: string;
  revenue: number;
  website: string;
  status: RowStatus;
  region: string;
  notes: string;
};

type VirtualRow = {
  id: number;
  owner: string;
  status: RowStatus;
  score: number;
};

type SortState = {
  column: ColumnId;
  direction: 'asc' | 'desc';
};

type Filters = {
  global: string;
  owner: string;
  minScore: string;
  joinedAfter: string;
  status: string;
  team: string;
};

type EditingCell = {
  rowId: number;
  column: ColumnId;
} | null;

type ContextCell = {
  rowId: number;
  column: ColumnId;
  label: string;
  value: string;
};

type ExportPreview = {
  type: 'csv' | 'pdf';
  title: string;
  content: string;
};

type GroupItem = {
  kind: 'group';
  key: string;
  groupValue: string;
  count: number;
  averageScore: number;
  totalRevenue: number;
};

type DetailItem = {
  kind: 'detail';
  key: string;
  row: GridRow;
};

type RowItem = {
  kind: 'row';
  key: string;
  row: GridRow;
};

type GridItem = GroupItem | DetailItem | RowItem;

type MetricCardProps = {
  value: string;
  label: string;
  accent: string;
};

type ToggleChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

type ResizeHandleProps = {
  columnId: ColumnId;
  width: number;
  minWidth: number;
  maxWidth: number;
  onResize: (columnId: ColumnId, width: number) => void;
};

type DraggableColumnChipProps = {
  label: string;
  index: number;
  total: number;
  onMove: (from: number, to: number) => void;
};

const LEFT_WIDTH = 46;
const ROW_HEIGHT = 72;
const GROUP_HEIGHT = 44;
const DETAIL_HEIGHT = 92;
const BODY_HEIGHT = 360;
const PAGE_SIZES = [8, 12, 20];
const STATUS_OPTIONS: RowStatus[] = ['Active', 'Pending', 'Blocked', 'Review'];
const TEAM_OPTIONS = ['Atlas', 'Nova', 'Pulse', 'Orbit'];
const CITY_OPTIONS = ['Sao Paulo', 'Lisbon', 'Austin', 'Berlin', 'Tokyo', 'Toronto'];
const REGION_OPTIONS = ['LATAM', 'EMEA', 'NA', 'APAC'];
const AVATAR_PALETTE = [
  {tone: Colors.primary, background: `${Colors.primary}20`},
  {tone: Colors.secondary, background: `${Colors.secondary}20`},
  {tone: Colors.accent, background: `${Colors.accent}20`},
  {tone: Colors.success, background: `${Colors.success}20`},
  {tone: Colors.warning, background: `${Colors.warning}20`},
];
const CENTER_DEFAULT_ORDER: CenterColumnId[] = [
  'team',
  'city',
  'score',
  'progress',
  'joined',
  'revenue',
  'website',
];
const DEFAULT_WIDTHS: Record<ColumnId, number> = {
  id: 78,
  owner: 214,
  team: 120,
  city: 140,
  score: 100,
  progress: 150,
  joined: 124,
  revenue: 140,
  website: 176,
  status: 170,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function moveItem<T>(items: T[], from: number, to: number) {
  const next = [...items];
  const [picked] = next.splice(from, 1);
  next.splice(to, 0, picked);
  return next;
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function toAvatarLabel(value: string) {
  return value
    .split(' ')
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('');
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString('en-US')}`;
}

function formatCompact(value: number) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return `${value}`;
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function base64Encode(input: string) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  let index = 0;

  while (index < input.length) {
    const chr1 = input.charCodeAt(index++);
    const chr2 = input.charCodeAt(index++);
    const chr3 = input.charCodeAt(index++);

    const enc1 = chr1 >> 2;
    const enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    let enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    let enc4 = chr3 & 63;

    if (Number.isNaN(chr2)) {
      enc3 = 64;
      enc4 = 64;
    } else if (Number.isNaN(chr3)) {
      enc4 = 64;
    }

    output +=
      chars.charAt(enc1) +
      chars.charAt(enc2) +
      chars.charAt(enc3) +
      chars.charAt(enc4);
  }

  return output;
}

function buildPdfDocument(lines: string[]) {
  const body = [
    'BT',
    '/F1 12 Tf',
    '40 760 Td',
    ...lines.map((line, index) =>
      index === 0
        ? `(${escapePdfText(line)}) Tj`
        : `0 -16 Td (${escapePdfText(line)}) Tj`,
    ),
    'ET',
  ].join('\n');

  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj',
    `4 0 obj << /Length ${body.length} >> stream\n${body}\nendstream endobj`,
    '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
  ];

  let document = '%PDF-1.4\n';
  const offsets: number[] = [0];

  objects.forEach(object => {
    offsets.push(document.length);
    document += `${object}\n`;
  });

  const xrefPosition = document.length;
  document += `xref\n0 ${objects.length + 1}\n`;
  document += '0000000000 65535 f \n';
  offsets.slice(1).forEach(offset => {
    document += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  });
  document += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  document += `startxref\n${xrefPosition}\n%%EOF`;

  return `data:application/pdf;base64,${base64Encode(document)}`;
}

function buildRows(count: number) {
  const firstNames = ['Ava', 'Noah', 'Mia', 'Liam', 'Nina', 'Ezra', 'Iris', 'Owen'];
  const lastNames = ['Stone', 'Parker', 'Reed', 'Lopez', 'Shaw', 'Diaz', 'King', 'Frost'];

  return Array.from({length: count}, (_, index) => {
    const id = index + 1;
    const owner = `${firstNames[index % firstNames.length]} ${
      lastNames[(index * 3) % lastNames.length]
    }`;
    const team = TEAM_OPTIONS[index % TEAM_OPTIONS.length];
    const city = CITY_OPTIONS[index % CITY_OPTIONS.length];
    const status = STATUS_OPTIONS[index % STATUS_OPTIONS.length];
    const joinedMonth = `${((index % 9) + 1).toString().padStart(2, '0')}`;
    const joinedDay = `${((index * 5) % 27) + 1}`.padStart(2, '0');
    const joined = `2025-${joinedMonth}-${joinedDay}`;
    const revenue = 24000 + index * 1875 + (index % 5) * 4200;
    const progress = 18 + ((index * 13) % 82);
    const score = 54 + ((index * 7) % 46);
    const slug = slugify(owner);
    const avatar = AVATAR_PALETTE[index % AVATAR_PALETTE.length];

    return {
      id,
      owner,
      email: `${slug}@${team.toLowerCase()}.showcase.dev`,
      avatarLabel: toAvatarLabel(owner),
      avatarTone: avatar.tone,
      avatarBackground: avatar.background,
      team,
      city,
      score,
      progress,
      joined,
      revenue,
      website: `https://showcase.dev/${slug}`,
      status,
      region: REGION_OPTIONS[index % REGION_OPTIONS.length],
      notes:
        status === 'Blocked'
          ? 'Waiting on dependency review before moving the contract to active delivery.'
          : status === 'Review'
            ? 'QA and client feedback are in progress with inline edits enabled for handoff.'
            : status === 'Pending'
              ? 'Pipeline is staffed and scheduled, pending the final go-live confirmation.'
              : 'Delivery is on track with healthy engagement and consistent weekly output.',
    } satisfies GridRow;
  });
}

function buildVirtualRows(count: number) {
  return Array.from({length: count}, (_, index) => ({
    id: index + 1,
    owner: `Record ${String(index + 1).padStart(5, '0')}`,
    status: STATUS_OPTIONS[index % STATUS_OPTIONS.length],
    score: 48 + ((index * 11) % 52),
  }));
}

function compareByColumn(a: GridRow, b: GridRow, column: ColumnId) {
  switch (column) {
    case 'id':
      return a.id - b.id;
    case 'score':
    case 'progress':
    case 'revenue':
      return a[column] - b[column];
    default:
      return String(a[column]).localeCompare(String(b[column]));
  }
}

function tryCopyToClipboard(value: string) {
  const clipboard =
    (globalThis as {navigator?: {clipboard?: {writeText?: (text: string) => Promise<void>}}})
      .navigator?.clipboard;

  if (clipboard?.writeText) {
    return clipboard.writeText(value).then(() => true).catch(() => false);
  }

  const nativeClipboard = (NativeModules as Record<string, {setString?: (text: string) => void}>)
    .Clipboard;

  if (nativeClipboard?.setString) {
    nativeClipboard.setString(value);
    return Promise.resolve(true);
  }

  return Promise.resolve(false);
}

function MetricCard({value, label, accent}: MetricCardProps) {
  return (
    <View style={[styles.metricCard, {borderColor: accent}]}>
      <Text style={[styles.metricValue, {color: accent}]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function ToggleChip({label, active, onPress}: ToggleChipProps) {
  return (
    <Pressable onPress={onPress} style={[styles.toggleChip, active && styles.toggleChipActive]}>
      <Text style={[styles.toggleChipText, active && styles.toggleChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ResizeHandle({
  columnId,
  width,
  minWidth,
  maxWidth,
  onResize,
}: ResizeHandleProps) {
  const startWidth = useRef(width);

  useEffect(() => {
    startWidth.current = width;
  }, [width]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 2,
        onPanResponderGrant: () => {
          startWidth.current = width;
        },
        onPanResponderMove: (_, gesture) => {
          onResize(columnId, clamp(startWidth.current + gesture.dx, minWidth, maxWidth));
        },
      }),
    [columnId, maxWidth, minWidth, onResize, width],
  );

  return (
    <View {...panResponder.panHandlers} style={styles.resizeHandle}>
      <View style={styles.resizeGrip} />
    </View>
  );
}

function DraggableColumnChip({label, index, total, onMove}: DraggableColumnChipProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [dragging, setDragging] = useState(false);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 4,
        onPanResponderGrant: () => setDragging(true),
        onPanResponderMove: (_, gesture) => {
          translateX.setValue(gesture.dx);
        },
        onPanResponderRelease: (_, gesture) => {
          const shift = Math.round(gesture.dx / 116);
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 8,
          }).start(() => setDragging(false));
          if (shift !== 0) {
            onMove(index, clamp(index + shift, 0, total - 1));
          }
        },
        onPanResponderTerminate: () => {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start(() => setDragging(false));
        },
      }),
    [index, onMove, total, translateX],
  );

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.dragChip,
        dragging && styles.dragChipActive,
        {transform: [{translateX}]},
      ]}>
      <Text style={styles.dragChipLabel}>{label}</Text>
      <Text style={styles.dragChipHint}>drag</Text>
    </Animated.View>
  );
}

function getStatusColor(status: RowStatus) {
  switch (status) {
    case 'Active':
      return Colors.success;
    case 'Pending':
      return Colors.warning;
    case 'Blocked':
      return Colors.error;
    default:
      return Colors.secondary;
  }
}

function getColumnLabel(column: ColumnId) {
  switch (column) {
    case 'id':
      return 'ID';
    case 'owner':
      return 'Owner';
    case 'team':
      return 'Team';
    case 'city':
      return 'City';
    case 'score':
      return 'Score';
    case 'progress':
      return 'Progress';
    case 'joined':
      return 'Joined';
    case 'revenue':
      return 'Revenue';
    case 'website':
      return 'Link';
    case 'status':
      return 'Status';
    default:
      return column;
  }
}

function getPlainCellValue(row: GridRow, column: ColumnId) {
  switch (column) {
    case 'id':
      return `${row.id}`;
    case 'owner':
      return row.owner;
    case 'score':
    case 'progress':
    case 'revenue':
      return `${row[column]}`;
    default:
      return String(row[column]);
  }
}

export default function DataGridScreen() {
  const initialRows = useMemo(() => buildRows(160), []);
  const virtualRows = useMemo<VirtualRow[]>(() => buildVirtualRows(10000), []);
  const [rows, setRows] = useState(initialRows);
  const [filters, setFilters] = useState<Filters>({
    global: '',
    owner: '',
    minScore: '',
    joinedAfter: '',
    status: 'All',
    team: 'All',
  });
  const [groupBy, setGroupBy] = useState<GroupById>('none');
  const [sort, setSort] = useState<SortState>({column: 'revenue', direction: 'desc'});
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(8);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [expandedIds, setExpandedIds] = useState<number[]>([1]);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [visibleColumns, setVisibleColumns] = useState<Record<CenterColumnId, boolean>>({
    team: true,
    city: true,
    score: true,
    progress: true,
    joined: true,
    revenue: true,
    website: true,
  });
  const [columnOrder, setColumnOrder] = useState<CenterColumnId[]>(CENTER_DEFAULT_ORDER);
  const [columnWidths, setColumnWidths] = useState<Record<ColumnId, number>>(DEFAULT_WIDTHS);
  const [editingCell, setEditingCell] = useState<EditingCell>(null);
  const [editDraft, setEditDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [forceEmpty, setForceEmpty] = useState(false);
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null);
  const [contextCell, setContextCell] = useState<ContextCell | null>(null);
  const [exportPreview, setExportPreview] = useState<ExportPreview | null>(null);
  const [feedback, setFeedback] = useState(
    'Ready to inspect, edit and share preview payloads from the grid.',
  );
  const [tableWidth, setTableWidth] = useState(0);
  const leftScrollRef = useRef<ScrollView>(null);
  const rightScrollRef = useRef<ScrollView>(null);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setPage(0);
  }, [
    filters.global,
    filters.joinedAfter,
    filters.minScore,
    filters.owner,
    filters.status,
    filters.team,
    forceEmpty,
    pageSize,
  ]);

  const orderedCenterColumns = useMemo(
    () => columnOrder.filter(columnId => visibleColumns[columnId]),
    [columnOrder, visibleColumns],
  );

  const filteredRows = useMemo(() => {
    if (forceEmpty) {
      return [];
    }

    const globalNeedle = filters.global.trim().toLowerCase();
    const ownerNeedle = filters.owner.trim().toLowerCase();
    const minScore = Number(filters.minScore) || 0;
    const joinedAfter = filters.joinedAfter.trim();

    return rows.filter(row => {
      if (globalNeedle) {
        const haystack = [
          row.owner,
          row.team,
          row.city,
          row.status,
          row.website,
          row.region,
          row.email,
        ]
          .join(' ')
          .toLowerCase();

        if (!haystack.includes(globalNeedle)) {
          return false;
        }
      }

      if (ownerNeedle && !row.owner.toLowerCase().includes(ownerNeedle)) {
        return false;
      }

      if (minScore > 0 && row.score < minScore) {
        return false;
      }

      if (joinedAfter && row.joined < joinedAfter) {
        return false;
      }

      if (filters.status !== 'All' && row.status !== filters.status) {
        return false;
      }

      if (filters.team !== 'All' && row.team !== filters.team) {
        return false;
      }

      return true;
    });
  }, [filters, forceEmpty, rows]);

  const sortedRows = useMemo(() => {
    const next = [...filteredRows];
    next.sort((left, right) => {
      const comparison = compareByColumn(left, right, sort.column);
      return sort.direction === 'asc' ? comparison : -comparison;
    });
    return next;
  }, [filteredRows, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);

  useEffect(() => {
    if (page !== safePage) {
      setPage(safePage);
    }
  }, [page, safePage]);

  const pagedRows = useMemo(
    () => sortedRows.slice(safePage * pageSize, safePage * pageSize + pageSize),
    [pageSize, safePage, sortedRows],
  );

  const gridItems = useMemo<GridItem[]>(() => {
    if (groupBy === 'none') {
      const flat: GridItem[] = [];
      pagedRows.forEach(row => {
        flat.push({kind: 'row', key: `row-${row.id}`, row});
        if (expandedIds.includes(row.id)) {
          flat.push({kind: 'detail', key: `detail-${row.id}`, row});
        }
      });
      return flat;
    }

    const grouped = new Map<string, GridRow[]>();
    pagedRows.forEach(row => {
      const groupValue = String(row[groupBy]);
      const current = grouped.get(groupValue) ?? [];
      current.push(row);
      grouped.set(groupValue, current);
    });

    const items: GridItem[] = [];
    Array.from(grouped.entries()).forEach(([groupValue, groupRows]) => {
      items.push({
        kind: 'group',
        key: `group-${groupValue}`,
        groupValue,
        count: groupRows.length,
        averageScore: Math.round(
          groupRows.reduce((sum, row) => sum + row.score, 0) / groupRows.length,
        ),
        totalRevenue: groupRows.reduce((sum, row) => sum + row.revenue, 0),
      });

      if (collapsedGroups[groupValue]) {
        return;
      }

      groupRows.forEach(row => {
        items.push({kind: 'row', key: `row-${row.id}`, row});
        if (expandedIds.includes(row.id)) {
          items.push({kind: 'detail', key: `detail-${row.id}`, row});
        }
      });
    });

    return items;
  }, [collapsedGroups, expandedIds, groupBy, pagedRows]);

  const currentPageIds = pagedRows.map(row => row.id);
  const currentSelectionCount = currentPageIds.filter(id => selectedIds.includes(id)).length;
  const allCurrentRowsSelected =
    currentPageIds.length > 0 && currentSelectionCount === currentPageIds.length;
  const visibleColumnCount = orderedCenterColumns.length + 3;
  const centerTableWidth = orderedCenterColumns.reduce(
    (sum, columnId) => sum + columnWidths[columnId],
    0,
  );
  const currentRevenue = pagedRows.reduce((sum, row) => sum + row.revenue, 0);
  const currentAverageScore =
    pagedRows.length > 0
      ? Math.round(pagedRows.reduce((sum, row) => sum + row.score, 0) / pagedRows.length)
      : 0;
  const responsiveHint = tableWidth > 0 && tableWidth < 980;

  function updateFilter<Key extends keyof Filters>(key: Key, value: Filters[Key]) {
    setFilters(prev => ({...prev, [key]: value}));
  }

  function toggleSort(column: ColumnId) {
    setSort(prev =>
      prev.column === column
        ? {column, direction: prev.direction === 'asc' ? 'desc' : 'asc'}
        : {column, direction: column === 'owner' || column === 'city' ? 'asc' : 'desc'},
    );
  }

  function toggleSelectRow(rowId: number) {
    setSelectedIds(prev =>
      prev.includes(rowId) ? prev.filter(id => id !== rowId) : [...prev, rowId],
    );
  }

  function toggleSelectCurrentPage() {
    setSelectedIds(prev => {
      if (allCurrentRowsSelected) {
        return prev.filter(id => !currentPageIds.includes(id));
      }

      return Array.from(new Set([...prev, ...currentPageIds]));
    });
  }

  function toggleExpanded(rowId: number) {
    setExpandedIds(prev =>
      prev.includes(rowId) ? prev.filter(id => id !== rowId) : [...prev, rowId],
    );
  }

  function toggleGroup(groupValue: string) {
    setCollapsedGroups(prev => ({...prev, [groupValue]: !prev[groupValue]}));
  }

  function toggleVisibility(columnId: CenterColumnId) {
    setVisibleColumns(prev => {
      const visibleCount = Object.values(prev).filter(Boolean).length;
      if (prev[columnId] && visibleCount === 1) {
        return prev;
      }

      return {...prev, [columnId]: !prev[columnId]};
    });
  }

  function resizeColumn(columnId: ColumnId, width: number) {
    setColumnWidths(prev => ({...prev, [columnId]: width}));
  }

  function reorderColumn(from: number, to: number) {
    if (from === to) {
      return;
    }

    setColumnOrder(prev => moveItem(prev, from, to));
  }

  function startEditing(row: GridRow, column: ColumnId) {
    setEditingCell({rowId: row.id, column});
    setEditDraft(getPlainCellValue(row, column));
  }

  function commitEditing(rowId: number, column: ColumnId, nextValue = editDraft) {
    setRows(prev =>
      prev.map(row => {
        if (row.id !== rowId) {
          return row;
        }

        if (column === 'owner') {
          return {...row, owner: nextValue.trim() || row.owner};
        }
        if (column === 'score') {
          return {...row, score: clamp(Number(nextValue) || row.score, 0, 100)};
        }
        if (column === 'progress') {
          return {...row, progress: clamp(Number(nextValue) || row.progress, 0, 100)};
        }
        if (column === 'revenue') {
          return {...row, revenue: Math.max(0, Number(nextValue) || row.revenue)};
        }
        if (column === 'status') {
          return {...row, status: nextValue as RowStatus};
        }
        if (column === 'team') {
          return {...row, team: nextValue};
        }

        return {...row, [column]: nextValue || row[column]};
      }),
    );

    setEditingCell(null);
    setFeedback(`${getColumnLabel(column)} updated inline for row ${rowId}.`);
  }

  function openContextMenu(row: GridRow, column: ColumnId) {
    setContextCell({
      rowId: row.id,
      column,
      label: `${getColumnLabel(column)} | Row ${row.id}`,
      value: getPlainCellValue(row, column),
    });
    setFeedback(`Context actions ready for ${getColumnLabel(column)} on row ${row.id}.`);
  }

  async function copyValue(value: string, label: string) {
    const copied = await tryCopyToClipboard(value);
    setFeedback(
      copied
        ? `${label} copied and mirrored into the preview buffer.`
        : `${label} stored in the preview buffer because the clipboard API is unavailable.`,
    );
  }

  async function exportCsv() {
    const columns: ColumnId[] = ['id', 'owner', ...orderedCenterColumns, 'status'];
    const csv = [
      columns.join(','),
      ...sortedRows.map(row =>
        columns
          .map(column => `"${getPlainCellValue(row, column).replace(/"/g, '""')}"`)
          .join(','),
      ),
    ].join('\n');

    setExportPreview({
      type: 'csv',
      title: 'showcase-grid.csv',
      content: csv,
    });

    try {
      await Share.share({
        title: 'showcase-grid.csv',
        message: csv,
      });
      setFeedback('CSV preview shared from the filtered dataset.');
    } catch {
      setFeedback('CSV preview generated locally.');
    }
  }

  async function exportPdf() {
    const lines = [
      'Showcase DataGrid Report',
      `Rows filtered: ${sortedRows.length}`,
      `Current page: ${safePage + 1}/${totalPages}`,
      `Visible center columns: ${orderedCenterColumns.length}`,
      `Group by: ${groupBy === 'none' ? 'none' : groupBy}`,
      `Current revenue: ${formatCurrency(currentRevenue)}`,
      '',
      ...pagedRows.slice(0, 8).map(
        row =>
          `#${row.id} ${row.owner} | ${row.team} | ${row.status} | ${formatCurrency(
            row.revenue,
          )}`,
      ),
    ];
    const pdfUri = buildPdfDocument(lines);
    const preview = lines.join('\n');

    setExportPreview({
      type: 'pdf',
      title: 'showcase-grid.pdf',
      content: preview,
    });

    try {
      await Share.share({
        title: 'showcase-grid.pdf',
        url: pdfUri,
        message: 'DataGrid PDF preview ready',
      });
      setFeedback('PDF preview shared from the current view.');
    } catch {
      setFeedback('PDF preview generated locally.');
    }
  }

  function runLoadingSimulation() {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    setLoading(true);
    setFeedback('Loading state and skeleton rows active.');
    loadingTimeoutRef.current = setTimeout(() => {
      setLoading(false);
      setFeedback('Dataset loaded again.');
    }, 950);
  }

  function applyContextFilter() {
    if (!contextCell) {
      return;
    }

    if (contextCell.column === 'status') {
      updateFilter('status', contextCell.value);
    } else if (contextCell.column === 'team') {
      updateFilter('team', contextCell.value);
    } else if (contextCell.column === 'owner' || contextCell.column === 'city') {
      updateFilter('owner', contextCell.value);
    } else if (contextCell.column === 'score') {
      updateFilter('minScore', contextCell.value);
    }

    setFeedback(`Filter seeded from ${contextCell.label}.`);
  }

  function syncVerticalScroll(y: number) {
    leftScrollRef.current?.scrollTo({y, animated: false});
    rightScrollRef.current?.scrollTo({y, animated: false});
  }

  function renderHeaderCell(columnId: ColumnId, width: number, resizable = false) {
    const sorted = sort.column === columnId;

    return (
      <Pressable
        key={`header-${columnId}`}
        onPress={() => toggleSort(columnId)}
        style={[styles.headerCell, {width}]}>
        <Text style={styles.headerCellLabel}>{getColumnLabel(columnId)}</Text>
        <Text style={styles.headerCellMeta}>
          {sorted ? (sort.direction === 'asc' ? 'ASC' : 'DESC') : 'SORT'}
        </Text>
        {resizable ? (
          <ResizeHandle
            columnId={columnId}
            width={width}
            minWidth={80}
            maxWidth={240}
            onResize={resizeColumn}
          />
        ) : null}
      </Pressable>
    );
  }

  function renderOwnerCell(row: GridRow, rowStyle: object) {
    const isEditing = editingCell?.rowId === row.id && editingCell.column === 'owner';

    return (
      <View style={[styles.leftRow, rowStyle]}>
        <Pressable onPress={() => toggleSelectRow(row.id)} style={styles.checkboxCell}>
          <Text style={styles.checkboxIcon}>
            {selectedIds.includes(row.id) ? '[x]' : '[ ]'}
          </Text>
        </Pressable>
        <View style={[styles.textCell, {width: columnWidths.id}]}>
          <Text style={styles.cellPrimary}>#{row.id}</Text>
          <Text style={styles.cellMuted}>{row.region}</Text>
        </View>
        <Pressable
          delayLongPress={180}
          onHoverIn={() => setHoveredRowId(row.id)}
          onHoverOut={() => setHoveredRowId(current => (current === row.id ? null : current))}
          onLongPress={() => openContextMenu(row, 'owner')}
          onPress={() => startEditing(row, 'owner')}
          style={[styles.ownerCell, {width: columnWidths.owner}]}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: row.avatarBackground,
                borderColor: row.avatarTone,
              },
            ]}>
            <Text style={[styles.avatarLabel, {color: row.avatarTone}]}>
              {row.avatarLabel}
            </Text>
          </View>
          <View style={styles.ownerCopy}>
            {isEditing ? (
              <TextInput
                autoFocus
                value={editDraft}
                onChangeText={setEditDraft}
                onBlur={() => commitEditing(row.id, 'owner')}
                onSubmitEditing={() => commitEditing(row.id, 'owner')}
                style={styles.inlineInput}
              />
            ) : (
              <>
                <Text style={styles.cellPrimary}>{row.owner}</Text>
                <Text style={styles.cellMuted}>{row.email}</Text>
              </>
            )}
          </View>
        </Pressable>
      </View>
    );
  }

  function renderCenterRow(item: GridItem, index: number) {
    if (item.kind === 'group') {
      return (
        <Pressable
          key={item.key}
          onPress={() => toggleGroup(item.groupValue)}
          style={[styles.groupRow, {width: centerTableWidth}]}>
          <Text style={styles.groupRowTitle}>
            {collapsedGroups[item.groupValue] ? '+' : '-'} {groupBy.toUpperCase()} {item.groupValue}
          </Text>
          <Text style={styles.groupRowMeta}>
            {item.count} rows | Avg {item.averageScore} | {formatCurrency(item.totalRevenue)}
          </Text>
        </Pressable>
      );
    }

    if (item.kind === 'detail') {
      return (
        <View key={item.key} style={[styles.detailRow, {width: centerTableWidth}]}>
          <Text style={styles.detailTitle}>Expandable row detail</Text>
          <Text style={styles.detailCopy}>{item.row.notes}</Text>
          <Text style={styles.detailMeta}>
            Region {item.row.region} | {item.row.website}
          </Text>
        </View>
      );
    }

    const row = item.row;
    const rowStyle = [
      styles.dataRow,
      index % 2 === 0 && styles.stripedRow,
      hoveredRowId === row.id && styles.hoveredRow,
      selectedIds.includes(row.id) && styles.selectedRow,
    ];

    return (
      <View key={item.key} style={[rowStyle, {width: centerTableWidth}]}>
        {orderedCenterColumns.map(columnId => {
          const width = columnWidths[columnId];
          const isEditing = editingCell?.rowId === row.id && editingCell.column === columnId;

          let content: React.ReactNode;
          if (isEditing && (columnId === 'team' || columnId === 'city')) {
            const options = columnId === 'team' ? TEAM_OPTIONS : CITY_OPTIONS;
            content = (
              <View style={styles.optionRow}>
                {options.map(option => (
                  <ToggleChip
                    key={option}
                    label={option}
                    active={getPlainCellValue(row, columnId) === option}
                    onPress={() => commitEditing(row.id, columnId, option)}
                  />
                ))}
              </View>
            );
          } else if (isEditing) {
            content = (
              <TextInput
                autoFocus
                value={editDraft}
                onChangeText={setEditDraft}
                onBlur={() => commitEditing(row.id, columnId)}
                onSubmitEditing={() => commitEditing(row.id, columnId)}
                style={styles.inlineInput}
              />
            );
          } else {
            switch (columnId) {
              case 'team':
                content = (
                  <View style={styles.teamBadge}>
                    <Text style={styles.teamBadgeText}>{row.team}</Text>
                  </View>
                );
                break;
              case 'city':
                content = (
                  <>
                    <Text style={styles.cellPrimary}>{row.city}</Text>
                    <Text style={styles.cellMuted}>{row.region}</Text>
                  </>
                );
                break;
              case 'score':
                content = (
                  <>
                    <Text style={styles.cellPrimary}>{row.score}</Text>
                    <Text
                      style={[
                        styles.cellMuted,
                        {color: row.score >= 80 ? Colors.success : Colors.warning},
                      ]}>
                      {row.score >= 80 ? 'healthy' : 'watch'}
                    </Text>
                  </>
                );
                break;
              case 'progress':
                content = (
                  <View style={styles.progressCell}>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${row.progress}%`,
                            backgroundColor: row.progress > 70 ? Colors.success : Colors.primary,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.cellMuted}>{row.progress}%</Text>
                  </View>
                );
                break;
              case 'joined':
                content = (
                  <>
                    <Text style={styles.cellPrimary}>{row.joined}</Text>
                    <Text style={styles.cellMuted}>date filter</Text>
                  </>
                );
                break;
              case 'revenue':
                content = (
                  <>
                    <Text style={styles.cellPrimary}>{formatCurrency(row.revenue)}</Text>
                    <Text style={styles.cellMuted}>{formatCompact(row.revenue)}</Text>
                  </>
                );
                break;
              case 'website':
                content = (
                  <Pressable onPress={() => setFeedback(`Link cell pressed for ${row.owner}.`)}>
                    <Text style={styles.linkText}>{row.website.replace('https://', '')}</Text>
                    <Text style={styles.cellMuted}>custom link cell</Text>
                  </Pressable>
                );
                break;
              default:
                content = <Text style={styles.cellPrimary}>{getPlainCellValue(row, columnId)}</Text>;
            }
          }

          const editable = columnId !== 'website';

          return (
            <Pressable
              key={`${item.key}-${columnId}`}
              delayLongPress={180}
              onHoverIn={() => setHoveredRowId(row.id)}
              onHoverOut={() => setHoveredRowId(current => (current === row.id ? null : current))}
              onLongPress={() => openContextMenu(row, columnId)}
              onPress={editable ? () => startEditing(row, columnId) : undefined}
              style={[styles.centerCell, {width}]}>
              {content}
            </Pressable>
          );
        })}
      </View>
    );
  }

  function renderRightRow(item: GridItem, index: number) {
    if (item.kind === 'group') {
      return (
        <Pressable
          key={item.key}
          onPress={() => toggleGroup(item.groupValue)}
          style={styles.groupRightRow}>
          <Text style={styles.groupRowMeta}>
            {collapsedGroups[item.groupValue] ? 'Expand' : 'Collapse'}
          </Text>
        </Pressable>
      );
    }

    if (item.kind === 'detail') {
      return <View key={item.key} style={styles.detailRightRow} />;
    }

    const row = item.row;
    const isEditing = editingCell?.rowId === row.id && editingCell.column === 'status';
    const rowStyle = [
      styles.rightRow,
      index % 2 === 0 && styles.stripedRow,
      hoveredRowId === row.id && styles.hoveredRow,
      selectedIds.includes(row.id) && styles.selectedRow,
    ];

    return (
      <View key={item.key} style={rowStyle}>
        <Pressable
          delayLongPress={180}
          onHoverIn={() => setHoveredRowId(row.id)}
          onHoverOut={() => setHoveredRowId(current => (current === row.id ? null : current))}
          onLongPress={() => openContextMenu(row, 'status')}
          onPress={() => startEditing(row, 'status')}
          style={styles.statusCell}>
          {isEditing ? (
            <View style={styles.optionRow}>
              {STATUS_OPTIONS.map(option => (
                <ToggleChip
                  key={option}
                  label={option}
                  active={row.status === option}
                  onPress={() => commitEditing(row.id, 'status', option)}
                />
              ))}
            </View>
          ) : (
            <>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: `${getStatusColor(row.status)}22`,
                    borderColor: getStatusColor(row.status),
                  },
                ]}>
                <Text style={[styles.statusText, {color: getStatusColor(row.status)}]}>
                  {row.status}
                </Text>
              </View>
              <Pressable onPress={() => toggleExpanded(row.id)} style={styles.detailButton}>
                <Text style={styles.detailButtonText}>
                  {expandedIds.includes(row.id) ? 'Hide detail' : 'Row detail'}
                </Text>
              </Pressable>
            </>
          )}
        </Pressable>
      </View>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.section}>
        <Text style={styles.eyebrow}>Phase 4.1</Text>
        <Text style={styles.title}>DataGrid Control Center</Text>
        <Text style={styles.subtitle}>
          Fixed headers, frozen columns, inline editing, drag resizing, drag-and-drop order,
          context actions, share previews and a 10k-row virtualized feed.
        </Text>

        <View style={styles.metricsRow}>
          <MetricCard value={`${sortedRows.length}`} label="Filtered rows" accent={Colors.primary} />
          <MetricCard
            value={`${selectedIds.length}`}
            label="Selected rows"
            accent={Colors.success}
          />
          <MetricCard
            value={`${visibleColumnCount}`}
            label="Visible columns"
            accent={Colors.secondary}
          />
          <MetricCard value="10k+" label="Virtualized" accent={Colors.warning} />
        </View>

        <View style={styles.heroBanner}>
          <Text style={styles.heroBannerTitle}>Live state</Text>
          <Text style={styles.heroBannerCopy}>{feedback}</Text>
          <Text style={styles.heroBannerMeta}>
            Page {safePage + 1}/{totalPages} | {pageSize} rows per page | Group by{' '}
            {groupBy === 'none' ? 'none' : groupBy}
          </Text>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.cardTitle}>Filter Lab</Text>
        <Text style={styles.cardSubtitle}>
          Column filters cover text, number, date and select fields, plus a global search.
        </Text>

        <View style={styles.filtersGrid}>
          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>Global search</Text>
            <TextInput
              value={filters.global}
              onChangeText={value => updateFilter('global', value)}
              placeholder="Search owner, team, city, status..."
              placeholderTextColor={Colors.textMuted}
              style={styles.input}
            />
          </View>
          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>Owner contains</Text>
            <TextInput
              value={filters.owner}
              onChangeText={value => updateFilter('owner', value)}
              placeholder="Text filter"
              placeholderTextColor={Colors.textMuted}
              style={styles.input}
            />
          </View>
          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>Minimum score</Text>
            <TextInput
              value={filters.minScore}
              onChangeText={value => updateFilter('minScore', value)}
              placeholder="Number filter"
              placeholderTextColor={Colors.textMuted}
              style={styles.input}
            />
          </View>
          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>Joined after</Text>
            <TextInput
              value={filters.joinedAfter}
              onChangeText={value => updateFilter('joinedAfter', value)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.textMuted}
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.inlineToolbar}>
          <Text style={styles.inputLabel}>Status</Text>
          <View style={styles.chipRow}>
            {['All', ...STATUS_OPTIONS].map(option => (
              <ToggleChip
                key={option}
                label={option}
                active={filters.status === option}
                onPress={() => updateFilter('status', option)}
              />
            ))}
          </View>
        </View>

        <View style={styles.inlineToolbar}>
          <Text style={styles.inputLabel}>Team</Text>
          <View style={styles.chipRow}>
            {['All', ...TEAM_OPTIONS].map(option => (
              <ToggleChip
                key={option}
                label={option}
                active={filters.team === option}
                onPress={() => updateFilter('team', option)}
              />
            ))}
          </View>
        </View>

        <View style={styles.inlineToolbar}>
          <Text style={styles.inputLabel}>Grouping</Text>
          <View style={styles.chipRow}>
            {(['none', 'team', 'status', 'city'] as GroupById[]).map(option => (
              <ToggleChip
                key={option}
                label={option === 'none' ? 'No grouping' : `Group ${option}`}
                active={groupBy === option}
                onPress={() => setGroupBy(option)}
              />
            ))}
          </View>
        </View>

        <View style={styles.inlineToolbar}>
          <Text style={styles.inputLabel}>Page size</Text>
          <View style={styles.chipRow}>
            {PAGE_SIZES.map(size => (
              <ToggleChip
                key={size}
                label={`${size}`}
                active={pageSize === size}
                onPress={() => setPageSize(size)}
              />
            ))}
          </View>
        </View>

        <View style={styles.toolbarActions}>
          <Pressable onPress={runLoadingSimulation} style={styles.toolbarButton}>
            <Text style={styles.toolbarButtonText}>Loading state</Text>
          </Pressable>
          <Pressable
            onPress={() => setForceEmpty(current => !current)}
            style={[styles.toolbarButton, forceEmpty && styles.toolbarButtonActive]}>
            <Text style={styles.toolbarButtonText}>{forceEmpty ? 'Show rows' : 'Empty state'}</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setFilters({
                global: '',
                owner: '',
                minScore: '',
                joinedAfter: '',
                status: 'All',
                team: 'All',
              });
              setForceEmpty(false);
            }}
            style={styles.toolbarButton}>
            <Text style={styles.toolbarButtonText}>Reset filters</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.cardTitle}>Column Studio</Text>
        <Text style={styles.cardSubtitle}>
          Drag chips to reorder center columns, toggle visibility and resize headers by dragging the
          grips.
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dragChipRow}>
          {columnOrder.map((columnId, index) => (
            <DraggableColumnChip
              key={columnId}
              label={getColumnLabel(columnId)}
              index={index}
              total={columnOrder.length}
              onMove={reorderColumn}
            />
          ))}
        </ScrollView>

        <View style={styles.inlineToolbar}>
          <Text style={styles.inputLabel}>Column visibility</Text>
          <View style={styles.chipRow}>
            {CENTER_DEFAULT_ORDER.map(columnId => (
              <ToggleChip
                key={columnId}
                label={getColumnLabel(columnId)}
                active={visibleColumns[columnId]}
                onPress={() => toggleVisibility(columnId)}
              />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section} onLayout={event => setTableWidth(event.nativeEvent.layout.width)}>
        <Text style={styles.cardTitle}>Interactive Grid</Text>
        <Text style={styles.cardSubtitle}>
          Basic table with fixed headers, left and right frozen columns, multi-select rows, inline
          editing, row detail and independent horizontal and vertical scroll.
        </Text>
        {responsiveHint ? (
          <Text style={styles.responsiveHint}>
            Narrow viewport detected: the center table stays horizontally scrollable while frozen
            columns remain pinned.
          </Text>
        ) : null}

        <View style={styles.paginationRow}>
          <Pressable
            onPress={() => setPage(current => Math.max(0, current - 1))}
            style={styles.paginationButton}>
            <Text style={styles.paginationText}>Prev</Text>
          </Pressable>
          <Text style={styles.paginationMeta}>
            {sortedRows.length === 0 ? 0 : safePage * pageSize + 1}-
            {Math.min((safePage + 1) * pageSize, sortedRows.length)} of {sortedRows.length}
          </Text>
          <Pressable
            onPress={() => setPage(current => Math.min(totalPages - 1, current + 1))}
            style={styles.paginationButton}>
            <Text style={styles.paginationText}>Next</Text>
          </Pressable>
        </View>

        <View style={styles.tableShell}>
          <View
            style={[
              styles.leftPane,
              {width: LEFT_WIDTH + columnWidths.id + columnWidths.owner},
            ]}>
            <View style={styles.headerRow}>
              <Pressable onPress={toggleSelectCurrentPage} style={styles.checkboxCell}>
                <Text style={styles.checkboxIcon}>{allCurrentRowsSelected ? '?' : '?'}</Text>
              </Pressable>
              {renderHeaderCell('id', columnWidths.id)}
              {renderHeaderCell('owner', columnWidths.owner)}
            </View>

            <ScrollView ref={leftScrollRef} scrollEnabled={false} style={styles.bodyScroll}>
              {loading
                ? Array.from({length: 6}, (_, index) => (
                    <View key={`left-skeleton-${index}`} style={[styles.leftRow, styles.dataRow]}>
                      <View style={styles.checkboxCell} />
                      <View style={[styles.skeletonBlock, {width: columnWidths.id - 16}]} />
                      <View style={[styles.skeletonOwner, {width: columnWidths.owner - 24}]} />
                    </View>
                  ))
                : gridItems.map((item, index) => {
                    if (item.kind === 'group') {
                      return (
                        <Pressable
                          key={item.key}
                          onPress={() => toggleGroup(item.groupValue)}
                          style={styles.groupLeftRow}>
                          <Text style={styles.groupRowTitle}>
                            {collapsedGroups[item.groupValue] ? '?' : '?'} {item.groupValue}
                          </Text>
                          <Text style={styles.groupRowMeta}>{item.count} rows</Text>
                        </Pressable>
                      );
                    }

                    if (item.kind === 'detail') {
                      return <View key={item.key} style={styles.detailLeftRow} />;
                    }

                    const row = item.row;
                    const rowStyle = [
                      index % 2 === 0 && styles.stripedRow,
                      hoveredRowId === row.id && styles.hoveredRow,
                      selectedIds.includes(row.id) && styles.selectedRow,
                    ];

                    return renderOwnerCell(row, rowStyle);
                  })}
            </ScrollView>
          </View>

          <ScrollView horizontal style={styles.centerPane} showsHorizontalScrollIndicator={false}>
            <View>
              <View style={styles.headerRow}>
                {orderedCenterColumns.map(columnId =>
                  renderHeaderCell(columnId, columnWidths[columnId], true),
                )}
              </View>

              <ScrollView
                style={styles.bodyScroll}
                onScroll={event => syncVerticalScroll(event.nativeEvent.contentOffset.y)}
                scrollEventThrottle={16}>
                {loading
                  ? Array.from({length: 6}, (_, index) => (
                      <View
                        key={`center-skeleton-${index}`}
                        style={[styles.dataRow, {width: centerTableWidth}]}> 
                        {orderedCenterColumns.map(columnId => (
                          <View
                            key={`center-skeleton-${index}-${columnId}`}
                            style={[styles.centerCell, {width: columnWidths[columnId]}]}>
                            <View style={styles.skeletonBlock} />
                          </View>
                        ))}
                      </View>
                    ))
                  : gridItems.map((item, index) => renderCenterRow(item, index))}

                {!loading && gridItems.length === 0 ? (
                  <View style={[styles.emptyState, {width: Math.max(centerTableWidth, 460)}]}>
                    <Text style={styles.emptyStateTitle}>No rows match the current filters</Text>
                    <Text style={styles.emptyStateCopy}>
                      This empty state is intentional for the phase 4.1 checklist.
                    </Text>
                  </View>
                ) : null}
              </ScrollView>

              <View style={[styles.footerRow, {width: centerTableWidth}]}> 
                <Text style={styles.footerText}>Totals / aggregations</Text>
                <Text style={styles.footerText}>
                  Revenue {formatCurrency(currentRevenue)} | Avg score {currentAverageScore}
                </Text>
              </View>
            </View>
          </ScrollView>

          <View style={[styles.rightPane, {width: columnWidths.status}]}> 
            <View style={styles.headerRow}>{renderHeaderCell('status', columnWidths.status)}</View>
            <ScrollView ref={rightScrollRef} scrollEnabled={false} style={styles.bodyScroll}>
              {loading
                ? Array.from({length: 6}, (_, index) => (
                    <View key={`right-skeleton-${index}`} style={[styles.rightRow, styles.dataRow]}>
                      <View style={styles.skeletonStatus} />
                    </View>
                  ))
                : gridItems.map((item, index) => renderRightRow(item, index))}
            </ScrollView>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.cardTitle}>Context Menu & Share Preview</Text>
        <Text style={styles.cardSubtitle}>
          Long-press cells to open contextual actions, then prepare CSV or PDF share previews,
          or copy the current preview payload.
        </Text>

        <View style={styles.contextGrid}>
          <View style={styles.contextCard}>
            <Text style={styles.contextTitle}>Context menu</Text>
            <Text style={styles.contextValue}>{contextCell?.label ?? 'Long press any cell'}</Text>
            <Text style={styles.contextBody}>
              {contextCell?.value ?? 'Cell value actions appear here for copy, edit and filter.'}
            </Text>
            <View style={styles.contextActions}>
              <Pressable
                disabled={!contextCell}
                onPress={() => {
                  if (contextCell) {
                    copyValue(contextCell.value, contextCell.label);
                  }
                }}
                style={[styles.toolbarButton, !contextCell && styles.disabledButton]}>
                <Text style={styles.toolbarButtonText}>Copy value</Text>
              </Pressable>
              <Pressable
                disabled={!contextCell}
                onPress={applyContextFilter}
                style={[styles.toolbarButton, !contextCell && styles.disabledButton]}>
                <Text style={styles.toolbarButtonText}>Filter by value</Text>
              </Pressable>
              <Pressable
                disabled={!contextCell}
                onPress={() => {
                  if (!contextCell) {
                    return;
                  }
                  const row = rows.find(item => item.id === contextCell.rowId);
                  if (!row) {
                    return;
                  }
                  startEditing(row, contextCell.column);
                }}
                style={[styles.toolbarButton, !contextCell && styles.disabledButton]}>
                <Text style={styles.toolbarButtonText}>Edit cell</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.contextCard}>
            <Text style={styles.contextTitle}>Share preview</Text>
            <Text style={styles.contextValue}>{exportPreview?.title ?? 'No preview prepared yet'}</Text>
            <Text style={styles.contextBody} numberOfLines={8}>
              {exportPreview?.content ?? 'Generate CSV or PDF to inspect the payload that will be shared.'}
            </Text>
            <View style={styles.contextActions}>
              <Pressable onPress={exportCsv} style={styles.toolbarButton}>
                <Text style={styles.toolbarButtonText}>Share CSV preview</Text>
              </Pressable>
              <Pressable onPress={exportPdf} style={styles.toolbarButton}>
                <Text style={styles.toolbarButtonText}>Share PDF preview</Text>
              </Pressable>
              <Pressable
                disabled={!exportPreview}
                onPress={() => {
                  if (exportPreview) {
                    copyValue(exportPreview.content, exportPreview.title);
                  }
                }}
                style={[styles.toolbarButton, !exportPreview && styles.disabledButton]}>
                <Text style={styles.toolbarButtonText}>Copy preview buffer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.cardTitle}>Virtualized Dataset</Text>
        <Text style={styles.cardSubtitle}>
          FlashList keeps 10000+ rows responsive without loading the whole grid into memory.
        </Text>
        <View style={styles.virtualCard}>
          <View style={styles.virtualHeader}>
            <Text style={styles.virtualHeaderLabel}>Row virtualization</Text>
            <Text style={styles.virtualHeaderMeta}>10000 rows | FlashList recycle pool</Text>
          </View>
          <FlashList
            data={virtualRows}
            renderItem={({item, index}) => (
              <View style={[styles.virtualRow, index % 2 === 0 && styles.stripedRow]}>
                <Text style={styles.virtualCellId}>#{item.id}</Text>
                <Text style={styles.virtualCellOwner}>{item.owner}</Text>
                <Text style={styles.virtualCellStatus}>{item.status}</Text>
                <Text style={styles.virtualCellScore}>{item.score}</Text>
              </View>
            )}
            style={styles.virtualList}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xxl,
  },
  eyebrow: {
    ...Typography.label,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  metricCard: {
    minWidth: 120,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    backgroundColor: Colors.bgCardAlt,
  },
  metricValue: {
    ...Typography.h3,
  },
  metricLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  heroBanner: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgCardAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heroBannerTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  heroBannerCopy: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  heroBannerMeta: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  filtersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  inputBlock: {
    minWidth: 210,
    flexGrow: 1,
  },
  inputLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
  },
  input: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCardAlt,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  inlineToolbar: {
    marginTop: Spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  toggleChip: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCardAlt,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  toggleChipActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}22`,
  },
  toggleChipText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  toggleChipTextActive: {
    color: Colors.textPrimary,
  },
  toolbarActions: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  toolbarButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCardAlt,
  },
  toolbarButtonActive: {
    borderColor: Colors.warning,
  },
  toolbarButtonText: {
    ...Typography.caption,
    color: Colors.textPrimary,
  },
  dragChipRow: {
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  dragChip: {
    width: 108,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCardAlt,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  dragChipActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}18`,
  },
  dragChipLabel: {
    ...Typography.caption,
    color: Colors.textPrimary,
  },
  dragChipHint: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  responsiveHint: {
    ...Typography.caption,
    color: Colors.warning,
    marginBottom: Spacing.sm,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  paginationButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgCardAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  paginationText: {
    ...Typography.caption,
    color: Colors.textPrimary,
  },
  paginationMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flex: 1,
    textAlign: 'center',
  },
  tableShell: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    backgroundColor: Colors.bgCard,
  },
  leftPane: {
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    backgroundColor: Colors.bgCardAlt,
  },
  centerPane: {
    flex: 1,
    backgroundColor: Colors.bgCard,
  },
  rightPane: {
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
    backgroundColor: Colors.bgCardAlt,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    minHeight: 56,
  },
  headerCell: {
    minHeight: 56,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  headerCellLabel: {
    ...Typography.caption,
    color: Colors.textPrimary,
  },
  headerCellMeta: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  resizeHandle: {
    position: 'absolute',
    right: -6,
    top: 0,
    bottom: 0,
    width: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resizeGrip: {
    width: 2,
    height: 24,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
  },
  bodyScroll: {
    maxHeight: BODY_HEIGHT,
  },
  dataRow: {
    minHeight: ROW_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  stripedRow: {
    backgroundColor: Colors.bgCardAlt,
  },
  hoveredRow: {
    backgroundColor: `${Colors.primary}14`,
  },
  selectedRow: {
    backgroundColor: `${Colors.success}14`,
  },
  leftRow: {
    minHeight: ROW_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
  },
  rightRow: {
    minHeight: ROW_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  checkboxCell: {
    width: LEFT_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  checkboxIcon: {
    fontSize: 18,
    color: Colors.textPrimary,
  },
  textCell: {
    paddingHorizontal: Spacing.sm,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  ownerCell: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    gap: Spacing.sm,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: {
    ...Typography.caption,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  ownerCopy: {
    flex: 1,
  },
  centerCell: {
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  statusCell: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  cellPrimary: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
  },
  cellMuted: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  teamBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: `${Colors.secondary}1c`,
  },
  teamBadgeText: {
    ...Typography.caption,
    color: Colors.textPrimary,
  },
  progressCell: {
    gap: Spacing.sm,
  },
  progressTrack: {
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  linkText: {
    ...Typography.bodySmall,
    color: Colors.primary,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  inlineInput: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.bgCardAlt,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    minHeight: 38,
  },
  groupLeftRow: {
    minHeight: GROUP_HEIGHT,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  groupRow: {
    minHeight: GROUP_HEIGHT,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  groupRightRow: {
    minHeight: GROUP_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  groupRowTitle: {
    ...Typography.caption,
    color: Colors.textPrimary,
  },
  groupRowMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  detailLeftRow: {
    minHeight: DETAIL_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: `${Colors.primary}10`,
  },
  detailRow: {
    minHeight: DETAIL_HEIGHT,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: `${Colors.primary}10`,
  },
  detailRightRow: {
    minHeight: DETAIL_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: `${Colors.primary}10`,
  },
  detailTitle: {
    ...Typography.caption,
    color: Colors.textPrimary,
  },
  detailCopy: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  detailMeta: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  statusText: {
    ...Typography.caption,
  },
  detailButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  detailButtonText: {
    ...Typography.caption,
    color: Colors.primary,
  },
  footerRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    ...Typography.caption,
    color: Colors.textPrimary,
  },
  emptyState: {
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  emptyStateCopy: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  contextGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  contextCard: {
    flex: 1,
    minWidth: 280,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCardAlt,
  },
  contextTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  contextValue: {
    ...Typography.caption,
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  contextBody: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  contextActions: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  disabledButton: {
    opacity: 0.45,
  },
  virtualCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    backgroundColor: Colors.bgCardAlt,
  },
  virtualHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  virtualHeaderLabel: {
    ...Typography.caption,
    color: Colors.textPrimary,
  },
  virtualHeaderMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  virtualList: {
    height: 320,
  },
  virtualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    minHeight: 46,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  virtualCellId: {
    width: 62,
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  virtualCellOwner: {
    flex: 1,
    ...Typography.bodySmall,
    color: Colors.textPrimary,
  },
  virtualCellStatus: {
    width: 90,
    ...Typography.caption,
    color: Colors.primary,
  },
  virtualCellScore: {
    width: 50,
    ...Typography.caption,
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  skeletonBlock: {
    height: 14,
    borderRadius: Radius.full,
    backgroundColor: Colors.borderLight,
  },
  skeletonOwner: {
    height: 18,
    marginHorizontal: Spacing.sm,
    alignSelf: 'center',
    borderRadius: Radius.full,
    backgroundColor: Colors.borderLight,
  },
  skeletonStatus: {
    height: 24,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.lg,
    borderRadius: Radius.full,
    backgroundColor: Colors.borderLight,
  },
});

