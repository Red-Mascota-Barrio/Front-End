import { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { TermsModal } from '../../components/auth/TermsModal';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { rolDeUsuario } from '../../utils/perfil';
import logo from '../../assets/images/inicio/logo.png';
import { Icono } from '../../components/common/Icono';
import '../../styles/auth.css';

const PASOS = ['Datos', 'Verificación', 'Listo'];

const BENEFICIOS = [
  ['clipboard-heart', 'Publica a tus mascotas y encuentra familias responsables para adoptarlas.'],
  ['chat-left-text', 'Participa en los foros y resuelve dudas con otros dueños del barrio.'],
  ['calendar-event', 'Inscríbete a jornadas de vacunación, ferias de adopción y talleres.'],
  ['bell', 'Recibe avisos cuando alguien comente o se interese por tus mascotas.'],
];

const Pasos = ({ actual }) => (
  <div className="pasos-registro" aria-label={`Paso ${actual} de ${PASOS.length}`}>
    {PASOS.map((nombre, i) => {
      const n = i + 1;
      const clase = n === actual ? 'activo' : n < actual ? 'hecho' : '';
      return (
        <div key={nombre} className="d-flex align-items-center gap-2">
          {i > 0 && <span className="paso-linea" />}
          <span className={`paso ${clase}`}>
            <span className="paso-num">{n < actual ? <Icono nombre="check-lg" /> : n}</span>
            {nombre}
          </span>
        </div>
      );
    })}
  </div>
);

export const Registro = () => {
  const [step, setStep] = useState(1);
  const [showTerms, setShowTerms] = useState(false);
  const [verClave, setVerClave] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  // Correo y contraseña del paso 1: se reutilizan para verificar el OTP sin volver a pedirlos
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [clave, setClave] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  // PASO 1: Envía los datos a Laravel (/api/register)
  const onSubmitStep1 = async (data) => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const payload = {
        nombre: data.nombre,
        apellido: data.apellido,
        correo: data.correo,
        telefono: data.telefono || '',
        contrasena: data.password,
      };

      await authService.register(payload);

      setRegisteredEmail(data.correo);
      setClave(data.password);
      setStep(2); // La cuenta queda sin verificar: pasamos al OTP
    } catch (error) {
      console.error('Error en registro:', error);
      setErrorMsg(error.response?.data?.mensaje || 'Error al registrarse. Revisa los datos.');
    } finally {
      setLoading(false);
    }
  };

  // PASO 2: Verificación del código OTP (login con correo + contraseña + código)
  const onSubmitStep2 = async (data) => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const response = await authService.login({
        correo: registeredEmail,
        contrasena: clave,
        codigo_otp: data.codigoVerificacion,
      });

      const user = response.datos.user;
      // Se guarda el ID del rol (antes se guardaba el nombre y ProtectedRoute lo rechazaba)
      login(user, response.datos.token, rolDeUsuario(user));
      setClave('');
      setStep(3);
    } catch (error) {
      console.error('Error al verificar código:', error);
      setErrorMsg(error.response?.data?.mensaje || 'Código de verificación incorrecto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="auth-contenedor p-0">
      <Row className="g-0 min-vh-100">
        {/* ========= FORMULARIO ========= */}
        <Col lg={7} className="auth-formulario d-flex align-items-center justify-content-center">
          <div className="auth-caja auth-caja-ancha">
            <Link to="/" className="auth-logo">
              <img src={logo} alt="" />
              Red de Mascotas de Barrio
            </Link>

            <Pasos actual={step} />

            {errorMsg && <Alert variant="danger" role="alert"><Icono nombre="exclamation-circle" /> {errorMsg}</Alert>}

            {/* PASO 1: DATOS BÁSICOS */}
            {step === 1 && (
              <>
                <h1>Crear cuenta</h1>
                <p className="auth-subtitulo">Únete gratis a la comunidad de tu barrio</p>

                <Form onSubmit={handleSubmit(onSubmitStep1)} noValidate>
                  <Row className="g-3 mb-3">
                    <Col sm={6}>
                      <Form.Group controlId="nombre">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control
                          placeholder="Tu nombre"
                          autoComplete="given-name"
                          {...register('nombre', { required: 'El nombre es obligatorio' })}
                          isInvalid={!!errors.nombre}
                        />
                        <Form.Control.Feedback type="invalid">{errors.nombre?.message}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col sm={6}>
                      <Form.Group controlId="apellido">
                        <Form.Label>Apellido</Form.Label>
                        <Form.Control
                          placeholder="Tu apellido"
                          autoComplete="family-name"
                          {...register('apellido', { required: 'El apellido es obligatorio' })}
                          isInvalid={!!errors.apellido}
                        />
                        <Form.Control.Feedback type="invalid">{errors.apellido?.message}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3" controlId="correo">
                    <Form.Label>Correo electrónico</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="tucorreo@gmail.com"
                      autoComplete="email"
                      {...register('correo', {
                        required: 'El correo es obligatorio',
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo no válido' },
                      })}
                      isInvalid={!!errors.correo}
                    />
                    <Form.Control.Feedback type="invalid">{errors.correo?.message}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="telefono">
                    <Form.Label>Teléfono (opcional)</Form.Label>
                    <Form.Control type="tel" placeholder="3001234567" autoComplete="tel" {...register('telefono')} />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="password">
                    <Form.Label>Contraseña</Form.Label>
                    <div className="campo-password">
                      <Form.Control
                        type={verClave ? 'text' : 'password'}
                        placeholder="Mínimo 8 caracteres"
                        autoComplete="new-password"
                        {...register('password', {
                          required: 'La contraseña es obligatoria',
                          minLength: { value: 8, message: 'Debe tener al menos 8 caracteres' },
                        })}
                        isInvalid={!!errors.password}
                      />
                      <button
                        type="button"
                        className="ojo-btn"
                        onClick={() => setVerClave(!verClave)}
                        aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {verClave ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {errors.password && <div className="invalid-feedback d-block">{errors.password.message}</div>}
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="terminos">
                    <Form.Check
                      type="checkbox"
                      isInvalid={!!errors.terminos}
                      {...register('terminos', { required: 'Debes aceptar los términos' })}
                      label={
                        <>
                          Acepto los{' '}
                          <button
                            type="button"
                            className="btn btn-link p-0 align-baseline link-sutil"
                            onClick={() => setShowTerms(true)}
                          >
                            términos y condiciones
                          </button>
                        </>
                      }
                    />
                    {errors.terminos && <div className="invalid-feedback d-block">{errors.terminos.message}</div>}
                  </Form.Group>

                  <Button type="submit" variant="primary" disabled={loading} className="w-100">
                    {loading ? 'Registrando…' : 'Crear cuenta'}
                  </Button>

                  <p className="enlace-auth">
                    ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
                  </p>
                </Form>
              </>
            )}

            {/* PASO 2: VERIFICACIÓN OTP */}
            {step === 2 && (
              <>
                <h1>Verifica tu cuenta</h1>
                <p className="auth-subtitulo">
                  Enviamos un código de 6 dígitos a <strong>{registeredEmail}</strong>. Revisa también la carpeta de spam.
                </p>

                <Form onSubmit={handleSubmit(onSubmitStep2)} noValidate>
                  <Form.Group className="mb-4" controlId="codigoVerificacion">
                    <Form.Label>Código OTP</Form.Label>
                    <Form.Control
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="123456"
                      maxLength={6}
                      className="campo-otp py-3"
                      {...register('codigoVerificacion', { required: 'Ingresa el código OTP' })}
                      isInvalid={!!errors.codigoVerificacion}
                    />
                    <Form.Control.Feedback type="invalid">{errors.codigoVerificacion?.message}</Form.Control.Feedback>
                  </Form.Group>

                  <Button type="submit" variant="primary" disabled={loading} className="w-100 mb-3">
                    {loading ? 'Verificando…' : 'Verificar y acceder'}
                  </Button>

                  <div className="text-center">
                    <Button variant="link" onClick={() => setStep(1)} className="text-secondary text-decoration-none p-0">
                      <FaArrowLeft /> Volver al paso anterior
                    </Button>
                  </div>
                </Form>
              </>
            )}

            {/* PASO 3: ÉXITO */}
            {step === 3 && (
              <div className="text-center py-3">
                <div className="icono-circular"><Icono nombre="check-lg" /></div>
                <h1>¡Cuenta verificada!</h1>
                <p className="auth-subtitulo">Tu correo fue confirmado y tu sesión ya está activa.</p>
                <Button onClick={() => navigate('/perfil')} variant="primary" className="w-100">
                  Ir a mi perfil
                </Button>
              </div>
            )}
          </div>
        </Col>

        {/* ========= PANEL VISUAL (derecha, como en el mockup) ========= */}
        <Col lg={5} className="auth-visual d-none d-lg-flex align-items-center justify-content-center">
          <div className="auth-visual-contenido">
            <div className="auth-visual-icono"><img src={logo} alt="" /></div>
            <h2>Únete a la comunidad</h2>
            <p>Crea tu cuenta y empieza a conectar con las mascotas y vecinos de tu barrio.</p>
            {BENEFICIOS.map(([icono, texto]) => (
              <div className="beneficio" key={texto}>
                <span className="beneficio-icono"><Icono nombre={icono} /></span>
                <span>{texto}</span>
              </div>
            ))}
          </div>
        </Col>
      </Row>

      <TermsModal show={showTerms} handleClose={() => setShowTerms(false)} />
    </Container>
  );
};
