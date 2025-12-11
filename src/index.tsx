import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import App from './components/app/app';
import { Provider } from 'react-redux';
import store from './services/store';
import { BrowserRouter } from 'react-router-dom';
import { AppHeader } from '@components';

const container = document.getElementById('root') as HTMLElement;
const root = ReactDOMClient.createRoot(container!);

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <React.StrictMode>
        <AppHeader />
        <App />
      </React.StrictMode>
    </BrowserRouter>
  </Provider>
);
