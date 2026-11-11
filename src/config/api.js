const rawApiUrl = import.meta.env.VITE_API_URL;

if (!rawApiUrl || typeof rawApiUrl !== 'string' || !/^https?:\/\//i.test(rawApiUrl.trim())) {
  console.warn(
    '[CONFIG] VITE_API_URL no está definida o es inválida en tiempo de ejecución. ' +
    'Se aplicará el endpoint de producción por defecto: https://mascotas.api.adsocidm.com/api'
  );
}

export const API_URL = (
  (rawApiUrl && typeof rawApiUrl === 'string' && /^https?:\/\//i.test(rawApiUrl.trim())
    ? rawApiUrl.trim()
    : 'https://mascotas.api.adsocidm.com/api')
).replace(/\/+$/, '');

export const urlStorage = (ruta) => {
  if (!ruta) return '';
  const limpia = String(ruta).replace(/^\/+/, '');
  return `${API_URL}/storage/${limpia}`;
};
