import { useState, useEffect } from "react";

function FiltrosForo({
  busqueda,
  setBusqueda,
  categoria,
  setCategoria,
}) {
  // 1. Estados para manejar las categorías de la BD
  const [categoriasList, setCategoriasList] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Traer las categorías desde el backend al cargar el componente
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/categorias')
      .then((response) => {
        if (!response.ok) {
          console.log('estoy aqui')
          throw new Error('Error al cargar categorías');
        }
        return response.json();
      })
      .then((data) => {
        const arrayCategorias = data.datos ? data.datos : data;
        
        // Protección: Solo guardamos si es un arreglo válido
        if (Array.isArray(arrayCategorias)) {
          setCategoriasList(arrayCategorias);
        } else {
          setCategoriasList([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.log('estoy aqui 2')
        console.error('Error al cargar los filtros de categorías:', error);
        setCategoriasList([]); // Evita pantalla en blanco
        setLoading(false);
      });
  }, []);

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
          disabled={loading} // Se bloquea mientras carga
        >
          <option value="todas">
            {loading ? "Cargando..." : "Todas las categorías"}
          </option>

          {/* 3. Mapeo protegido de las opciones */}
          {Array.isArray(categoriasList) && categoriasList.map((cat) => (
            <option 
              key={cat.id_categoria} 
              value={cat.nombre_categoria} // Usamos el nombre para que funcione con tu backend actual
            >
              {cat.nombre_categoria}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default FiltrosForo;