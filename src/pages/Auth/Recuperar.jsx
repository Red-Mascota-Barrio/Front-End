import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { FaArrowLeft, FaKey, FaEnvelope } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authService } from '../../services/authService';
import { PasswordModal } from '../../components/auth/PasswordModal';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/images/inicio/logo.png';
import { Icono } from '../../components/common/Icono';
import '../../styles/auth.css';

export const Recuperar = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const { token, logout } = useAuth();

  // Al restablecer, el back borra todos los tokens del usuario: si había sesión, se cierra aquí también
  const handleCloseModal = () => {
    setShowPasswordModal(false);
    if (token) logout();
    navigate('/login');
  };

  // Guardamos el correo ingresado en el paso 1 para enviarlo junto con la nueva clave en el paso 2
  const [correoGuardado, setCorreoGuardado] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  // ==========================================
  // PASO 1: Solicitar código al Backend
  // ==========================================
  const onSubmitCorreo = async (data) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      setMensaje(null);

      // Llamada real a tu API de Laravel
      await authService.solicitarRecuperacion(data.correo);

      setCorreoGuardado(data.correo); // Guardamos el correo para el siguiente paso
      setMensaje("Si tu correo está registrado, te hemos enviado un código de 6 dígitos.");
      setStep(2); // Avanzamos a la pantalla de nueva contraseña

    } catch {
      setErrorMsg("Hubo un error de conexión al intentar enviar el código.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // PASO 2: Enviar OTP y nueva contraseña
  // ==========================================
  const onSubmitNuevaClave = async (data) => {
    try {
      setLoading(true);
      setErrorMsg(null);

      // Llamada real enviando correo, OTP y la nueva clave
      await authService.restablecerContrasena({
        correo: correoGuardado,
        codigo_otp: data.codigo_otp,
        password: data.password
      });

      setShowPasswordModal(true);

    } catch (error) {
      setErrorMsg(error.response?.data?.mensaje || "Código incorrecto o vencido, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-centrado">
      <div className="auth-tarjeta">
        <Link to="/" className="auth-logo mb-4">
          <img src={logo} alt="" />
          Red de Mascotas de Barrio
        </Link>

        {errorMsg && <Alert variant="danger" role="alert"><Icono nombre="exclamation-circle" /> {errorMsg}</Alert>}
        {mensaje && <Alert variant="success">{mensaje}</Alert>}

        {/* PASO 1: Ingresar correo */}
        {step === 1 && (
          <>
            <div className="text-center mb-4">
              <div className="icono-circular"><FaEnvelope /></div>
              <h1 className="h3 fw-bold">¿Olvidaste tu contraseña?</h1>
              <p className="auth-subtitulo mb-0">
                Ingresa el correo asociado a tu cuenta y te enviaremos un código para restablecerla.
              </p>
            </div>

            <Form onSubmit={handleSubmit(onSubmitCorreo)} noValidate>
              <Form.Group className="mb-4" controlId="correoRecuperacion">
                <Form.Label>Correo electrónico</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  autoComplete="email"
                  {...register('correo', { required: 'El correo es obligatorio' })}
                  isInvalid={!!errors.correo}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">{errors.correo?.message}</Form.Control.Feedback>
              </Form.Group>

              <Button type="submit" variant="primary" disabled={loading} className="w-100 mb-3">
                {loading ? 'Enviando…' : 'Enviar código'}
              </Button>

              <div className="text-center">
                <Link to="/login" className="link-sutil d-inline-flex align-items-center gap-2">
                  <FaArrowLeft /> Volver al inicio de sesión
                </Link>
              </div>
            </Form>
          </>
        )}

        {/* PASO 2: Código y nueva contraseña */}
        {step === 2 && (
          <>
            <div className="text-center mb-4">
              <div className="icono-circular"><FaKey /></div>
              <h1 className="h3 fw-bold">Crear nueva contraseña</h1>
              <p className="auth-subtitulo mb-0">
                Ingresa el código que recibiste en <strong>{correoGuardado}</strong> y tu nueva contraseña.
              </p>
            </div>

            <Form onSubmit={handleSubmit(onSubmitNuevaClave)} noValidate>
              <Form.Group className="mb-3" controlId="codigoRecuperacion">
                <Form.Label>Código de recuperación</Form.Label>
                <Form.Control
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  maxLength={6}
                  className="campo-otp"
                  {...register('codigo_otp', { required: 'Ingresa el código OTP' })}
                  isInvalid={!!errors.codigo_otp}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">{errors.codigo_otp?.message}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-4" controlId="nuevaPassword">
                <Form.Label>Nueva contraseña</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  {...register('password', {
                    required: 'Obligatorio',
                    minLength: { value: 8, message: 'Debe tener al menos 8 caracteres' },
                  })}
                  isInvalid={!!errors.password}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
              </Form.Group>

              <Button type="submit" variant="primary" disabled={loading} className="w-100 mb-3">
                {loading ? 'Actualizando…' : 'Restablecer contraseña'}
              </Button>

              <div className="text-center">
                <Button variant="link" onClick={() => setStep(1)} className="text-secondary text-decoration-none p-0">
                  <FaArrowLeft /> Volver a pedir código
                </Button>
              </div>
            </Form>
          </>
        )}
      </div>

      {/* Modal de éxito al actualizar la contraseña */}
      <PasswordModal show={showPasswordModal} handleClose={handleCloseModal} />
    </div>
  );
};
