/**
 * marketplace.test.ts
 * -------------------
 * Mocks window.electron.templateAPI so the renderer-side
 * marketplace stubs work in a Node test environment.
 */

/* ---------- lightweight in-memory store ---------- */
const memory: any[] = [];

(global as any).window = {
  electron: {
    templateAPI: {
      publishTemplate: async (t: any) => {
        memory.push(t);
      },
      fetchPublicTemplates: async () => memory
    }
  }
};

/* ---------- now import the module under test ---------- */
import {
  publishTemplate,
  fetchPublicTemplates
} from "../src/services/marketplace";

/* ---------- demo payload ---------- */
const demo = {
  title: "Unit-Test Template",
  prompt: "echo test",
  instructions: "",
  tags: [],
  price_cents: 0,
  version: "1.0.0",
  is_public: false
};

test("publish + fetch round-trip", async () => {
  await publishTemplate(demo);
  const list = await fetchPublicTemplates();
  const found = list.find(t => t.title === demo.title);
  expect(found?.prompt).toBe("echo test");
});
