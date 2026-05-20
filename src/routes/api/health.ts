import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/health')({
  server: {
    handlers: {
      GET: async () => {
        return Response.json({
          status: 'ok',
          ssr: true,
          timestamp: new Date().toISOString(),
          runtime: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
        });
      },
    },
  },
});
