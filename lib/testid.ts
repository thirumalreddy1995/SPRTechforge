// Stable automation hooks (data-testid) for Selenium / Playwright.
//
// The shared form components derive a test id from their label or placeholder
// (`input-full-name`, `select-role`, `btn-sign-in`), so most of the app gets
// a selector without per-field edits. Pages add explicit ids on raw elements
// via `data-testid="…"`. Rules:
//   - lower-case kebab-case, ASCII letters/digits/dashes only
//   - emoji, punctuation and the trailing "*", "…", "→" are dropped
//   - at most 48 characters, never empty (falls back to the prefix alone)
// Test ids are a contract with the automation suite: change them deliberately
// and update testing/SELECTORS.md.

export const slugForTestId = (text: unknown): string => {
  const s = String(text ?? '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')        // accents
    .replace(/[^\x20-\x7E]/g, ' ')          // emoji and non-ASCII → space
    .replace(/&amp;|&/g, ' and ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s.slice(0, 48).replace(/-+$/g, '');
};

/** `testId('input', 'Full Name *')` → `input-full-name`; empty text → `input`. */
export const testId = (prefix: string, text?: unknown): string => {
  const slug = slugForTestId(text);
  return slug ? `${prefix}-${slug}` : prefix;
};

/** Text content of React children when it is plain text (used for buttons). */
export const childrenText = (children: unknown): string => {
  if (children == null || typeof children === 'boolean') return '';
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(childrenText).join(' ');
  if (typeof children === 'object' && 'props' in (children as any)) return childrenText((children as any).props?.children);
  return '';
};
