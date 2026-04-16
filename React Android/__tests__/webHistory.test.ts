import {describe, expect, it} from '@jest/globals';
import {
  browserHistoryReducer,
  createBrowserHistoryState,
  getCurrentHistoryUrl,
} from '../src/screens/web/history';

describe('browserHistoryReducer', () => {
  it('does not append duplicate entries for the current URL', () => {
    const initialState = createBrowserHistoryState(
      'https://showcase.cfd.dev/browser/home',
    );
    const nextState = browserHistoryReducer(initialState, {
      type: 'navigate',
      url: 'https://showcase.cfd.dev/browser/home',
    });

    expect(nextState).toBe(initialState);
  });

  it('drops forward history when navigating from the middle of the stack', () => {
    const home = 'https://showcase.cfd.dev/browser/home';
    const bridge = 'https://showcase.cfd.dev/browser/bridge';
    const links = 'https://showcase.cfd.dev/browser/links';
    const docs = 'https://reactnative.dev';

    let state = createBrowserHistoryState(home);
    state = browserHistoryReducer(state, {type: 'navigate', url: bridge});
    state = browserHistoryReducer(state, {type: 'navigate', url: links});
    state = browserHistoryReducer(state, {type: 'back'});
    state = browserHistoryReducer(state, {type: 'navigate', url: docs});

    expect(state.entries).toEqual([home, bridge, docs]);
    expect(getCurrentHistoryUrl(state)).toBe(docs);
  });

  it('clamps backward and forward navigation at stack boundaries', () => {
    const state = createBrowserHistoryState(
      'https://showcase.cfd.dev/browser/home',
    );

    expect(browserHistoryReducer(state, {type: 'back'})).toBe(state);
    expect(browserHistoryReducer(state, {type: 'forward'})).toBe(state);
  });
});
