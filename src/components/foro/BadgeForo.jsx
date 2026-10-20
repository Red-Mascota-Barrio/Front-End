const CLASES = {
  categoria: 'badge-azul',
  destacado: 'badge-verde',
  cerrado: 'badge-gris',
};

function BadgeForo({ children, tipo = 'categoria' }) {
  return <span className={`badge ${CLASES[tipo] ?? 'badge-gris'}`}>{children}</span>;
}

export default BadgeForo;
