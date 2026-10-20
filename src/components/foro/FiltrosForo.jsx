import { Icono, IconoEspecie } from '../common/Icono';
import { especieDeCategoria } from '../../utils/foro';

// Buscador + categorías en píldora
function FiltrosForo({ busqueda, setBusqueda, categoria, setCategoria, categorias = [], total = 0 }) {
  return (
    <div className="mb-4">
      <div className="foro-busqueda mb-3">
        <Icono nombre="search" />
        <input
          type="search"
          className="form-control"
          placeholder="Buscar en el foro…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          aria-label="Buscar en el foro"
        />
      </div>

      <div className="filtros-pildora" role="group" aria-label="Filtrar por categoría">
        <button
          type="button"
          className={`btn-pildora ${categoria === 'todas' ? 'activo' : ''}`}
          onClick={() => setCategoria('todas')}
        >
          Todos <span className="contador">{total}</span>
        </button>
        {categorias.map((cat) => {
          const id = String(cat.id_categoria);
          return (
            <button
              key={id}
              type="button"
              className={`btn-pildora ${categoria === id ? 'activo' : ''}`}
              onClick={() => setCategoria(id)}
              title={cat.descripcion}
            >
              <IconoEspecie especie={especieDeCategoria(cat)} /> {cat.nombre_categoria}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default FiltrosForo;