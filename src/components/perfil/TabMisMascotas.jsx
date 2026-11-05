import { useCallback, useState } from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { Icono } from '../common/Icono';
import { ListaPestana } from './ListaPestana';
import MascotaCard from '../mascotas/MascotaCard';
import PerfilMascotaModal from '../mascotas/PerfilMascotaModal';
import RegistrarMascotaModal from '../mascotas/RegistrarMascotaModal';
import { mascotasService } from '../../services/mascotasService';
import { idMascota } from '../../utils/mascotas';
import { useAuth } from '../../context/AuthContext';
import '../../styles/mascotas.css';

// Lista las mascotas del usuario (GET /mis-mascotas o, si no existe, GET /mascotas filtrado por dueño).
// Permite ver perfil, editar, publicar en adopción, eliminar y gestionar solicitudes de adopción.
export const TabMisMascotas = () => {
  const { user } = useAuth();
  const [seleccionada, setSeleccionada] = useState(null);
  const [mascotasCargadas, setMascotasCargadas] = useState([]);
  const [ultimoIdUrl, setUltimoIdUrl] = useState(null);
  const [editando, setEditando] = useState(null);
  const [errorPublicacion, setErrorPublicacion] = useState('');
  const [aviso, setAviso] = useState(false);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  // Al cambiar `version` se vuelve a cargar la lista
  const [version, setVersion] = useState(0);
  const idUsuario = user?.id_usuario;

  // /perfil?mascota=ID (viene de una notificación de adopción): abre el modal de esa mascota
  const [params, setParams] = useSearchParams();
  const idEnUrl = params.get('mascota');

  const cargar = useCallback(async () => {
    void version; // dependencia para forzar la recarga
    const { mascotas, fiable } = await mascotasService.misMascotas({ id_usuario: idUsuario });
    setAviso(!fiable);
    setMascotasCargadas(mascotas);
    return mascotas;
  }, [idUsuario, version]);

  // Se ajusta durante el render (patrón recomendado por React, sin useEffect): en cuanto la lista
  // está cargada y la URL trae una mascota nueva, se selecciona. Sirve tanto si el perfil ya estaba
  // abierto como si se llegó desde otra página.
  if (!idEnUrl && ultimoIdUrl) {
    setUltimoIdUrl(null);
  } else if (idEnUrl && idEnUrl !== ultimoIdUrl && mascotasCargadas.length > 0) {
    setUltimoIdUrl(idEnUrl);
    const deLaUrl = mascotasCargadas.find((m) => String(idMascota(m)) === String(idEnUrl));
    if (deLaUrl) setSeleccionada(deLaUrl);
  }

  // Cierra el modal y limpia ?mascota= para que no se reabra al recargar
  const cerrarPerfil = () => {
    setSeleccionada(null);
    if (idEnUrl) {
      setParams((p) => {
        const nuevos = new URLSearchParams(p);
        nuevos.delete('mascota');
        return nuevos;
      }, { replace: true });
    }
  };

  const abrirRegistro = () => setMostrarRegistro(true);
  const cerrarRegistro = () => setMostrarRegistro(false);

  const handleGuardar = async (datosNuevos) => {
    await mascotasService.crear(datosNuevos);
    cerrarRegistro();
    setVersion((v) => v + 1);
  };

  const handleEditar = async (datosActualizados) => {
    await mascotasService.actualizar(
      editando.id_mascotas ?? editando.id,
      datosActualizados
    );
    setEditando(null);
    setVersion((v) => v + 1);
  };

  const handleEliminar = async (id) => {
    await mascotasService.eliminar(id);
    cerrarPerfil();
    setVersion((v) => v + 1);
  };

  const handleSolicitudAprobada = async () => {
    cerrarPerfil();
    setVersion((v) => v + 1);
  };

  const handlePublicar = async (id) => {
    setErrorPublicacion('');
    try {
      const respuesta = await mascotasService.publicarParaAdopcion(id);
      setSeleccionada((actual) => ({
        ...actual,
        adopciones: [...(actual?.adopciones ?? []), respuesta.datos],
        adopcion_activa_id: respuesta.datos?.id_adopcion,
        estado_adopcion: 'Disponible',
      }));
      setVersion((v) => v + 1);
    } catch (err) {
      console.error('Error al publicar mascota para adopción:', err);
      setErrorPublicacion(err.response?.data?.mensaje || 'No se pudo publicar la mascota para adopción.');
    }
  };

  // El dueño retira la mascota de adopción (PATCH /adopciones/:id/cancelar)
  const handleCancelarAdopcion = async (idAdopcion) => {
    const respuesta = await mascotasService.cancelarAdopcion(idAdopcion);
    setSeleccionada((actual) => actual && ({
      ...actual,
      adopcion_activa_id: null,
      id_adopcion: undefined,
      estado_adopcion: 'Cancelada',
      adopciones: (actual.adopciones ?? []).map((a) => (
        Number(a.id_adopcion) === Number(idAdopcion) ? { ...a, ...respuesta.datos, estado_adopcion: 'Cancelada' } : a
      )),
    }));
    setVersion((v) => v + 1);
  };

  return (
    <>
      {aviso && (
        <p className="text-muted small text-center mt-3">
          <Icono nombre="info-circle" /> La API no está indicando de quién es cada mascota, por eso no se puede filtrar tu lista.
        </p>
      )}
      <ListaPestana
        cargar={cargar}
        vacio={{
          icono: 'heart',
          titulo: 'Aún no has registrado mascotas',
          sub: 'Registra a tu mascota para publicarla en adopción o llevar su información al día.',
          accion: { texto: 'Registrar mascota', onClick: abrirRegistro },
        }}
      >
        {(mascotas) => (
          <>
            <Row xs={1} sm={2} lg={3} className="g-3 mt-1">
              {mascotas.map((m) => (
                <Col key={idMascota(m)}>
                  <MascotaCard mascota={m} onVerPerfil={setSeleccionada} />
                </Col>
              ))}
            </Row>
            <div className="d-flex justify-content-center flex-wrap gap-2 mt-4">
              <Button variant="primary" onClick={abrirRegistro}>
                <Icono nombre="plus-lg" /> Registrar mascota
              </Button>
            </div>
          </>
        )}
      </ListaPestana>

      {seleccionada && (
        <PerfilMascotaModal
          mascota={seleccionada}
          onClose={cerrarPerfil}
          onEditar={(m) => {
            cerrarPerfil();
            setEditando(m);
          }}
          onEliminar={handleEliminar}
          onSolicitudAprobada={handleSolicitudAprobada}
          mostrarSolicitudes
          onCancelarAdopcion={handleCancelarAdopcion}
          onPublicar={handlePublicar}
          errorPublicacion={errorPublicacion}
        />
      )}

      {editando && (
        <RegistrarMascotaModal
          mascota={editando}
          onClose={() => setEditando(null)}
          onGuardar={handleEditar}
        />
      )}

      {mostrarRegistro && <RegistrarMascotaModal onClose={cerrarRegistro} onGuardar={handleGuardar} />}
    </>
  );
};
