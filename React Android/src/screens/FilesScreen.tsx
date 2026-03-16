import React, {useEffect, useMemo, useState} from 'react';
import {Pressable, Share, StyleSheet, Text, TextInput, View} from 'react-native';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {Colors, Radius, Spacing, Typography} from '../theme';

type FileKind = 'pdf' | 'image' | 'doc' | 'sheet' | 'archive' | 'audio';
type ImageKind = 'PNG' | 'JPG' | 'GIF' | 'SVG';
type FileFilter = 'All' | 'Docs' | 'Images' | 'Media' | 'Archive';

type FileItem = {
  id: string;
  name: string;
  ext: string;
  kind: FileKind;
  sizeLabel: string;
  sizeKb: number;
  updatedAt: string;
  source: string;
  previewTitle: string;
  summary: string;
  accent: string;
  cached: boolean;
  downloaded: boolean;
  shareLabel: string;
  imageKind?: ImageKind;
  pdfPages?: string[];
  documentSections?: string[];
};

type ChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

type StatProps = {
  label: string;
  value: string;
  accent: string;
};

type PageCardProps = {
  text: string;
  page: number;
  zoom: number;
  query: string;
};

const FILE_FILTERS: FileFilter[] = ['All', 'Docs', 'Images', 'Media', 'Archive'];
const IMAGE_TABS: ImageKind[] = ['PNG', 'JPG', 'GIF', 'SVG'];

function buildFiles(): FileItem[] {
  return [
    {
      id: 'pdf-proposal',
      name: 'Client proposal',
      ext: 'pdf',
      kind: 'pdf',
      sizeLabel: '2.4 MB',
      sizeKb: 2400,
      updatedAt: '2026-03-14 09:20',
      source: 'Downloads',
      previewTitle: 'Proposal deck',
      summary: 'Multi-page PDF with pricing, roadmap and delivery notes.',
      accent: Colors.primary,
      cached: true,
      downloaded: true,
      shareLabel: 'proposal.pdf',
      pdfPages: [
        'Executive summary\nPhase 1 covered architecture and navigation.\nPhase 2 delivered layout systems and optimized lists.',
        'Pricing details\nRetainer model with onboarding, delivery and reporting milestones.\nSearch finds contracts, milestones and scope.',
        'Appendix\nBenchmarks, compatibility notes and deployment checklist.',
      ],
      documentSections: ['Overview', 'Pricing', 'Appendix'],
    },
    {
      id: 'pdf-guide',
      name: 'Integration guide',
      ext: 'pdf',
      kind: 'pdf',
      sizeLabel: '1.8 MB',
      sizeKb: 1800,
      updatedAt: '2026-03-13 16:05',
      source: 'Shared',
      previewTitle: 'Implementation guide',
      summary: 'PDF handbook used to demo pagination, search and zoom.',
      accent: Colors.secondary,
      cached: false,
      downloaded: false,
      shareLabel: 'guide.pdf',
      pdfPages: [
        'Setup checklist\nInstall prerequisites and validate build scripts.',
        'Delivery workflow\nUse preview builds, QA signoff and staged releases.',
        'Troubleshooting\nCache resets, runtime logs and dependency verification.',
      ],
      documentSections: ['Checklist', 'Workflow', 'Troubleshooting'],
    },
    {
      id: 'image-brand',
      name: 'Brand poster',
      ext: 'png',
      kind: 'image',
      imageKind: 'PNG',
      sizeLabel: '860 KB',
      sizeKb: 860,
      updatedAt: '2026-03-12 11:48',
      source: 'Design',
      previewTitle: 'PNG artwork',
      summary: 'Raster preview with transparent layers and color blocks.',
      accent: Colors.success,
      cached: true,
      downloaded: true,
      shareLabel: 'poster.png',
      documentSections: ['Palette', 'Layout', 'Export'],
    },
    {
      id: 'image-hero',
      name: 'Hero photo',
      ext: 'jpg',
      kind: 'image',
      imageKind: 'JPG',
      sizeLabel: '1.1 MB',
      sizeKb: 1100,
      updatedAt: '2026-03-12 18:10',
      source: 'Camera roll',
      previewTitle: 'JPG preview',
      summary: 'Compressed image suited for previewing raster assets.',
      accent: Colors.warning,
      cached: false,
      downloaded: true,
      shareLabel: 'hero.jpg',
      documentSections: ['Metadata', 'Compression', 'Variants'],
    },
    {
      id: 'image-loader',
      name: 'Loading sticker',
      ext: 'gif',
      kind: 'image',
      imageKind: 'GIF',
      sizeLabel: '420 KB',
      sizeKb: 420,
      updatedAt: '2026-03-11 09:34',
      source: 'Assets',
      previewTitle: 'GIF preview',
      summary: 'Animated-style asset with looping motion stripes.',
      accent: Colors.secondary,
      cached: true,
      downloaded: true,
      shareLabel: 'loader.gif',
      documentSections: ['Frames', 'Timing', 'Loop'],
    },
    {
      id: 'image-iconset',
      name: 'Vector icon set',
      ext: 'svg',
      kind: 'image',
      imageKind: 'SVG',
      sizeLabel: '96 KB',
      sizeKb: 96,
      updatedAt: '2026-03-10 21:02',
      source: 'Assets',
      previewTitle: 'SVG preview',
      summary: 'Sharp vector output for icons and illustrations.',
      accent: Colors.accent,
      cached: true,
      downloaded: true,
      shareLabel: 'icons.svg',
      documentSections: ['Paths', 'Strokes', 'Scales'],
    },
    {
      id: 'doc-notes',
      name: 'Meeting notes',
      ext: 'docx',
      kind: 'doc',
      sizeLabel: '320 KB',
      sizeKb: 320,
      updatedAt: '2026-03-09 15:32',
      source: 'Documents',
      previewTitle: 'Document preview',
      summary: 'Word-style notes preview with section snippets.',
      accent: Colors.primary,
      cached: false,
      downloaded: false,
      shareLabel: 'notes.docx',
      documentSections: ['Agenda', 'Risks', 'Actions'],
    },
    {
      id: 'sheet-budget',
      name: 'Budget sheet',
      ext: 'xlsx',
      kind: 'sheet',
      sizeLabel: '508 KB',
      sizeKb: 508,
      updatedAt: '2026-03-08 13:44',
      source: 'Finance',
      previewTitle: 'Spreadsheet preview',
      summary: 'Grid-like summary for numeric docs and previews.',
      accent: Colors.success,
      cached: true,
      downloaded: true,
      shareLabel: 'budget.xlsx',
      documentSections: ['Summary', 'Quarterly', 'Variance'],
    },
    {
      id: 'archive-build',
      name: 'Build archive',
      ext: 'zip',
      kind: 'archive',
      sizeLabel: '7.6 MB',
      sizeKb: 7600,
      updatedAt: '2026-03-07 20:16',
      source: 'Artifacts',
      previewTitle: 'Archive preview',
      summary: 'Package bundle with cache and download actions.',
      accent: Colors.error,
      cached: false,
      downloaded: false,
      shareLabel: 'build.zip',
      documentSections: ['Bundle', 'Checksums', 'Artifacts'],
    },
    {
      id: 'audio-bed',
      name: 'Audio bed',
      ext: 'wav',
      kind: 'audio',
      sizeLabel: '4.1 MB',
      sizeKb: 4100,
      updatedAt: '2026-03-06 12:28',
      source: 'Media',
      previewTitle: 'Audio asset',
      summary: 'Sound asset preview routed through the generic document viewer.',
      accent: Colors.secondary,
      cached: true,
      downloaded: true,
      shareLabel: 'audio.wav',
      documentSections: ['Waveform', 'Markers', 'Exports'],
    },
  ] satisfies FileItem[];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function Chip({label, active, onPress}: ChipProps) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function Stat({label, value, accent}: StatProps) {
  return (
    <View style={[styles.statCard, {borderColor: accent}]}>
      <Text style={[styles.statValue, {color: accent}]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function PageCard({text, page, zoom, query}: PageCardProps) {
  const containsQuery = query.trim().length > 0 && text.toLowerCase().includes(query.toLowerCase());

  return (
    <View style={[styles.pageCard, {transform: [{scale: zoom}]}]}>
      <Text style={styles.pageNumber}>Page {page}</Text>
      <Text style={styles.pageText}>{text}</Text>
      {containsQuery ? (
        <Text style={styles.searchHit}>Search hit found on this page</Text>
      ) : null}
    </View>
  );
}

function getFilterKind(filter: FileFilter, file: FileItem) {
  if (filter === 'All') {
    return true;
  }
  if (filter === 'Docs') {
    return file.kind === 'pdf' || file.kind === 'doc' || file.kind === 'sheet';
  }
  if (filter === 'Images') {
    return file.kind === 'image';
  }
  if (filter === 'Media') {
    return file.kind === 'image' || file.kind === 'audio';
  }
  return file.kind === 'archive';
}

export default function FilesScreen() {
  const baseFiles = useMemo<FileItem[]>(() => buildFiles(), []);
  const [files, setFiles] = useState<FileItem[]>(baseFiles);
  const [selectedId, setSelectedId] = useState(baseFiles[0].id);
  const [filter, setFilter] = useState<FileFilter>('All');
  const [query, setQuery] = useState('');
  const [pdfPage, setPdfPage] = useState(0);
  const [pdfZoom, setPdfZoom] = useState(1);
  const [pdfSearch, setPdfSearch] = useState('');
  const [imageTab, setImageTab] = useState<ImageKind>('PNG');
  const [feedback, setFeedback] = useState(
    'File picker ready. Select an asset to inspect metadata and preview content.',
  );

  const filteredFiles = files.filter(file => {
    const matchesFilter = getFilterKind(filter, file);
    const needle = query.trim().toLowerCase();
    const matchesQuery =
      !needle ||
      file.name.toLowerCase().includes(needle) ||
      file.ext.toLowerCase().includes(needle) ||
      file.source.toLowerCase().includes(needle);

    return matchesFilter && matchesQuery;
  });

  const selectedFile =
    filteredFiles.find(file => file.id === selectedId) ??
    files.find(file => file.id === selectedId) ??
    files[0];

  const pdfPages = selectedFile.pdfPages ?? ['Document preview not available for this file.'];
  const safePage = clamp(pdfPage, 0, pdfPages.length - 1);
  const imageFiles = files.filter(file => file.kind === 'image' && file.imageKind === imageTab);
  const activeImage = imageFiles[0] ?? files.find(file => file.kind === 'image') ?? files[0];

  useEffect(() => {
    if (!selectedFile.pdfPages) {
      setPdfPage(0);
      setPdfZoom(1);
      setPdfSearch('');
    }
  }, [selectedFile.pdfPages]);

  function updateFile(id: string, patch: Partial<FileItem>) {
    setFiles(current => current.map(file => (file.id === id ? {...file, ...patch} : file)));
  }

  async function shareFile(file: FileItem) {
    try {
      await Share.share({
        title: file.shareLabel,
        message: `${file.name} (${file.ext.toUpperCase()}) from ${file.source}`,
      });
      setFeedback(`${file.name} prepared for sharing.`);
    } catch {
      setFeedback(`${file.name} share preview generated locally.`);
    }
  }

  const totalSizeMb = `${(files.reduce((sum, file) => sum + file.sizeKb, 0) / 1024).toFixed(1)} MB`;

  return (
    <ScreenContainer>
      <View style={styles.section}>
        <Text style={styles.eyebrow}>Phase 5.4</Text>
        <Text style={styles.title}>Files and Documents Hub</Text>
        <Text style={styles.subtitle}>
          File picker, metadata, PDF reading, page navigation, zoom, search, downloads, cache,
          sharing and image plus document previews in one workflow.
        </Text>

        <View style={styles.statsRow}>
          <Stat label="Assets" value={`${files.length}`} accent={Colors.primary} />
          <Stat
            label="Cached"
            value={`${files.filter(file => file.cached).length}`}
            accent={Colors.success}
          />
          <Stat
            label="PDF pages"
            value={`${selectedFile.pdfPages?.length ?? 0}`}
            accent={Colors.warning}
          />
          <Stat label="Total size" value={totalSizeMb} accent={Colors.secondary} />
        </View>

        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackTitle}>Status</Text>
          <Text style={styles.feedbackCopy}>{feedback}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>File picker</Text>
        <Text style={styles.sectionCopy}>
          Filter by category, search by name and choose any file to load metadata and previews.
        </Text>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search name, extension or location"
          placeholderTextColor={Colors.textMuted}
          style={styles.searchInput}
        />

        <View style={styles.chipRow}>
          {FILE_FILTERS.map(option => (
            <Chip
              key={option}
              label={option}
              active={filter === option}
              onPress={() => setFilter(option)}
            />
          ))}
        </View>

        <View style={styles.fileList}>
          {filteredFiles.map(file => {
            const selected = file.id === selectedId;
            return (
              <Pressable
                key={file.id}
                onPress={() => {
                  setSelectedId(file.id);
                  setFeedback(`${file.name} loaded into the preview panel.`);
                }}
                style={[styles.fileCard, selected && styles.fileCardSelected]}>
                <View style={styles.fileHeader}>
                  <View style={[styles.fileBadge, {backgroundColor: `${file.accent}22`}]}>
                    <Text style={[styles.fileBadgeText, {color: file.accent}]}>
                      {file.ext.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.fileCopy}>
                    <Text style={styles.fileTitle}>{file.name}</Text>
                    <Text style={styles.fileMeta}>
                      {file.source} | {file.sizeLabel} | {file.updatedAt}
                    </Text>
                  </View>
                </View>
                <Text style={styles.fileSummary}>{file.summary}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Metadata and actions</Text>
        <Text style={styles.sectionCopy}>
          Inspect file properties, then simulate download, cache and share operations.
        </Text>

        <View style={styles.metaCard}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Name</Text>
            <Text style={styles.metaValue}>{selectedFile.name}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Type</Text>
            <Text style={styles.metaValue}>{selectedFile.ext.toUpperCase()}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Size</Text>
            <Text style={styles.metaValue}>{selectedFile.sizeLabel}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Updated</Text>
            <Text style={styles.metaValue}>{selectedFile.updatedAt}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Location</Text>
            <Text style={styles.metaValue}>{selectedFile.source}</Text>
          </View>

          <View style={styles.actionRow}>
            <Pressable
              onPress={() => {
                updateFile(selectedFile.id, {downloaded: !selectedFile.downloaded});
                setFeedback(
                  !selectedFile.downloaded
                    ? `${selectedFile.name} downloaded to local storage.`
                    : `${selectedFile.name} download flag cleared.`,
                );
              }}
              style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>
                {selectedFile.downloaded ? 'Downloaded' : 'Download'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                updateFile(selectedFile.id, {cached: !selectedFile.cached});
                setFeedback(
                  !selectedFile.cached
                    ? `${selectedFile.name} stored in cache.`
                    : `${selectedFile.name} removed from cache.`,
                );
              }}
              style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>
                {selectedFile.cached ? 'Clear cache' : 'Cache file'}
              </Text>
            </Pressable>
            <Pressable onPress={() => shareFile(selectedFile)} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Share file</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PDF reader</Text>
        <Text style={styles.sectionCopy}>
          Integrated PDF surface with page navigation, zoom controls and in-document search.
        </Text>

        <View style={styles.viewerCard}>
          <View style={styles.viewerHeader}>
            <View>
              <Text style={styles.viewerTitle}>{selectedFile.previewTitle}</Text>
              <Text style={styles.viewerMeta}>
                {selectedFile.kind.toUpperCase()} | {safePage + 1}/{pdfPages.length}
              </Text>
            </View>
            <View style={[styles.fileBadge, {backgroundColor: `${selectedFile.accent}22`}]}>
              <Text style={[styles.fileBadgeText, {color: selectedFile.accent}]}>
                {Math.round(pdfZoom * 100)}%
              </Text>
            </View>
          </View>

          <TextInput
            value={pdfSearch}
            onChangeText={setPdfSearch}
            placeholder="Search inside the document"
            placeholderTextColor={Colors.textMuted}
            style={styles.searchInput}
          />

          <PageCard text={pdfPages[safePage]} page={safePage + 1} zoom={pdfZoom} query={pdfSearch} />

          <View style={styles.actionRow}>
            <Pressable
              onPress={() => setPdfPage(current => clamp(current - 1, 0, pdfPages.length - 1))}
              style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Previous page</Text>
            </Pressable>
            <Pressable
              onPress={() => setPdfPage(current => clamp(current + 1, 0, pdfPages.length - 1))}
              style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Next page</Text>
            </Pressable>
            <Pressable
              onPress={() => setPdfZoom(current => clamp(current - 0.1, 0.8, 1.6))}
              style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Zoom out</Text>
            </Pressable>
            <Pressable
              onPress={() => setPdfZoom(current => clamp(current + 0.1, 0.8, 1.6))}
              style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Zoom in</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Image viewer</Text>
        <Text style={styles.sectionCopy}>
          Preview PNG, JPG, GIF and SVG outputs with a dedicated image pane.
        </Text>

        <View style={styles.chipRow}>
          {IMAGE_TABS.map(kind => (
            <Chip
              key={kind}
              label={kind}
              active={imageTab === kind}
              onPress={() => setImageTab(kind)}
            />
          ))}
        </View>

        <View style={styles.imageCard}>
          <View style={[styles.imageCanvas, {backgroundColor: `${activeImage.accent}18`}]}>
            <View style={[styles.imageShapeLarge, {backgroundColor: activeImage.accent}]} />
            <View style={[styles.imageShapeSmall, {borderColor: activeImage.accent}]} />
            <View style={styles.imageGrid} />
            <Text style={styles.imageCanvasLabel}>{activeImage.imageKind ?? 'DOC'} preview</Text>
          </View>
          <Text style={styles.imageMeta}>
            {activeImage.name} | {activeImage.sizeLabel} | {activeImage.summary}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Document preview</Text>
        <Text style={styles.sectionCopy}>
          Generic preview cards adapt to docs, spreadsheets, archives and other file types.
        </Text>

        <View style={styles.previewGrid}>
          {(selectedFile.documentSections ?? ['Preview']).map(section => (
            <View key={section} style={styles.previewTile}>
              <Text style={styles.previewTileTitle}>{section}</Text>
              <Text style={styles.previewTileBody}>
                {selectedFile.kind === 'sheet'
                  ? 'Tabular summary with rows, totals and variance indicators.'
                  : selectedFile.kind === 'archive'
                    ? 'Archive contents, checksums and extraction summary.'
                    : selectedFile.kind === 'audio'
                      ? 'Media preview card with duration, markers and exports.'
                      : 'Section preview with extracted snippets and document metadata.'}
              </Text>
            </View>
          ))}
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
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statCard: {
    minWidth: 120,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    backgroundColor: Colors.bgCardAlt,
  },
  statValue: {
    ...Typography.h3,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  feedbackCard: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgCardAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  feedbackTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  feedbackCopy: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  sectionCopy: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  searchInput: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCardAlt,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCardAlt,
  },
  chipActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}22`,
  },
  chipText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.textPrimary,
  },
  fileList: {
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  fileCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCardAlt,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  fileCardSelected: {
    borderColor: Colors.primary,
  },
  fileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  fileBadge: {
    minWidth: 64,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  fileBadgeText: {
    ...Typography.caption,
  },
  fileCopy: {
    flex: 1,
    gap: 2,
  },
  fileTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  fileMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  fileSummary: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  metaCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCardAlt,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
  },
  metaLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  metaValue: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  primaryButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
  },
  primaryButtonText: {
    ...Typography.caption,
    color: Colors.bg,
  },
  secondaryButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  secondaryButtonText: {
    ...Typography.caption,
    color: Colors.textPrimary,
  },
  viewerCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCardAlt,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  viewerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  viewerTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  viewerMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  pageCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  pageNumber: {
    ...Typography.caption,
    color: Colors.primary,
  },
  pageText: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  searchHit: {
    ...Typography.caption,
    color: Colors.success,
  },
  imageCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCardAlt,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  imageCanvas: {
    height: 220,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageShapeLarge: {
    position: 'absolute',
    width: 138,
    height: 138,
    borderRadius: Radius.full,
    opacity: 0.4,
  },
  imageShapeSmall: {
    position: 'absolute',
    width: 86,
    height: 86,
    borderRadius: Radius.lg,
    borderWidth: 3,
    transform: [{rotate: '18deg'}],
  },
  imageGrid: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  imageCanvasLabel: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  imageMeta: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  previewTile: {
    minWidth: 240,
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCardAlt,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  previewTileTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  previewTileBody: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
});
