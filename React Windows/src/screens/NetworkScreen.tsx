import React, {useEffect, useRef, useState} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import {ScreenContainer} from '../components/common/ScreenContainer';
import StateBlock from '../components/common/StateBlock';
import {Colors, Radius, Spacing} from '../theme';
import {createOperationController} from './network/operationController';
import {useTimeoutRegistry} from './network/useTimeoutRegistry';

type RestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type RestStatus = 'idle' | 'loading' | 'success' | 'error';
type TransferKind = 'upload' | 'download';

type RestPreset = {
  id: string;
  label: string;
  path: string;
  tone: string;
};

type GraphPreset = {
  id: string;
  label: string;
  tone: string;
  query: string;
};

type LogItem = {
  id: string;
  title: string;
  detail: string;
  tone: string;
};

type ChatMessage = {
  id: string;
  author: 'You' | 'Socket';
  text: string;
  time: string;
  tone: string;
};

type ApiEnvelope = {
  source: 'network' | 'cache' | 'retry';
  status: number;
  method: RestMethod;
  endpoint: string;
  latencyMs: number;
  data: unknown;
};

type RequestFlow = 'rest' | 'retry' | null;

const NETWORK_OPERATION_KEYS = [
  'request',
  'graph',
  'upload',
  'download',
  'heartbeat',
  'socket-session',
] as const;

const REST_PRESETS: RestPreset[] = [
  {id: 'projects', label: 'Projects', path: '/v1/projects', tone: Colors.primary},
  {id: 'deployments', label: 'Deployments', path: '/v1/deployments', tone: Colors.secondary},
  {id: 'profile', label: 'Profile', path: '/v1/profile', tone: Colors.success},
  {id: 'unstable', label: 'Unstable', path: '/v1/unstable', tone: Colors.error},
];

const GRAPH_PRESETS: GraphPreset[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    tone: Colors.primary,
    query: `query WorkspaceOverview {\n  workspace {\n    name\n    activeUsers\n    regions\n  }\n}`,
  },
  {
    id: 'release',
    label: 'Release Status',
    tone: Colors.secondary,
    query: `query ReleaseStatus {\n  release(id: "beta-42") {\n    version\n    status\n    blockers\n  }\n}`,
  },
  {
    id: 'billing',
    label: 'Billing',
    tone: Colors.warning,
    query: `query BillingSummary {\n  billing {\n    plan\n    invoicesDue\n    spendThisMonth\n  }\n}`,
  },
];

function stamp() {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function makeLog(title: string, detail: string, tone: string): LogItem {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    detail,
    tone,
  };
}

function parseBody(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return {raw: value};
  }
}

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function buildRestData(
  preset: RestPreset,
  method: RestMethod,
  body: unknown,
  mode: 'network' | 'retry',
) {
  if (preset.id === 'projects') {
    return {
      items: [
        {id: 'p-101', name: 'Showcase Android', status: 'Shipping'},
        {id: 'p-102', name: 'Windows Desktop', status: 'QA'},
        {id: 'p-103', name: 'Marketing Site', status: 'Design'},
      ],
      filters: {method, mode},
    };
  }

  if (preset.id === 'deployments') {
    return {
      deployment: {
        id: `dep-${Date.now().toString().slice(-4)}`,
        status: method === 'DELETE' ? 'Rolled back' : 'Queued',
        channel: method === 'POST' ? 'beta' : 'stable',
      },
      payload: body,
    };
  }

  if (preset.id === 'profile') {
    return {
      profile: {
        owner: 'Mathe',
        role: method === 'PUT' ? 'Owner' : 'Admin',
        locale: 'pt-BR',
      },
      payload: body,
    };
  }

  return {
    service: 'unstable-edge',
    note: 'Recovered after exponential backoff.',
    payload: body,
  };
}

function CodePanel({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.codeCard}>
      <Text style={styles.codeLabel}>{label}</Text>
      <Text style={styles.codeValue}>{value}</Text>
    </View>
  );
}

export default function NetworkScreen() {
  const {width} = useWindowDimensions();
  const cardWidth = width >= 1080 ? (width - Spacing.lg * 2 - Spacing.md) / 2 : width - Spacing.lg * 2;
  const [method, setMethod] = useState<RestMethod>('GET');
  const [restPresetId, setRestPresetId] = useState('projects');
  const [requestBody, setRequestBody] = useState('{"includeMetrics": true, "limit": 3}');
  const [restStatus, setRestStatus] = useState<RestStatus>('idle');
  const [restResponse, setRestResponse] = useState<ApiEnvelope | null>(null);
  const [restError, setRestError] = useState('');
  const [retryPlan, setRetryPlan] = useState('Retry engine idle.');
  const [cacheStore, setCacheStore] = useState<Record<string, ApiEnvelope>>({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [requestFlow, setRequestFlow] = useState<RequestFlow>(null);
  const [graphPresetId, setGraphPresetId] = useState('workspace');
  const [graphLoading, setGraphLoading] = useState(false);
  const [graphError, setGraphError] = useState('');
  const [graphResponse, setGraphResponse] = useState<Record<string, unknown>>({
    data: {
      workspace: {
        name: 'Showcase Lab',
        activeUsers: 18,
        regions: ['sa-east', 'us-east'],
      },
    },
  });
  const [socketConnected, setSocketConnected] = useState(true);
  const [chatInput, setChatInput] = useState('Ship the beta build today?');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {id: 'msg-1', author: 'Socket', text: 'Socket ready on ws://showcase/realtime', time: '09:40:01', tone: Colors.secondary},
    {id: 'msg-2', author: 'You', text: 'Watching release stream and API health.', time: '09:40:08', tone: Colors.primary},
  ]);
  const [activityLog, setActivityLog] = useState<LogItem[]>([
    makeLog('Network lab ready', 'REST, GraphQL, WebSocket and transfers are standing by.', Colors.primary),
  ]);
  const graphFailureRef = useRef<Record<string, boolean>>({billing: true});
  const operationController = useRef(createOperationController()).current;
  const {clearTimeouts, scheduleTimeout} = useTimeoutRegistry();
  const restPreset = REST_PRESETS.find(item => item.id === restPresetId) ?? REST_PRESETS[0];
  const graphPreset = GRAPH_PRESETS.find(item => item.id === graphPresetId) ?? GRAPH_PRESETS[0];
  const cacheKey = `${method}:${restPreset.path}`;

  function pushLog(title: string, detail: string, tone: string) {
    setActivityLog(previous => [makeLog(title, detail, tone), ...previous].slice(0, 8));
  }

  useEffect(() => {
    return () => {
      clearTimeouts();
      operationController.cancelAll(NETWORK_OPERATION_KEYS);
    };
  }, [clearTimeouts, operationController]);

  useEffect(() => {
    if (!socketConnected) {
      operationController.cancel('heartbeat');
      operationController.cancel('socket-session');
      return;
    }

    const sessionToken = operationController.start('socket-session');
    const heartbeatToken = operationController.start('heartbeat');

    const scheduleHeartbeat = () => {
      scheduleTimeout(() => {
        if (
          !operationController.isCurrent('heartbeat', heartbeatToken) ||
          !operationController.isCurrent('socket-session', sessionToken)
        ) {
          return;
        }

        const heartbeat: ChatMessage = {
          id: `hb-${Date.now()}`,
          author: 'Socket',
          text: 'Heartbeat OK. Cache warm and gateway latency steady.',
          time: stamp(),
          tone: Colors.secondary,
        };
        setChatMessages(previous => [heartbeat, ...previous].slice(0, 8));
        pushLog(
          'Socket heartbeat',
          'Realtime channel published a status pulse.',
          Colors.secondary,
        );
        scheduleHeartbeat();
      }, 5200);
    };

    scheduleHeartbeat();

    return () => {
      operationController.cancel('heartbeat');
      operationController.cancel('socket-session');
    };
  }, [operationController, scheduleTimeout, socketConnected]);

  const runRestRequest = () => {
    if (requestFlow) {
      setRetryPlan('Wait for the active request flow to finish first.');
      pushLog('REST blocked', 'Another request flow is already running.', Colors.warning);
      return;
    }

    const parsedBody = parseBody(requestBody);
    const requestToken = operationController.start('request');
    setRequestFlow('rest');
    setRestStatus('loading');
    setRestError('');
    setRetryPlan('Direct request in flight.');
    pushLog('REST request', `${method} ${restPreset.path}`, restPreset.tone);

    if (method === 'GET' && cacheStore[cacheKey]) {
      const cached = {
        ...cacheStore[cacheKey],
        source: 'cache' as const,
        latencyMs: 18,
      };
      setRestResponse(cached);
      setRestStatus('success');
      setRequestFlow(null);
      setRetryPlan('Cache hit served instantly.');
      pushLog('Cache hit', cacheKey, Colors.success);
      return;
    }

    scheduleTimeout(() => {
      if (!operationController.isCurrent('request', requestToken)) {
        return;
      }

      if (restPreset.id === 'unstable') {
        setRestStatus('error');
        setRestError('503 gateway unstable. Use retry with exponential backoff.');
        setRetryPlan('Endpoint marked unstable. Retry available with 400ms, 800ms and 1600ms delays.');
        setRequestFlow(null);
        pushLog('REST error', '503 gateway unstable', Colors.error);
        return;
      }

      const response: ApiEnvelope = {
        source: 'network',
        status: method === 'DELETE' ? 204 : method === 'POST' ? 201 : 200,
        method,
        endpoint: restPreset.path,
        latencyMs: 520,
        data: buildRestData(restPreset, method, parsedBody, 'network'),
      };

      if (method === 'GET') {
        setCacheStore(previous => ({...previous, [cacheKey]: response}));
      }

      setRestResponse(response);
      setRestStatus('success');
      setRequestFlow(null);
      setRetryPlan(method === 'GET' ? 'Response cached for the next identical request.' : 'Mutation completed without retry.');
      pushLog('REST success', `${response.status} ${restPreset.path}`, Colors.primary);
    }, 520);
  };

  const runRetrySequence = () => {
    if (requestFlow) {
      setRetryPlan('Wait for the active request flow to finish first.');
      pushLog('Retry blocked', 'Another request flow is already running.', Colors.warning);
      return;
    }

    const parsedBody = parseBody(requestBody);
    const delays = [400, 800, 1600];
    const requestToken = operationController.start('request');
    setRequestFlow('retry');
    setRestStatus('loading');
    setRestError('');
    setRetryPlan('Attempt 1 scheduled after 400ms.');
    pushLog('Retry start', `${method} ${restPreset.path} with exponential backoff`, Colors.warning);

    const runAttempt = (attempt: number) => {
      if (!operationController.isCurrent('request', requestToken)) {
        return;
      }

      const delay = delays[attempt];
      setRetryPlan(`Attempt ${attempt + 1} waiting ${delay}ms.`);
      scheduleTimeout(() => {
        if (!operationController.isCurrent('request', requestToken)) {
          return;
        }

        if (attempt < delays.length - 1) {
          pushLog('Retry miss', `Attempt ${attempt + 1} failed after ${delay}ms`, Colors.warning);
          setRetryPlan(`Attempt ${attempt + 1} failed. Escalating to ${delays[attempt + 1]}ms.`);
          runAttempt(attempt + 1);
          return;
        }

        const response: ApiEnvelope = {
          source: 'retry',
          status: 200,
          method,
          endpoint: restPreset.path,
          latencyMs: delay,
          data: buildRestData(restPreset, method, parsedBody, 'retry'),
        };
        if (method === 'GET') {
          setCacheStore(previous => ({...previous, [cacheKey]: response}));
        }
        setRestResponse(response);
        setRestStatus('success');
        setRequestFlow(null);
        setRetryPlan(`Attempt ${attempt + 1} succeeded after ${delay}ms.`);
        pushLog('Retry success', `Recovered on attempt ${attempt + 1}`, Colors.success);
      }, delay);
    };

    runAttempt(0);
  };

  const startTransfer = (kind: TransferKind) => {
    const setter = kind === 'upload' ? setUploadProgress : setDownloadProgress;
    const toggle = kind === 'upload' ? setUploading : setDownloading;
    const operationKey = kind === 'upload' ? 'upload' : 'download';
    const operationToken = operationController.start(operationKey);
    const isRestart = kind === 'upload' ? uploading : downloading;

    setter(0);
    toggle(true);
    pushLog(
      kind === 'upload'
        ? isRestart
          ? 'Upload restarted'
          : 'Upload started'
        : isRestart
          ? 'Download restarted'
          : 'Download started',
      `${kind} transfer queued`,
      Colors.accent,
    );

    const step = () => {
      scheduleTimeout(() => {
        if (!operationController.isCurrent(operationKey, operationToken)) {
          return;
        }

        setter(previous => {
          const next = Math.min(previous + (kind === 'upload' ? 11 : 9), 100);
          if (next >= 100) {
            toggle(false);
            pushLog(
              kind === 'upload' ? 'Upload complete' : 'Download complete',
              kind === 'upload'
                ? 'proposal.zip queued for share preview'
                : 'bundle.tar preview cached locally',
              Colors.success,
            );
            return 100;
          }

          step();
          return next;
        });
      }, 220);
    };

    step();
  };

  const runGraphQuery = () => {
    if (graphLoading) {
      pushLog('GraphQL blocked', 'Wait for the active query to finish first.', Colors.warning);
      return;
    }

    const graphToken = operationController.start('graph');
    setGraphLoading(true);
    setGraphError('');
    pushLog('GraphQL query', graphPreset.label, graphPreset.tone);

    scheduleTimeout(() => {
      if (!operationController.isCurrent('graph', graphToken)) {
        return;
      }

      if (graphFailureRef.current[graphPreset.id]) {
        graphFailureRef.current[graphPreset.id] = false;
        setGraphLoading(false);
        setGraphError(`Resolver timeout while loading ${graphPreset.label}. Retry the query to recover.`);
        pushLog('GraphQL error', `${graphPreset.label} resolver timed out`, Colors.error);
        return;
      }

      const response = {
        data:
          graphPreset.id === 'workspace'
            ? {
                workspace: {
                  name: 'Showcase Lab',
                  activeUsers: 18,
                  regions: ['sa-east', 'us-east'],
                },
              }
            : graphPreset.id === 'release'
              ? {
                  release: {
                    version: 'beta-42',
                    status: 'green',
                    blockers: 1,
                  },
                }
              : {
                  billing: {
                    plan: 'Studio',
                    invoicesDue: 2,
                    spendThisMonth: '$4,820',
                  },
                },
      };

      setGraphResponse(response);
      setGraphLoading(false);
      pushLog('GraphQL success', `${graphPreset.label} resolved in 460ms`, Colors.success);
    }, 460);
  };

  const toggleSocket = () => {
    setSocketConnected(previous => {
      const next = !previous;
      pushLog(
        next ? 'Socket connected' : 'Socket paused',
        next ? 'Realtime channel reopened.' : 'Realtime channel paused.',
        next ? Colors.secondary : Colors.warning,
      );
      return next;
    });
  };

  const sendChat = () => {
    if (!socketConnected || !chatInput.trim()) {
      return;
    }

    const sessionToken = operationController.current('socket-session');
    const outbound: ChatMessage = {
      id: `you-${Date.now()}`,
      author: 'You',
      text: chatInput.trim(),
      time: stamp(),
      tone: Colors.primary,
    };

    setChatMessages(previous => [outbound, ...previous].slice(0, 8));
    setChatInput('');
    pushLog('Socket send', outbound.text, Colors.primary);

    scheduleTimeout(() => {
      if (!operationController.isCurrent('socket-session', sessionToken)) {
        return;
      }

      const inbound: ChatMessage = {
        id: `socket-${Date.now()}`,
        author: 'Socket',
        text: `Echo: ${outbound.text}`,
        time: stamp(),
        tone: Colors.secondary,
      };
      setChatMessages(previous => [inbound, ...previous].slice(0, 8));
    }, 720);
  };

  return (
    <ScreenContainer>
      <View style={styles.root}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>PHASE 7.2</Text>
          <Text style={styles.title}>Networking & APIs</Text>
          <Text style={styles.body}>
            Deterministic REST, GraphQL, WebSocket and transfer demos with cache, backoff and
            formatted payload inspection.
          </Text>
          <View style={styles.pills}>
            <View style={styles.pill}><Text style={styles.pillText}>10 demos</Text></View>
            <View style={styles.pill}><Text style={styles.pillText}>{Object.keys(cacheStore).length} cached routes</Text></View>
            <View style={styles.pill}><Text style={styles.pillText}>{socketConnected ? 'Socket live' : 'Socket paused'}</Text></View>
          </View>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>REST Playground</Text>
          <Text style={styles.sectionText}>
            GET, POST, PUT and DELETE with loading, formatted JSON, cache and retry backoff.
          </Text>
        </View>
        <View style={styles.grid}>
          <View style={[styles.card, {width: cardWidth}]}>
            <Text style={styles.cardTitle}>Request Builder</Text>
            <Text style={styles.cardSubtitle}>Choose method, endpoint and payload for the API sandbox.</Text>
            <View style={styles.wrap}>
              {(['GET', 'POST', 'PUT', 'DELETE'] as RestMethod[]).map(nextMethod => (
                <Pressable
                  key={nextMethod}
                  style={[styles.smallAction, method === nextMethod && styles.smallActionActive]}
                  onPress={() => setMethod(nextMethod)}>
                  <Text style={method === nextMethod ? styles.smallActionTextActive : styles.smallActionText}>
                    {nextMethod}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.wrap}>
              {REST_PRESETS.map(item => (
                <Pressable
                  key={item.id}
                  style={[styles.smallAction, restPresetId === item.id && styles.smallActionActive, {borderColor: item.tone + '44'}]}
                  onPress={() => setRestPresetId(item.id)}>
                  <Text style={restPresetId === item.id ? styles.smallActionTextActive : [styles.smallActionText, {color: item.tone}]}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              style={styles.input}
              value={requestBody}
              onChangeText={setRequestBody}
              multiline
              placeholder="Request payload"
              placeholderTextColor={Colors.textSecondary}
            />
            <View style={styles.wrap}>
              <Pressable style={[styles.smallAction, styles.smallActionActive]} onPress={() => void runRestRequest()}>
                <Text style={styles.smallActionTextActive}>Run request</Text>
              </Pressable>
              <Pressable style={styles.smallAction} onPress={() => void runRetrySequence()}>
                <Text style={styles.smallActionText}>Retry backoff</Text>
              </Pressable>
              <Pressable
                style={styles.smallAction}
                onPress={() => {
                  setCacheStore({});
                  pushLog('Cache cleared', 'All REST cache entries removed.', Colors.warning);
                }}>
                <Text style={styles.smallActionText}>Clear cache</Text>
              </Pressable>
            </View>
            <Text style={styles.note}>{retryPlan}</Text>
          </View>

          <View style={[styles.card, {width: cardWidth}]}>
            <Text style={styles.cardTitle}>Response Console</Text>
            <Text style={styles.cardSubtitle}>Formatted JSON, loading and error handling live on the right panel.</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusPill, restStatus === 'loading' && styles.loadingPill]}>
                <Text style={styles.statusPillText}>{restStatus.toUpperCase()}</Text>
              </View>
              <Text style={styles.note}>Cache key: {cacheKey}</Text>
            </View>
            {restStatus === 'loading' ? (
              <StateBlock
                variant="loading"
                title="Running REST request"
                description="Inspecting latency, cache rules and formatted payload output for the current endpoint."
              />
            ) : restError ? (
              <StateBlock
                variant="error"
                title="Gateway error"
                description={restError}
                actionLabel="Retry request"
                onAction={() => void runRetrySequence()}
              />
            ) : restResponse ? (
              <CodePanel label="REST JSON" value={formatJson(restResponse)} />
            ) : (
              <StateBlock
                variant="empty"
                title="No response yet"
                description="Run a request to inspect payload shape, cache hits and latency timing."
                actionLabel="Run request"
                onAction={() => void runRestRequest()}
              />
            )}
            {Object.keys(cacheStore).length > 0 ? (
              <View style={styles.wrap}>
                {Object.keys(cacheStore).map(key => (
                  <View key={key} style={styles.cacheChip}>
                    <Text style={styles.cacheChipText}>{key}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <StateBlock
                variant="empty"
                title="REST cache is empty"
                description="Successful GET requests will appear here and can be replayed instantly."
                compact
              />
            )}
          </View>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Transfers & Queries</Text>
          <Text style={styles.sectionText}>
            File transfer progress plus GraphQL queries with typed response formatting.
          </Text>
        </View>
        <View style={styles.grid}>
          <View style={[styles.card, {width: cardWidth}]}>
            <Text style={styles.cardTitle}>Upload / Download</Text>
            <Text style={styles.cardSubtitle}>Progress bars for outbound and inbound payloads.</Text>
            <View style={styles.transferBlock}>
              <Text style={styles.transferTitle}>Upload proposal.zip</Text>
              <View style={styles.track}>
                <View style={[styles.fill, {width: `${uploadProgress}%`, backgroundColor: Colors.primary}]} />
              </View>
              <Text style={styles.note}>{uploading ? `${uploadProgress}% sent` : uploadProgress === 100 ? 'Upload complete' : 'Idle'}</Text>
            </View>
            <View style={styles.transferBlock}>
              <Text style={styles.transferTitle}>Download bundle.tar</Text>
              <View style={styles.track}>
                <View style={[styles.fill, {width: `${downloadProgress}%`, backgroundColor: Colors.success}]} />
              </View>
              <Text style={styles.note}>{downloading ? `${downloadProgress}% cached` : downloadProgress === 100 ? 'Download complete' : 'Idle'}</Text>
            </View>
            <View style={styles.wrap}>
              <Pressable style={styles.smallAction} onPress={() => startTransfer('upload')}>
                <Text style={styles.smallActionText}>Start upload</Text>
              </Pressable>
              <Pressable style={styles.smallAction} onPress={() => startTransfer('download')}>
                <Text style={styles.smallActionText}>Start download</Text>
              </Pressable>
            </View>
          </View>

          <View style={[styles.card, {width: cardWidth}]}>
            <Text style={styles.cardTitle}>GraphQL</Text>
            <Text style={styles.cardSubtitle}>Query presets with structured response formatting.</Text>
            <View style={styles.wrap}>
              {GRAPH_PRESETS.map(item => (
                <Pressable
                  key={item.id}
                  style={[styles.smallAction, graphPresetId === item.id && styles.smallActionActive, {borderColor: item.tone + '44'}]}
                  onPress={() => {
                    setGraphPresetId(item.id);
                    setGraphError('');
                  }}>
                  <Text style={graphPresetId === item.id ? styles.smallActionTextActive : [styles.smallActionText, {color: item.tone}]}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <CodePanel label="GraphQL query" value={graphPreset.query} />
            <Pressable style={[styles.smallAction, styles.smallActionActive]} onPress={() => void runGraphQuery()}>
              <Text style={styles.smallActionTextActive}>{graphLoading ? 'Loading...' : 'Run query'}</Text>
            </Pressable>
            <Text style={styles.note}>Billing simulates a transient resolver failure on the first request.</Text>
            {graphLoading ? (
              <StateBlock
                variant="loading"
                title="Executing GraphQL query"
                description="Resolving the selected document and formatting the response payload."
              />
            ) : graphError ? (
              <StateBlock
                variant="error"
                title="Resolver error"
                description={graphError}
                actionLabel="Retry query"
                onAction={() => void runGraphQuery()}
              />
            ) : (
              <CodePanel label="GraphQL response" value={formatJson(graphResponse)} />
            )}
          </View>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Realtime Socket</Text>
          <Text style={styles.sectionText}>
            A chat-like WebSocket feed with connection state, outbound send and server echo.
          </Text>
        </View>
        <View style={styles.grid}>
          <View style={[styles.card, {width: cardWidth}]}>
            <Text style={styles.cardTitle}>Socket Chat</Text>
            <Text style={styles.cardSubtitle}>Toggle the channel and send messages into the realtime stream.</Text>
            <View style={styles.wrap}>
              <Pressable
                style={[styles.smallAction, socketConnected && styles.smallActionActive]}
                onPress={toggleSocket}>
                <Text style={socketConnected ? styles.smallActionTextActive : styles.smallActionText}>
                  {socketConnected ? 'Connected' : 'Reconnect'}
                </Text>
              </Pressable>
            </View>
            <View style={styles.chatComposer}>
              <TextInput
                style={styles.input}
                value={chatInput}
                onChangeText={setChatInput}
                placeholder="Type a socket message"
                placeholderTextColor={Colors.textSecondary}
              />
              <Pressable style={[styles.smallAction, styles.smallActionActive]} onPress={sendChat}>
                <Text style={styles.smallActionTextActive}>Send</Text>
              </Pressable>
            </View>
            {chatMessages.length > 0 ? (
              chatMessages.map(message => (
                <View key={message.id} style={styles.chatRow}>
                  <View style={[styles.chatBadge, {backgroundColor: message.tone}]} />
                  <View style={styles.chatCopy}>
                    <Text style={styles.chatAuthor}>{message.author}</Text>
                    <Text style={styles.chatText}>{message.text}</Text>
                  </View>
                  <Text style={styles.chatTime}>{message.time}</Text>
                </View>
              ))
            ) : (
              <StateBlock
                variant="empty"
                title="Socket feed is empty"
                description="Reconnect or send a message to seed the realtime stream again."
                compact
              />
            )}
          </View>

          <View style={[styles.card, {width: cardWidth}]}>
            <Text style={styles.cardTitle}>Activity Feed</Text>
            <Text style={styles.cardSubtitle}>Unified log for REST, transfer, GraphQL and socket events.</Text>
            {activityLog.length > 0 ? (
              activityLog.map(item => (
                <View key={item.id} style={styles.logRow}>
                  <View style={[styles.logTone, {backgroundColor: item.tone}]} />
                  <View style={styles.logCopy}>
                    <Text style={styles.logTitle}>{item.title}</Text>
                    <Text style={styles.logDetail}>{item.detail}</Text>
                  </View>
                </View>
              ))
            ) : (
              <StateBlock
                variant="empty"
                title="No network events yet"
                description="Run a request, transfer or socket action to populate this timeline."
                compact
              />
            )}
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
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    color: Colors.textPrimary,
    fontSize: 14,
    minHeight: 54,
  },
  note: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  loadingPill: {
    borderColor: Colors.warning,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  errorCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.error + '55',
    backgroundColor: Colors.error + '14',
    padding: Spacing.md,
    gap: 4,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.error,
  },
  errorText: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textPrimary,
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
  cacheChip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.success + '44',
  },
  cacheChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
  },
  transferBlock: {
    gap: 8,
  },
  transferTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  track: {
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  chatComposer: {
    gap: Spacing.sm,
  },
  chatRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chatBadge: {
    width: 10,
    alignSelf: 'stretch',
    borderRadius: Radius.full,
  },
  chatCopy: {
    flex: 1,
    gap: 2,
  },
  chatAuthor: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  chatText: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  chatTime: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  logRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  logTone: {
    width: 10,
    alignSelf: 'stretch',
    borderRadius: Radius.full,
  },
  logCopy: {
    flex: 1,
    gap: 4,
  },
  logTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  logDetail: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
});
