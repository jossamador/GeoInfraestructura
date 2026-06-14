import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export const AuthPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo autenticar");
    }
  };

  return (
    <main className="auth-screen shell">
      <section className="auth-card">
        <div>
          <p className="eyebrow">Sistema de reporte georreferenciado</p>
          <h1>GeoLluvias</h1>
          <p>Registro de daños por lluvias, ubicaciones exactas, zonas trazadas y seguimiento de infraestructura.</p>
        </div>

        <form onSubmit={submit} className="auth-form">
          <div className="toggle-row">
            <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Ingresar</button>
            <button type="button" className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Registro</button>
          </div>

          {mode === "register" && (
            <label>
              Nombre
              <input value={name} onChange={event => setName(event.target.value)} placeholder="Ana Torres" />
            </label>
          )}

          <label>
            Correo
            <input value={email} onChange={event => setEmail(event.target.value)} type="email" placeholder="usuario@correo.com" />
          </label>

          <label>
            Contraseña
            <input value={password} onChange={event => setPassword(event.target.value)} type="password" placeholder="********" />
          </label>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="primary">{mode === "login" ? "Entrar" : "Crear cuenta"}</button>
        </form>
      </section>
    </main>
  );
};
