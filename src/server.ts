import './lib/error-capture';
import { consumeLastCapturedError } from './lib/error-capture';
import { renderErrorPage } from './lib/error-page';

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import('@tanstack/react-start/server-entry').then(
      (mod) => (mod.default ?? mod) as ServerEntry
    );
  }

  return serverEntryPromise;
}

async function normalizeCatastrophicSsrResponse(response: Response) {
  if (response.status < 500) return response;

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) return response;

  const body = await response.clone().text();
  const looksLikeSwallowedFrameworkError =
    body.includes('"unhandled":true') && body.includes('"message":"HTTPError"');

  if (!looksLikeSwallowedFrameworkError) return response;

  console.error(
    consumeLastCapturedError() ?? new Error(`SSR request failed before rendering: ${body}`)
  );

  return new Response(renderErrorPage(), {
    status: 500,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const entry = await getServerEntry();
      const response = await entry.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(error instanceof Error ? error.message : 'Unknown server error'), {
        status: 500,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    }
  },
};