import { describe, it, expect } from 'vitest';

import { getAccordionBorderStyle } from './style';

const expectedBorderCases = [
  { index: 0, length: 1, expected: 'rounded' },
  { index: 0, length: 2, expected: 'firstOf' },
  { index: 0, length: 3, expected: 'firstOf' },
  { index: 2, length: 3, expected: 'lastOf' },
  { index: 1, length: 3, expected: 'none' },
];

describe('getAccordionBorderStyle', () => {
  it.each(expectedBorderCases)(
    'should return $expected when index is $index and length is $length',
    ({ index, length, expected }) => {
      expect(getAccordionBorderStyle(index, length)).toBe(expected);
    },
  );
});
