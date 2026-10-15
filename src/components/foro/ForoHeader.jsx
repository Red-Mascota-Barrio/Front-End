import { Button } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";

function ForoHeader({ onCrearHilo }) {
  return (
    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
      <div>
        <h2 className="fw-bold text-primary mb-1">Foro Comunitario</h2>
        <p className="text-muted small mb-0">
          Comparte ideas, preguntas y experiencias con la comunidad.
        </p>
      </div>

      <Button
        variant="primary"
        className="rounded-pill px-4 py-2 shadow-sm fw-medium d-inline-flex align-items-center gap-2"
        onClick={onCrearHilo}
      >
        <FaPlus /> Crear nuevo hilo
      </Button>
    </div>
  );
}

export default ForoHeader;