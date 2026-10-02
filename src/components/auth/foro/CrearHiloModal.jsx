import { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

export const CrearHiloModal = ({ mostrar, cerrar, alCrear }) => {
    const [titulo, setTitulo] = useState('');
    const [contenido, setContenido] = useState('');
    const [categoria, setCategoria] = useState('');
    const [error, setError] = useState('');


    const manejarSubmit = (e) => {
        e.preventDefault();
        setError('');


        // Validar título
        if (!titulo.trim()) {
            setError('El título es obligatorio.');
            return;
        }


        // Validar contenido
        if (!contenido.trim()) {
            setError('El contenido es obligatorio.');
            return;
        }


        // Validar categoría
        if (!categoria) {
            setError('Debes seleccionar una categoría.');
            return;
        }

        const nuevoHilo = {
            titulo: titulo.trim(),
            contenido: contenido.trim(),
            categoria_foro_id: categoria

        };


        console.log(
            'Datos del nuevo hilo:',
            nuevoHilo
        );


        // Enviar los datos al componente padre
        if (alCrear) {
            alCrear(nuevoHilo);
        }

    };


    // Cerrar y limpiar el formulario
    const cerrarModal = () => {
        setTitulo('');
        setContenido('');
        setCategoria('');
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
                    Crear nuevo hilo
                </Modal.Title>
            </Modal.Header>

            <Form onSubmit={manejarSubmit}>

                <Modal.Body>
                    {error && (
                        <Alert variant="danger">
                            {error}
                        </Alert>
                    )}


                   //titulo

                    <Form.Group className="mb-3">
                        <Form.Label>
                            Título
                        </Form.Label>

                        <Form.Control
                            type="text"
                            placeholder="Escribe el título del hilo"
                            value={titulo}
                            onChange={(e) =>
                                setTitulo(e.target.value)
                            }
                        />

                    </Form.Group>


                    //categoria

                    <Form.Group className="mb-3">
                        <Form.Label>
                            Categoría
                        </Form.Label>

                        <Form.Select
                            value={categoria}
                            onChange={(e) =>
                                setCategoria(e.target.value)
                            }
                        >

                            <option value="">
                                Selecciona una categoría
                            </option>

                            <option value="1">
                                Perros
                            </option>

                            <option value="2">
                                Gatos
                            </option>

                        </Form.Select>

                    </Form.Group>

                    //contenido 

                    <Form.Group className="mb-3">
                        <Form.Label>
                            Contenido
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={5}
                            placeholder="Escribe el contenido de tu hilo"
                            value={contenido}
                            onChange={(e) =>
                                setContenido(e.target.value)
                            }
                        />

                    </Form.Group>

                </Modal.Body>


                <Modal.Footer>

                    <Button
                        variant="secondary"
                        type="button"
                        onClick={cerrarModal}
                    >
                        Cancelar
                    </Button>


                    <Button
                        variant="primary"
                        type="submit"
                    >
                        Publicar hilo
                    </Button>

                </Modal.Footer>

            </Form>

        </Modal>

    );
};