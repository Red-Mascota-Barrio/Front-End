
export default function InscripcionModal({ evento, onClose, onConfirmar }) {
  return (
    <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Confirmar Inscripción</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p>¿Deseas inscribirte al evento <strong>{evento.titulo}</strong>?</p>
            <ul className="list-unstyled text-muted small">
              <li><strong>Fecha:</strong> {evento.fecha}</li>
              <li> <strong>Hora:</strong> {evento.hora}</li>
              <li> <strong>Lugar:</strong> {evento.lugar}</li>
            </ul>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button className="btn btn-success" onClick={() => onConfirmar(evento.id)}>
              Confirmar Asistencia
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 



