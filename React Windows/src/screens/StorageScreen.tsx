import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions} from 'react-native';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {Colors, Radius, Spacing} from '../theme';

type KvEntry = {
  id: string;
  key: string;
  value: string;
  updatedAt: string;
};

type DbRow = {
  id: string;
  name: string;
  quantity: number;
  status: 'queued' | 'processing' | 'synced';
};

type FastPair = {
  id: string;
  key: string;
  value: string;
};

type VaultSecret = {
  id: string;
  label: string;
  cipher: string;
  last4: string;
  length: number;
  updatedAt: string;
};

type CacheEntry = {
  id: string;
  key: string;
  scope: string;
  sizeKb: number;
  updatedAt: string;
};

type StorageSnapshot = {
  kvEntries: KvEntry[];
  dbRows: DbRow[];
  fastPairs: FastPair[];
  secrets: VaultSecret[];
  cacheEntries: CacheEntry[];
  fastReads: number;
  fastWrites: number;
};

type SqlFilter = 'all' | 'queued' | 'synced';

type EventItem = {
  id: string;
  title: string;
  detail: string;
  tone: string;
};

const STORAGE_KEY = 'showcase:local-storage-lab';
const VAULT_SALT = 'showcase-vault';

const defaultSnapshot: StorageSnapshot = {
  kvEntries: [
    {id: 'kv-1', key: 'theme', value: 'neon-dark', updatedAt: '09:10:14'},
    {id: 'kv-2', key: 'last-screen', value: 'network', updatedAt: '09:14:22'},
  ],
  dbRows: [
    {id: 'db-1', name: 'Offline payload', quantity: 4, status: 'queued'},
    {id: 'db-2', name: 'Metrics batch', quantity: 11, status: 'processing'},
    {id: 'db-3', name: 'Release notes', quantity: 2, status: 'synced'},
  ],
  fastPairs: [
    {id: 'fast-1', key: 'session.token', value: 'warm'},
    {id: 'fast-2', key: 'flags.realtime', value: 'enabled'},
    {id: 'fast-3', key: 'layout.cols', value: '3'},
  ],
  secrets: [
    {id: 'secret-1', label: 'api-token', cipher: '', last4: '9F4A', length: 12, updatedAt: '09:08:10'},
  ],
  cacheEntries: [
    {id: 'cache-1', key: 'images/home-hero', scope: 'image', sizeKb: 320, updatedAt: '09:01:40'},
    {id: 'cache-2', key: 'responses/projects', scope: 'json', sizeKb: 72, updatedAt: '09:05:18'},
    {id: 'cache-3', key: 'pdf/proposal-v4', scope: 'document', sizeKb: 940, updatedAt: '09:07:52'},
  ],
  fastReads: 320,
  fastWrites: 44,
};

function stamp() {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
}

function createEvent(title: string, detail: string, tone: string): EventItem {
  return {
    id: makeId('event'),
    title,
    detail,
    tone,
  };
}

function cipherValue(value: string) {
  return value
    .split('')
    .map((char, index) =>
      (char.charCodeAt(0) ^ VAULT_SALT.charCodeAt(index % VAULT_SALT.length))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('');
}

function revealValue(cipher: string) {
  const bytes = cipher.match(/.{1,2}/g) ?? [];
  return bytes
    .map((chunk, index) =>
      String.fromCharCode(
        parseInt(chunk, 16) ^ VAULT_SALT.charCodeAt(index % VAULT_SALT.length),
      ),
    )
    .join('');
}

defaultSnapshot.secrets[0].cipher = cipherValue('sdk_live_9F4A');

function CodeCard({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.codeCard}>
      <Text style={styles.codeLabel}>{label}</Text>
      <Text style={styles.codeValue}>{value}</Text>
    </View>
  );
}

export default function StorageScreen() {
  const {width} = useWindowDimensions();
  const fullWidth = width - Spacing.lg * 2;
  const cardWidth = width >= 1080 ? (fullWidth - Spacing.md) / 2 : fullWidth;
  const [snapshot, setSnapshot] = useState<StorageSnapshot>(defaultSnapshot);
  const [hydrated, setHydrated] = useState(false);
  const [kvKey, setKvKey] = useState('feature.flag');
  const [kvValue, setKvValue] = useState('storage-lab');
  const [dbName, setDbName] = useState('Queued export');
  const [dbQuantity, setDbQuantity] = useState('6');
  const [dbStatus, setDbStatus] = useState<DbRow['status']>('queued');
  const [sqlFilter, setSqlFilter] = useState<SqlFilter>('all');
  const [secretLabel, setSecretLabel] = useState('refresh-token');
  const [secretValue, setSecretValue] = useState('tok_live_4H2P8Z');
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [fastLatency, setFastLatency] = useState('0.7ms median');
  const [events, setEvents] = useState<EventItem[]>([
    createEvent('Storage lab ready', 'AsyncStorage snapshot is waiting to hydrate.', Colors.primary),
  ]);

  useEffect(() => {
    let active = true;

    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        if (!active || !raw) {
          return;
        }
        const parsed = JSON.parse(raw) as Partial<StorageSnapshot>;
        setSnapshot({
          ...defaultSnapshot,
          ...parsed,
          kvEntries: parsed.kvEntries ?? defaultSnapshot.kvEntries,
          dbRows: parsed.dbRows ?? defaultSnapshot.dbRows,
          fastPairs: parsed.fastPairs ?? defaultSnapshot.fastPairs,
          secrets: parsed.secrets ?? defaultSnapshot.secrets,
          cacheEntries: parsed.cacheEntries ?? defaultSnapshot.cacheEntries,
          fastReads: parsed.fastReads ?? defaultSnapshot.fastReads,
          fastWrites: parsed.fastWrites ?? defaultSnapshot.fastWrites,
        });
        setEvents(previous => [
          createEvent('Snapshot restored', 'Local storage state restored from AsyncStorage.', Colors.success),
          ...previous,
        ].slice(0, 8));
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setEvents(previous => [
          createEvent('Storage fallback', 'Using default local snapshot after a read failure.', Colors.warning),
          ...previous,
        ].slice(0, 8));
      })
      .finally(() => {
        if (active) {
          setHydrated(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)).catch(() => {});
  }, [hydrated, snapshot]);

  const pushEvent = (title: string, detail: string, tone: string) => {
    setEvents(previous => [createEvent(title, detail, tone), ...previous].slice(0, 8));
  };

  const upsertKvEntry = () => {
    const trimmedKey = kvKey.trim();
    if (!trimmedKey) {
      return;
    }

    setSnapshot(previous => {
      const nextEntry: KvEntry = {
        id: makeId('kv'),
        key: trimmedKey,
        value: kvValue.trim() || 'empty',
        updatedAt: stamp(),
      };
      const existing = previous.kvEntries.find(entry => entry.key === trimmedKey);
      const kvEntries = existing
        ? previous.kvEntries.map(entry =>
            entry.key === trimmedKey
              ? {...entry, value: nextEntry.value, updatedAt: nextEntry.updatedAt}
              : entry,
          )
        : [nextEntry, ...previous.kvEntries];

      return {...previous, kvEntries};
    });

    pushEvent('AsyncStorage write', `Upserted key "${trimmedKey}".`, Colors.primary);
  };

  const removeKvEntry = (id: string) => {
    setSnapshot(previous => ({
      ...previous,
      kvEntries: previous.kvEntries.filter(entry => entry.id !== id),
    }));
    pushEvent('AsyncStorage delete', 'Removed a persisted key-value entry.', Colors.warning);
  };

  const insertDbRow = () => {
    const quantity = Number.parseInt(dbQuantity, 10);
    if (!dbName.trim() || Number.isNaN(quantity)) {
      return;
    }

    setSnapshot(previous => ({
      ...previous,
      dbRows: [
        {
          id: makeId('db'),
          name: dbName.trim(),
          quantity,
          status: dbStatus,
        },
        ...previous.dbRows,
      ],
    }));
    pushEvent('SQLite-style insert', `Inserted "${dbName.trim()}" into the queue table.`, Colors.secondary);
  };

  const markDbSynced = () => {
    setSnapshot(previous => ({
      ...previous,
      dbRows: previous.dbRows.map((row, index) =>
        index === 0 ? {...row, status: 'synced'} : row,
      ),
    }));
    pushEvent('SQLite-style update', 'Promoted the newest row to synced.', Colors.success);
  };

  const deleteOldestDbRow = () => {
    setSnapshot(previous => ({
      ...previous,
      dbRows: previous.dbRows.slice(0, Math.max(previous.dbRows.length - 1, 0)),
    }));
    pushEvent('SQLite-style delete', 'Removed the oldest row from the queue.', Colors.error);
  };

  const hydrateFastStore = () => {
    const fastPairs = Array.from({length: 24}, (_, index) => ({
      id: makeId('fast'),
      key: `hot.key.${index + 1}`,
      value: `value-${(index + 1).toString().padStart(2, '0')}`,
    }));

    setSnapshot(previous => ({
      ...previous,
      fastPairs,
      fastWrites: previous.fastWrites + fastPairs.length,
    }));
    setFastLatency('0.4ms warm write');
    pushEvent('MMKV-style hydrate', 'Filled the hot store with 24 keys.', Colors.accent);
  };

  const burstRead = () => {
    const reads = snapshot.fastPairs.length * 32;
    setSnapshot(previous => ({
      ...previous,
      fastReads: previous.fastReads + reads,
    }));
    setFastLatency(`${Math.max(0.2, 1.8 - snapshot.fastPairs.length / 20).toFixed(1)}ms burst read`);
    pushEvent('MMKV-style read', `Read ${reads} keys from the hot store.`, Colors.primary);
  };

  const burstWrite = () => {
    setSnapshot(previous => ({
      ...previous,
      fastPairs: previous.fastPairs.map((pair, index) =>
        index % 2 === 0 ? {...pair, value: `${pair.value}-w`} : pair,
      ),
      fastWrites: previous.fastWrites + previous.fastPairs.length,
    }));
    setFastLatency('0.6ms write burst');
    pushEvent(
      'MMKV-style write',
      'Mutated the in-memory key map and persisted the snapshot.',
      Colors.success,
    );
  };

  const storeSecret = () => {
    const label = secretLabel.trim();
    const secret = secretValue.trim();
    if (!label || !secret) {
      return;
    }

    const nextSecret: VaultSecret = {
      id: makeId('secret'),
      label,
      cipher: cipherValue(secret),
      last4: secret.slice(-4),
      length: secret.length,
      updatedAt: stamp(),
    };

    setSnapshot(previous => ({
      ...previous,
      secrets: [nextSecret, ...previous.secrets],
    }));
    pushEvent('Vault write', `Stored masked secret "${label}".`, Colors.warning);
  };

  const clearSecrets = () => {
    setSnapshot(previous => ({...previous, secrets: []}));
    pushEvent('Vault reset', 'Cleared the secure vault preview.', Colors.error);
  };

  const primeCache = () => {
    const extraEntries: CacheEntry[] = [
      {id: makeId('cache'), key: 'graphql/dashboard', scope: 'json', sizeKb: 88, updatedAt: stamp()},
      {id: makeId('cache'), key: 'video/thumb-12', scope: 'media', sizeKb: 210, updatedAt: stamp()},
      {id: makeId('cache'), key: 'tiles/map-preview', scope: 'tile', sizeKb: 156, updatedAt: stamp()},
    ];

    setSnapshot(previous => ({
      ...previous,
      cacheEntries: [...extraEntries, ...previous.cacheEntries].slice(0, 8),
    }));
    pushEvent('Cache primed', 'Added three cache entries for media, API and tiles.', Colors.primary);
  };

  const trimCache = () => {
    setSnapshot(previous => ({
      ...previous,
      cacheEntries: previous.cacheEntries.slice(0, 3),
    }));
    pushEvent('Cache trimmed', 'Reduced the cache footprint to the three hottest entries.', Colors.warning);
  };

  const clearCache = () => {
    setSnapshot(previous => ({...previous, cacheEntries: []}));
    pushEvent('Cache cleared', 'Removed all cached entries from the local snapshot.', Colors.error);
  };

  const sqlRows = useMemo(() => {
    if (sqlFilter === 'queued') {
      return snapshot.dbRows.filter(row => row.status === 'queued');
    }
    if (sqlFilter === 'synced') {
      return snapshot.dbRows.filter(row => row.status === 'synced');
    }
    return snapshot.dbRows;
  }, [snapshot.dbRows, sqlFilter]);

  const sqlPreview = {
    all: 'SELECT * FROM queue ORDER BY id DESC;',
    queued: "SELECT * FROM queue WHERE status = 'queued';",
    synced: "SELECT * FROM queue WHERE status = 'synced';",
  }[sqlFilter];

  const totalCacheKb = snapshot.cacheEntries.reduce((sum, entry) => sum + entry.sizeKb, 0);
  const recordCount =
    snapshot.kvEntries.length +
    snapshot.dbRows.length +
    snapshot.fastPairs.length +
    snapshot.secrets.length +
    snapshot.cacheEntries.length;

  return (
    <ScreenContainer>
      <View style={styles.root}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>PHASE 7.3</Text>
          <Text style={styles.title}>Local Storage</Text>
          <Text style={styles.body}>
            Persistent key-value storage, SQLite-style tables, MMKV-style hot memory, secure vault
            preview and cache controls in one offline lab.
          </Text>
          <View style={styles.pills}>
            <View style={styles.pill}><Text style={styles.pillText}>5 demos</Text></View>
            <View style={styles.pill}><Text style={styles.pillText}>{recordCount} persisted records</Text></View>
            <View style={styles.pill}><Text style={styles.pillText}>{totalCacheKb} KB cache</Text></View>
            <View style={styles.pill}><Text style={styles.pillText}>{hydrated ? 'Hydrated' : 'Booting'}</Text></View>
          </View>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Persistent Stores</Text>
          <Text style={styles.sectionText}>
            AsyncStorage CRUD and a SQLite-style queue table backed by the same local snapshot.
          </Text>
        </View>
        <View style={styles.grid}>
          <View style={[styles.card, {width: cardWidth}]}>
            <Text style={styles.cardTitle}>AsyncStorage CRUD</Text>
            <Text style={styles.cardSubtitle}>Upsert, list and delete persisted key-value entries.</Text>
            <TextInput
              style={styles.input}
              value={kvKey}
              onChangeText={setKvKey}
              placeholder="Key"
              placeholderTextColor={Colors.textSecondary}
            />
            <TextInput
              style={styles.input}
              value={kvValue}
              onChangeText={setKvValue}
              placeholder="Value"
              placeholderTextColor={Colors.textSecondary}
            />
            <View style={styles.wrap}>
              <Pressable style={[styles.smallAction, styles.smallActionActive]} onPress={upsertKvEntry}>
                <Text style={styles.smallActionTextActive}>Upsert key</Text>
              </Pressable>
              <Pressable
                style={styles.smallAction}
                onPress={() => {
                  setSnapshot(previous => ({...previous, kvEntries: []}));
                  pushEvent('AsyncStorage clear', 'Cleared the key-value bucket.', Colors.error);
                }}>
                <Text style={styles.smallActionText}>Clear bucket</Text>
              </Pressable>
            </View>
            {snapshot.kvEntries.map(entry => (
              <View key={entry.id} style={styles.row}>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>{entry.key}</Text>
                  <Text style={styles.rowText}>{entry.value}</Text>
                </View>
                <View style={styles.rowMeta}>
                  <Text style={styles.rowTime}>{entry.updatedAt}</Text>
                  <Pressable onPress={() => removeKvEntry(entry.id)}>
                    <Text style={styles.inlineAction}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>

          <View style={[styles.card, {width: cardWidth}]}>
            <Text style={styles.cardTitle}>SQLite-style Table</Text>
            <Text style={styles.cardSubtitle}>A relational queue preview with insert, update and delete flows.</Text>
            <View style={styles.wrap}>
              {(['all', 'queued', 'synced'] as SqlFilter[]).map(filter => (
                <Pressable
                  key={filter}
                  style={[styles.smallAction, sqlFilter === filter && styles.smallActionActive]}
                  onPress={() => setSqlFilter(filter)}>
                  <Text style={sqlFilter === filter ? styles.smallActionTextActive : styles.smallActionText}>
                    {filter}
                  </Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              style={styles.input}
              value={dbName}
              onChangeText={setDbName}
              placeholder="Row name"
              placeholderTextColor={Colors.textSecondary}
            />
            <View style={styles.inlineInputs}>
              <TextInput
                style={[styles.input, styles.inlineInput]}
                value={dbQuantity}
                onChangeText={setDbQuantity}
                placeholder="Qty"
                placeholderTextColor={Colors.textSecondary}
              />
              <View style={styles.statusTabs}>
                {(['queued', 'processing', 'synced'] as DbRow['status'][]).map(status => (
                  <Pressable
                    key={status}
                    style={[styles.statusTab, dbStatus === status && styles.statusTabActive]}
                    onPress={() => setDbStatus(status)}>
                    <Text style={dbStatus === status ? styles.statusTabTextActive : styles.statusTabText}>
                      {status}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={styles.wrap}>
              <Pressable style={[styles.smallAction, styles.smallActionActive]} onPress={insertDbRow}>
                <Text style={styles.smallActionTextActive}>Insert row</Text>
              </Pressable>
              <Pressable style={styles.smallAction} onPress={markDbSynced}>
                <Text style={styles.smallActionText}>Mark synced</Text>
              </Pressable>
              <Pressable style={styles.smallAction} onPress={deleteOldestDbRow}>
                <Text style={styles.smallActionText}>Delete oldest</Text>
              </Pressable>
            </View>
            <CodeCard label="SQL query" value={sqlPreview} />
            <CodeCard label="Result set" value={JSON.stringify(sqlRows, null, 2)} />
          </View>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Local Engines</Text>
          <Text style={styles.sectionText}>
            MMKV-style hot storage and a secure vault preview layered over the persisted snapshot.
          </Text>
        </View>
        <View style={styles.grid}>
          <View style={[styles.card, {width: cardWidth}]}>
            <Text style={styles.cardTitle}>MMKV-style Hot Store</Text>
            <Text style={styles.cardSubtitle}>Cross-platform memory map profile with read and write bursts.</Text>
            <View style={styles.metricRow}>
              <View style={styles.metricChip}>
                <Text style={styles.metricLabel}>Keys</Text>
                <Text style={styles.metricValue}>{snapshot.fastPairs.length}</Text>
              </View>
              <View style={styles.metricChip}>
                <Text style={styles.metricLabel}>Reads</Text>
                <Text style={styles.metricValue}>{snapshot.fastReads}</Text>
              </View>
              <View style={styles.metricChip}>
                <Text style={styles.metricLabel}>Writes</Text>
                <Text style={styles.metricValue}>{snapshot.fastWrites}</Text>
              </View>
            </View>
            <View style={styles.wrap}>
              <Pressable style={[styles.smallAction, styles.smallActionActive]} onPress={hydrateFastStore}>
                <Text style={styles.smallActionTextActive}>Hydrate keys</Text>
              </Pressable>
              <Pressable style={styles.smallAction} onPress={burstRead}>
                <Text style={styles.smallActionText}>Read burst</Text>
              </Pressable>
              <Pressable style={styles.smallAction} onPress={burstWrite}>
                <Text style={styles.smallActionText}>Write burst</Text>
              </Pressable>
            </View>
            <Text style={styles.note}>{fastLatency}</Text>
            {snapshot.fastPairs.slice(0, 6).map(pair => (
              <View key={pair.id} style={styles.row}>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>{pair.key}</Text>
                  <Text style={styles.rowText}>{pair.value}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={[styles.card, {width: cardWidth}]}>
            <Text style={styles.cardTitle}>Secure Vault Preview</Text>
            <Text style={styles.cardSubtitle}>
              Masked secrets with local ciphering. Replace with Keychain or Keystore in production.
            </Text>
            <TextInput
              style={styles.input}
              value={secretLabel}
              onChangeText={setSecretLabel}
              placeholder="Secret label"
              placeholderTextColor={Colors.textSecondary}
            />
            <TextInput
              style={styles.input}
              value={secretValue}
              onChangeText={setSecretValue}
              placeholder="Secret value"
              placeholderTextColor={Colors.textSecondary}
            />
            <View style={styles.wrap}>
              <Pressable
                style={[styles.smallAction, vaultUnlocked && styles.smallActionActive]}
                onPress={() => setVaultUnlocked(previous => !previous)}>
                <Text style={vaultUnlocked ? styles.smallActionTextActive : styles.smallActionText}>
                  {vaultUnlocked ? 'Vault open' : 'Unlock vault'}
                </Text>
              </Pressable>
              <Pressable style={styles.smallAction} onPress={storeSecret}>
                <Text style={styles.smallActionText}>Store secret</Text>
              </Pressable>
              <Pressable style={styles.smallAction} onPress={clearSecrets}>
                <Text style={styles.smallActionText}>Clear vault</Text>
              </Pressable>
            </View>
            {snapshot.secrets.map(secret => (
              <View key={secret.id} style={styles.row}>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>{secret.label}</Text>
                  <Text style={styles.rowText}>
                    {vaultUnlocked ? revealValue(secret.cipher) : `****${secret.last4}`} ({secret.length} chars)
                  </Text>
                </View>
                <Text style={styles.rowTime}>{secret.updatedAt}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Cache Management</Text>
          <Text style={styles.sectionText}>
            Inspect cache footprint, prime entries and clear the local cache surface.
          </Text>
        </View>
        <View style={styles.grid}>
          <View style={[styles.card, {width: fullWidth}]}>
            <View style={styles.metricRow}>
              <View style={styles.metricChip}>
                <Text style={styles.metricLabel}>Entries</Text>
                <Text style={styles.metricValue}>{snapshot.cacheEntries.length}</Text>
              </View>
              <View style={styles.metricChip}>
                <Text style={styles.metricLabel}>Total size</Text>
                <Text style={styles.metricValue}>{totalCacheKb} KB</Text>
              </View>
              <View style={styles.metricChip}>
                <Text style={styles.metricLabel}>Store</Text>
                <Text style={styles.metricValue}>AsyncStorage</Text>
              </View>
            </View>
            <View style={styles.wrap}>
              <Pressable style={[styles.smallAction, styles.smallActionActive]} onPress={primeCache}>
                <Text style={styles.smallActionTextActive}>Prime cache</Text>
              </Pressable>
              <Pressable style={styles.smallAction} onPress={trimCache}>
                <Text style={styles.smallActionText}>Trim hot set</Text>
              </Pressable>
              <Pressable style={styles.smallAction} onPress={clearCache}>
                <Text style={styles.smallActionText}>Clear cache</Text>
              </Pressable>
            </View>
            {snapshot.cacheEntries.map(entry => (
              <View key={entry.id} style={styles.row}>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>{entry.key}</Text>
                  <Text style={styles.rowText}>{entry.scope} cache entry</Text>
                </View>
                <View style={styles.rowMeta}>
                  <Text style={styles.rowTime}>{entry.sizeKb} KB</Text>
                  <Text style={styles.rowTime}>{entry.updatedAt}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Activity Feed</Text>
          <Text style={styles.sectionText}>Recent persistence events from the local storage lab.</Text>
        </View>
        <View style={styles.grid}>
          <View style={[styles.card, {width: fullWidth}]}>
            {events.map(event => (
              <View key={event.id} style={styles.eventRow}>
                <View style={[styles.eventTone, {backgroundColor: event.tone}]} />
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>{event.title}</Text>
                  <Text style={styles.rowText}>{event.detail}</Text>
                </View>
              </View>
            ))}
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
  sectionHead: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sectionText: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
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
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  inlineInputs: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  inlineInput: {
    width: 84,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  smallAction: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  smallActionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  smallActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  smallActionTextActive: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.bg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  rowCopy: {
    flex: 1,
    gap: 4,
  },
  rowMeta: {
    alignItems: 'flex-end',
    gap: 6,
  },
  rowTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  rowText: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  rowTime: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  inlineAction: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.error,
  },
  codeCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#08111f',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  codeValue: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textPrimary,
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  metricChip: {
    minWidth: 96,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  note: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  statusTabs: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  statusTab: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  statusTabActive: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.secondary,
  },
  statusTabText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statusTabTextActive: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.bg,
  },
  eventRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  eventTone: {
    width: 10,
    alignSelf: 'stretch',
    borderRadius: Radius.full,
  },
});
