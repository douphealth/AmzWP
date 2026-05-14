function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderErrorPage(message = 'The app hit a server error while rendering this page.') {
  const safeMessage = escapeHtml(message);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Server error — AmzWP Automator</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #050816;
        --panel: #0f172a;
        --border: rgba(239, 68, 68, 0.24);
        --text: #e2e8f0;
        --muted: #94a3b8;
        --primary: #ffffff;
        --primaryText: #020617;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: radial-gradient(circle at top, rgba(56, 189, 248, 0.08), transparent 28%), var(--bg);
        color: var(--text);
      }
      .panel {
        width: min(100%, 560px);
        background: rgba(15, 23, 42, 0.92);
        border: 1px solid var(--border);
        border-radius: 24px;
        padding: 32px;
        box-shadow: 0 24px 80px rgba(2, 6, 23, 0.55);
      }
      h1 {
        margin: 0 0 12px;
        font-size: clamp(1.75rem, 2vw + 1rem, 2.5rem);
        line-height: 1.1;
      }
      p {
        margin: 0;
        color: var(--muted);
        line-height: 1.7;
      }
      .actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 24px;
      }
      a, button {
        appearance: none;
        border: 0;
        border-radius: 14px;
        padding: 12px 18px;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
        text-decoration: none;
      }
      .primary {
        background: var(--primary);
        color: var(--primaryText);
      }
      .secondary {
        background: transparent;
        color: var(--text);
        border: 1px solid rgba(148, 163, 184, 0.2);
      }
      code {
        display: block;
        margin-top: 18px;
        padding: 14px 16px;
        background: rgba(2, 6, 23, 0.45);
        border-radius: 16px;
        border: 1px solid rgba(148, 163, 184, 0.12);
        color: var(--text);
        white-space: pre-wrap;
        word-break: break-word;
      }
    </style>
  </head>
  <body>
    <main class="panel">
      <h1>Internal server error</h1>
      <p>${safeMessage}</p>
      <code>${safeMessage}</code>
      <div class="actions">
        <button class="primary" onclick="window.location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </main>
  </body>
</html>`;
}