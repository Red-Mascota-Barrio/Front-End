import { useRef, useState, useEffect } from 'react';
import { Button, Alert } from 'react-bootstrap';
import { FaCamera } from 'react-icons/fa';
import { AvatarPerfil } from './AvatarPerfil';
import { perfilService } from '../../services/perfilService';
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
      const nueva = data?.foto_perfil ?? data?.usuario?.foto_perfil ?? data?.foto ?? null;
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
    <div className="d-flex flex-column align-items-center text-center mb-4">
      <div className="position-relative mb-3">
        <AvatarPerfil usuario={user} previa={previa} size={130} />
      </div>
      
      <input ref={inputRef} type="file" accept={TIPOS.join(',')} hidden onChange={onSeleccionar} />
      
      <div>
        <Button 
          variant="outline-primary" 
          size="sm" 
          className="rounded-pill px-4 py-2 shadow-sm fw-medium d-inline-flex align-items-center gap-2"
          disabled={subiendo} 
          onClick={() => inputRef.current.click()}
        >
          <FaCamera />
          {subiendo ? 'Subiendo...' : user?.foto_perfil ? 'Cambiar foto' : 'Subir foto'}
        </Button>
        <div className="text-muted small mt-2">JPG, PNG o WEBP · máx. {MAX_MB} MB</div>
      </div>

      {mensaje && (
        <Alert variant={mensaje.tipo} className="py-2 small mt-3 mb-0 rounded-3 w-100">
          {mensaje.texto}
        </Alert>
      )}
    </div>
  );
};