import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css'; // Añade esta línea
import 'bootstrap-icons/font/bootstrap-icons.css'; // Añade esta línea
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Necesario para el menú responsive
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);