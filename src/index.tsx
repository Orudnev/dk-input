import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import {store} from './Reducers/index';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);


root.render(
  <Provider store={store}>
      <App />
  </Provider>
);

 