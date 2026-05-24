import { Cpu, Shield, Palette, BarChart3, Globe, Code2, Lock, Activity } from "lucide-react";
import { employeeInitials } from "../hooks/useManagerEmployees.js";

const DEPT_META = [
  { icon: Cpu, color: "#3b82f6", glow: "rgba(59,130,246,0.35)" },
  { icon: Shield, color: "#f59e0b", glow: "rgba(245,158,11,0.35)" },
  { icon: Palette, color: "#ec4899", glow: "rgba(236,72,153,0.35)" },
  { icon: BarChart3, color: "#10b981", glow: "rgba(16,185,129,0.35)" },
  { icon: Globe, color: "#8b5cf6", glow: "rgba(139,92,246,0.35)" },
  { icon: Code2, color: "#06b6d4", glow: "rgba(6,182,212,0.35)" },
  { icon: Lock, color: "#f97316", glow: "rgba(249,115,22,0.35)" },
  { icon: Activity, color: "#ef4444", glow: "rgba(239,68,68,0.35)" },
];

export function employeesToTeams(employees) {
  const byDept = {};
  employees.forEach((emp) => {
    const dept = emp.dept || "Genel";
    if (!byDept[dept]) byDept[dept] = [];
    byDept[dept].push({
      name: emp.name,
      role: emp.role || emp.position || "",
      avatar: emp.avatar || employeeInitials(emp.name, emp.email),
    });
  });

  return Object.entries(byDept).map(([department, members], index) => {
    const meta = DEPT_META[index % DEPT_META.length];
    return {
      id: department,
      name: department,
      department,
      icon: meta.icon,
      color: meta.color,
      glow: meta.glow,
      members,
    };
  });
}

export function uniqueDepts(employees) {
  const depts = [...new Set(employees.map((e) => e.dept || "Genel"))];
  return depts.sort((a, b) => a.localeCompare(b, "tr"));
}
