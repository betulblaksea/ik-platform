import { teamEfficiency } from "./taskMetrics.js";

export function buildWorkforcePlanningContext({
  goalText = "",
  horizonMonths = 6,
  newProjectCount = 2,
  focus = "mobile",
  monthlyBudgetTry = null,
  tasks = [],
  checkIns = [],
  employees = [],
}) {
  const depts = [...new Set(employees.map((e) => e.dept || "Genel"))];

  function deptAttendance(dept) {
    const rows = checkIns.filter((c) => c.dept === dept);
    if (!rows.length) return { rate: 85, avgDelay: 0, sample: 0 };
    const onTime = rows.filter((c) => !c.delta).length;
    const late = rows.filter((c) => c.delta > 0);
    const avgDelay = late.length
      ? Math.round(late.reduce((s, c) => s + c.delta, 0) / late.length)
      : 0;
    return {
      rate: Math.round((onTime / rows.length) * 100),
      avgDelay,
      sample: rows.length,
    };
  }

  const teamSnapshots = depts.map((dept) => {
    const teamTasks = tasks.filter((t) => t.team === dept);
    const eff = teamEfficiency(teamTasks);
    const active = teamTasks.filter((t) => t.status === "In Progress").length;
    const total = teamTasks.length;
    const loadPct = total ? Math.round((active / total) * 100) : 0;
    const att = deptAttendance(dept);
    const headcount = employees.filter((e) => e.dept === dept).length;
    const capacityIndex = Math.round(
      (eff ?? 75) * 0.55 + att.rate * 0.3 + Math.min(headcount * 12, 100) * 0.15,
    );
    return {
      dept,
      headcount,
      efficiency: eff,
      loadPct,
      activeTasks: active,
      totalTasks: total,
      attendanceRate: att.rate,
      avgDelay: att.avgDelay,
      checkInSamples: att.sample,
      capacityIndex,
    };
  });

  return {
    goalText,
    horizonMonths,
    newProjectCount,
    focus,
    monthlyBudgetTry,
    teamSnapshots,
    employeeCount: employees.length,
    taskCount: tasks.length,
    checkInCount: checkIns.length,
  };
}
