import { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { crearReporte } from '../../services/foroService';

export const ReportarModal = ({ mostrar, cerrar, foroId = null, comentarioId = null }) => {
    const [descripcion, setDescripcion] = useState('');
    const [tipoReporte, setTipoReporte] = useState('');
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const manejarSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!descripcion.trim()) {

            setError(
                'Debes escribir una descripción.'
            );

            return;
        }

        if (!tipoReporte) {

            setError(
                'Debes seleccionar un tipo de reporte.'
            );

            return;
        }

        try {

            setCargando(true);

            const datos = {
                descripcion: descripcion.trim(),
                tipo_reporte_id: tipoReporte
            };

            if (foroId) {
                datos.foro_id = foroId;
            }

            if (comentarioId) {
                datos.comentario_id = comentarioId;
            }

            await crearReporte(datos);

            setDescripcion('');
            setTipoReporte('');

            cerrar();

        } catch (error) {

            console.error(
                'Error al crear reporte:',
                error
            );

            setError(
                'No se pudo enviar el reporte.'
            );

        } finally {

            setCargando(false);

        }

    };


    const cerrarModal = () => {

        setDescripcion('');
        setTipoReporte('');
        setError('');
        cerrar();

    };


    return (

        <Modal
            show={mostrar}
            onHide={cerrarModal}
            centered
        >

            <Modal.Header closeButton>

                <Modal.Title>
                    Reportar contenido
                </Modal.Title>

            </Modal.Header>


            <Form onSubmit={manejarSubmit}>

                <Modal.Body>

                    {error && (

                        <Alert variant="danger">
                            {error}
                        </Alert>

                    )}


                    <Form.Group className="mb-3">

                        <Form.Label>
                            Motivo del reporte
                        </Form.Label>

                        <Form.Select
                            value={tipoReporte}
                            onChange={(e) =>
                                setTipoReporte(
                                    e.target.value
                                )
                            }
                        >

                            <option value="">
                                Selecciona un motivo
                            </option>

                            <option value="1">
                                Contenido inapropiado
                            </option>

                            <option value="2">
                                Spam
                            </option>

                            <option value="3">
                                Información falsa
                            </option>

                            <option value="4">
                                Otro
                            </option>

                        </Form.Select>

                    </Form.Group>


                    <Form.Group>

                        <Form.Label>
                            Descripción
                        </Form.Label>

                        <Form.Control
                            as="textarea"
                            rows={4}
                            placeholder="Explica por qué deseas reportar este contenido..."
                            value={descripcion}
                            onChange={(e) =>
                                setDescripcion(
                                    e.target.value
                                )
                            }
                        />

                    </Form.Group>

                </Modal.Body>


                <Modal.Footer>

                    <Button
                        type="button"
                        variant="secondary"
                        onClick={cerrarModal}
                        disabled={cargando}
                    >
                        Cancelar
                    </Button>


                    <Button
                        type="submit"
                        variant="danger"
                        disabled={cargando}
                    >
                        {cargando
                            ? 'Enviando...'
                            : 'Enviar reporte'}
                    </Button>

                </Modal.Footer>

            </Form>

        </Modal>

    );

};