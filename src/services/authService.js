import { api } from './api';

export const authService = {
  // Petición de Login de usuario normal
  login: async (credentials) => {
    const response = await api.post('/login', credentials);
    return response.data; // Debe retornar { token, user, role } según tu API de Laravel
  },

  // Petición de Login de Administrador
  loginAdmin: async (credentials) => {
    const response = await api.post('/admin/login', credentials);
    return response.data;
  },

  // Petición de Registro (Paso 1)
  register: async (userData) => {
    const response = await api.post('/register', userData);
    return response.data;
  },

  // Petición para verificar código (Paso 2 / RF18)
  verifyCode: async (codeData) => {
    const response = await api.post('/verify-code', codeData);
    return response.data;
  },

  // Petición de Logout
  logout: async () => {
    const response = await api.post('/logout');
    return response.data;
  },
  
  // Solicitar código de recuperación
  solicitarRecuperacion: async (correo) => {
    const response = await api.post('/recuperar/solicitar', { correo });
    return response.data;
  },

  // Enviar nueva contraseña
  restablecerContrasena: async (data) => {
    // data debe contener { correo, codigo_otp, password }
    const response = await api.post('/recuperar/restablecer', data);
    return response.data;
  }
};