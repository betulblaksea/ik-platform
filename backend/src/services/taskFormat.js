export function employeeInitialsFromUser(user) {
  const name = (user?.name || "").trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  const email = (user?.email || "").trim();
  return email ? email.slice(0, 2).toUpperCase() : "??";
}
