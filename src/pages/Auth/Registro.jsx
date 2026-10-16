import { useState } from 'react';
import { Container, Row, Col, Form, Button, ProgressBar, Alert } from 'react-bootstrap';
import { FaPaw, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { TermsModal } from '../../components/auth/TermsModal';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth.css';

export const Registro = () => {
  const [step, setStep] = useState(1);
  const [showTerms, setShowTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Guardamos temporalmente el correo para usarlo en la verificación si lo requiere tu flujo
  const [registeredEmail, setRegisteredEmail] = useState('');
  
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  // PASO 1: Envía los datos reales a Laravel (/api/register)
  const onSubmitStep1 = async (data) => {
    try {
      setLoading(true);
      setErrorMsg(null);

      // Ajustamos los campos que exige tu validador de Laravel
      const payload = {
        nombre: data.nombre,
        apellido: data.apellido || 'Usuario', // Por si acaso divides el nombre o pides apellido extra
        correo: data.correo,
        telefono: data.telefono || '',
        contrasena: data.password
      };

      await authService.register(payload);
      
      setRegisteredEmail(data.correo);
      
      // Si el registro fue exitoso, Laravel devuelve datos y token, pero como la cuenta no está verificada, pasamos al paso 2
      setStep(2); 
    } catch (error) {
      console.error("Error en registro:", error);
      setErrorMsg(error.response?.data?.mensaje || "Error al registrarse. Revisa los datos.");
    } finally {
      setLoading(false);
    }
  };

  // PASO 2: Validación del código OTP (si tu flujo requiere mandar el código al login o endpoint de verificación)
  const onSubmitStep2 = async (data) => {
    try {
      setLoading(true);
      setErrorMsg(null);

      // Intentamos hacer login enviando el correo y el código OTP que ingresó
      const response = await authService.login({
        correo: registeredEmail,
        contrasena: data.passwordTemporal || '', // O validamos según tu lógica de verificación
        codigo_otp: data.codigoVerificacion
      });

      // Si el código es correcto, guardamos la sesión y vamos al dashboard
      login(response.datos.user, response.datos.token, response.datos.user.rol?.nombre || 'usuario');
      setStep(3); // Pantalla de éxito
    } catch (error) {
      console.error("Error al verificar código:", error);
      setErrorMsg(error.response?.data?.mensaje || "Código de verificación incorrecto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="vh-100 p-0">
      <Row className="h-100 m-0">
        
        {/* Panel lateral verde */}
        <Col md={5} className="d-none d-md-flex flex-column justify-content-center align-items-center text-white bg-brand-green p-5">
          <div className="text-center px-4" style={{ maxWidth: '400px' }}>
            <div className="bg-white bg-opacity-10 rounded-circle d-inline-flex p-3 mb-4 shadow-sm">
              <FaPaw size={40} className="text-white" />
            </div>
            <h2 className="fw-bold mb-3 display-6">Únete a la comunidad</h2>
            <p className="opacity-75 mb-0">
              Crea tu cuenta para reportar mascotas perdidas, conectar con veterinarias y participar en los foros de tu barrio.
            </p>
          </div>
        </Col>

        {/* Contenedor del formulario por pasos */}
        <Col md={7} xs={12} className="d-flex flex-column justify-content-center align-items-center bg-white p-4 p-md-5">
          <div className="w-100" style={{ maxWidth: '450px' }}>
            
            {/* Barra de progreso */}
            <div className="mb-4">
              <div className="d-flex justify-content-between small text-muted fw-bold mb-2">
                <span>Paso {step} de 3</span>
                <span>{step === 1 ? 'Datos básicos' : step === 2 ? 'Verificación OTP' : '¡Completado!'}</span>
              </div>
              <ProgressBar now={(step / 3) * 100} style={{ height: '6px', backgroundColor: '#e2e8f0' }} variant="success" className="rounded-pill" />
            </div>

            {errorMsg && <Alert variant="danger" className="py-2 small rounded-3 shadow-sm mb-4">{errorMsg}</Alert>}

            {/* PASO 1: DATOS BÁSICOS */}
            {step === 1 && (
              <div>
                <h3 className="fw-bold mb-1 text-dark">Crear cuenta</h3>
                <p className="text-muted mb-4 small">Ingresa tus datos personales para empezar</p>

                <Form onSubmit={handleSubmit(onSubmitStep1)}>
                  <Row className="g-3">
                    <Col sm={6}>
                      <Form.Group controlId="nombre">
                        <Form.Label className="small fw-bold text-muted">NOMBRE</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Tu nombre"
                          {...register("nombre", { required: "Obligatorio" })}
                          isInvalid={!!errors.nombre}
                          className="py-2 shadow-none"
                        />
                        <Form.Control.Feedback type="invalid">{errors.nombre?.message}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col sm={6}>
                      <Form.Group controlId="apellido">
                        <Form.Label className="small fw-bold text-muted">APELLIDO</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Tu apellido"
                          {...register("apellido", { required: "Obligatorio" })}
                          isInvalid={!!errors.apellido}
                          className="py-2 shadow-none"
                        />
                        <Form.Control.Feedback type="invalid">{errors.apellido?.message}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mt-3 mb-3" controlId="correo">
                    <Form.Label className="small fw-bold text-muted">CORREO ELECTRÓNICO</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="tucorreo@gmail.com"
                      {...register("correo", { required: "El correo es obligatorio" })}
                      isInvalid={!!errors.correo}
                      className="py-2 shadow-none"
                    />
                    <Form.Control.Feedback type="invalid">{errors.correo?.message}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="telefono">
                    <Form.Label className="small fw-bold text-muted">TELÉFONO (OPCIONAL)</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="3001234567"
                      {...register("telefono")}
                      className="py-2 shadow-none"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="password">
                    <Form.Label className="small fw-bold text-muted">CONTRASEÑA</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      {...register("password", { 
                        required: "La contraseña es obligatoria",
                        minLength: { value: 8, message: "Debe tener al menos 8 caracteres" }
                      })}
                      isInvalid={!!errors.password}
                      className="py-2 shadow-none"
                    />
                    <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
                  </Form.Group>

                  <div className="mb-4 form-check">
                    <input type="checkbox" className="form-check-input shadow-none" id="terminos" required />
                    <label className="form-check-label small text-muted" htmlFor="terminos">
                      Acepto los <span className="text-primary fw-bold text-decoration-underline" style={{ cursor: 'pointer' }} onClick={() => setShowTerms(true)}>términos y condiciones</span>
                    </label>
                  </div>

                  <div className="d-grid mb-3">
                    <Button type="submit" variant="primary" disabled={loading} className="rounded-pill py-2 shadow-sm fw-medium">
                      {loading ? 'Registrando...' : 'Continuar'}
                    </Button>
                  </div>

                  <div className="text-center small">
                    <span className="text-muted">¿Ya tienes una cuenta? </span>
                    <Link to="/login" className="text-decoration-none fw-bold text-primary">
                      Inicia sesión
                    </Link>
                  </div>
                </Form>
              </div>
            )}

            {/* PASO 2: VERIFICACIÓN OTP */}
            {step === 2 && (
              <div>
                <h3 className="fw-bold mb-1 text-dark">Verifica tu cuenta</h3>
                <p className="text-muted mb-4 small">Revisa tu correo electrónico. Hemos enviado un código OTP de 6 dígitos.</p>

                <Form onSubmit={handleSubmit(onSubmitStep2)}>
                  <Form.Group className="mb-3" controlId="passwordTemporal">
                    <Form.Label className="small fw-bold text-muted">CONFIRMA TU CONTRASEÑA</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Tu contraseña creada"
                      {...register("passwordTemporal", { required: "Necesaria para validar sesión" })}
                      className="py-2 shadow-none"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4 text-center" controlId="codigoVerificacion">
                    <Form.Label className="small fw-bold text-muted d-block text-start">CÓDIGO OTP</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="123456"
                      maxLength={6}
                      className="py-3 text-center fs-3 tracking-widest shadow-none"
                      {...register("codigoVerificacion", { required: "Ingresa el código OTP" })}
                      isInvalid={!!errors.codigoVerificacion}
                    />
                    <Form.Control.Feedback type="invalid">{errors.codigoVerificacion?.message}</Form.Control.Feedback>
                  </Form.Group>

                  <div className="d-grid mb-3">
                    <Button type="submit" variant="primary" disabled={loading} className="rounded-pill py-2 shadow-sm fw-medium">
                      {loading ? 'Verificando...' : 'Verificar y Acceder'}
                    </Button>
                  </div>

                  <div className="text-center">
                    <Button variant="link" onClick={() => setStep(1)} className="text-muted small text-decoration-none p-0 fw-medium d-inline-flex align-items-center gap-1">
                      <FaArrowLeft /> Volver al paso anterior
                    </Button>
                  </div>
                </Form>
              </div>
            )}

            {/* PASO 3: LISTO / ÉXITO */}
            {step === 3 && (
              <div className="text-center py-4">
                <div className="d-inline-flex p-3 bg-success bg-opacity-10 text-success rounded-circle mb-3">
                  <FaCheckCircle size={50} />
                </div>
                <h3 className="fw-bold mb-2 text-dark">¡Cuenta verificada!</h3>
                <p className="text-muted mb-4 small">
                  Tu correo ha sido confirmado exitosamente y tu sesión está activa.
                </p>

                <div className="d-grid">
                  <Button onClick={() => navigate('/perfil')} variant="primary" className="rounded-pill py-2 shadow-sm fw-medium">
                    Ir al panel principal
                  </Button>
                </div>
              </div>
            )}

          </div>
        </Col>

      </Row>

      <TermsModal show={showTerms} handleClose={() => setShowTerms(false)} />
    </Container>
  );
};

export default Registro;