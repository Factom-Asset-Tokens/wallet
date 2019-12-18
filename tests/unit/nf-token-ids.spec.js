import { assert } from 'chai';
import { mergeContiguousIds } from '@/components/Token/Fat1Token/nf-token-ids';

describe('NF Token Ids', function() {
  it('should merge contiguous ids', async function() {
    const ids = [
      { min: 6, max: 9 },
      { min: 1, max: 5 },
      { min: 10, max: 10 },
      { min: 11, max: 13 },
      { min: 24, max: 66 },
      { min: 70, max: 70 },
      { min: 15, max: 23 }
    ];
    const merged = mergeContiguousIds(ids);

    assert.lengthOf(merged, 3);
    assert.deepEqual(merged[0], { min: 1, max: 13 });
    assert.deepEqual(merged[1], { min: 15, max: 66 });
    assert.deepEqual(merged[2], { min: 70, max: 70 });
  });
});
