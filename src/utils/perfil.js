// Construye la URL de la foto de perfil (acepta URL absoluta o ruta de storage de Laravel)
export const urlFoto = (usuario) => {
  const foto = usuario?.foto_perfil ?? usuario?.foto ?? null;
  if (!foto) return null;
  if (/^(https?:|blob:|data:)/.test(foto)) return foto;
  const origen = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');
  return `${origen}/storage/${String(foto).replace(/^\/+/, '')}`;
};

// Indica si la cuenta tiene la insignia de verificado
export const esVerificado = (usuario) =>
  Boolean(
    usuario?.verificado ??
      usuario?.cuenta_verificada ??
      usuario?.correo_verificado_en ??
      usuario?.email_verified_at
  );

export const iniciales = (usuario) =>
  `${usuario?.nombre?.[0] ?? ''}${usuario?.apellido?.[0] ?? ''}`.toUpperCase() || '🐾';

export const mensajeError = (error, porDefecto) => {
  const data = error.response?.data;
  const primerError = data?.errores ? Object.values(data.errores).flat()[0] : null;
  return primerError || data?.mensaje || porDefecto;
};
