import { api } from './api';
import SIN_FOTO from '../assets/images/common/pata.png';

export { SIN_FOTO };

const lista = (data, clave) => {
  const contenido = data?.datos ?? data?.data ?? data;
  if (Array.isArray(contenido)) return contenido;
  if (Array.isArray(contenido?.[clave])) return contenido[clave];
  return Array.isArray(data?.[clave]) ? data[clave] : [];
};

const ORIGEN_API = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '');

// Convierte la ruta de foto que devuelve Laravel ("mascotas/abc.jpg") en una URL completa
// (http://localhost:8000/storage/mascotas/abc.jpg). Requiere `php artisan storage:link` en el backend.
export const urlFoto = (foto) => {
  if (!foto) return SIN_FOTO;
  const ruta = String(foto);
  if (/^(https?:|blob:|data:)/i.test(ruta)) return ruta;
  const limpia = ruta.replace(/^\/+/, '').replace(/^(public\/|storage\/)/, '');
  return `${ORIGEN_API}/storage/${limpia}`;
};

// Foto principal de una mascota: columna "foto" o, si no hay, la primera imagen de la galería
export const fotoDeMascota = (m) => m?.foto ?? m?.imagenes?.[0]?.url_imagen ?? null;

// Arma el FormData con los nombres de campo que valida MascotasController
const aFormData = (d) => {
  const fd = new FormData();
  const poner = (k, v) => v !== undefined && v !== null && v !== '' && fd.append(k, v);
  poner('nombre', d.nombre);
  poner('genero', d.genero ? String(d.genero).toLowerCase() : undefined);
  poner('raza_id', d.raza_id ?? d.id_raza);
  poner('edad_estimada', d.edad_estimada ?? d.edad);
  poner('fecha_nacimiento', d.fecha_nacimiento);
  poner('peso_kg', d.peso_kg);
  poner('tamano', d.tamano);
  poner('notas_adicionales', d.notas_adicionales ?? d.descripcion);
  fd.append('esterilizado', d.esterilizado ? 1 : 0);
  fd.append('vacunas_al_dia', d.vacunas_al_dia ? 1 : 0);
  if (d.foto instanceof File) fd.append('foto', d.foto);
  return fd;
};

export const mascotasService = {
  listar: async () => {
    const response = await api.get('/mascotas');
    return lista(response.data, 'mascotas');
  },
  // GET /mascotas/:id (Obtener perfil de una mascota por ID)
  obtener: async (id) => {
    const response = await api.get(`/mascotas/${id}`);
    return response.data;
  },
  // POST /mascotas (Registrar nueva mascota)
  crear: async (datosMascota) => {
    // multipart/form-data para que Laravel reciba la foto con $request->file('foto')
    const res = await api.post('/mascotas', aFormData(datosMascota), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  eliminar:async (id) => {
    const { data } = await api.delete(`/mascotas/${id}`);
    return data;
  },

  // --- NUEVOS MÉTODOS PARA ESPECIES Y RAZAS DESDE LA BD ---

  // GET /especies (Obtener lista de especies)
  obtenerEspecies: async () => {
    const res = await api.get('/especies');
    return lista(res.data, 'especies');
  },

  // GET /razas/especie/:idEspecie (Obtener razas de una especie específica)
  // O GET /razas?id_especie=... si tu backend lo maneja por query param
  obtenerRazasPorEspecie: async (idEspecie) => {
    const res = await api.get(`/razas/especie/${idEspecie}`);
    return lista(res.data, 'razas');
  }
};


