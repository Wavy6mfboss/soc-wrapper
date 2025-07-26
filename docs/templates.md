# Prompt-Template JSON Schema & Usage

```jsonc
{
  "title": "Send PDF to Accounting",           // Required, string
  "prompt": "Open Gmail, draft an email …",    // Required, string
  "instructions": "Gmail must be logged-in.",  // Optional, string
  "tags": ["gmail", "pdf"],                    // Optional, string[]
  "price_cents": 300,                          // Required, integer ≥ 0
  "version": "1.0.0",                          // SemVer, auto­bumped on edit
  "is_public": false                           // Reserved for marketplace
}
