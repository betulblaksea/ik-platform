export const MANAGER_ROLE = "manager";
export const EMPLOYEE_ROLE = "employee";

/** Portal rolü → kullanıcı arayüzü etiketi */
export function formatPortalRole(role) {
  if (isManagerRole(role)) return "Yönetici";
  if (role === EMPLOYEE_ROLE) return "Çalışan";
  return role || "—";
}

export function isManagerRole(role) {
  return role === MANAGER_ROLE;
}
