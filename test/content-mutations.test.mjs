import assert from 'node:assert/strict';
import test from 'node:test';

import { isMissingSortDate } from '../src/lib/content-mutations.ts';

test('a database without the sort date column is recognized, and real failures are not', () => {
  // 운영자가 마이그레이션을 실행하기 전 Supabase가 실제로 돌려주는 문구.
  assert.equal(isMissingSortDate({
    message: "Could not find the 'sorted_on' column of 'timeline_items' in the schema cache",
  }), true);
  assert.equal(isMissingSortDate({ message: 'column timeline_items.sorted_on does not exist' }), true);

  // 권한 문제나 다른 오류를 칸 없음으로 착각해 조용히 다시 저장하면 안 된다.
  assert.equal(isMissingSortDate({ message: 'new row violates row-level security policy' }), false);
  assert.equal(isMissingSortDate({ message: 'JWT expired' }), false);
  assert.equal(isMissingSortDate(null), false);
  assert.equal(isMissingSortDate({}), false);
});
