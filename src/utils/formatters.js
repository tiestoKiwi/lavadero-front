export const money = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function tone(value) {
  return value.toLowerCase().replaceAll(" ", "-").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function initials(name) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

export function normalizeError(error) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "No fue posible completar la operacion.";
}

export function buildEmptyStaffForm(meta) {
  const firstCompanyId = meta?.companies?.[0]?.id ? String(meta.companies[0].id) : "";
  const firstLocation = meta?.locations?.find((item) => String(item.companyId) === firstCompanyId);

  return {
    companyId: firstCompanyId,
    locationId: firstLocation ? String(firstLocation.id) : "",
    fullName: "",
    email: "",
    phone: "",
    role: "washer",
    hourlyRate: "",
    commissionPct: "",
    isActive: true,
  };
}

export function toLineSeries(data) {
  return (data ?? []).map((item) => [item.label, item.value]);
}

export function toDonutSeries(data) {
  return (data ?? []).map((item) => [item.label, item.value, item.color]);
}
