import { useState } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, Alert, Card } from 'react-bootstrap';
import { FaShieldAlt, FaEye, FaEyeSlash, FaUserShield, FaWrench, FaKey, FaExclamationTriangle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import '../../assets/auth.css';

export const LoginAdmin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    console.log("Datos admin enviados:", data);
  };

  return (
    <Container fluid className="vh-100 p-0">
      <Row className="h-100 m-0">
        
        {/* Lado Izquierdo: Información Admin (Azul) */}
        <Col md={6} className="d-none d-md-flex flex-column justify-content-center align-items-center text-white bg-admin-blue">
          <div className="text-center px-4 auth-panel-info">
            <div className="mb-4 d-inline-block p-3 rounded-4 bg-white bg-opacity-10">
              <FaShieldAlt size={50} className="text-info" />
            </div>
            
            <h2 className="fw-bold mb-3">Panel Administrativo</h2>
            <p className="mb-4 text-light opacity-75">
              Acceso restringido al equipo de moderación y administración de la plataforma.
            </p>
            
            <Card className="bg-transparent border-light admin-card-border text-start text-white shadow-none">
              <Card.Header className="bg-transparent border-bottom border-light admin-card-border small fw-bold text-uppercase opacity-75">
                Acceso habilitado para
              </Card.Header>
              <Card.Body className="d-flex flex-column gap-3">
                <div className="d-flex align-items-center gap-3">
                  <FaShieldAlt className="text-info" /> <span>Administradores del sistema</span>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <FaUserShield className="text-info" /> <span>Moderadores de contenido</span>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <FaWrench className="text-info" /> <span>Equipo técnico</span>
                </div>
              </Card.Body>
            </Card>

            <p className="mt-5 small text-light opacity-50">
              Este acceso es monitoreado y registrado.<br/>Uso no autorizado está prohibido.
            </p>
          </div>
        </Col>

        {/* Lado Derecho: Formulario */}
        <Col md={6} xs={12} className="d-flex flex-column justify-content-center align-items-center bg-white p-4 p-md-5">
          <div className="auth-form-container">
            
            <div className="mb-4 d-flex align-items-center gap-2">
              <FaShieldAlt className="text-primary" size={24} />
              <span className="fw-bold text-primary">Red de Mascotas · Admin</span>
            </div>

            <h3 className="fw-bold mb-1">Acceso administrativo</h3>
            <p className="text-muted mb-4 small">Solo para personal autorizado de la plataforma</p>

            <Alert variant="warning" className="d-flex align-items-start gap-2 py-2 small border-0 bg-warning bg-opacity-15">
              <FaExclamationTriangle className="text-warning mt-1" />
              <div>
                Si no eres parte del equipo de administración, <Link to="/login" className="alert-link text-warning text-decoration-underline">inicia sesión como usuario aquí</Link>.
              </div>
            </Alert>

            <Form onSubmit={handleSubmit(onSubmit)}>
              <Form.Group className="mb-3" controlId="usuarioAdmin">
                <Form.Label className="small fw-bold text-muted input-label">USUARIO ADMINISTRADOR</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="admin@redmascotas.com"
                  {...register("email", { required: "El correo es obligatorio" })}
                  isInvalid={!!errors.email}
                  className="py-2"
                />
                <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="passwordAdmin">
                <Form.Label className="small fw-bold text-muted input-label">CONTRASEÑA</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password", { required: "La contraseña es obligatoria" })}
                    isInvalid={!!errors.password}
                    className="py-2 border-end-0"
                  />
                  <InputGroup.Text onClick={() => setShowPassword(!showPassword)} className="bg-white border-start-0 text-muted cursor-pointer">
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </InputGroup.Text>
                  <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-4" controlId="codigoAcceso">
                <Form.Label className="small fw-bold text-muted input-label">CÓDIGO DE ACCESO</Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-white border-end-0 text-muted">
                    <FaKey />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Código de 6 dígitos"
                    maxLength={6}
                    {...register("codigo", { 
                      required: "El código es obligatorio",
                      pattern: { value: /^[0-9]{6}$/, message: "Debe ser un código numérico de 6 dígitos" }
                    })}
                    isInvalid={!!errors.codigo}
                    className="py-2 border-start-0 ps-0"
                  />
                  <Form.Control.Feedback type="invalid">{errors.codigo?.message}</Form.Control.Feedback>
                </InputGroup>
                <Form.Text className="text-muted small">
                  El código de acceso es entregado por el equipo técnico.
                </Form.Text>
              </Form.Group>

              <Button type="submit" className="w-100 fw-bold mb-4 py-2 d-flex justify-content-center align-items-center gap-2 btn-admin-blue text-white shadow-sm">
                <FaShieldAlt /> Ingresar al panel
              </Button>

              <div className="text-center mb-4">
                <Link to="/login" className="text-muted small text-decoration-none">
                  ← Volver al inicio de sesión normal
                </Link>
              </div>

              <div className="text-center small text-muted">
                ¿Problemas de acceso? Contacta al equipo técnico:<br/>
                <a href="mailto:soporte@redmascotas.com" className="fw-bold text-decoration-none text-brand-green">soporte@redmascotas.com</a>
              </div>
            </Form>
          </div>
        </Col>

      </Row>
    </Container>
  );
};