import { useEffect, useMemo, useState } from "react";
import { SESSION_KEY, emptyDashboard, emptyStaffForm } from "../constants/app";
import { apiRequest } from "../services/api";
import { buildEmptyStaffForm, normalizeError } from "../utils/formatters";

export function useAdminConsole() {
  const [activeView, setActiveView] = useState("dashboard");
  const [statusFilter, setStatusFilter] = useState("todas");
  const [locationFilter, setLocationFilter] = useState("todas");
  const [search, setSearch] = useState("");
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [demoAccounts, setDemoAccounts] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [reservationMeta, setReservationMeta] = useState({ statusOptions: ["todas"], locationOptions: ["todas"] });
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [locations, setLocations] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const [staffMeta, setStaffMeta] = useState({ companies: [], locations: [], roles: [] });
  const [staffCompanyFilter, setStaffCompanyFilter] = useState("todas");
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [staffForm, setStaffForm] = useState(emptyStaffForm);
  const [staffMessage, setStaffMessage] = useState("");
  const [staffError, setStaffError] = useState("");
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffSaving, setStaffSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [pageLoading, setPageLoading] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [session, setSession] = useState(() => {
    const stored = typeof window === "undefined" ? null : window.localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (session) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(SESSION_KEY);
    }
  }, [session]);

  useEffect(() => {
    let cancelled = false;

    async function loadDemoAccounts() {
      try {
        const response = await apiRequest("/api/admin/demo-accounts");
        if (!cancelled) {
          setDemoAccounts(response.data ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          setLoginError(normalizeError(error));
        }
      }
    }

    loadDemoAccounts();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!session) return;

    let cancelled = false;

    async function loadConsoleData() {
      setPageLoading(true);
      try {
        const [dashboardResponse, customersResponse, servicesResponse, locationsResponse] = await Promise.all([
          apiRequest("/api/dashboard"),
          apiRequest("/api/customers"),
          apiRequest("/api/services"),
          apiRequest("/api/locations"),
        ]);

        if (cancelled) return;

        setDashboard(dashboardResponse ?? emptyDashboard);
        setCustomers(customersResponse.data ?? []);
        setServices(servicesResponse.data ?? []);
        setLocations(locationsResponse.data ?? []);
        setPageError("");
      } catch (error) {
        if (!cancelled) {
          setPageError(normalizeError(error));
        }
      } finally {
        if (!cancelled) {
          setPageLoading(false);
        }
      }
    }

    loadConsoleData();
    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => {
    if (!session) return;

    let cancelled = false;

    async function loadReservations() {
      try {
        const params = new URLSearchParams();
        if (statusFilter !== "todas") params.set("status", statusFilter);
        if (locationFilter !== "todas") params.set("location", locationFilter);
        if (search.trim()) params.set("search", search.trim());
        const query = params.toString() ? `?${params.toString()}` : "";
        const response = await apiRequest(`/api/reservations${query}`);

        if (cancelled) return;

        setReservations(response.data ?? []);
        setReservationMeta(response.filters ?? { statusOptions: ["todas"], locationOptions: ["todas"] });
        setPageError("");
      } catch (error) {
        if (!cancelled) {
          setPageError(normalizeError(error));
        }
      }
    }

    loadReservations();
    return () => {
      cancelled = true;
    };
  }, [session, search, statusFilter, locationFilter]);

  useEffect(() => {
    if (!session) return;

    let cancelled = false;

    async function loadStaffMeta() {
      try {
        const meta = await apiRequest("/api/staff-users/meta/options");
        if (cancelled) return;

        setStaffMeta(meta);
        setStaffForm((current) => (current.companyId ? current : buildEmptyStaffForm(meta)));
      } catch (error) {
        if (!cancelled) {
          setStaffError(normalizeError(error));
        }
      }
    }

    loadStaffMeta();
    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => {
    if (!session) return;

    let cancelled = false;

    async function loadStaffUsers() {
      setStaffLoading(true);
      try {
        const query = staffCompanyFilter !== "todas" ? `?companyId=${staffCompanyFilter}` : "";
        const response = await apiRequest(`/api/staff-users${query}`);

        if (cancelled) return;

        setStaffUsers(response.data ?? []);
        setStaffError("");
      } catch (error) {
        if (!cancelled) {
          setStaffError(normalizeError(error));
        }
      } finally {
        if (!cancelled) {
          setStaffLoading(false);
        }
      }
    }

    loadStaffUsers();
    return () => {
      cancelled = true;
    };
  }, [session, staffCompanyFilter]);

  const sidebarStats = dashboard.sidebarStats;
  const metrics = dashboard.summary;
  const dashboardAlerts = dashboard.alerts;
  const statusOptions = reservationMeta.statusOptions ?? ["todas"];
  const locationOptions = reservationMeta.locationOptions ?? ["todas"];

  const staffCompanyOptions = useMemo(() => {
    return [{ id: "todas", name: "Todas" }, ...staffMeta.companies];
  }, [staffMeta.companies]);

  const availableStaffLocations = useMemo(() => {
    if (!staffForm.companyId) {
      return staffMeta.locations;
    }
    return staffMeta.locations.filter((item) => String(item.companyId) === String(staffForm.companyId));
  }, [staffForm.companyId, staffMeta.locations]);

  function updateCredentials(field, value) {
    setCredentials((current) => ({ ...current, [field]: value }));
    setLoginError("");
  }

  function updateStaffForm(field, value) {
    setStaffForm((current) => {
      if (field === "companyId") {
        const nextLocations = staffMeta.locations.filter((item) => String(item.companyId) === String(value));
        const keepLocation = nextLocations.some((item) => String(item.id) === String(current.locationId));

        return {
          ...current,
          companyId: value,
          locationId: keepLocation ? current.locationId : (nextLocations[0] ? String(nextLocations[0].id) : ""),
        };
      }

      return { ...current, [field]: value };
    });

    setStaffMessage("");
    setStaffError("");
  }

  function quickAccess(account) {
    setCredentials({ email: account.email, password: account.password });
    setLoginError("");
  }

  async function handleLogin(event) {
    event.preventDefault();
    setLoginLoading(true);
    try {
      const response = await apiRequest("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({
          email: credentials.email.trim(),
          password: credentials.password,
        }),
      });

      setSession(response.user);
      setActiveView("dashboard");
      setLoginError("");
    } catch (error) {
      setLoginError(normalizeError(error));
    } finally {
      setLoginLoading(false);
    }
  }

  function resetStaffForm() {
    setEditingStaffId(null);
    setStaffForm(buildEmptyStaffForm(staffMeta));
    setStaffMessage("");
    setStaffError("");
  }

  function startEditStaff(staff) {
    setEditingStaffId(staff.id);
    setStaffForm({
      companyId: String(staff.companyId ?? ""),
      locationId: staff.locationId ? String(staff.locationId) : "",
      fullName: staff.fullName,
      email: staff.email,
      phone: staff.phone ?? "",
      role: staff.role,
      hourlyRate: String(staff.hourlyRate ?? ""),
      commissionPct: String(staff.commissionPct ?? ""),
      isActive: staff.isActive,
    });
    setStaffMessage("");
    setStaffError("");
  }

  async function submitStaffForm(event) {
    event.preventDefault();

    if (!staffForm.companyId || !staffForm.fullName || !staffForm.email || !staffForm.role) {
      setStaffMessage("Completa compania, nombre, correo y rol para guardar.");
      return;
    }

    const payload = {
      companyId: Number(staffForm.companyId),
      locationId: staffForm.locationId ? Number(staffForm.locationId) : null,
      fullName: staffForm.fullName.trim(),
      email: staffForm.email.trim(),
      phone: staffForm.phone.trim(),
      role: staffForm.role,
      hourlyRate: staffForm.hourlyRate === "" ? 0 : Number(staffForm.hourlyRate),
      commissionPct: staffForm.commissionPct === "" ? 0 : Number(staffForm.commissionPct),
      isActive: staffForm.isActive,
    };

    setStaffSaving(true);
    try {
      if (editingStaffId) {
        await apiRequest(`/api/staff-users/${editingStaffId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setStaffMessage("Usuario interno actualizado en base de datos.");
      } else {
        await apiRequest("/api/staff-users", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setStaffMessage("Usuario interno creado en base de datos.");
      }

      setStaffCompanyFilter(String(payload.companyId));
      setEditingStaffId(null);
      setStaffForm(buildEmptyStaffForm(staffMeta));
      const response = await apiRequest(`/api/staff-users?companyId=${payload.companyId}`);
      setStaffUsers(response.data ?? []);
      setStaffError("");
    } catch (error) {
      setStaffError(normalizeError(error));
    } finally {
      setStaffSaving(false);
    }
  }

  async function deleteStaff(id) {
    setStaffSaving(true);
    try {
      await apiRequest(`/api/staff-users/${id}`, { method: "DELETE" });

      if (editingStaffId === id) {
        setEditingStaffId(null);
        setStaffForm(buildEmptyStaffForm(staffMeta));
      }

      const query = staffCompanyFilter !== "todas" ? `?companyId=${staffCompanyFilter}` : "";
      const response = await apiRequest(`/api/staff-users${query}`);
      setStaffUsers(response.data ?? []);
      setStaffMessage("Usuario interno desactivado en base de datos.");
      setStaffError("");
    } catch (error) {
      setStaffError(normalizeError(error));
    } finally {
      setStaffSaving(false);
    }
  }

  return {
    activeView,
    setActiveView,
    statusFilter,
    setStatusFilter,
    locationFilter,
    setLocationFilter,
    search,
    setSearch,
    dashboard,
    dashboardAlerts,
    metrics,
    sidebarStats,
    demoAccounts,
    reservations,
    statusOptions,
    locationOptions,
    customers,
    services,
    locations,
    pageError,
    pageLoading,
    credentials,
    loginError,
    loginLoading,
    updateCredentials,
    quickAccess,
    handleLogin,
    session,
    setSession,
    staff: {
      staffUsers,
      staffMeta,
      staffCompanyOptions,
      staffCompanyFilter,
      setStaffCompanyFilter,
      editingStaffId,
      staffForm,
      staffMessage,
      staffError,
      staffLoading,
      staffSaving,
      availableStaffLocations,
      updateStaffForm,
      resetStaffForm,
      startEditStaff,
      submitStaffForm,
      deleteStaff,
    },
  };
}
