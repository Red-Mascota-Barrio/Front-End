export const API_URL = (
  import.meta.env.VITE_API_URL || 'https://mascotas.api.adsocidm.com/api'
).replace(/\/+$/, '');

export const urlStorage = (ruta) => {
  const limpia = String(ruta).replace(/^\/+/, '');
  return `${API_URL}/storage/${limpia}`;
};
