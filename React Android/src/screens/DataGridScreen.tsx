import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Image,
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
  avatarUri: string;
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

    return {
      id,
      owner,
      email: `${slug}@${team.toLowerCase()}.showcase.dev`,
      avatarUri: `https://i.pravatar.cc/80?u=showcase-${id}`,
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
  const virtualRows = useMemo(() => buildVirtualRows(10000), []);
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
  const [feedback, setFeedback] = useState('Ready to inspect, edit and export the grid.');
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
      label: `${getColumnLabel(column)} • Row ${row.id}`,
      value: getPlainCellValue(row, column),
    });
    setFeedback(`Context actions ready for ${getColumnLabel(column)} on row ${row.id}.`);
  }

  async function copyValue(value: string, label: string) {
    const copied = await tryCopyToClipboard(value);
    setFeedback(copied ? `${label} copied to clipboard.` : `Clipboard API not available for ${label}.`);
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
      setFeedback('CSV export prepared from the filtered dataset.');
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
        message: 'DataGrid PDF export ready',
      });
      setFeedback('PDF export payload generated from the current view.');
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
          {sorted ? (sort.direction === 'asc' ? '↑' : '↓') : '↕'}
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
            {selectedIds.includes(row.id) ? '☑' : '☐'}
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
          <Image source={{uri: row.avatarUri}} style={styles.avatar} />
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
            {collapsedGroups[item.groupValue] ? '▸' : '▾'} {groupBy.toUpperCase()} {item.groupValue}
          </Text>
          <Text style={styles.groupRowMeta}>
            {item.count} rows • Avg {item.averageScore} • {formatCurrency(item.totalRevenue)}
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
            Region {item.row.region} • {item.row.website}
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
          context actions, export previews and a 10k-row virtualized feed.
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
            Page {safePage + 1}/{totalPages} • {pageSize} rows per page • Group by{' '}
            {groupBy === 'none' ? 'none' : groupBy}
          </Text>
        </View>
      </View>
