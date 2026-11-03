import { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { Icono } from '../common/Icono';
import {
  mascotasService,
  fotoDeMascota,
  urlFoto,
  SIN_FOTO,
  RAZA_OTRA,
} from '../../services/mascotasService';
import { TAMANOS_MASCOTA, hoyISO, mesesDesde, textoEdad } from '../../utils/mascotas';

// "Pequeño" / "pequeño" -> "pequeno" (valor que guarda la BD)
const valorTamano = (t) => {
  const k = String(t ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return TAMANOS_MASCOTA.some((o) => o.valor === k) ? k : '';
};

export default function RegistrarMascotaModal({ onClose, onGuardar, mascota = null }) {
  const editando = Boolean(mascota);
  const [formData, setFormData] = useState({
    nombre: mascota?.nombre ?? '',
    id_especie: mascota?.raza?.especie?.id_especie ?? mascota?.raza?.especie_id ?? '',
    id_raza: mascota?.raza_id ?? mascota?.raza?.id_raza ?? '',
    raza_otra: '',
    edad: mascota?.edad_estimada && Number.isFinite(Number(mascota.edad_estimada))
      ? Number(mascota.edad_estimada)
      : '',
    fecha_nacimiento: String(mascota?.fecha_nacimiento ?? '').slice(0, 10),
    tamano: valorTamano(mascota?.tamano),
    peso_kg: mascota?.peso_kg ? Number(mascota.peso_kg) : '',
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
        id_raza: '',
        raza_otra: ''
      }));
    } else if (name === 'fecha_nacimiento') {
      // Con fecha de nacimiento la edad se calcula sola (en años cumplidos)
      const meses = mesesDesde(value);
      setFormData(prev => ({
        ...prev,
        fecha_nacimiento: value,
        edad: meses !== null ? Math.floor(meses / 12) : prev.edad
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
    if (formData.id_raza === RAZA_OTRA && formData.raza_otra.trim().length < 2) {
      setErrorGuardar('Escribe el nombre de la raza.');
      return;
    }
    if (formData.fecha_nacimiento && formData.fecha_nacimiento > hoyISO()) {
      setErrorGuardar('La fecha de nacimiento no puede ser futura.');
      return;
    }
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
                    {formData.id_especie && !cargandoRazas && (
                      <option value={RAZA_OTRA}>Otra raza (escribirla)…</option>
                    )}
                  </select>
                </div>

                {/* Otra raza: texto libre cuando no aparece en la lista */}
                {formData.id_raza === RAZA_OTRA && (
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="raza_otra">¿Cuál raza? *</label>
                    <input
                      id="raza_otra"
                      type="text"
                      className="form-control"
                      name="raza_otra"
                      placeholder="Ej. Criollo, Schnauzer, Mestizo…"
                      maxLength={100}
                      value={formData.raza_otra}
                      onChange={handleChange}
                      required
                      autoFocus
                    />
                    <div className="form-text">Se agregará a la lista para que otros también puedan elegirla.</div>
                  </div>
                )}

                {/* Género */}
                <div className="col-md-4">
                  <label className="form-label" htmlFor="genero">Género</label>
                  <select
                    id="genero"
                    className="form-select"
                    name="genero"
                    value={formData.genero}
                    onChange={handleChange}
                  >
                    <option value="Hembra">Hembra</option>
                    <option value="Macho">Macho</option>
                  </select>
                </div>

                {/* Tamaño */}
                <div className="col-md-4">
                  <label className="form-label" htmlFor="tamano">Tamaño</label>
                  <select
                    id="tamano"
                    className="form-select"
                    name="tamano"
                    value={formData.tamano}
                    onChange={handleChange}
                  >
                    <option value="">-- Seleccionar --</option>
                    {TAMANOS_MASCOTA.map((t) => (
                      <option key={t.valor} value={t.valor}>{t.texto}</option>
                    ))}
                  </select>
                </div>

                {/* Peso */}
                <div className="col-md-4">
                  <label className="form-label" htmlFor="peso_kg">Peso (kg)</label>
                  <input
                    id="peso_kg"
                    type="number"
                    min="0"
                    max="999"
                    step="0.1"
                    className="form-control"
                    name="peso_kg"
                    placeholder="Ej. 8.5"
                    value={formData.peso_kg}
                    onChange={handleChange}
                  />
                </div>

                {/* Fecha de nacimiento */}
                <div className="col-md-6">
                  <label className="form-label" htmlFor="fecha_nacimiento">Fecha de nacimiento</label>
                  <input
                    id="fecha_nacimiento"
                    type="date"
                    className="form-control"
                    name="fecha_nacimiento"
                    max={hoyISO()}
                    value={formData.fecha_nacimiento}
                    onChange={handleChange}
                  />
                  <div className="form-text">Si no la sabes exacta, deja este campo vacío e indica la edad aproximada.</div>
                </div>

                {/* Edad */}
                <div className="col-md-6">
                  <label className="form-label" htmlFor="edad">Edad aproximada (años)</label>
                  <input
                    id="edad"
                    type="number"
                    min="0"
                    max="40"
                    className="form-control"
                    name="edad"
                    placeholder="Ej. 3"
                    value={formData.edad}
                    onChange={handleChange}
                    disabled={Boolean(formData.fecha_nacimiento)}
                  />
                  {formData.fecha_nacimiento && (
                    <div className="form-text">
                      Calculada con la fecha de nacimiento: {textoEdad({ fecha_nacimiento: formData.fecha_nacimiento }) ?? '—'}.
                    </div>
                  )}
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
