import { useCallback, useState } from 'react';
import { Button, Row, Col } from 'react-bootstrap';
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
// El formulario de registro se abre aquí mismo (modal), sin cambiar de página.
export const TabMisMascotas = () => {
  const { user } = useAuth();
  const [seleccionada, setSeleccionada] = useState(null);
  const [aviso, setAviso] = useState(false);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  // Al cambiar `version` se vuelve a cargar la lista (después de registrar una mascota)
  const [version, setVersion] = useState(0);
  const idUsuario = user?.id_usuario;

  const cargar = useCallback(async () => {
    void version; // dependencia para forzar la recarga
    const { mascotas, fiable } = await mascotasService.misMascotas({ id_usuario: idUsuario });
    setAviso(!fiable);
    return mascotas;
  }, [idUsuario, version]);

  const abrirRegistro = () => setMostrarRegistro(true);
  const cerrarRegistro = () => setMostrarRegistro(false);

  const handleGuardar = async (datosNuevos) => {
    await mascotasService.crear(datosNuevos); // si falla, el modal muestra el error
    cerrarRegistro();
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
      {seleccionada && <PerfilMascotaModal mascota={seleccionada} onClose={() => setSeleccionada(null)} />}
      {mostrarRegistro && <RegistrarMascotaModal onClose={cerrarRegistro} onGuardar={handleGuardar} />}
    </>
  );
};
