// Construye la URL de la foto de perfil (acepta URL absoluta o ruta de storage de Laravel)
export const urlFoto = (usuario) => {
  const foto = usuario?.foto_perfil ?? usuario?.foto ?? null;
  if (!foto) return null;
  const origen = (import.meta.env.VITE_API_URL || 'https://back-end-kks2.onrender.com/api').replace(/\/api\/?$/, '');
  let ruta = String(foto).trim();
  if (!ruta) return null;

  if (/^(blob:|data:)/i.test(ruta)) {
    return ruta;
  }

  const matchStorage = ruta.match(/(?:storage|public)\/(.+)$/i);
  if (matchStorage) {
    const limpia = matchStorage[1].replace(/^\/+/, '');
    return `${origen}/api/storage/${limpia}`;
  }

  if (/^https?:\/\/(localhost|127\.0\.0\.1|back-end-kks2\.onrender\.com)(:\d+)?/i.test(ruta)) {
    const limpia = ruta
      .replace(/^https?:\/\/[^/]+\/?/i, '')
      .replace(/^(api\/)?(storage\/|public\/)?/, '');
    return `${origen}/api/storage/${limpia}`;
  }

  if (/^https?:\/\//i.test(ruta)) {
    if (ruta.startsWith('http://') && typeof window !== 'undefined' && window.location.protocol === 'https:') {
      ruta = ruta.replace(/^http:\/\//i, 'https://');
    }
    return ruta;
  }

  const limpia = ruta.replace(/^\/+/, '').replace(/^(public\/|storage\/|api\/storage\/)/, '');
  return `${origen}/api/storage/${limpia}`;
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
  `${usuario?.nombre?.[0] ?? ''}${usuario?.apellido?.[0] ?? ''}`.toUpperCase() || '?';

export const mensajeError = (error, porDefecto) => {
  const data = error.response?.data;
  // Laravel devuelve los errores de validación en "error" (o "errors" con $request->validate)
  const errores = data?.error ?? data?.errors ?? data?.errores;
  const primerError = errores && typeof errores === 'object' ? Object.values(errores).flat()[0] : null;
  return primerError || data?.mensaje || porDefecto;
};

// Id del rol del usuario (1 = Administrador, 2 = Usuario) sin importar cómo lo devuelva Laravel
export const rolDeUsuario = (usuario) =>
  Number(usuario?.rol_id ?? usuario?.id_rol ?? usuario?.rol?.id_rol ?? usuario?.rol?.id ?? 2);
