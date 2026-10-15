import { urlFoto, iniciales } from '../../utils/perfil';

export const AvatarPerfil = ({ usuario, previa, size = 120 }) => {
  const src = previa || urlFoto(usuario);
  
  return (
    <div 
      className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white shadow-sm overflow-hidden border border-2 border-white" 
      style={{ width: size, height: size, fontSize: size / 3, flexShrink: 0 }}
    >
      {src ? (
        <img 
          src={src} 
          alt="Foto de perfil" 
          className="w-100 h-100" 
          style={{ objectFit: 'cover' }} 
        />
      ) : (
        <span className="fw-bold text-uppercase">{iniciales(usuario)}</span>
      )}
    </div>
  );
};