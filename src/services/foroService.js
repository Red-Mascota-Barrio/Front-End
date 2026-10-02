import { api } from './api';

// Obtener todos los foros
export const obtenerForos = async (categoria = '') => {
    const response = await api.get('/foros', {
        params: categoria ? { categoria } : {}
    });

    return response.data;
};


// Obtener un foro por ID
export const obtenerForo = async (id) => {
    const response = await api.get(`/foros/${id}`);

    return response.data;
};


// Crear un nuevo foro
export const crearForo = async (datos) => {
    const response = await api.post('/foros', datos);

    return response.data;
};


// Crear comentario
export const crearComentario = async (datos) => {
    const response = await api.post('/comentarios', datos);

    return response.data;
};


// Crear reporte
export const crearReporte = async (datos) => {
    const response = await api.post('/reportes', datos);

    return response.data;
};