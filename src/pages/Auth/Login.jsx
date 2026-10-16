import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, Badge, Alert } from 'react-bootstrap';
import { FaPaw, FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

// Importamos servicios y contexto
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";

// Importamos la imagen y nuestro CSS
import imagenMascotas from "../../assets/perroFotoInicioSecion.png";
import "../../assets/auth.css";

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [requiresOtp, setRequiresOtp] = useState(false); // Controla si mostramos el campo OTP
  const [errorMsg, setErrorMsg] = useState(() =>
    new URLSearchParams(window.location.search).has("error")
      ? "Error al iniciar sesión con Google."
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

  // ==========================================
  // ATRAPAR EL TOKEN DE GOOGLE EN LA URL
  // ==========================================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    const urlError = params.get("error");

    if (urlError) {
      window.history.replaceState({}, document.title, "/login");
    }

    if (urlToken) {
      const iniciarConGoogle = async () => {
        try {
          setLoading(true);
          // Pedimos los datos del usuario usando la nueva función del servicio
          const userData = await authService.getProfileConToken(urlToken);

          // Ajustamos para leer el rol igual que en el login normal
          const user = userData.datos || userData; // Depende de cómo devuelva tu backend la ruta /api/user
          const userRole = user.rol_id || user.id_rol || user.rol?.id || 2;

          login(user, urlToken, userRole);

          if (Number(userRole) === 1) {
            navigate("/admin", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        } catch {
          setErrorMsg("No se pudo obtener el perfil de Google.");
        } finally {
          setLoading(false);
          window.history.replaceState({}, document.title, "/login");
        }
      };
      iniciarConGoogle();
    }
  }, [login, navigate]);

  // ==========================================
  // LOGIN NORMAL POR CORREO Y CONTRASEÑA
  // ==========================================
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setErrorMsg(null);

      // Preparamos el payload exactamente como lo pide el AuthController de Laravel
      const payload = {
        correo: data.correo,
        contrasena: data.password,
      };

      // Si el backend pidió OTP en un intento anterior, lo sumamos al payload
      if (requiresOtp && data.codigo_otp) {
        payload.codigo_otp = data.codigo_otp;
      }

      const response = await authService.login(payload);

      const userRole =
        response.datos.user.rol_id ||
        response.datos.user.id_rol ||
        response.datos.user.rol?.id ||
        2;

      login(response.datos.user, response.datos.token, userRole);

      if (Number(userRole) === 1) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("Error en login:", error);
      const status = error.response?.status;
      const mensajeBackend = error.response?.data?.mensaje;

      // Laravel devuelve 403 si la cuenta está inactiva o no verificada
      if (status === 403 && mensajeBackend?.includes("verificada")) {
        setRequiresOtp(true);
        setErrorMsg(
          "Tu cuenta no está verificada. Por favor, ingresa el código OTP que enviamos a tu correo.",
        );
      } else {
        setErrorMsg(mensajeBackend || "Correo o contraseña incorrectos.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="vh-100 p-0">
      <Row className="h-100 m-0">
        {/* Lado Izquierdo: Información */}
        <Col
          md={6}
          className="d-none d-md-flex flex-column justify-content-center align-items-center text-white bg-brand-green p-5"
        >
          <div className="text-center px-4" style={{ maxWidth: '500px' }}>
            <div className="bg-white bg-opacity-10 rounded-circle d-inline-flex p-3 mb-4 shadow-sm">
              <FaPaw size={40} className="text-white" />
            </div>

            <h2 className="fw-bold mb-3 display-6">Bienvenido de vuelta</h2>
            <p className="mb-4 opacity-75">
              Accede a tu comunidad de mascotas. Gestiona tus publicaciones,
              participa en el foro y sigue los eventos de tu barrio.
            </p>

            <div className="d-flex justify-content-center gap-2 mb-4 flex-wrap">
              <Badge bg="white" text="success" className="rounded-pill px-3 py-2 fw-medium shadow-sm">
                Adopciones
              </Badge>
              <Badge bg="white" text="success" className="rounded-pill px-3 py-2 fw-medium shadow-sm">
                Mascotas
              </Badge>
              <Badge bg="white" text="success" className="rounded-pill px-3 py-2 fw-medium shadow-sm">
                Eventos
              </Badge>
              <Badge bg="white" text="success" className="rounded-pill px-3 py-2 fw-medium shadow-sm">
                Foros
              </Badge>
            </div>

            <div className="mt-4 overflow-hidden rounded-4 shadow-lg bg-white p-2">
              <img
                src={imagenMascotas}
                alt="Perro y gato"
                className="img-fluid rounded-3 w-100 object-fit-cover"
                style={{ maxHeight: '240px' }}
              />
            </div>
          </div>
        </Col>

        {/* Lado Derecho: Formulario */}
        <Col
          md={6}
          xs={12}
          className="d-flex flex-column justify-content-center align-items-center bg-white p-4 p-md-5"
        >
          <div className="w-100" style={{ maxWidth: '420px' }}>
            <div className="text-center mb-4 d-flex align-items-center justify-content-center gap-2 text-primary">
              <FaPaw className="fs-4" />
              <span className="fw-bold fs-5">Red de Mascotas de Barrio</span>
            </div>

            <h3 className="fw-bold mb-1 text-dark">Iniciar sesión</h3>
            <p className="text-muted mb-4 small">
              Ingresa tus datos para continuar
            </p>

            {errorMsg && (
              <Alert
                variant={requiresOtp ? "warning" : "danger"}
                className="py-2 small rounded-3 shadow-sm mb-4"
              >
                {errorMsg}
              </Alert>
            )}

            <Form onSubmit={handleSubmit(onSubmit)}>
              {/* Input Correo */}
              <Form.Group className="mb-3" controlId="correo">
                <Form.Label className="small fw-bold text-muted">
                  CORREO ELECTRÓNICO
                </Form.Label>
                <Form.Control
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  {...register("correo", {
                    required: "El correo es obligatorio",
                  })}
                  isInvalid={!!errors.correo}
                  className="py-2 shadow-none"
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.correo?.message}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Input Contraseña con Toggle */}
              <Form.Group className="mb-2" controlId="password">
                <Form.Label className="small fw-bold text-muted">
                  CONTRASEÑA
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Tu contraseña"
                    {...register("password", {
                      required: "La contraseña es obligatoria",
                    })}
                    isInvalid={!!errors.password}
                    className="py-2 border-end-0 shadow-none"
                    disabled={loading}
                  />
                  <InputGroup.Text
                    onClick={() => setShowPassword(!showPassword)}
                    className="bg-white border-start-0 text-muted"
                    style={{ cursor: 'pointer' }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </InputGroup.Text>
                </InputGroup>
                {errors.password && (
                  <div className="text-danger small mt-1">
                    {errors.password.message}
                  </div>
                )}
              </Form.Group>

              {/* Input OTP (Se muestra solo si la cuenta no está verificada) */}
              {requiresOtp && (
                <Form.Group className="mb-3 mt-3" controlId="codigo_otp">
                  <Form.Label className="small fw-bold text-warning">
                    CÓDIGO DE VERIFICACIÓN (OTP)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ej. 123456"
                    maxLength={6}
                    {...register("codigo_otp", {
                      required: "Ingresa el código para verificar tu cuenta",
                    })}
                    isInvalid={!!errors.codigo_otp}
                    className="py-2 text-center tracking-widest fs-5 border-warning shadow-none"
                    disabled={loading}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.codigo_otp?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              )}

              <div className="text-end mb-4 mt-2">
                <Link
                  to="/recuperar"
                  className="text-muted small text-decoration-none fw-medium"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <div className="d-grid mb-3">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="rounded-pill py-2 shadow-sm fw-medium"
                >
                  {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                </Button>
              </div>

              {/* ==========================================
                  BOTÓN DE GOOGLE
                  ========================================== */}
              <div className="text-center mb-3">
                <span className="text-muted small">o ingresa con</span>
              </div>

              <div className="d-grid mb-4">
                <Button
                  variant="light"
                  className="rounded-pill py-2 d-flex justify-content-center align-items-center gap-2 border shadow-sm fw-medium text-dark"
                  onClick={() =>
                    (window.location.href =
                      `${import.meta.env.VITE_API_URL}/auth/google/redirect`)
                  }
                  disabled={loading}
                >
                  <FaGoogle className="text-danger" />
                  <span>Continuar con Google</span>
                </Button>
              </div>

              <div className="text-center small">
                <span className="text-muted">¿No tienes cuenta? </span>
                <Link
                  to="/registro"
                  className="text-decoration-none fw-bold text-primary"
                >
                  Regístrate gratis
                </Link>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;