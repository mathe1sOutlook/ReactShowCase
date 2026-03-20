import {describe, expect, it} from '@jest/globals';
import {getHomeGridMetrics} from '../src/utils/layout';

describe('getHomeGridMetrics', () => {
  it('keeps phone layouts at two columns', () => {
    expect(getHomeGridMetrics(390)).toEqual({
      columns: 2,
      cardWidth: 173,
    });
  });

  it('switches to three columns on wider screens', () => {
    expect(getHomeGridMetrics(1024)).toEqual({
      columns: 3,
      cardWidth: 322,
    });
  });
});
