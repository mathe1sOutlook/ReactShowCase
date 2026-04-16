import {Colors} from '../../theme';

export type RestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type RestStatus = 'idle' | 'loading' | 'success' | 'error';
export type TransferKind = 'upload' | 'download';

export type RestPreset = {
  id: string;
  label: string;
  path: string;
  tone: string;
};

export type GraphPreset = {
  id: string;
  label: string;
  tone: string;
  query: string;
};

export type LogItem = {
  id: string;
  title: string;
  detail: string;
  tone: string;
};

export type ChatMessage = {
  id: string;
  author: 'You' | 'Socket';
  text: string;
  time: string;
  tone: string;
};

export type ApiEnvelope = {
  source: 'network' | 'cache' | 'retry';
  status: number;
  method: RestMethod;
  endpoint: string;
  latencyMs: number;
  data: unknown;
};

export const REST_PRESETS: RestPreset[] = [
  {id: 'projects', label: 'Projects', path: '/v1/projects', tone: Colors.primary},
  {
    id: 'deployments',
    label: 'Deployments',
    path: '/v1/deployments',
    tone: Colors.secondary,
  },
  {id: 'profile', label: 'Profile', path: '/v1/profile', tone: Colors.success},
  {id: 'unstable', label: 'Unstable', path: '/v1/unstable', tone: Colors.error},
];

export const GRAPH_PRESETS: GraphPreset[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    tone: Colors.primary,
    query:
      'query WorkspaceOverview {\n  workspace {\n    name\n    activeUsers\n    regions\n  }\n}',
  },
  {
    id: 'release',
    label: 'Release Status',
    tone: Colors.secondary,
    query:
      'query ReleaseStatus {\n  release(id: "beta-42") {\n    version\n    status\n    blockers\n  }\n}',
  },
  {
    id: 'billing',
    label: 'Billing',
    tone: Colors.warning,
    query:
      'query BillingSummary {\n  billing {\n    plan\n    invoicesDue\n    spendThisMonth\n  }\n}',
  },
];

export function stamp() {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function wait(ms: number) {
  return new Promise<void>(resolve => {
    setTimeout(() => resolve(), ms);
  });
}

export function makeLog(title: string, detail: string, tone: string): LogItem {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    detail,
    tone,
  };
}

export function parseBody(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return {raw: value};
  }
}

export function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function buildRestData(
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
