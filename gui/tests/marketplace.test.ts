/* ---------------------------------------------------------------- *\
   Marketplace integration test
   Publishes one row → immediately fetches it back
\* ---------------------------------------------------------------- */

import type { TemplateJSON }     from '@/services/templates';
import {
  publishTemplate,
  fetchPublicTemplates,
}                                from '@/services/marketplace';

describe('Marketplace – publish + fetch round-trip', () => {
  it('inserts row and it shows up in list', async () => {
    /* ---- unique row so parallel CI runs never collide ---- */
    const now = Date.now();
    const tpl: TemplateJSON = {
      title        : `jest-tpl ${now}`,
      prompt       : 'say hi',
      instructions : '',
      tags         : ['jest'],
      price_cents  : 0,
      /**  ⚠️  Supabase column `version` is still INTEGER,
           so keep it a numeric string the DB can cast.       */
      version      : '1',
      is_public    : true,
    };

    /* ---- publish ---- */
    const { error } = await publishTemplate(tpl);
    expect(error).toBeNull();

    /* ---- fetch list ---- */
    const list = await fetchPublicTemplates();
    expect(list.find(t => t.title === tpl.title)).toBeTruthy();
  });
});
