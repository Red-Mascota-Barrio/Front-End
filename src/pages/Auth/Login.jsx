import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { rolDeUsuario } from '../../utils/perfil';

import imagenMascotas from '../../assets/images/auth/perro-login.png';
import logo from '../../assets/images/inicio/logo.png';
import { Icono } from '../../components/common/Icono';
import '../../styles/auth.css';

const CHIPS = [
  ['heart', 'Adopciones'],
  ['clipboard-heart', 'Mascotas'],
  ['calendar-event', 'Eventos'],
  ['chat-left-text', 'Foros'],
];

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [requiresOtp, setRequiresOtp] = useState(false); // Controla si mostramos el campo OTP
  const [errorMsg, setErrorMsg] = useState(() =>
    new URLSearchParams(window.location.search).has('error')
      ? 'Error al iniciar sesión con Google.'
      : null,
  );
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const entrar = (user, token) => {
    const rol = rolDeUsuario(user);
    login(user, token, rol);
    navigate(rol === 1 ? '/admin' : '/', { replace: true });
  };

  // ==========================================
  // ATRAPAR EL TOKEN DE GOOGLE EN LA URL
  // ==========================================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const urlError = params.get('error');

    if (urlError) {
      window.history.replaceState({}, document.title, '/login');
    }

    if (urlToken) {
      const iniciarConGoogle = async () => {
        try {
          setLoading(true);
          const userData = await authService.getProfileConToken(urlToken);
          const user = userData.datos || userData; // Depende de cómo devuelva el backend /api/user
          entrar(user, urlToken);
        } catch {
          setErrorMsg('No se pudo obtener el perfil de Google.');
        } finally {
          setLoading(false);
          window.history.replaceState({}, document.title, '/login');
        }
      };
      iniciarConGoogle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================================
  // LOGIN NORMAL POR CORREO Y CONTRASEÑA
  // ==========================================
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setErrorMsg(null);

      // Payload como lo pide el AuthController de Laravel
      const payload = { correo: data.correo, contrasena: data.password };

      // Si el backend pidió OTP en un intento anterior, lo sumamos al payload
      if (requiresOtp && data.codigo_otp) payload.codigo_otp = data.codigo_otp;

      const response = await authService.login(payload);
      entrar(response.datos.user, response.datos.token);
    } catch (error) {
      console.error('Error en login:', error);
      const status = error.response?.status;
      const mensajeBackend = error.response?.data?.mensaje;

      // Laravel devuelve 403 si la cuenta está inactiva o no verificada
      if (status === 403 && mensajeBackend?.includes('verificada')) {
        setRequiresOtp(true);
        setErrorMsg('Tu cuenta no está verificada. Ingresa el código OTP que enviamos a tu correo.');
      } else {
        setErrorMsg(mensajeBackend || 'Correo o contraseña incorrectos.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="auth-contenedor p-0">
      <Row className="g-0 min-vh-100">
        {/* ========= PANEL VISUAL ========= */}
        <Col lg={6} className="auth-visual d-none d-lg-flex align-items-center justify-content-center">
          <div className="auth-visual-contenido">
            <div className="auth-visual-icono"><img src={logo} alt="" /></div>
            <h2>Bienvenido de vuelta</h2>
            <p>
              Accede a tu comunidad de mascotas. Gestiona tus publicaciones, participa en el foro y
              sigue los eventos de tu barrio.
            </p>
            <div className="d-flex flex-wrap justify-content-center mb-4">
              {CHIPS.map(([icono, texto]) => (
                <span className="chip-beneficio" key={texto}><Icono nombre={icono} /> {texto}</span>
              ))}
            </div>
            <img src={imagenMascotas} alt="Perro feliz" className="auth-visual-img" />
          </div>
        </Col>

        {/* ========= FORMULARIO ========= */}
        <Col lg={6} className="auth-formulario d-flex align-items-center justify-content-center">
          <div className="auth-caja">
            <Link to="/" className="auth-logo">
              <img src={logo} alt="" />
              Red de Mascotas de Barrio
            </Link>

            <h1>Iniciar sesión</h1>
            <p className="auth-subtitulo">Ingresa tus datos para continuar</p>

            {errorMsg && (
              <Alert variant={requiresOtp ? 'warning' : 'danger'} role="alert">
                <Icono nombre={requiresOtp ? 'shield-lock' : 'exclamation-circle'} /> {errorMsg}
              </Alert>
            )}

            <Form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Form.Group className="mb-3" controlId="correo">
                <Form.Label>Correo electrónico</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  autoComplete="username"
                  {...register('correo', { required: 'El correo es obligatorio' })}
                  isInvalid={!!errors.correo}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">{errors.correo?.message}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-2" controlId="password">
                <Form.Label>Contraseña</Form.Label>
                <div className="campo-password">
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Tu contraseña"
                    autoComplete="current-password"
                    {...register('password', { required: 'La contraseña es obligatoria' })}
                    isInvalid={!!errors.password}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="ojo-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <div className="invalid-feedback d-block">{errors.password.message}</div>}
              </Form.Group>

              {/* OTP: solo si la cuenta no está verificada */}
              {requiresOtp && (
                <Form.Group className="mb-3 mt-3" controlId="codigo_otp">
                  <Form.Label>Código de verificación (OTP)</Form.Label>
                  <Form.Control
                    type="text"
                    inputMode="numeric"
                    placeholder="123456"
                    maxLength={6}
                    className="campo-otp"
                    {...register('codigo_otp', { required: 'Ingresa el código para verificar tu cuenta' })}
                    isInvalid={!!errors.codigo_otp}
                    disabled={loading}
                  />
                  <Form.Control.Feedback type="invalid">{errors.codigo_otp?.message}</Form.Control.Feedback>
                </Form.Group>
              )}

              <div className="text-end mb-4">
                <Link to="/recuperar" className="link-sutil">¿Olvidaste tu contraseña?</Link>
              </div>

              <Button type="submit" variant="primary" disabled={loading} className="w-100">
                {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
              </Button>
            </Form>

            <div className="separador">o ingresa con</div>

            <Button
              variant="light"
              className="w-100"
              onClick={() => (window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/redirect`)}
              disabled={loading}
            >
              <FaGoogle className="text-danger" /> Continuar con Google
            </Button>

            <p className="enlace-auth">
              ¿No tienes cuenta? <Link to="/registro">Regístrate gratis</Link>
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};
