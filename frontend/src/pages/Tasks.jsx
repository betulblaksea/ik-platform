import { useState, useMemo, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useManagerEmployees } from "../hooks/useManagerEmployees.js";
import { useTasks } from "../hooks/useTasks.js";
import { uniqueDepts } from "../utils/employeeTeams.js";
import { formatDuration, PRIORITY_META } from "../utils/taskTime.js";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Circle, Plus, Users, BarChart3,
  Search, X, Flame,
  Filter, Pencil,
  Calendar, AlignLeft, Clock,
} from "lucide-react";
import { Layout } from "../components/Sidebar";
import AiAnalysisNote from "../components/AiAnalysisNote.jsx";
import { useAiInsight } from "../hooks/useAiInsight.js";
import { slimTasksForAi } from "../utils/aiPayload.js";

const AVATAR_PALETTE = ["#60a5fa", "#f472b6", "#34d399", "#a78bfa", "#fbbf24", "#818cf8"];

function avatarColor(avatar) {
  if (!avatar) return AVATAR_PALETTE[0];
  const code = avatar.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return AVATAR_PALETTE[code % AVATAR_PALETTE.length];
}

const STATUS_META = {
  "Done":        { color: "#34d399", icon: CheckCircle2, label: "Tamamlandı" },
  "In Progress": { color: "#818cf8", icon: Flame,        label: "Devam ediyor" },
  "To Do":       { color: "#6b7280", icon: Circle,       label: "Yapılacak" },
};

function TasksAiInsight({ tasks }) {
  const { run, loading, error, insight, setInsight } = useAiInsight();

  const refresh = useCallback(() => {
    if (!tasks.length) return;
    run("tasks", { tasks: slimTasksForAi(tasks) }).catch(() => {});
  }, [run, tasks]);

  useEffect(() => {
    if (!tasks.length) {
      setInsight(null);
      return;
    }
    const timer = setTimeout(refresh, 500);
    return () => clearTimeout(timer);
  }, [refresh, tasks, setInsight]);

  if (!tasks.length) return null;
  return <AiAnalysisNote insight={insight} loading={loading} error={error} />;
}

function StatPill({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="glass-stat flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="glass-stat__label">{label}</span>
        <div className="stat-icon" style={{ "--stat-color": color }}>
          <Icon size={13} />
        </div>
      </div>
      <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
      <span className="glass-stat__sub">{sub}</span>
    </div>
  );
}

function CompleteHoursModal({ onClose, onSubmit, submitting }) {
  const [hours, setHours] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const spent = parseFloat(hours);
    if (!spent || spent <= 0) return;
    await onSubmit(spent);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-backdrop"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="modal-panel"
      >
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-start mb-4 gap-3">
            <div>
              <span className="text-lg font-bold text-white block">Görevi tamamla</span>
              <span className="text-xs page-header__subtitle">Bu iş kaç saat sürdü?</span>
            </div>
            <button type="button" onClick={onClose} className="modal-close-btn">
              <X size={18} />
            </button>
          </div>
          <div className="mb-6">
            <label className="field-label">Harcanan süre (saat)</label>
            <input
              autoFocus
              required
              type="number"
              min="0.5"
              step="0.5"
              placeholder="Örn: 4"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="field-input"
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-submit-form">
            {submitting ? "Kaydediliyor…" : "Tamamlandı olarak kaydet"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function TaskCard({ task, index, canChangeStatus, canEditMeta, onUpdate, onEdit, hideEmployee }) {
  const [completeOpen, setCompleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const status = STATUS_META[task.status] || STATUS_META["To Do"];
  const StatusIcon = status.icon;
  const color = avatarColor(task.avatar);
  const priority = PRIORITY_META[task.priority] || PRIORITY_META.medium;

  const setStatus = async (s) => {
    if (s === "Done" && (!task.spent || task.spent <= 0)) {
      setCompleteOpen(true);
      return;
    }
    await onUpdate?.(task.id, { status: s });
  };

  const completeWithHours = async (spent) => {
    setSaving(true);
    try {
      await onUpdate?.(task.id, { status: "Done", spent });
      setCompleteOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ delay: index * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="task-card--main"
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
      >
        <div
          className="task-card__accent-line"
          style={{ "--status-color": status.color }}
        />

        <div className="flex justify-between items-start mb-3 gap-2">
          <div className="flex gap-2.5 items-start min-w-0 flex-1">
            <div className="task-avatar" style={{ "--avatar-color": color }}>
              {task.avatar}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white leading-snug">{task.title}</p>
              {!hideEmployee ? (
                <p className="text-xs mt-0.5 truncate page-header__subtitle">{task.employee}</p>
              ) : null}
              {task.description ? (
                <p className="text-xs mt-1 line-clamp-2 text-[var(--text-label)]">{task.description}</p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <span className="color-badge" style={{ "--status-color": priority.color }}>
              {priority.label}
            </span>
            <div className="color-badge color-badge--md" style={{ "--status-color": status.color }}>
              <StatusIcon size={10} />
              {status.label}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {task.dueDate ? (
            <span className="task-meta-chip">
              <Calendar size={10} />
              Son: {task.dueDate}
            </span>
          ) : null}
          {task.estimated > 0 ? (
            <span className="task-meta-chip">
              <Clock size={10} />
              Tahmini: {formatDuration(task.estimated)}
            </span>
          ) : null}
          {task.status === "Done" && task.spent > 0 ? (
            <span className="task-meta-chip task-meta-chip--done">
              <CheckCircle2 size={10} />
              {formatDuration(task.spent)} sürdü
            </span>
          ) : null}
        </div>

        {(canChangeStatus && onUpdate) || canEditMeta ? (
          <div className="task-card__footer">
            {canEditMeta ? (
              <button type="button" onClick={() => onEdit?.(task)} className="task-card__edit-btn">
                <Pencil size={12} />
                Düzenle
              </button>
            ) : null}
            {canChangeStatus && onUpdate ? (
              <div className="task-card__status-row">
                {["To Do", "In Progress", "Done"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`status-btn ${task.status === s ? "status-btn--active" : ""}`}
                    style={{ "--status-color": STATUS_META[s].color }}
                  >
                    {STATUS_META[s].label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </motion.div>

      <AnimatePresence>
        {completeOpen ? (
          <CompleteHoursModal
            onClose={() => setCompleteOpen(false)}
            onSubmit={completeWithHours}
            submitting={saving}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}

const INITIAL_FORM = {
  employee: "",
  title: "",
  description: "",
  priority: "medium",
  dueDate: "",
  estimated: "8",
};

function taskToForm(task) {
  return {
    employee: task.employee || "",
    title: task.title || "",
    description: task.description || "",
    priority: task.priority || "medium",
    dueDate: task.dueDate || "",
    estimated: String(task.estimated ?? 8),
  };
}

function TaskFormModal({ mode, team, employees, isEmployee, task, onClose, onSubmit, submitting }) {
  const isEdit = mode === "edit";
  const [form, setForm] = useState(() => (isEdit ? taskToForm(task) : { ...INITIAL_FORM }));
  const up = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title?.trim()) return;
    if (!isEdit && !isEmployee && !form.employee) return;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      dueDate: form.dueDate,
      estimated: parseFloat(form.estimated) || 0,
    };

    if (isEdit) {
      await onSubmit(task.id, payload);
    } else {
      const emp = employees.find((e) => e.name === form.employee);
      await onSubmit({ ...payload, employeeId: emp?.id });
    }
    onClose();
  };

  const title = isEdit
    ? "Görevi düzenle"
    : isEmployee
      ? "Yeni görev ekle"
      : "Ekibe görev ata";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-backdrop"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="modal-panel modal-panel--wide"
      >
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-start mb-6 gap-3">
            <div>
              <span className="text-lg font-bold text-white block">{title}</span>
              <span className="text-xs page-header__subtitle">
                {isEdit ? "Başlık, açıklama ve tahmini süreyi güncelleyin." : isEmployee ? "İşinizi kısaca tanımlayın." : `Departman: ${team}`}
              </span>
            </div>
            <button type="button" onClick={onClose} className="modal-close-btn">
              <X size={18} />
            </button>
          </div>

          {!isEdit && !isEmployee && employees.length > 0 ? (
            <div className="mb-4">
              <label className="field-label">Çalışan *</label>
              <select
                required
                value={form.employee}
                onChange={(e) => up("employee", e.target.value)}
                className="field-input"
              >
                <option value="">Seçin…</option>
                {employees
                  .filter((e) => team === "Tümü" || team === "All" || e.dept === team)
                  .map((e) => (
                    <option key={e.id} value={e.name}>{e.name} — {e.dept}</option>
                  ))}
              </select>
            </div>
          ) : null}

          {isEdit && !isEmployee ? (
            <div className="mb-4">
              <label className="field-label">Atanan</label>
              <p className="text-sm text-[var(--text-label)]">{task.employee}</p>
            </div>
          ) : null}

          <div className="mb-4">
            <label className="field-label">Görev başlığı *</label>
            <input
              required
              type="text"
              placeholder="Örn: Müşteri portalı API entegrasyonu"
              value={form.title}
              onChange={(e) => up("title", e.target.value)}
              className="field-input"
            />
          </div>

          <div className="mb-4">
            <label className="field-label flex items-center gap-1.5">
              <AlignLeft size={11} />
              Açıklama
            </label>
            <textarea
              rows={3}
              placeholder="Ne yapılacak, kabul kriterleri, notlar…"
              value={form.description}
              onChange={(e) => up("description", e.target.value)}
              className="field-input resize-none"
            />
          </div>

          <div className="mb-4">
            <label className="field-label">Öncelik</label>
            <div className="flex gap-2">
              {Object.entries(PRIORITY_META).map(([key, meta]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => up("priority", key)}
                  className={`choice-btn ${form.priority === key ? "choice-btn--active" : ""}`}
                  style={{ "--status-color": meta.color }}
                >
                  {meta.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="field-label flex items-center gap-1.5">
              <Calendar size={11} />
              Hedef bitiş tarihi (isteğe bağlı)
            </label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => up("dueDate", e.target.value)}
              className="field-input"
            />
          </div>

          <div className="mb-6">
            <label className="field-label flex items-center gap-1.5">
              <Clock size={11} />
              Tahmini süre (saat)
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              placeholder="8"
              value={form.estimated}
              onChange={(e) => up("estimated", e.target.value)}
              className="field-input"
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-submit-form">
            {submitting ? "Kaydediliyor…" : isEdit ? "Değişiklikleri kaydet" : "Görevi oluştur"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function TasksPage() {
  const { user } = useAuth();
  const isEmployee = user?.role === "employee";
  const { employees } = useManagerEmployees();
  const { tasks, loading, error, createTask, updateTask } = useTasks();
  const deptList = useMemo(() => uniqueDepts(employees), [employees]);
  const teamTabs = useMemo(() => (isEmployee ? [] : ["Tümü", ...deptList]), [isEmployee, deptList]);

  const [activeTeam, setActiveTeam] = useState("Tümü");
  const [search,     setSearch]     = useState("");
  const [showModal,  setShowModal]  = useState(false);
  const [editTask,   setEditTask]   = useState(null);
  const [modalTeam,  setModalTeam]  = useState("Genel");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (deptList.length && modalTeam === "Genel" && !deptList.includes("Genel")) {
      setModalTeam(deptList[0]);
    }
  }, [deptList, modalTeam]);

  const globalStats = useMemo(() => {
    const active = tasks.filter((t) => t.status === "In Progress").length;
    const done = tasks.filter((t) => t.status === "Done").length;
    const todo = tasks.filter((t) => t.status === "To Do").length;
    return { active, done, todo, total: tasks.length };
  }, [tasks]);

  const filteredTeams = useMemo(() => {
    const match = (t) =>
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.employee || "").toLowerCase().includes(search.toLowerCase());

    if (isEmployee) {
      const mine = tasks.filter(match);
      return mine.length ? [{ team: "Görevlerim", tasks: mine }] : [];
    }

    const teams = activeTeam === "Tümü" ? deptList : [activeTeam];
    return teams
      .map((team) => {
        const teamTasks = tasks.filter((t) => t.team === team).filter(match);
        return { team, tasks: teamTasks };
      })
      .filter((g) => g.tasks.length > 0);
  }, [tasks, activeTeam, search, deptList, isEmployee]);

  const openModal = (team) => { setModalTeam(team); setShowModal(true); };

  const handleCreateTask = async (payload) => {
    setSubmitting(true);
    try {
      await createTask(payload);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTask = async (id, patch) => {
    await updateTask(id, patch);
  };

  const handleEditTask = async (id, patch) => {
    setSubmitting(true);
    try {
      await updateTask(id, patch);
      setEditTask(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <header className="page-header">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white tracking-tight">
            {isEmployee ? "Görevlerim" : "Görev Yönetimi"}
          </h1>
          <p className="page-header__subtitle">
            {isEmployee ? "Görevlerinizi takip edin ve tamamlayın" : "Ekip görevleri ve ilerleme"}
          </p>
        </div>

        <button
          onClick={() => openModal(isEmployee ? "Görevlerim" : (activeTeam === "Tümü" ? (deptList[0] || "Genel") : activeTeam))}
          disabled={!isEmployee && employees.length === 0}
          className="btn-primary"
        >
          <Plus size={14} /> {isEmployee ? "Görev ekle" : "Görev ekle"}
        </button>
      </header>

      <div className="page-body space-y-6">
        {error ? <div className="alert-error">{error}</div> : null}

        {loading ? (
          <p className="text-sm text-gray-500">Görevler yükleniyor…</p>
        ) : null}

        {!isEmployee && !loading && tasks.length > 0 ? <TasksAiInsight tasks={tasks} /> : null}

        <motion.div
          className="grid grid-cols-2 lg:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <StatPill label="Toplam görev" value={globalStats.total} sub={`${globalStats.todo} bekleyen`} icon={BarChart3} color="#818cf8" />
          <StatPill label="Devam eden" value={globalStats.active} sub={isEmployee ? "aktif işleriniz" : "tüm ekip"} icon={Flame} color="#f472b6" />
          <StatPill label="Tamamlanan" value={globalStats.done} sub="bu dönem" icon={CheckCircle2} color="#34d399" />
        </motion.div>

        <motion.div
          className="flex gap-3 items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          {!isEmployee && teamTabs.length > 0 ? (
            <div className="filter-tabs">
              {teamTabs.map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTeam(t)}
                  className={`filter-tab ${activeTeam === t ? "filter-tab--active" : ""}`}
                >
                  {t}
                </button>
              ))}
            </div>
          ) : null}

          <div className="flex-1 relative">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={isEmployee ? "Görevlerde ara…" : "Görev veya çalışan ara…"}
              className="search-field"
            />
          </div>

          <div className="filter-chip">
            <Filter size={11} />
            {isEmployee ? "Görevlerim" : activeTeam === "Tümü" ? "Tüm ekip" : activeTeam}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTeam}
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {filteredTeams.map(({ team, tasks: tTasks }) => (
              <motion.div
                key={team}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="team-section"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Users size={14} className="text-[var(--text-dim)]" />
                    <span className="text-sm font-bold text-white tracking-tight">{team}</span>
                    <span className="team-section__count">{tTasks.length} görev</span>
                  </div>
                </div>

                <div className="team-section__divider" />

                <div className="task-grid">
                  <AnimatePresence>
                    {tTasks.map((task, i) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        index={i}
                        canChangeStatus={task.employeeId === user?.id}
                        canEditMeta={task.createdById === user?.id}
                        hideEmployee={isEmployee}
                        onUpdate={handleUpdateTask}
                        onEdit={setEditTask}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {!isEmployee && employees.length === 0 && !loading && (
          <div className="py-16 empty-state">
            <Users size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Görev atamak için önce Panel üzerinden personel ekleyin.</p>
          </div>
        )}

        {!loading && (isEmployee || employees.length > 0) && filteredTeams.length === 0 && (
          <div className="py-16 empty-state">
            <BarChart3 size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aramanızla eşleşen görev yok. Yeni görev ekleyebilirsiniz.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal ? (
          <TaskFormModal
            mode="create"
            team={modalTeam}
            employees={employees}
            isEmployee={isEmployee}
            submitting={submitting}
            onClose={() => setShowModal(false)}
            onSubmit={handleCreateTask}
          />
        ) : null}
        {editTask ? (
          <TaskFormModal
            mode="edit"
            task={editTask}
            team={editTask.team}
            employees={employees}
            isEmployee={isEmployee}
            submitting={submitting}
            onClose={() => setEditTask(null)}
            onSubmit={handleEditTask}
          />
        ) : null}
      </AnimatePresence>
    </Layout>
  );
}
