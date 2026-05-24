import { Task } from "../models/Task.js";
import { User } from "../models/User.js";
import { getTeamScope } from "../services/teamScope.js";
import { employeeInitialsFromUser } from "../services/taskFormat.js";

export async function listTasks(req, res) {
  try {
    const scope = await getTeamScope(req);
    if (!scope) return res.status(401).json({ message: "Yetkisiz" });

    const tasks = await Task.find({ employeeId: { $in: scope.employeeIds } })
      .sort({ updatedAt: -1 })
      .populate("employeeId", "name email dept position");

    return res.json({ tasks: tasks.map(formatTask) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Görevler yüklenemedi" });
  }
}

export async function createTask(req, res) {
  try {
    const scope = await getTeamScope(req);
    if (!scope) return res.status(401).json({ message: "Yetkisiz" });

    const {
      title,
      description,
      priority,
      dueDate,
      timeUnit,
      status,
      estimated,
      spent,
      employeeId: bodyEmployeeId,
    } = req.body ?? {};
    if (!title?.trim()) {
      return res.status(400).json({ message: "Görev başlığı zorunludur" });
    }
    const unit = timeUnit === "days" ? "days" : "hours";

    let targetId = scope.user._id;
    if (scope.role === "manager") {
      if (!bodyEmployeeId) {
        return res.status(400).json({ message: "Çalışan seçilmelidir" });
      }
      if (!scope.employeeIds.some((id) => id.toString() === String(bodyEmployeeId))) {
        return res.status(403).json({ message: "Bu çalışan sizin ekibinizde değil" });
      }
      targetId = bodyEmployeeId;
    }

    const employee = await User.findById(targetId);
    if (!employee) return res.status(404).json({ message: "Çalışan bulunamadı" });

    const task = await Task.create({
      employeeId: targetId,
      title: String(title).trim(),
      description: String(description || "").trim(),
      priority: ["low", "medium", "high"].includes(priority) ? priority : "medium",
      dueDate: dueDate ? String(dueDate) : "",
      timeUnit: unit,
      status: status || "To Do",
      estimated: Number(estimated) >= 0 ? Number(estimated) : unit === "hours" ? 8 : 1,
      spent: Number(spent) >= 0 ? Number(spent) : 0,
      team: employee.dept || "Genel",
    });

    await task.populate("employeeId", "name email dept position");
    return res.status(201).json({ task: formatTask(task) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Görev oluşturulamadı" });
  }
}

export async function updateTask(req, res) {
  try {
    const scope = await getTeamScope(req);
    if (!scope) return res.status(401).json({ message: "Yetkisiz" });

    const task = await Task.findById(req.params.id).populate("employeeId", "name email dept position");
    if (!task) return res.status(404).json({ message: "Görev bulunamadı" });

    if (!scope.employeeIds.some((id) => id.toString() === task.employeeId._id.toString())) {
      return res.status(403).json({ message: "Bu göreve erişim yok" });
    }

    const { title, description, priority, dueDate, timeUnit, status, estimated, spent } = req.body ?? {};
    if (title != null) task.title = String(title).trim();
    if (description != null) task.description = String(description).trim();
    if (priority != null && ["low", "medium", "high"].includes(priority)) task.priority = priority;
    if (dueDate != null) task.dueDate = String(dueDate);
    if (timeUnit != null && ["hours", "days"].includes(timeUnit)) task.timeUnit = timeUnit;
    if (status != null) task.status = status;
    if (estimated != null) task.estimated = Number(estimated);
    if (spent != null) task.spent = Number(spent);

    await task.save();
    return res.json({ task: formatTask(task) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Görev güncellenemedi" });
  }
}

export async function deleteTask(req, res) {
  try {
    const scope = await getTeamScope(req);
    if (!scope) return res.status(401).json({ message: "Yetkisiz" });

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Görev bulunamadı" });

    if (!scope.employeeIds.some((id) => id.toString() === task.employeeId.toString())) {
      return res.status(403).json({ message: "Bu göreve erişim yok" });
    }

    await task.deleteOne();
    return res.json({ message: "Görev silindi" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Görev silinemedi" });
  }
}

function formatTask(task) {
  const emp = task.employeeId;
  const name = emp?.name || "Çalışan";
  return {
    id: task._id.toString(),
    employeeId: emp?._id?.toString?.() || task.employeeId?.toString?.(),
    team: task.team,
    employee: name,
    avatar: employeeInitialsFromUser(emp),
    title: task.title,
    description: task.description || "",
    priority: task.priority || "medium",
    dueDate: task.dueDate || "",
    timeUnit: task.timeUnit || "days",
    status: task.status,
    estimated: task.estimated,
    spent: task.spent,
  };
}
