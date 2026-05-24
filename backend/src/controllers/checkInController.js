import { CheckIn } from "../models/CheckIn.js";
import { getTeamScope } from "../services/teamScope.js";
import { employeeInitialsFromUser } from "../services/taskFormat.js";
import { todayKey, delayFromStandard } from "../utils/time.js";

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const LATE_CATS = ["traffic", "health", "family", "technical"];

function parseTime(value) {
  const t = String(value || "").trim();
  if (!TIME_RE.test(t)) return null;
  return t;
}

export async function listCheckIns(req, res) {
  try {
    const scope = await getTeamScope(req);
    if (!scope) return res.status(401).json({ message: "Yetkisiz" });

    const { date, days } = req.query;
    const filter = { employeeId: { $in: scope.employeeIds } };

    if (date) {
      filter.date = String(date);
    } else {
      const lookback = Math.min(Number(days) || 30, 90);
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - (lookback - 1));
      filter.date = { $gte: todayKey(start), $lte: todayKey(end) };
    }

    const rows = await CheckIn.find(filter)
      .sort({ date: -1, arrivalTime: -1 })
      .populate("employeeId", "name email dept position");

    return res.json({ checkIns: rows.map(formatCheckIn) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Giriş kayıtları yüklenemedi" });
  }
}

export async function upsertTodayCheckIn(req, res) {
  try {
    const scope = await getTeamScope(req);
    if (!scope) return res.status(401).json({ message: "Yetkisiz" });

    const {
      arrivalTime,
      departureTime,
      category,
      commuteMethod,
      workMode,
      energyLevel,
    } = req.body ?? {};

    const date = todayKey();
    const existing = await CheckIn.findOne({ employeeId: scope.user._id, date });

    const expected = "09:00";
    const patch = {};

    const arrival = parseTime(arrivalTime);
    const hasEveningFields =
      departureTime !== undefined || energyLevel !== undefined;

    if (!arrival && hasEveningFields && !existing) {
      return res.status(400).json({ message: "Önce sabah giriş saatini kaydedin" });
    }

    if (arrival) {
      const delay = delayFromStandard(arrival, expected);
      patch.arrivalTime = arrival;
      patch.expectedArrival = expected;
      patch.delayMinutes = delay;
      patch.category =
        delay === 0
          ? "ontime"
          : LATE_CATS.includes(category)
            ? category
            : "traffic";
    } else if (!existing) {
      return res.status(400).json({ message: "Giriş saati zorunludur (HH:MM)" });
    }

    const departure = parseTime(departureTime);
    if (departure !== null) patch.departureTime = departure;

    if (commuteMethod !== undefined) {
      const allowed = ["metrobus", "car", "marmaray", "walk", "other", ""];
      patch.commuteMethod = allowed.includes(commuteMethod) ? commuteMethod : "";
    }

    if (workMode !== undefined) {
      const modes = ["office", "remote", ""];
      patch.workMode = modes.includes(workMode) ? workMode : "office";
    }

    if (energyLevel !== undefined && energyLevel !== null && energyLevel !== "") {
      const n = Number(energyLevel);
      if (n >= 1 && n <= 5) patch.energyLevel = n;
    }

    const row = await CheckIn.findOneAndUpdate(
      { employeeId: scope.user._id, date },
      {
        $set: patch,
        $setOnInsert: {
          employeeId: scope.user._id,
          date,
        },
      },
      { upsert: true, new: true, runValidators: true },
    ).populate("employeeId", "name email dept position");

    return res.json({ checkIn: formatCheckIn(row) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Kayıt kaydedilemedi" });
  }
}

function formatCheckIn(row) {
  const emp = row.employeeId;
  return {
    id: row._id.toString(),
    employeeId: emp?._id?.toString?.(),
    name: emp?.name || "",
    dept: emp?.dept || "Genel",
    role: emp?.position || "",
    category: row.category,
    arrival: row.arrivalTime,
    departure: row.departureTime || "",
    expectedArrival: row.expectedArrival || "09:00",
    commuteMethod: row.commuteMethod || "",
    workMode: row.workMode || "office",
    avatar: employeeInitialsFromUser(emp),
    delta: row.delayMinutes,
    date: row.date,
    energyLevel: row.energyLevel ?? null,
  };
}
