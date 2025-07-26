/**
 * Canonical Prompt-Template definition used across
 * main-process, preload and renderer.
 */
export interface TemplateJSON {
  title: string;                 // e.g. "Send PDF to Accounting"
  prompt: string;                // Full natural-language prompt
  instructions: string;          // Setup / pre-req notes
  tags: string[];                // ["gmail","pdf"]
  price_cents: number;           // 0 = free; >0 = paid
  version: string;               // semver, default "1.0.0"
  is_public: boolean;            // local vs marketplace

  /** slug = kebab-case title, generated on save */
  slug?: string;
}

/** Filename helper – templates/<slug>.json */
export const slugify = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
