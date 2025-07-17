// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Seu CSS Global
import App from './App'; // Importa o novo componente App

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
