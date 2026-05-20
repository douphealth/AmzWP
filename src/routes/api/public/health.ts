import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/public/health')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);

        return Response.json({
          status: 'ok',
          ssr: true,
          timestamp: new Date().toISOString(),
          path: url.pathname,
        });
      },
    },
  },
});