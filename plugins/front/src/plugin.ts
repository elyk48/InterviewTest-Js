import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const frontPlugin = createPlugin({
  id: 'front',
  routes: {
    root: rootRouteRef,
  },
});

export const FrontPage = frontPlugin.provide(
  createRoutableExtension({
    name: 'FrontPage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);
