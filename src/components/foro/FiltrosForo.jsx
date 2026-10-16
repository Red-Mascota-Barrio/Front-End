function FiltrosForo({
  busqueda,
  setBusqueda,
  categoria,
  setCategoria,
}) {
  return (
    <div className="row g-3 mb-4">
      <div className="col-md-8">
        <input
          type="text"
          className="form-control py-2"
          placeholder="Buscar en el foro"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="col-md-4">
        <select
          className="form-select py-2"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          <option value="todas">Todas las categorías</option>
          <option value="perro">Perro</option>
          <option value="gato">Gato</option>
        </select>
      </div>
    </div>
  );
}

export default FiltrosForo;
