import { useRef, useState, useEffect } from 'react';
import { Button, Alert } from 'react-bootstrap';
import { AvatarPerfil } from './AvatarPerfil';
import { Icono } from '../common/Icono';
import { perfilService, PERFIL_SOPORTA } from '../../services/perfilService';
import { useAuth } from '../../context/AuthContext';
import { mensajeError } from '../../utils/perfil';

const TIPOS = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_MB = 2;

export const FotoPerfilUploader = () => {
  const { user, updateUser } = useAuth();
  const inputRef = useRef(null);
  const [previa, setPrevia] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState(null); // { tipo, texto }

  // Libera la URL temporal de la vista previa
  useEffect(() => () => previa && URL.revokeObjectURL(previa), [previa]);

  const onSeleccionar = async (e) => {
    const archivo = e.target.files?.[0];
    e.target.value = '';
    if (!archivo) return;

    if (!TIPOS.includes(archivo.type)) {
      return setMensaje({ tipo: 'danger', texto: 'Formato no válido. Usa JPG, PNG o WEBP.' });
    }
    if (archivo.size > MAX_MB * 1024 * 1024) {
      return setMensaje({ tipo: 'danger', texto: `La imagen no puede superar los ${MAX_MB} MB.` });
    }

    setPrevia(URL.createObjectURL(archivo));
    setMensaje(null);
    setSubiendo(true);
    try {
      const data = await perfilService.subirFoto(archivo);
      const nueva = data?.foto_perfil ?? data?.usuario?.foto_perfil ?? null;
      if (nueva) updateUser({ foto_perfil: nueva });
      setMensaje({ tipo: 'success', texto: 'Foto de perfil actualizada.' });
    } catch (error) {
      setPrevia(null);
      setMensaje({ tipo: 'danger', texto: mensajeError(error, 'No se pudo subir la foto.') });
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="mb-4">
      <div className="avatar-upload-wrap mb-0">
        <AvatarPerfil usuario={user} previa={previa} size={88} />

        <input ref={inputRef} type="file" accept={TIPOS.join(',')} hidden onChange={onSeleccionar} />

        <div className="avatar-upload-info">
          <h3>Foto de perfil</h3>
          <p>
            {PERFIL_SOPORTA.foto
              ? `JPG, PNG o WEBP · máx. ${MAX_MB} MB`
              : 'Muy pronto podrás subir tu foto (la API aún no tiene la ruta).'}
          </p>
          <Button
            variant="light"
            size="sm"
            disabled={subiendo || !PERFIL_SOPORTA.foto}
            onClick={() => inputRef.current.click()}
          >
            <Icono nombre="camera" />
            {subiendo ? 'Subiendo…' : user?.foto_perfil ? 'Cambiar foto' : 'Subir foto'}
          </Button>
        </div>
      </div>

      {mensaje && (
        <Alert variant={mensaje.tipo} className="mt-3 mb-0">
          {mensaje.texto}
        </Alert>
      )}
    </div>
  );
};
