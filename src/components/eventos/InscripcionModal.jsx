export default function InscripcionModal({ evento, onClose, onConfirmar, enviando = false }) {
  return (
    <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1" onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Confirmar inscripción</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar"></button>
          </div>
          <div className="modal-body">
            <p>¿Deseas inscribirte al evento <strong>{evento.titulo}</strong>?</p>
            <ul className="list-unstyled text-muted small">
              <li><strong>Fecha:</strong> {evento.fecha}</li>
              <li><strong>Hora:</strong> {evento.hora}</li>
              <li><strong>Lugar:</strong> {evento.lugar}</li>
            </ul>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose} disabled={enviando}>Cancelar</button>
            <button className="btn btn-success" onClick={() => onConfirmar(evento.id)} disabled={enviando}>
              {enviando ? 'Inscribiendo...' : 'Confirmar asistencia'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
