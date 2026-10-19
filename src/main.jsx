import React from 'react';
import ReactDOM from 'react-dom/client';
// Los estilos globales van ANTES de App: así Bootstrap queda primero en el CSS final
// y los estilos de cada módulo (importados dentro de los componentes) lo pueden sobrescribir.
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Necesario para el menú responsive
// Tema del mockup: debe ir DESPUÉS de Bootstrap para sobrescribir sus variables
import './styles/theme.css';
import './styles/layout.css';
import './index.css';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
