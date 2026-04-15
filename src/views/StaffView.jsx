import { money } from "../utils/formatters";

export default function StaffView({
  staffUsers,
  staffMeta,
  staffCompanyOptions,
  staffCompanyFilter,
  availableStaffLocations,
  staffForm,
  editingStaffId,
  staffMessage,
  staffError,
  staffLoading,
  staffSaving,
  onStaffCompanyFilterChange,
  onStartEdit,
  onDelete,
  onReset,
  onFormChange,
  onSubmit,
}) {
  return (
    <section className="workspace-grid">
      <section className="section-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Staff users</p>
            <h3>Listado por compania</h3>
          </div>
          <span className="section-note">{staffLoading ? "Cargando staff..." : `${staffUsers.length} usuarios visibles`}</span>
        </div>
        <div className="filters-row">
          <label>
            Compania
            <select value={staffCompanyFilter} onChange={(event) => onStaffCompanyFilterChange(event.target.value)}>
              {staffCompanyOptions.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
        </div>
        {staffError ? <p className="staff-message">{staffError}</p> : null}
        <div className="staff-list">
          {staffUsers.map((staff) => (
            <article key={staff.id} className="staff-row">
              <div className="staff-main">
                <div>
                  <p className="reservation-id">{staff.id}</p>
                  <h4>{staff.fullName}</h4>
                </div>
                <span className={`status-badge ${staff.isActive ? "activa" : "riesgo"}`}>{staff.isActive ? "activo" : "inactivo"}</span>
              </div>
              <p className="staff-copy">{staff.company} - {staff.location || "Sin sede"} - {staff.roleLabel || staff.role}</p>
              <div className="reservation-meta">
                <span>{staff.email}</span>
                <span>{staff.phone || "Sin telefono"}</span>
                <span>{money.format(Number(staff.hourlyRate || 0))}/hora</span>
                <span>{staff.commissionPct}% comision</span>
              </div>
              <div className="staff-actions">
                <button type="button" className="ghost-button" onClick={() => onStartEdit(staff)} disabled={staffSaving}>Editar</button>
                <button type="button" className="ghost-button" onClick={() => onDelete(staff.id)} disabled={staffSaving}>Desactivar</button>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="section-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Formulario</p>
            <h3>{editingStaffId ? "Editar staff_user" : "Nuevo staff_user"}</h3>
          </div>
          <button type="button" className="ghost-button" onClick={onReset}>Limpiar</button>
        </div>
        <form className="staff-form" onSubmit={onSubmit}>
          <label>
            Compania
            <select value={staffForm.companyId} onChange={(event) => onFormChange("companyId", event.target.value)}>
              {staffMeta.companies.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
          <label>
            Sede
            <select value={staffForm.locationId} onChange={(event) => onFormChange("locationId", event.target.value)}>
              <option value="">Sin sede</option>
              {availableStaffLocations.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
          <label>
            Nombre completo
            <input value={staffForm.fullName} onChange={(event) => onFormChange("fullName", event.target.value)} placeholder="Nombre del usuario interno" />
          </label>
          <label>
            Correo
            <input type="email" value={staffForm.email} onChange={(event) => onFormChange("email", event.target.value)} placeholder="correo@empresa.com" />
          </label>
          <label>
            Telefono
            <input value={staffForm.phone} onChange={(event) => onFormChange("phone", event.target.value)} placeholder="3001234567" />
          </label>
          <label>
            Rol
            <select value={staffForm.role} onChange={(event) => onFormChange("role", event.target.value)}>
              {staffMeta.roles.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
          <label>
            Tarifa por hora
            <input value={staffForm.hourlyRate} onChange={(event) => onFormChange("hourlyRate", event.target.value)} placeholder="25000" />
          </label>
          <label>
            Comision %
            <input value={staffForm.commissionPct} onChange={(event) => onFormChange("commissionPct", event.target.value)} placeholder="2.5" />
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={staffForm.isActive} onChange={(event) => onFormChange("isActive", event.target.checked)} />
            Usuario activo
          </label>
          {staffMessage ? <p className="staff-message">{staffMessage}</p> : null}
          <button type="submit" className="primary-button" disabled={staffSaving || staffLoading}>
            {staffSaving ? "Guardando..." : editingStaffId ? "Guardar cambios" : "Crear usuario"}
          </button>
        </form>
      </section>
    </section>
  );
}
