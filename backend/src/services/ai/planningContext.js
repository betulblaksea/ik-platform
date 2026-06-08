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

const TASK_STATUS_TR = {
  "To Do": "Yapılacak",
  "In Progress": "Devam ediyor",
  Done: "Tamamlandı",
};

function summarizeTasksForAi(tasks) {
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

const GECIKME_KATEGORI_TR = {
  traffic: "Trafik",
  health: "Sağlık",
  family: "Aile",
  technical: "Teknik",
  ontime: "Zamanında",
};

function topCategories(categories, limit = 3) {
  return Object.entries(categories || {})
    .filter(([k]) => k !== "ontime")
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([k, n]) => ({ neden: GECIKME_KATEGORI_TR[k] || k, adet: n }));
}

export function summarizeMorningAttendanceForAiTr(checkIns) {
  const dates = checkIns.map((c) => c.date).filter(Boolean).sort();
  const lateRows = checkIns.filter((c) => (c.delta || 0) > 0);
  const delays = lateRows.map((c) => c.delta);
  const onTimeCount = checkIns.length - lateRows.length;

  const gecikmeNedenleri = {};
  checkIns.forEach((c) => {
    const cat = c.category || "ontime";
    const label = GECIKME_KATEGORI_TR[cat] || cat;
    gecikmeNedenleri[label] = (gecikmeNedenleri[label] || 0) + 1;
  });

  const deptStats = {};
  checkIns.forEach((c) => {
    const dept = c.dept || "Genel";
    if (!deptStats[dept]) {
      deptStats[dept] = { gecKalan: 0, gecikmeToplami: 0, gecikmeDegerleri: [], kategoriler: {} };
    }
    const s = deptStats[dept];
    const cat = c.category || "ontime";
    s.kategoriler[cat] = (s.kategoriler[cat] || 0) + 1;
    if ((c.delta || 0) > 0) {
      s.gecKalan += 1;
      s.gecikmeToplami += c.delta;
      s.gecikmeDegerleri.push(c.delta);
    }
  });

  const departmanGecikme = Object.entries(deptStats)
    .map(([departman, s]) => {
      const deptRows = checkIns.filter((c) => (c.dept || "Genel") === departman);
      const deptLate = deptRows.filter((c) => (c.delta || 0) > 0);
      const gecikmeOraniYuzde = deptRows.length
        ? Math.round((deptLate.length / deptRows.length) * 100)
        : 0;
      return {
        departman,
        gecikmeOraniYuzde,
        ortalamaGecikmeDk: deptLate.length
          ? Math.round(s.gecikmeToplami / deptLate.length)
          : 0,
        enYuksekGecikmeDk: s.gecikmeDegerleri.length ? Math.max(...s.gecikmeDegerleri) : 0,
        baskinGecikmeNedenleri: topCategories(s.kategoriler),
      };
    })
    .sort((a, b) => b.gecikmeOraniYuzde - a.gecikmeOraniYuzde);

  const kritikOrnekler = [...lateRows]
    .sort((a, b) => (b.delta || 0) - (a.delta || 0))
    .slice(0, 8)
    .map((c) => ({
      tarih: c.date,
      departman: c.dept,
      ad: c.name,
      giris: c.arrival,
      gecikmeDk: c.delta,
      neden: GECIKME_KATEGORI_TR[c.category] || c.category,
    }));

  const severeCount = lateRows.filter((c) => (c.delta || 0) >= 30).length;

  return {
    donem: {
      baslangic: dates[0] || null,
      bitis: dates[dates.length - 1] || null,
      gunSayisi: new Set(dates).size,
    },
    genelOzet: {
      zamanindaGiris: onTimeCount,
      gecKalanGiris: lateRows.length,
      gecikmeOraniYuzde: checkIns.length
        ? Math.round((lateRows.length / checkIns.length) * 100)
        : 0,
      ortalamaGecikmeDk: delays.length
        ? Math.round(delays.reduce((a, b) => a + b, 0) / delays.length)
        : 0,
      enYuksekGecikmeDk: delays.length ? Math.max(...delays) : 0,
      otuzDakikaUstuGecikme: severeCount,
    },
    gecikmeNedenleriDagilimi: gecikmeNedenleri,
    departmanGecikmeKarsilastirmasi: departmanGecikme,
    kritikOrnekler,
  };
}
