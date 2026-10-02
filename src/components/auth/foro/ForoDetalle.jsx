import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Container, Card, Spinner, Alert, Badge, Button } from 'react-bootstrap';
import { obtenerForo } from '../../services/foroService';
import { FormularioComentario } from './FormularioComentario';
import { ReportarModal } from './ReportarModal';

export const ForoDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [foro, setForo] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [mostrarComentario, setMostrarComentario] =useState(false);
    const [comentarioPadre, setComentarioPadre] = useState(null);
    const [mostrarReporte, setMostrarReporte] = useState(false);
    const [elementoReporte, setElementoReporte] = useState(null);

    
    //cargar foro

    const cargarForo = async () => {
        try {
            setCargando(true);
            setError('');

            const response =
                await obtenerForo(id);
            console.log(
                'Foro recibido:',
                response
            );

            setForo(
                response.datos || response
            );

        } catch (error) {

            console.error(
                'Error al cargar foro:',
                error
            );

            setError(
                'No se pudo cargar el foro.'
            );

        } finally {

            setCargando(false);

        }

    };


    useEffect(() => {
        cargarForo();
    }, [id]);


    //cargando

    if (cargando) {

        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" />
                <p className="mt-3">
                    Cargando hilo...
                </p>

            </Container>

        );

    }


    //error

    if (error) {

        return (
            <Container className="py-5">

                <Alert variant="danger">
                    {error}
                </Alert>

                <Button
                    variant="secondary"
                    onClick={() =>
                        navigate('/foro')
                    }
                >
                    Volver al foro
                </Button>

            </Container>

        );

    }


    if (!foro) {

        return (
            <Container className="py-5">

                <Alert variant="warning">
                    No se encontró el hilo.
                </Alert>

                <Button
                    variant="secondary"
                    onClick={() =>
                        navigate('/foro')
                    }
                >
                    Volver al foro
                </Button>

            </Container>

        );

    }


    //comentario creado

    const comentarioCreado = async () => {
        setMostrarComentario(false);
        setComentarioPadre(null);
        await cargarForo();

    };

    //responder comentario

    const responderComentario = (comentario) => {

        setComentarioPadre(
            comentario.id_comentario
        );

        setMostrarComentario(true);

    };

    //reportar foro

    const reportarForo = () => {

        setElementoReporte({
            tipo: 'foro',
            id: foro.id_foro
        });

        setMostrarReporte(true);

    };

    //reportar comentario

    const reportarComentario = (comentario) => {

        setElementoReporte({
            tipo: 'comentario',
            id: comentario.id_comentario
        });

        setMostrarReporte(true);

    };


    return (

        <Container className="py-5">

            //para volver
            <Button
                variant="secondary"
                className="mb-4"
                onClick={() =>
                    navigate('/foro')
                }
            >
                Volver al foro
            </Button>


            //para mostrar
            <Card className="shadow-sm mb-4">

                <Card.Body>

                    <div className="d-flex justify-content-between align-items-start">

                        <h1 className="mb-3">

                            {foro.titulo}

                        </h1>


                        <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={reportarForo}
                        >
                            Reportar
                        </Button>

                    </div>


                    <Badge
                        bg="secondary"
                        className="mb-3"
                    >

                        {
                            foro.categoriaForo?.nombre_categoria || 'Sin categoría'
                        }

                    </Badge>


                    <div className="text-muted mb-4">

                        <small>

                            {' '}

                            {
                                foro.usuario?.nombre || 'Usuario'
                            }

                        </small>

                        {'  '}

                        <small>

                            {' '}

                            {
                                foro.fecha_creacion || 'Fecha no disponible'
                            }

                        </small>

                    </div>


                    <p
                        style={{
                            whiteSpace: 'pre-wrap'
                        }}
                    >
                        {foro.contenido}
                    </p>


                    <div className="mt-4 text-muted">

                        {' '}

                        {
                            foro.numero_comentarios || 0
                        }

                        {' '}
                        comentarios

                    </div>

                </Card.Body>

            </Card>


            //formulario de comentario

            {mostrarComentario && (

                <Card className="shadow-sm mb-4">

                    <Card.Body>

                        <h4 className="mb-3">

                            {comentarioPadre
                                ? 'Responder comentario'
                                : 'Agregar comentario'}

                        </h4>


                        <FormularioComentario

                            foroId={foro.id_foro}

                            comentarioPadreId={
                                comentarioPadre
                            }

                            alCrear={
                                comentarioCreado
                            }

                            cancelar={() => {

                                setMostrarComentario(
                                    false
                                );

                                setComentarioPadre(
                                    null
                                );

                            }}

                        />

                    </Card.Body>

                </Card>

            )}


            //boton para comentar

            {!mostrarComentario && (

                <Button
                    variant="primary"
                    className="mb-4"
                    onClick={() => {

                        setComentarioPadre(null);

                        setMostrarComentario(true);

                    }}
                >
                    Agregar comentario
                </Button>

            )}


           //comentarios

            <Card className="shadow-sm">

                <Card.Body>

                    <h3 className="mb-4">
                        Comentarios
                    </h3>


                    {!foro.comentarios ||
                    foro.comentarios.length === 0 ? (

                        <Alert variant="info">

                            Todavía no hay comentarios
                            en este hilo.

                        </Alert>

                    ) : (

                        foro.comentarios.map(
                            (comentario) => (

                                <Card
                                    key={
                                        comentario.id_comentario
                                    }
                                    className="mb-3"
                                >

                                    <Card.Body>

                                        <div className="d-flex justify-content-between">

                                            <strong>

                                                {
                                                    comentario
                                                        .usuario
                                                        ?.nombre
                                                    || 'Usuario'
                                                }

                                            </strong>


                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="text-danger"
                                                onClick={() =>
                                                    reportarComentario(
                                                        comentario
                                                    )
                                                }
                                            >
                                                Reportar
                                            </Button>

                                        </div>


                                        <p
                                            className="mt-2"
                                            style={{
                                                whiteSpace:
                                                    'pre-wrap'
                                            }}
                                        >

                                            {
                                                comentario
                                                    .comentario
                                            }

                                        </p>


                                        <div className="d-flex justify-content-between align-items-center">

                                            <small className="text-muted">

                                                {
                                                    comentario
                                                        .fecha_creacion
                                                }

                                            </small>


                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() =>
                                                    responderComentario(
                                                        comentario
                                                    )
                                                }
                                            >
                                                Responder
                                            </Button>

                                        </div>


                                        //respuestas

                                        {
                                            comentario
                                                .respuestas
                                                ?.length > 0 && (

                                                <div className="ms-4 mt-3">

                                                    {
                                                        comentario
                                                            .respuestas
                                                            .map(
                                                                (
                                                                    respuesta
                                                                ) => (

                                                                    <Card
                                                                        key={
                                                                            respuesta.id_comentario
                                                                        }
                                                                        className="mb-2"
                                                                    >

                                                                        <Card.Body>

                                                                            <div className="d-flex justify-content-between">

                                                                                <strong>

                                                                                    {
                                                                                        respuesta
                                                                                            .usuario
                                                                                            ?.nombre
                                                                                        || 'Usuario'
                                                                                    }

                                                                                </strong>

                                                                                <Button
                                                                                    variant="link"
                                                                                    size="sm"
                                                                                    className="text-danger"
                                                                                    onClick={() =>
                                                                                        reportarComentario(
                                                                                            respuesta
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    
                                                                                </Button>

                                                                            </div>


                                                                            <p className="mt-2 mb-1">

                                                                                {
                                                                                    respuesta
                                                                                        .comentario
                                                                                }

                                                                            </p>


                                                                            <small className="text-muted">

                                                                                {
                                                                                    respuesta
                                                                                        .fecha_creacion
                                                                                }

                                                                            </small>

                                                                        </Card.Body>

                                                                    </Card>

                                                                )
                                                            )
                                                    }

                                                </div>

                                            )
                                        }

                                    </Card.Body>

                                </Card>

                            )
                        )

                    )}

                </Card.Body>

            </Card>


            //reportar

            <ReportarModal

                mostrar={mostrarReporte}

                cerrar={() =>
                    setMostrarReporte(false)
                }

                foroId={
                    elementoReporte?.tipo === 'foro'
                        ? elementoReporte.id
                        : null
                }

                comentarioId={
                    elementoReporte?.tipo === 'comentario'
                        ? elementoReporte.id
                        : null
                }

            />

        </Container>

    );

};