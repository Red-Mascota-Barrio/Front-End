import { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { FaPaw, FaArrowLeft, FaKey, FaEnvelope } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authService } from '../../services/authService';
import '../../assets/auth.css';

export const Recuperar = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  
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

    } catch (error) {
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

      alert("¡Contraseña actualizada con éxito!");
      navigate('/login'); // Lo devolvemos al inicio de sesión

    } catch (error) {
      setErrorMsg(error.response?.data?.mensaje || "Código incorrecto o vencido, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="vh-100 p-0 bg-light d-flex justify-content-center align-items-center">
      <div className="auth-form-container bg-white p-4 p-md-5 rounded-4 shadow-sm" style={{ maxWidth: '450px', width: '100%' }}>
        
        <div className="text-center mb-4 d-flex align-items-center justify-content-center gap-2 text-brand-green">
          <FaPaw size={24} />
          <span className="fw-bold fs-5">Red de Mascotas</span>
        </div>

        {errorMsg && <Alert variant="danger" className="py-2 small text-center">{errorMsg}</Alert>}
        {mensaje && <Alert variant="success" className="py-2 small text-center">{mensaje}</Alert>}

        {/* PASO 1: Ingresar Correo */}
        {step === 1 && (
          <div>
            <div className="text-center mb-4">
              <div className="d-inline-block p-3 rounded-circle bg-light mb-3">
                <FaEnvelope size={24} className="text-brand-green" />
              </div>
              <h4 className="fw-bold">¿Olvidaste tu contraseña?</h4>
              <p className="text-muted small">
                Ingresa el correo electrónico asociado a tu cuenta y te enviaremos un código para restablecerla.
              </p>
            </div>

            <Form onSubmit={handleSubmit(onSubmitCorreo)}>
              <Form.Group className="mb-4" controlId="correoRecuperacion">
                <Form.Label className="small fw-bold text-muted input-label">CORREO ELECTRÓNICO</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  {...register("correo", { required: "El correo es obligatorio" })}
                  isInvalid={!!errors.correo}
                  className="py-2"
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">{errors.correo?.message}</Form.Control.Feedback>
              </Form.Group>

              <Button type="submit" disabled={loading} className="w-100 fw-bold mb-4 py-2 btn-brand-green">
                {loading ? 'Enviando...' : 'Enviar instrucciones'}
              </Button>

              <div className="text-center">
                <Link to="/login" className="text-muted small text-decoration-none d-flex justify-content-center align-items-center gap-2">
                  <FaArrowLeft /> Volver al inicio de sesión
                </Link>
              </div>
            </Form>
          </div>
        )}

        {/* PASO 2: Ingresar Código y Nueva Contraseña */}
        {step === 2 && (
          <div>
            <div className="text-center mb-4">
              <div className="d-inline-block p-3 rounded-circle bg-light mb-3">
                <FaKey size={24} className="text-brand-green" />
              </div>
              <h4 className="fw-bold">Crear nueva contraseña</h4>
              <p className="text-muted small">
                Ingresa el código que recibiste por correo y tu nueva contraseña segura.
              </p>
            </div>

            <Form onSubmit={handleSubmit(onSubmitNuevaClave)}>
              <Form.Group className="mb-3 text-center" controlId="codigoRecuperacion">
                <Form.Label className="small fw-bold text-muted input-label d-block text-start">CÓDIGO DE RECUPERACIÓN</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  {...register("codigo_otp", { required: "Ingresa el código OTP" })}
                  isInvalid={!!errors.codigo_otp}
                  className="py-2 text-center tracking-widest fs-5"
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">{errors.codigo_otp?.message}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-4" controlId="nuevaPassword">
                <Form.Label className="small fw-bold text-muted input-label">NUEVA CONTRASEÑA</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  {...register("password", { 
                    required: "Obligatorio",
                    minLength: { value: 8, message: "Debe tener al menos 8 caracteres" }
                  })}
                  isInvalid={!!errors.password}
                  className="py-2"
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
              </Form.Group>

              <Button type="submit" disabled={loading} className="w-100 fw-bold mb-4 py-2 btn-brand-green">
                {loading ? 'Actualizando...' : 'Restablecer contraseña'}
              </Button>

              <Button variant="link" onClick={() => setStep(1)} className="w-100 text-muted small text-decoration-none">
                <FaArrowLeft className="me-1" /> Volver a pedir código
              </Button>
            </Form>
          </div>
        )}
      </div>
    </Container>
  );
};