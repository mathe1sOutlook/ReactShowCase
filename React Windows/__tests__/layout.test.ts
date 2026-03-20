import {describe, expect, it} from '@jest/globals';
import {getHomeGridMetrics} from '../src/utils/layout';

describe('getHomeGridMetrics', () => {
  it('uses two columns on compact desktop widths', () => {
    expect(getHomeGridMetrics(800)).toEqual({
      columns: 2,
      cardWidth: 370,
    });
  });

  it('uses three columns on medium desktop widths', () => {
    expect(getHomeGridMetrics(1100)).toEqual({
      columns: 3,
      cardWidth: 342,
    });
  });

  it('uses four columns on large desktop widths', () => {
    expect(getHomeGridMetrics(1500)).toEqual({
      columns: 4,
      cardWidth: 354,
    });
  });
});
