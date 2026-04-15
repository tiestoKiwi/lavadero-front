import AppSidebar from "./components/layout/AppSidebar";
import AppTopbar from "./components/layout/AppTopbar";
import { moduleMeta, navGroups } from "./constants/app";
import { useAdminConsole } from "./hooks/useAdminConsole";
import { money } from "./utils/formatters";
import CatalogView from "./views/CatalogView";
import DashboardView from "./views/DashboardView";
import FinanceView from "./views/FinanceView";
import LoginView from "./views/LoginView";
import ReservationsView from "./views/ReservationsView";
import StaffView from "./views/StaffView";

function renderActiveView(state) {
  switch (state.activeView) {
    case "dashboard":
      return <DashboardView metrics={state.metrics} dashboard={state.dashboard} />;
    case "reservas":
      return (
        <ReservationsView
          reservations={state.reservations}
          search={state.search}
          statusFilter={state.statusFilter}
          locationFilter={state.locationFilter}
          statusOptions={state.statusOptions}
          locationOptions={state.locationOptions}
          onSearchChange={state.setSearch}
          onStatusFilterChange={state.setStatusFilter}
          onLocationFilterChange={state.setLocationFilter}
        />
      );
    case "clientes":
      return <CatalogView items={state.customers} formatter={(item) => money.format(item.lifetimeValue)} />;
    case "servicios":
      return <CatalogView items={state.services} formatter={(item) => money.format(item.price)} />;
    case "staff":
      return (
        <StaffView
          staffUsers={state.staff.staffUsers}
          staffMeta={state.staff.staffMeta}
          staffCompanyOptions={state.staff.staffCompanyOptions}
          staffCompanyFilter={state.staff.staffCompanyFilter}
          availableStaffLocations={state.staff.availableStaffLocations}
          staffForm={state.staff.staffForm}
          editingStaffId={state.staff.editingStaffId}
          staffMessage={state.staff.staffMessage}
          staffError={state.staff.staffError}
          staffLoading={state.staff.staffLoading}
          staffSaving={state.staff.staffSaving}
          onStaffCompanyFilterChange={state.staff.setStaffCompanyFilter}
          onStartEdit={state.staff.startEditStaff}
          onDelete={state.staff.deleteStaff}
          onReset={state.staff.resetStaffForm}
          onFormChange={state.staff.updateStaffForm}
          onSubmit={state.staff.submitStaffForm}
        />
      );
    case "operacion":
      return <CatalogView items={state.locations} />;
    case "finanzas":
      return <FinanceView metrics={state.metrics} dashboardAlerts={state.dashboardAlerts} dashboard={state.dashboard} />;
    default:
      return null;
  }
}

export default function App() {
  const state = useAdminConsole();

  if (!state.session) {
    return (
      <LoginView
        credentials={state.credentials}
        loginError={state.loginError}
        loginLoading={state.loginLoading}
        demoAccounts={state.demoAccounts}
        onCredentialChange={state.updateCredentials}
        onQuickAccess={state.quickAccess}
        onSubmit={state.handleLogin}
      />
    );
  }

  const meta = moduleMeta[state.activeView];

  return (
    <div className="app-shell">
      <AppSidebar
        navGroups={navGroups}
        activeView={state.activeView}
        onViewChange={state.setActiveView}
        session={state.session}
        sidebarStats={state.sidebarStats}
        alerts={state.dashboard.alerts}
        onLogout={() => state.setSession(null)}
      />

      <main className="content-area">
        <AppTopbar meta={meta} />
        {state.pageLoading ? <p className="section-note top-summary">Actualizando informacion operativa...</p> : null}
        {state.pageError ? <p className="staff-message">{state.pageError}</p> : null}
        {renderActiveView(state)}
      </main>
    </div>
  );
}
