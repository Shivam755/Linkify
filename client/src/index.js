import React from 'react';
import ReactDOM from 'react-dom/client';
import {Drizzle} from '@drizzle/store';
import './index.css';
import App from './App';
import Account from "./contracts/Account.json";

const options = {
  contracts:[Account],
  web3:{
    fallback:{
      type: "http",
      url: "http://127.0.0.1:9545",
    }
  }
}

const drizzle = new Drizzle(options);
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App drizzle={drizzle}/>
  </React.StrictMode>
);

