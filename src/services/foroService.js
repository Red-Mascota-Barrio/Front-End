import { api } from "./api";

export const foroService = {
  listar: async () => {
    const respuesta = await api.get("/foros");

    return respuesta.data;
  },

  crear: async (nuevoHilo) => {
    const respuesta = await api.post("/foros", nuevoHilo);

    return respuesta.data;
  }
};