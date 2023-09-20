import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { frontPlugin, FrontPage } from '../src/plugin';

createDevApp()
  .registerPlugin(frontPlugin)
  .addPage({
    element: <FrontPage />,
    title: 'Root Page',
    path: '/front'
  })
  .render();
