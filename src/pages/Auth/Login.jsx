import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
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

// Logo oficial de Google ("G" de 4 colores), según las pautas de marca de Google Sign-In
const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [requiresOtp, setRequiresOtp] = useState(false); // Controla si mostramos el campo OTP
  const [resendingOtp, setResendingOtp] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hashSplit = window.location.hash.split('?')[1] || '';
    const hashParams = new URLSearchParams(hashSplit);
    const urlError = searchParams.get('error') || hashParams.get('error');
    if (urlError) {
      return urlError === 'google_auth_failed'
        ? 'No se pudo iniciar sesión con Google. Intenta de nuevo o ingresa con tu correo.'
        : urlError === 'account_inactive'
          ? 'Tu cuenta está inactiva. Contacta a un administrador para recuperar el acceso.'
        : 'Error al iniciar sesión con Google.';
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const entrar = (user, token) => {
    const rol = rolDeUsuario(user);
    login(user, token, rol);
    navigate(rol === 1 ? '/admin' : '/', { replace: true });
  };

  const reenviarOtp = async () => {
    const correo = getValues('correo')?.trim();
    if (!correo) {
      setErrorMsg('Escribe tu correo para reenviar el código.');
      return;
    }

    setResendingOtp(true);
    setErrorMsg(null);
    setSuccessMsg('');
    try {
      const respuesta = await authService.reenviarCodigoVerificacion(correo);
      setSuccessMsg(respuesta.mensaje || 'Enviamos un nuevo código de verificación.');
    } catch (error) {
      setErrorMsg(error.response?.data?.mensaje || 'No pudimos reenviar el código. Inténtalo nuevamente.');
    } finally {
      setResendingOtp(false);
    }
  };

  // ==========================================
  // ATRAPAR EL TOKEN DE GOOGLE EN LA URL
  // ==========================================
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hashSplit = window.location.hash.split('?')[1] || '';
    const hashParams = new URLSearchParams(hashSplit);

    const urlToken = searchParams.get('token') || hashParams.get('token');
    const urlError = searchParams.get('error') || hashParams.get('error');

    if (urlError) {
      window.history.replaceState({}, document.title, window.location.pathname + '#/login');
    }

    if (urlToken) {
      const iniciarConGoogle = async () => {
        try {
          setLoading(true);
          const userData = await authService.getProfileConToken(urlToken);
          const user = userData.datos || userData.data || userData;
          entrar(user, urlToken);
        } catch {
          setErrorMsg('No se pudo obtener el perfil de Google.');
        } finally {
          setLoading(false);
          window.history.replaceState({}, document.title, window.location.pathname + '#/login');
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
            {successMsg && <Alert variant="success" role="status">{successMsg}</Alert>}

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
                <>
                  <Form.Group className="mb-2 mt-3" controlId="codigo_otp">
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
                  <div className="text-end mb-3">
                    <Button type="button" variant="link" className="p-0 link-sutil" onClick={reenviarOtp} disabled={loading || resendingOtp}>
                      {resendingOtp ? 'Reenviando…' : 'Reenviar código OTP'}
                    </Button>
                  </div>
                </>
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
              className="w-100 d-inline-flex align-items-center justify-content-center gap-2"
              onClick={() => { const apiUrl = (import.meta.env.VITE_API_URL || 'https://back-end-kks2.onrender.com/api').replace(/\/+$/, ''); const retorno = encodeURIComponent(window.location.href); window.location.href = `${apiUrl}/auth/google/redirect?redirect_to=${retorno}`; }}
              disabled={loading}
            >
              <GoogleLogo /> Continuar con Google
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
