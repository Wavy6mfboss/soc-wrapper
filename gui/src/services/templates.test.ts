import { fetchTemplates } from './templates';

test('fetchTemplates returns array (RLS read OK)', async () => {
  const data = await fetchTemplates();
  expect(Array.isArray(data)).toBe(true);
});
