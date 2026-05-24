function deptAttendance(checkIns, dept) {
  const rows = checkIns.filter((c) => c.dept === dept);
  if (!rows.length) return { rate: 85, avgDelay: 0, sample: 0 };
  const onTime = rows.filter((c) => !c.delta && c.delta !== undefined).length;
  const late = rows.filter((c) => (c.delta || 0) > 0);
  const avgDelay = late.length
    ? Math.round(late.reduce((s, c) => s + c.delta, 0) / late.length)
    : 0;
  return {
    rate: Math.round((onTime / rows.length) * 100),
    avgDelay,
    sample: rows.length,
  };
}

function teamEfficiency(tasks) {
  const scored = tasks.filter((t) => {
    if (t.status === "To Do" || !t.spent || !t.estimated) return false;
    return true;
  });
  if (!scored.length) return null;
  const avg = scored.reduce((s, t) => s + Math.round((t.estimated / t.spent) * 100), 0) / scored.length;
  return Math.round(avg);
}

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
  const teamSnapshots = depts.map((dept) => {
    const teamTasks = tasks.filter((t) => t.team === dept);
    const eff = teamEfficiency(teamTasks);
    const active = teamTasks.filter((t) => t.status === "In Progress").length;
    const total = teamTasks.length;
    const loadPct = total ? Math.round((active / total) * 100) : 0;
    const att = deptAttendance(checkIns, dept);
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

  const taskSummary = {
    total: tasks.length,
    inProgress: tasks.filter((t) => t.status === "In Progress").length,
    done: tasks.filter((t) => t.status === "Done").length,
    byTeam: teamSnapshots.map((t) => ({
      dept: t.dept,
      count: tasks.filter((x) => x.team === t.dept).length,
      efficiency: t.efficiency,
    })),
  };

  const checkInSummary = {
    total: checkIns.length,
    lateCount: checkIns.filter((c) => (c.delta || 0) > 0).length,
    categories: checkIns.reduce((acc, c) => {
      const k = c.category || "ontime";
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {}),
  };

  return {
    goalText,
    horizonMonths,
    newProjectCount,
    focus,
    monthlyBudgetTry,
    teamSnapshots,
    taskSummary,
    checkInSummary,
    employeeCount: employees.length,
  };
}

export function summarizeCheckInsForAi(checkIns) {
  const byDept = {};
  checkIns.forEach((c) => {
    const d = c.dept || "Genel";
    if (!byDept[d]) byDept[d] = { count: 0, late: 0, arrivals: [], categories: {} };
    byDept[d].count++;
    if ((c.delta || 0) > 0) byDept[d].late++;
    if (c.arrival) byDept[d].arrivals.push(c.arrival);
    const cat = c.category || "ontime";
    byDept[d].categories[cat] = (byDept[d].categories[cat] || 0) + 1;
  });

  return {
    totalRecords: checkIns.length,
    byDept,
    recentSample: checkIns.slice(0, 40).map((c) => ({
      date: c.date,
      dept: c.dept,
      name: c.name,
      arrival: c.arrival,
      departure: c.departure,
      delta: c.delta,
      category: c.category,
      expectedArrival: c.expectedArrival,
      commuteMethod: c.commuteMethod,
      workMode: c.workMode,
      note: c.note,
      daySummary: c.daySummary,
      energyLevel: c.energyLevel,
    })),
  };
}

const TASK_STATUS_TR = {
  "To Do": "Yapılacak",
  "In Progress": "Devam ediyor",
  Done: "Tamamlandı",
};

export function workforcePayloadForAi(context) {
  return {
    hedef: context.goalText,
    sureAy: context.horizonMonths,
    yeniProjeSayisi: context.newProjectCount,
    odak: context.focus,
    aylikButceTry: context.monthlyBudgetTry,
    calisanSayisi: context.employeeCount,
    ekipler: context.teamSnapshots.map((t) => ({
      departman: t.dept,
      kisiSayisi: t.headcount,
      verimlilikYuzde: t.efficiency,
      yukYuzde: t.loadPct,
      aktifGorev: t.activeTasks,
      toplamGorev: t.totalTasks,
      devamOraniYuzde: t.attendanceRate,
      ortalamaGecikmeDk: t.avgDelay,
      kapasiteIndeksi: t.capacityIndex,
    })),
    gorevOzeti: {
      toplam: context.taskSummary.total,
      devamEden: context.taskSummary.inProgress,
      tamamlanan: context.taskSummary.done,
      departmanlaraGore: context.taskSummary.byTeam.map((x) => ({
        departman: x.dept,
        gorevSayisi: x.count,
        verimlilikYuzde: x.efficiency,
      })),
    },
    girisKayitlariOzeti: {
      toplam: context.checkInSummary.total,
      gecKalan: context.checkInSummary.lateCount,
      kategoriler: context.checkInSummary.categories,
    },
  };
}

export function summarizeCheckInsForAiTr(checkIns) {
  const raw = summarizeCheckInsForAi(checkIns);
  const byDept = {};
  Object.entries(raw.byDept || {}).forEach(([dept, v]) => {
    byDept[dept] = {
      kayitSayisi: v.count,
      gecKalan: v.late,
      kategoriler: v.categories,
    };
  });
  return {
    toplamKayit: raw.totalRecords,
    departmanlaraGore: byDept,
    ornekKayitlar: (raw.recentSample || []).map((c) => ({
      tarih: c.date,
      departman: c.dept,
      ad: c.name,
      giris: c.arrival,
      cikis: c.departure,
      gecikmeDk: c.delta,
      kategori: c.category,
      beklenenGiris: c.expectedArrival,
      ulasim: c.commuteMethod,
      calismaModu: c.workMode,
      not: c.note,
      gunOzeti: c.daySummary,
      enerji: c.energyLevel,
    })),
  };
}

export function summarizeTasksForAiTr(tasks) {
  const raw = summarizeTasksForAi(tasks);
  const byTeam = {};
  Object.entries(raw.byTeam || {}).forEach(([team, v]) => {
    byTeam[team] = {
      ortalamaVerimlilikYuzde: v.avgEfficiency,
      gorevler: (v.tasks || []).map((t) => ({
        baslik: t.title,
        durum: TASK_STATUS_TR[t.status] || t.status,
        calisan: t.employee,
        tahminiSaat: t.estimated,
        harcananSaat: t.spent,
        oncelik: t.priority,
      })),
    };
  });
  return { toplamGorev: raw.total, departmanlaraGore: byTeam };
}

export function summarizeTasksForAi(tasks) {
  const byTeam = {};
  tasks.forEach((t) => {
    const team = t.team || "Genel";
    if (!byTeam[team]) byTeam[team] = { tasks: [], efficiencies: [] };
    byTeam[team].tasks.push({
      title: t.title,
      status: t.status,
      employee: t.employee,
      estimated: t.estimated,
      spent: t.spent,
      priority: t.priority,
    });
    if (t.status !== "To Do" && t.spent && t.estimated) {
      byTeam[team].efficiencies.push(Math.round((t.estimated / t.spent) * 100));
    }
  });

  Object.keys(byTeam).forEach((team) => {
    const e = byTeam[team].efficiencies;
    byTeam[team].avgEfficiency = e.length ? Math.round(e.reduce((a, b) => a + b, 0) / e.length) : null;
    delete byTeam[team].efficiencies;
  });

  return { total: tasks.length, byTeam };
}
