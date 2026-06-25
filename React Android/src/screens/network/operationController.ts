export type OperationKey =
  | 'request'
  | 'graph'
  | 'upload'
  | 'download'
  | 'heartbeat'
  | 'socket-session';

type TokenMap = Map<OperationKey, number>;

function bump(tokens: TokenMap, key: OperationKey) {
  const next = (tokens.get(key) ?? 0) + 1;
  tokens.set(key, next);
  return next;
}

export function createOperationController() {
  const tokens: TokenMap = new Map();

  return {
    start(key: OperationKey) {
      return bump(tokens, key);
    },
    cancel(key: OperationKey) {
      return bump(tokens, key);
    },
    cancelAll(keys: readonly OperationKey[]) {
      keys.forEach(key => {
        bump(tokens, key);
      });
    },
    current(key: OperationKey) {
      return tokens.get(key) ?? 0;
    },
    isCurrent(key: OperationKey, token: number) {
      return (tokens.get(key) ?? 0) === token;
    },
  };
}
