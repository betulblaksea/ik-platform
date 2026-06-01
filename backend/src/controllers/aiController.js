import {
  generateWorkforceInsight,
  generateMorningInsightFromData,
  generateTasksCoachInsight,
} from "../services/ai/insightService.js";

export async function postInsight(req, res) {
  try {
    const { type, input } = req.body ?? {};
    if (!type || !input) {
      return res.status(400).json({ message: "type ve input zorunludur" });
    }

    let insight;
    switch (type) {
      case "workforce":
        insight = await generateWorkforceInsight(input);
        break;
      case "morning":
        insight = await generateMorningInsightFromData(input.checkIns || []);
        break;
      case "tasks":
        insight = await generateTasksCoachInsight(input.tasks || []);
        break;
      default:
        return res.status(400).json({ message: "Geçersiz type: workforce | morning | tasks" });
    }

    return res.json({ insight });
  } catch (err) {
    console.error("[ai]", err.code, err.message, err.raw ? "(parse)" : "");
    const code = err.code || "AI_ERROR";
    const status =
      code === "AI_NOT_CONFIGURED"
        ? 503
        : code === "AI_QUOTA"
          ? 429
          : code === "AI_TIMEOUT"
            ? 504
            : 502;
    return res.status(status).json({
      message: err.message || "AI analizi oluşturulamadı",
      code,
    });
  }
}
