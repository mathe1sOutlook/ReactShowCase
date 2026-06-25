export type BrowserHistoryState = {
  entries: string[];
  index: number;
};

export type BrowserHistoryAction =
  | {type: 'navigate'; url: string}
  | {type: 'back'}
  | {type: 'forward'};

function clampIndex(value: number, max: number) {
  return Math.max(0, Math.min(value, max));
}

export function createBrowserHistoryState(
  initialUrl: string,
): BrowserHistoryState {
  return {
    entries: [initialUrl],
    index: 0,
  };
}

export function getCurrentHistoryUrl(state: BrowserHistoryState) {
  return state.entries[state.index] ?? state.entries[0];
}

export function browserHistoryReducer(
  state: BrowserHistoryState,
  action: BrowserHistoryAction,
): BrowserHistoryState {
  if (action.type === 'navigate') {
    const nextUrl = action.url.trim();
    if (!nextUrl || getCurrentHistoryUrl(state) === nextUrl) {
      return state;
    }

    const baseEntries = state.entries.slice(0, state.index + 1);

    return {
      entries: [...baseEntries, nextUrl],
      index: baseEntries.length,
    };
  }

  if (action.type === 'back') {
    if (state.index === 0) {
      return state;
    }

    return {
      ...state,
      index: clampIndex(state.index - 1, state.entries.length - 1),
    };
  }

  if (action.type === 'forward') {
    if (state.index >= state.entries.length - 1) {
      return state;
    }

    return {
      ...state,
      index: clampIndex(state.index + 1, state.entries.length - 1),
    };
  }

  return state;
}
