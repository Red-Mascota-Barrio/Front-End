function BadgeForo({ children, tipo = "categoria" }) {

  const claseBootstrap = tipo === "destacado" ? "bg-warning text-dark" : "bg-primary-subtle text-primary border border-primary-subtle";
  return (
    <span className={`badge rounded-pill px-3 py-2 fw-semibold ${claseBootstrap}`}>
      {children}
    </span>
  );
}

export default BadgeForo;
