export function slimCheckInsForAi(checkIns) {
  return checkIns.map((c) => ({
    date: c.date,
    dept: c.dept,
    name: c.name,
    arrival: c.arrival,
    departure: c.departure,
    delta: c.delta,
    category: c.category,
    commuteMethod: c.commuteMethod,
    workMode: c.workMode,
  }));
}

export function slimTasksForAi(tasks) {
  return tasks.map((t) => ({
    title: t.title,
    status: t.status,
    team: t.team,
    employee: t.employee,
    estimated: t.estimated,
    spent: t.spent,
    priority: t.priority,
  }));
}

export function slimEmployeesForAi(employees) {
  return employees.map((e) => ({
    id: e.id,
    name: e.name,
    dept: e.dept,
    position: e.role || e.position,
  }));
}
