import { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { Icono } from "../common/Icono";

const MOTIVOS = [
  { id: "1", texto: "Publicidad o spam" },
  { id: "2", texto: "Lenguaje ofensivo o acoso" },
  { id: "3", texto: "Información falsa o peligrosa" },
  { id: "4", texto: "Otro motivo" },
];

// Motivos = tipos_reporte (TipoReporteSeeder, ids 1-4)
function ReportarModal({ onCerrar, onReportar, objeto = "comentario" }) {
  const [motivo, setMotivo] = useState("1");

  const manejarReporte = (e) => {
    e.preventDefault();
    onReportar(motivo);
    onCerrar();
  };

  return (
    <Modal show onHide={onCerrar} centered>
      <Modal.Header closeButton>
        <div>
          <Modal.Title as="h2" className="h5 mb-1 text-danger"><Icono nombre="flag" /> Reportar {objeto}</Modal.Title>
          <p className="text-muted small mb-0">Un moderador revisará el contenido.</p>
        </div>
      </Modal.Header>
      <Form onSubmit={manejarReporte}>
        <Modal.Body>
          <p className="small text-secondary mb-3">¿Por qué quieres reportar este {objeto}?</p>
          <div className="d-flex flex-column gap-2">
            {MOTIVOS.map((m) => (
              <Form.Check
                key={m.id}
                type="radio"
                name="motivo"
                id={`motivo${m.id}`}
                value={m.id}
                label={m.texto}
                checked={motivo === m.id}
                onChange={(e) => setMotivo(e.target.value)}
              />
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={onCerrar}>Cancelar</Button>
          <Button type="submit" variant="danger">Enviar reporte</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default ReportarModal;
