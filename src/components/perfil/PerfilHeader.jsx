import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AvatarPerfil } from './AvatarPerfil';
import { Icono } from '../common/Icono';
import { esVerificado } from '../../utils/perfil';

// Claves de GET /estadisticas/usuario
const STATS = [
  { clave: 'mascotas', etiqueta: 'Mascotas' },
  { clave: 'publicaciones', etiqueta: 'Posts' },
  { clave: 'eventos', etiqueta: 'Eventos' },
  { clave: 'adopciones', etiqueta: 'Adopciones' },
];

// Encabezado del perfil (perfil_Usuario.html del mockup)
export const PerfilHeader = ({ usuario, estadisticas }) => {
  // En la BD la biografía es la columna "descripcion"
  const bio = usuario?.descripcion ?? usuario?.biografia;
  const ubicacion = [usuario?.barrio, usuario?.ciudad].filter(Boolean).join(', ');

  return (
    <section className="perfil-encabezado">
      <div className="d-flex flex-wrap align-items-start gap-4">
        <AvatarPerfil usuario={usuario} size={96} />

        <div style={{ flex: '1 1 0', minWidth: 240 }}>
          <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
            <h1 className="perfil-nombre">{usuario?.nombre} {usuario?.apellido}</h1>
            {esVerificado(usuario) ? (
              <span className="badge badge-verde"><Icono nombre="patch-check-fill" /> Cuenta verificada</span>
            ) : (
              <span className="badge badge-naranja">Sin verificar</span>
            )}
          </div>
          {ubicacion && <p className="perfil-dato"><Icono nombre="geo-alt" /> {ubicacion}</p>}
          <p className="perfil-dato">
            <Icono nombre="envelope" /> {usuario?.correo}
            {usuario?.telefono && <> <span className="mx-1">·</span> <Icono nombre="telephone" /> {usuario.telefono}</>}
          </p>
          {bio && <p className="bio-bloque">“{bio}”</p>}
        </div>

        <div className="d-flex flex-column align-items-start align-items-md-end gap-3">
          <div className="stats-perfil">
            {STATS.map(({ clave, etiqueta }) => (
              <div className="stat-perfil" key={clave}>
                <div className="num">{estadisticas?.[clave] ?? 0}</div>
                <div className="lbl">{etiqueta}</div>
              </div>
            ))}
          </div>
          <div className="d-flex flex-wrap gap-2">
            <Button as={Link} to="/perfil/editar" variant="outline-primary" size="sm">
              <Icono nombre="pencil" /> Editar
            </Button>
            <Button as={Link} to="/mis-mascotas?registrar=1" variant="primary" size="sm">
              <Icono nombre="plus-lg" /> Agregar mascota
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
