function BadgeForo({ children, tipo = "categoria" }) {
  return (
    <span className={`badge-foro badge-${tipo}`}>
      {children}
    </span>
  );
}

export default BadgeForo;
