import { Building2, Home, Bus, Car, TrainFront, Footprints, CircleHelp } from "lucide-react";

export const WORK_MODES = [
  { id: "office", label: "Ofiste", icon: Building2 },
  { id: "remote", label: "Uzaktan", icon: Home },
];

export const COMMUTE_METHODS = [
  { id: "metrobus", label: "Metrobüs", icon: Bus },
  { id: "marmaray", label: "Marmaray", icon: TrainFront },
  { id: "car", label: "Araç", icon: Car },
  { id: "walk", label: "Yürüyüş", icon: Footprints },
  { id: "other", label: "Diğer", icon: CircleHelp },
];

export const COMMUTE_LABELS = Object.fromEntries(COMMUTE_METHODS.map((c) => [c.id, c.label]));
export const WORK_MODE_LABELS = Object.fromEntries(WORK_MODES.map((w) => [w.id, w.label]));
