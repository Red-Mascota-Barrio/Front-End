import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Spinner, Alert, Badge, Form, Button } from 'react-bootstrap';
import { obtenerForos, crearForo } from '../../services/foroService';
import { CrearHiloModal } from './CrearHiloModal';

export const ForoList = () => {
    const [foros, setForos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [categoria, setCategoria] = useState('');
    const [mostrarModal, setMostrarModal] = useState(false);

    //cargar foros

    useEffect(() => {

        const cargarForos = async () => {
            try {

                setCargando(true);
                setError('');

                const response =
                    await obtenerForos(categoria);

                console.log(
                    'Respuesta del backend:',
                    response
                );

                setForos(
                    response.datos || []
                );

            } catch (error) {

                console.error(error);

                setError(
                    'No se pudieron cargar los foros.'
                );

            } finally {

                setCargando(false);

            }

        };

        cargarForos();

    }, [categoria]);


    //buscar 

    const forosFiltrados = foros.filter((foro) => {

        const textoBusqueda =
            busqueda.toLowerCase();

        const titulo =
            foro.titulo?.toLowerCase() || '';

        const contenido =
            foro.contenido?.toLowerCase() || '';

        return (
            titulo.includes(textoBusqueda) ||
            contenido.includes(textoBusqueda)
        );

    });


    //cargando

    if (cargando) {

        return (

            <Container className="py-5 text-center">

                <Spinner animation="border" />

                <p className="mt-3">
                    Cargando foros...
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

            </Container>

        );

    }


    return (

        <Container className="py-5">

            //este es el encabezado

            <div className="mb-4">

                <h1>
                    Foro Comunitario
                </h1>

                <p className="text-muted">
                    Comparte experiencias, preguntas y
                    consejos con la comunidad.
                </p>

                <Button
                    variant="primary"
                    onClick={() =>
                        setMostrarModal(true)
                    }
                >
                    Crear nuevo hilo
                </Button>

            </div>


            //buscador

            <Form.Group className="mb-4">

                <Form.Label>
                    Buscar
                </Form.Label>

                <Form.Control
                    type="text"
                    placeholder="Buscar un hilo..."
                    value={busqueda}
                    onChange={(e) =>
                        setBusqueda(e.target.value)
                    }
                />

            </Form.Group>


            //filtro

            <Form.Group className="mb-4">

                <Form.Label>
                    Filtrar por categoría
                </Form.Label>

                <Form.Select
                    value={categoria}
                    onChange={(e) =>
                        setCategoria(e.target.value)
                    }
                >

                    <option value="">
                        Todas las categorías
                    </option>

                    <option value="Perros">
                        Perros
                    </option>

                    <option value="Gatos">
                        Gatos
                    </option>

                </Form.Select>

            </Form.Group>


            //listado

            {foros.length === 0 ? (

                <Alert variant="info">
                    No hay hilos disponibles.
                </Alert>

            ) : forosFiltrados.length === 0 ? (

                <Alert variant="warning">
                    No se encontraron hilos que
                    coincidan con la búsqueda.
                </Alert>

            ) : (

                forosFiltrados.map((foro) => (

                    <Card
                        key={foro.id_foro}
                        className="mb-3 shadow-sm"
                    >

                        <Card.Body>

                            <div className="d-flex justify-content-between align-items-start">

                                <h3 className="mb-2">

                                    <Link
                                        to={`/foro/${foro.id_foro}`}
                                        className="text-decoration-none"
                                    >
                                        {foro.titulo}
                                    </Link>

                                </h3>


                                {foro.estado && (

                                    <Badge bg="success">

                                        {foro.estado}

                                    </Badge>

                                )}

                            </div>


                            <p className="mb-3">

                                {foro.contenido}

                            </p>


                            <div className="mb-3">

                                <Badge bg="secondary">

                                    {
                                        foro.categoriaForo
                                            ?.nombre_categoria
                                        || 'Sin categoría'
                                    }

                                </Badge>

                            </div>


                            <div className="d-flex gap-3 text-muted">

                                <small>

                                    {' '}

                                    {
                                        foro.usuario?.nombre || 'Usuario'
                                    }

                                </small>


                                <small>

                                    {' '}

                                    {
                                        foro.numero_comentarios || 0
                                    }

                                    {' '}
                                    respuestas

                                </small>


                                <small>

                                    {' '}

                                    {foro.fecha_creacion}

                                </small>

                            </div>

                        </Card.Body>

                    </Card>

                ))

            )}


            //crear hilo

            <CrearHiloModal

                mostrar={mostrarModal}

                cerrar={() =>
                    setMostrarModal(false)
                }

                alCrear={async (nuevoHilo) => {

                    try {

                        console.log(
                            'Enviando hilo al backend:',
                            nuevoHilo
                        );

                        const response =
                            await crearForo(
                                nuevoHilo
                            );

                        console.log(
                            'Respuesta del backend:',
                            response
                        );

                        setMostrarModal(false);


                        const respuestaForos =
                            await obtenerForos(
                                categoria
                            );

                        setForos(
                            respuestaForos.datos || []
                        );

                    } catch (error) {

                        console.error(
                            'Error al crear el hilo:',
                            error
                        );

                    }

                }}

            />

        </Container>

    );

};