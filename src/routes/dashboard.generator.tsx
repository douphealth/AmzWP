import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/generator')({
  head: () => ({
    meta: [{ title: 'Generator — AmzWP Automator' }],
  }),
});
