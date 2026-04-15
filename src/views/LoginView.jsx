import { initials } from "../utils/formatters";

export default function LoginView({
  credentials,
  loginError,
  loginLoading,
  demoAccounts,
  onCredentialChange,
  onQuickAccess,
  onSubmit,
}) {
  return (
    <div className="login-shell">
      <section className="login-panel">
        <div className="login-copy">
          <p className="eyebrow">Lavadero Admin</p>
          <h1>Ingreso administrativo de desarrollo conectado al backend.</h1>
          <p>Las cuentas visibles se leen desde la API y validan contra los usuarios activos almacenados en la base de datos.</p>
        </div>
        <form className="login-form" onSubmit={onSubmit}>
          <label>Correo<input type="email" value={credentials.email} onChange={(event) => onCredentialChange("email", event.target.value)} placeholder="admin@lavadero.com" /></label>
          <label>Clave<input type="password" value={credentials.password} onChange={(event) => onCredentialChange("password", event.target.value)} placeholder="Ingresa la clave temporal" /></label>
          {loginError ? <p className="login-error">{loginError}</p> : null}
          <button type="submit" className="primary-button" disabled={loginLoading}>{loginLoading ? "Validando..." : "Ingresar a la consola"}</button>
        </form>
      </section>
      <section className="section-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Accesos de desarrollo</p>
            <h3>Usuarios disponibles desde la base de datos</h3>
          </div>
        </div>
        <div className="login-accounts">
          {demoAccounts.map((item) => (
            <article key={item.id} className="login-account">
              <div className="login-account-top">
                <div className="avatar-chip">{initials(item.name)}</div>
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.role}</p>
                </div>
              </div>
              <span>{item.email}</span>
              <span>{item.password}</span>
              <button type="button" className="ghost-button" onClick={() => onQuickAccess(item)}>Usar este acceso</button>
            </article>
          ))}
          {!demoAccounts.length ? <p className="section-note">Cargando cuentas de desarrollo...</p> : null}
        </div>
      </section>
    </div>
  );
}
