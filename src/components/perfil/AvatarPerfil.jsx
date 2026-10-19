import { urlFoto, iniciales } from '../../utils/perfil';

export const AvatarPerfil = ({ usuario, previa, size = 96 }) => {
  const src = previa || urlFoto(usuario);

  return (
    <div className="perfil-avatar" style={{ width: size, height: size, fontSize: size / 3 }}>
      {src ? <img src={src} alt="Foto de perfil" /> : <span>{iniciales(usuario)}</span>}
    </div>
  );
};
