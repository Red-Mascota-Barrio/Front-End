import { api } from './api';
import SIN_FOTO from '../assets/images/common/pata.png';
import { esMiMascota, tieneInfoDueno } from '../utils/mascotas';

export { SIN_FOTO };

const lista = (data, clave) => {
  const contenido = data?.datos ?? data?.data ?? data;
  if (Array.isArray(contenido)) return contenido;
  if (Array.isArray(contenido?.[clave])) return contenido[clave];
  return Array.isArray(data?.[clave]) ? data[clave] : [];
};
const ORIGEN_API = (import.meta.env.VITE_API_URL || 'https://back-end-kks2.onrender.com/api').replace(/\/api\/?$/, '');

// Convierte la ruta de foto que devuelve Laravel ("mascotas/abc.jpg") en una URL completa
// (https://back-end-kks2.onrender.com/api/storage/mascotas/abc.jpg).
export const urlFoto = (foto) => {
  if (!foto) return SIN_FOTO;
  let ruta = String(foto).trim();
  if (!ruta) return SIN_FOTO;

  // Si es un blob o data URI local
  if (/^(blob:|data:)/i.test(ruta)) {
    return ruta;
  }

  // Si contiene storage/ o public/ (sea de localhost, render o relativo)
  const matchStorage = ruta.match(/(?:storage|public)\/(.+)$/i);
  if (matchStorage) {
    const limpia = matchStorage[1].replace(/^\/+/, '');
    return `${ORIGEN_API}/api/storage/${limpia}`;
  }

  // Si apunta a localhost o al backend de render
  if (/^https?:\/\/(localhost|127\.0\.0\.1|back-end-kks2\.onrender\.com)(:\d+)?/i.test(ruta)) {
    const limpia = ruta
      .replace(/^https?:\/\/[^/]+\/?/i, '')
      .replace(/^(api\/)?(storage\/|public\/)?/, '');
    return `${ORIGEN_API}/api/storage/${limpia}`;
  }

  // Si ya es una URL externa válida (ej. Unsplash, Imgur)
  if (/^https?:\/\//i.test(ruta)) {
    if (ruta.startsWith('http://') && typeof window !== 'undefined' && window.location.protocol === 'https:') {
      ruta = ruta.replace(/^http:\/\//i, 'https://');
    }
    return ruta;
  }

  const limpia = ruta.replace(/^\/+/, '').replace(/^(public\/|storage\/|api\/storage\/)/, '');
  return `${ORIGEN_API}/api/storage/${limpia}`;
};

// Foto principal de una mascota: columna "foto" o, si no hay, la primera imagen de la galería
export const fotoDeMascota = (m) => m?.foto ?? m?.imagenes?.[0]?.url_imagen ?? null;

// Arma el FormData con los nombres de campo que valida MascotasController
const aFormData = (d, incluirVacios = false) => {
  const fd = new FormData();
  const poner = (k, v) => (
    v !== undefined
    && v !== null
    && (incluirVacios || v !== '')
    && fd.append(k, v)
  );
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
  if (d.foto) fd.append('foto', d.foto);
  return fd;
};

export const mascotasService = {
  // params son filtros opcionales del back (ej. { estado_adopcion: 'Disponible' })
  listar: async (params = {}) => {
    const response = await api.get('/mascotas', { params });
    return lista(response.data, 'mascotas');
  },
  listarAdopciones: async () => {
    try {
      const response = await api.get('/adopciones');
      return lista(response.data, 'adopciones').map((adopcion) => ({
        ...adopcion.mascota,
        id_adopcion: adopcion.id_adopcion,
        adopcion_activa_id: adopcion.id_adopcion,
        adopciones: [adopcion],
      }));
    } catch {
      return mascotasService.listar({ estado_adopcion: 'Disponible' });
    }
  },
  // Mascotas vinculadas al usuario autenticado
  listarMisMascotas: async () => {
    const response = await api.get('/mis-mascotas');
    return lista(response.data, 'mascotas');
  },
  // Mascotas del usuario: usa GET /mis-mascotas y, si la API no lo tiene (404/405),
  // filtra GET /mascotas por dueño. 'fiable' es false si ninguna mascota trae dato de dueño.
  misMascotas: async (user) => {
    try {
      const res = await api.get('/mis-mascotas');
      return { mascotas: lista(res.data, 'mascotas'), fiable: true };
    } catch (err) {
      if (![404, 405].includes(err.response?.status)) throw err;
    }
    const todas = await mascotasService.listar();
    return {
      mascotas: todas.filter((m) => esMiMascota(m, user?.id_usuario)),
      fiable: todas.some(tieneInfoDueno),
    };
  },
  // POST /solicitudes (SolicitudController): se postula a la publicación de adopción 'Disponible' de la mascota
  solicitarAdopcion: async (idAdopcion) => {
    const res = await api.post('/solicitudes', { adopcion_id: Number(idAdopcion) });
    return res.data;
  },
  publicarParaAdopcion: async (mascotaId) => {
    const { data } = await api.post('/adopciones', { mascota_id: mascotaId });
    return data;
  },
  listarSolicitudesDeMascota: async (mascotaId) => {
    const response = await api.get(`/mascotas/${mascotaId}/solicitudes`);
    return lista(response.data, 'solicitudes');
  },
  responderSolicitud: async (solicitudId, faseActual) => {
    const { data } = await api.put('/solicitudes/responder', {
      solicitud_id: solicitudId,
      fase_actual: faseActual,
    });
    return data;
  },
  // GET /mascotas/:id (Obtener perfil de una mascota por ID)
  obtener: async (id) => {
    const response = await api.get(`/mascotas/${id}`);
    return response.data;
  },
  // POST /mascotas (Registrar nueva mascota)
  crear: async (datosMascota) => {
    // multipart/form-data para que Laravel reciba la foto con $request->file('foto')
    const res = await api.post('/mascotas', aFormData(datosMascota));
    return res.data;
  },
  actualizar: async (mascotaId, datosMascota) => {
    const formData = aFormData(datosMascota, true);
    formData.append('_method', 'PUT');
    const { data } = await api.post(`/mascotas/${mascotaId}`, formData);
    return data;
  },

  eliminar: async (id) => {
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
  obtenerRazasPorEspecie: async (idEspecie) => {
    const res = await api.get(`/razas/especie/${idEspecie}`);
    return lista(res.data, 'razas');
  },
};
