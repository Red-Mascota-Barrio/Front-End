import { useEffect } from 'react';
import { AdminIcon } from './AdminIcon';
import { formatoNumero } from '../../utils/admin';

/* ============================================================
   Piezas reutilizables del panel (estilo Mockups-Front)
   ============================================================ */

export const PageHeader = ({ titulo, subtitulo, children }) => (
  <div className="adm-page-header">
    <div>
      <h1>{titulo}</h1>
      {subtitulo && <p>{subtitulo}</p>}
    </div>
    {children && <div className="adm-page-header-acciones">{children}</div>}
  </div>
);

export const StatCard = ({ icono, numero, label, alerta = false, cargando = false }) => (
  <div className={`adm-stat-card${alerta ? ' alerta' : ''}`}>
    <div className="adm-stat-icono">
      <AdminIcon nombre={icono} />
    </div>
    <div>
      <div className="adm-stat-numero">{cargando ? '…' : formatoNumero(numero)}</div>
      <div className="adm-stat-label">{label}</div>
    </div>
  </div>
);

export const Badge = ({ clase = 'adm-badge-gris', children, className = '' }) => (
  <span className={`adm-badge ${clase} ${className}`}>{children}</span>
);

export const Toolbar = ({ busqueda, onBusqueda, placeholder, children }) => (
  <div className="adm-toolbar">
    <div className="adm-toolbar-search">
      <span>🔍</span>
      <input
        type="search"
        value={busqueda}
        onChange={(e) => onBusqueda(e.target.value)}
        placeholder={placeholder}
        aria-label="Buscar"
      />
    </div>
    {children}
  </div>
);

export const SelectFiltro = ({ value, onChange, opciones, label }) => (
  <select className="adm-toolbar-select" value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
    {opciones.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
);

// Construye la lista de páginas con "…" (1 2 3 … 53)
const paginasVisibles = (actual, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, actual - 1, actual, actual + 1]);
  if (actual <= 3) [2, 3, 4].forEach((n) => set.add(n));
  if (actual >= total - 2) [total - 1, total - 2, total - 3].forEach((n) => set.add(n));
  const nums = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const salida = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) salida.push('…' + n);
    salida.push(n);
  });
  return salida;
};

export const TablaFooter = ({ mostrando, total, nombre, pagina, totalPaginas, onPagina }) => (
  <div className="adm-tabla-footer">
    <span>
      Mostrando <strong>{mostrando}</strong> de {formatoNumero(total)} {nombre}
    </span>
    {totalPaginas > 1 && (
      <div className="adm-paginacion">
        <button type="button" className="adm-pag-btn" disabled={pagina === 1} onClick={() => onPagina(pagina - 1)} aria-label="Anterior">
          ‹
        </button>
        {paginasVisibles(pagina, totalPaginas).map((p) =>
          typeof p === 'string' ? (
            <span key={p} className="adm-pag-puntos">…</span>
          ) : (
            <button
              key={p}
              type="button"
              className={`adm-pag-btn${p === pagina ? ' activo' : ''}`}
              onClick={() => onPagina(p)}
            >
              {p}
            </button>
          ),
        )}
        <button type="button" className="adm-pag-btn" disabled={pagina === totalPaginas} onClick={() => onPagina(pagina + 1)} aria-label="Siguiente">
          ›
        </button>
      </div>
    )}
  </div>
);

export const EstadoVacio = ({ icono = '🔍', titulo, sub }) => (
  <div className="adm-vacio">
    <div className="adm-vacio-icono">{icono}</div>
    <div className="adm-vacio-titulo">{titulo}</div>
    {sub && <div className="adm-vacio-sub">{sub}</div>}
  </div>
);

export const Cargando = ({ texto = 'Cargando…' }) => (
  <div className="adm-vacio">
    <div className="adm-spinner" />
    <div className="adm-vacio-sub">{texto}</div>
  </div>
);

export const Aviso = ({ tipo = 'advertencia', children }) => (
  <div className={`adm-aviso${tipo === 'error' ? ' error' : ''}`} role="alert">
    <span>{tipo === 'error' ? '⛔' : '⚠️'}</span>
    <div>{children}</div>
  </div>
);

// Modal con overlay difuminado; cierra con Escape o clic fuera
export const AdminModal = ({ abierto, titulo, onCerrar, children, ancho }) => {
  useEffect(() => {
    if (!abierto) return undefined;
    const alPresionar = (e) => e.key === 'Escape' && onCerrar();
    document.addEventListener('keydown', alPresionar);
    return () => document.removeEventListener('keydown', alPresionar);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <div
      className="adm-modal-overlay adm-app-modal"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}
    >
      <div className="adm-modal-caja" style={ancho ? { maxWidth: ancho } : undefined}>
        <h2>{titulo}</h2>
        {children}
      </div>
    </div>
  );
};
