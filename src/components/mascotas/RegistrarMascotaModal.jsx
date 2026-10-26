import { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { Icono } from '../common/Icono';
import {
  mascotasService,
  fotoDeMascota,
  urlFoto,
  SIN_FOTO,
} from '../../services/mascotasService';

export default function RegistrarMascotaModal({ onClose, onGuardar, mascota = null }) {
  const editando = Boolean(mascota);
  const [formData, setFormData] = useState({
    nombre: mascota?.nombre ?? '',
    id_especie: mascota?.raza?.especie?.id_especie ?? mascota?.raza?.especie_id ?? '',
    id_raza: mascota?.raza_id ?? mascota?.raza?.id_raza ?? '',
    edad: mascota?.edad_estimada && Number.isFinite(Number(mascota.edad_estimada))
      ? Number(mascota.edad_estimada)
      : '',
    genero: mascota?.genero
      ? String(mascota.genero).charAt(0).toUpperCase() + String(mascota.genero).slice(1).toLowerCase()
      : 'Hembra',
    foto: null,
    descripcion: mascota?.notas_adicionales ?? '',
    esterilizado: Boolean(Number(mascota?.esterilizado)),
    vacunas_al_dia: Boolean(Number(mascota?.vacunas_al_dia))
  });

  const [especies, setEspecies] = useState([]);
  const [cargandoEspecies, setCargandoEspecies] = useState(true);
  const [errorEspecies, setErrorEspecies] = useState('');
  const [razas, setRazas] = useState([]);
  const [cargandoRazas, setCargandoRazas] = useState(false);
  const [previa, setPrevia] = useState(() => (
    mascota ? urlFoto(fotoDeMascota(mascota)) : null
  ));
  const [guardando, setGuardando] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState('');

  // Libera la URL temporal de la vista previa
  useEffect(() => () => {
    if (previa?.startsWith('blob:')) URL.revokeObjectURL(previa);
  }, [previa]);

  // Cargar la lista de especies cuando se monta el modal.
  useEffect(() => {
    let activo = true;

    mascotasService.obtenerEspecies()
      .then(data => {
        if (activo) setEspecies(data);
      })
      .catch(err => {
        console.error('Error al obtener especies:', err);
        if (activo) setErrorEspecies('No se pudieron cargar las especies desde el servidor.');
      })
      .finally(() => {
        if (activo) setCargandoEspecies(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    if (!formData.id_especie) return undefined;

    let activo = true;
    mascotasService.obtenerRazasPorEspecie(formData.id_especie)
      .then(data => {
        if (activo) setRazas(data);
      })
      .catch(err => {
        console.error('Error al obtener razas:', err);
        if (activo) setRazas([]);
      })
      .finally(() => {
        if (activo) setCargandoRazas(false);
      });

    return () => {
      activo = false;
    };
  }, [formData.id_especie]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'file') {
      const archivo = files?.[0] ?? null;
      setFormData(prev => ({ ...prev, foto: archivo }));
      setPrevia(archivo ? URL.createObjectURL(archivo) : null);
      return;
    }

    if (name === 'id_especie') {
      setRazas([]);
      setCargandoRazas(Boolean(value));
      setFormData(prev => ({
        ...prev,
        id_especie: value,
        id_raza: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setErrorGuardar('');
    try {
      await onGuardar(formData);
    } catch (err) {
      console.error('Error al guardar mascota:', err);
      const respuesta = err?.response?.data;
      const erroresValidacion = Object.values(respuesta?.error ?? {}).flat().join(' ');
      setErrorGuardar(
        erroresValidacion
        || respuesta?.mensaje
        || respuesta?.message
        || `No se pudo ${editando ? 'actualizar' : 'registrar'} la mascota. Comprueba los datos y vuelve a intentar.`
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal show onHide={guardando ? undefined : onClose} centered size="lg" backdrop={guardando ? 'static' : true} scrollable>
          <Modal.Header closeButton={!guardando}>
            <div>
              <Modal.Title as="h2" className="h4 mb-1">
                {editando ? `Editar perfil de ${mascota.nombre}` : 'Registrar mascota'}
              </Modal.Title>
              <p className="text-muted small mb-0">Completa los datos de tu mascota. Los campos con * son obligatorios.</p>
            </div>
          </Modal.Header>
          <form onSubmit={handleSubmit} className="d-flex flex-column overflow-hidden">
            <div className="modal-body">
              {errorGuardar && <div className="alert alert-danger" role="alert">{errorGuardar}</div>}
              <div className="row g-3">
                {/* Nombre */}
                <div className="col-md-6">
                  <label className="form-label">Nombre *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Desplegable Especie */}
                <div className="col-md-6">
                  <label className="form-label">Especie *</label>
                  <select
                    className="form-select"
                    name="id_especie"
                    value={formData.id_especie}
                    onChange={handleChange}
                    disabled={cargandoEspecies || Boolean(errorEspecies)}
                    required
                  >
                    <option value="">
                      {cargandoEspecies ? 'Cargando especies...' : '-- Seleccionar Especie --'}
                    </option>
                    {especies.map((item) => (
                      <option key={item.id_especie ?? item.id} value={item.id_especie ?? item.id}>
                        {item.nombre_especie ?? item.nombre ?? item.especie}
                      </option>
                    ))}
                  </select>
                  {errorEspecies && <div className="form-text text-danger" role="alert">{errorEspecies}</div>}
                </div>

                {/* Desplegable Raza (Dependiente) */}
                <div className="col-md-6">
                  <label className="form-label">Raza *</label>
                  <select
                    className="form-select"
                    name="id_raza"
                    value={formData.id_raza}
                    onChange={handleChange}
                    disabled={!formData.id_especie || cargandoRazas}
                    required
                  >
                    <option value="">
                      {!formData.id_especie
                        ? '-- Primero elige una especie --'
                        : cargandoRazas
                        ? 'Cargando razas...'
                        : '-- Seleccionar Raza --'}
                    </option>
                    {razas.map((item) => (
                      <option key={item.id_raza ?? item.id} value={item.id_raza ?? item.id}>
                        {item.nombre_raza ?? item.nombre ?? item.raza}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Edad */}
                <div className="col-md-3">
                  <label className="form-label">Edad (años)</label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    className="form-control"
                    name="edad"
                    placeholder="Ej. 3"
                    value={formData.edad}
                    onChange={handleChange}
                  />
                </div>

                {/* Género */}
                <div className="col-md-3">
                  <label className="form-label">Género</label>
                  <select
                    className="form-select"
                    name="genero"
                    value={formData.genero}
                    onChange={handleChange}
                  >
                    <option value="Hembra">Hembra</option>
                    <option value="Macho">Macho</option>
                  </select>
                </div>

                {/* Foto (se sube como archivo: el backend espera el campo "foto") */}
                <div className="col-12">
                  <label className="form-label">Foto (Opcional)</label>
                  <input
                    type="file"
                    className="form-control"
                    name="foto"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleChange}
                  />
                  <div className="form-text">
                    {editando && mascota.foto
                      ? 'Selecciona una foto nueva para reemplazar la actual.'
                      : 'JPG, PNG o WEBP · máximo 4 MB.'}
                  </div>
                  {previa && (
                    <img
                      src={previa}
                      alt="Vista previa"
                      className="img-thumbnail mt-2"
                      style={{ maxHeight: 160, objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = SIN_FOTO;
                      }}
                    />
                  )}
                </div>

                {/* Descripción */}
                <div className="col-12">
                  <label className="form-label">Descripción</label>
                  <textarea
                    className="form-control"
                    name="descripcion"
                    rows="3"
                    placeholder="Escribe un resumen o cuidados especiales..."
                    value={formData.descripcion}
                    onChange={handleChange}
                  ></textarea>
                </div>

                {/* Checkboxes (bloque de salud del mockup) */}
                <div className="col-12">
                  <div className="caja-info">
                    <div className="fw-bold mb-2"><Icono nombre="heart-pulse" /> Salud</div>
                    <div className="d-flex flex-wrap gap-4">
                        <div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              name="esterilizado"
                              id="esterilizado"
                              checked={formData.esterilizado}
                              onChange={handleChange}
                            />
                            <label className="form-check-label" htmlFor="esterilizado">
                              ¿Esterilizado/a?
                            </label>
                          </div>
                        </div>

                        <div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              name="vacunas_al_dia"
                              id="vacunas_al_dia"
                              checked={formData.vacunas_al_dia}
                              onChange={handleChange}
                            />
                            <label className="form-check-label" htmlFor="vacunas_al_dia">
                              ¿Vacunas al día?
                            </label>
                          </div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-light" onClick={onClose} disabled={guardando}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={guardando}>
                {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Guardar Mascota'}
              </button>
            </div>
          </form>
    </Modal>
  );
}
