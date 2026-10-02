import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { crearComentario } from '../../services/foroService';

export const FormularioComentario = ({
    foroId, comentarioPadreId = null, alCrear, cancelar}) => {

    const [comentario, setComentario] = useState('');
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const manejarSubmit = async (e) => {

        e.preventDefault();

        setError('');

        if (!comentario.trim()) {

            setError(
                'El comentario no puede estar vacío.'
            );

            return;
        }

        try {

            setCargando(true);

            const datos = {
                foro_id: foroId,
                comentario: comentario.trim()
            };

            if (comentarioPadreId) {
                datos.comentario_padre_id =
                    comentarioPadreId;
            }

            const response =
                await crearComentario(datos);

            setComentario('');

            if (alCrear) {
                alCrear(response);
            }

        } catch (error) {

            console.error(
                'Error al crear comentario:',
                error
            );

            setError(
                'No se pudo publicar el comentario.'
            );

        } finally {

            setCargando(false);

        }

    };


    return (

        <Form onSubmit={manejarSubmit}>
            {error && (

                <Alert variant="danger">
                    {error}
                </Alert>

            )}


            <Form.Group className="mb-3">

                <Form.Label>
                    {comentarioPadreId
                        ? 'Responder comentario'
                        : 'Escribe un comentario'}
                </Form.Label>

                <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Escribe tu comentario..."
                    value={comentario}
                    onChange={(e) =>
                        setComentario(e.target.value)
                    }
                    disabled={cargando}
                />

            </Form.Group>


            <div className="d-flex gap-2">

                <Button
                    type="submit"
                    variant="primary"
                    disabled={cargando}
                >
                    {cargando
                        ? 'Publicando...'
                        : 'Publicar comentario'}
                </Button>


                {cancelar && (

                    <Button
                        type="button"
                        variant="secondary"
                        onClick={cancelar}
                        disabled={cargando}
                    >
                        Cancelar
                    </Button>

                )}

            </div>

        </Form>

    );

};