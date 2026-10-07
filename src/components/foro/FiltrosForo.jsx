function FiltrosForo({
  busqueda,
  setBusqueda,
  categoria,
  setCategoria,
}) {
  return (
    <section className="filtros-foro">
      <div className="buscador-foro">
        <input
          type="text"
          placeholder="Buscar en el foro"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="categoria-foro">
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          <option value="todas">
            Todas las categorías
          </option>

          <option value="perro">
            Perro
          </option>

          <option value="gato">
            Gato
          </option>
        </select>
      </div>
    </section>
  );
}

export default FiltrosForo;
