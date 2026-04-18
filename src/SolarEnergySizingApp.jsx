import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, ArrowRight, Battery, Calculator, ChevronLeft, FileText, Home, ImageDown, Info, Plus, RotateCcw, Settings2, Trash2, Upload, Zap } from "lucide-react";

const DEFAULT_LOGO = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#6d28d9"/>
      <stop offset="50%" stop-color="#4f46e5"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="320" height="320" rx="56" fill="url(#g)"/>
  <circle cx="160" cy="110" r="38" fill="#ffffff" opacity="0.92"/>
  <path d="M84 224c18-42 48-64 76-64s58 22 76 64" fill="none" stroke="#ffffff" stroke-width="18" stroke-linecap="round"/>
  <path d="M160 72l13 22 26 4-19 19 5 26-25-14-25 14 5-26-19-19 26-4z" fill="#facc15"/>
</svg>
`)}`;

const BRAND = {
  primary: "#6d28d9",
  secondary: "#4f46e5",
  dark: "#0f172a",
  slate: "#475569",
  light: "#f8fafc",
  border: "#cbd5e1",
  soft: "#eef2ff",
  warning: "#fff7ed",
  success: "#ecfdf5",
  danger: "#fef2f2",
};

const EQUIPMENT_PRESETS = [
  { name: "کولر گازی 12000", power: 1000, voltage: 230, surge: 2.5 },
  { name: "کولر گازی 18000", power: 1500, voltage: 230, surge: 2.7 },
  { name: "کولر گازی 24000", power: 1800, voltage: 230, surge: 3 },
  { name: "کولر آبی 6000", power: 1000, voltage: 230, surge: 2 },
  { name: "تلویزیون LED", power: 100, voltage: 230, surge: 1 },
  { name: "یخچال", power: 300, voltage: 230, surge: 3 },
  { name: "یخچال فریزر", power: 400, voltage: 230, surge: 3 },
  { name: "ماشین لباسشویی", power: 1000, voltage: 230, surge: 2.5 },
  { name: "لامپ LED", power: 10, voltage: 230, surge: 1 },
  { name: "مودم", power: 20, voltage: 230, surge: 1 },
  { name: "لپ تاپ", power: 80, voltage: 230, surge: 1.1 },
  { name: "پمپ آب", power: 650, voltage: 230, surge: 3 },
  { name: "پنکه سقفی", power: 80, voltage: 230, surge: 1.5 },
];

const DEFAULT_ROWS = [
  { id: 1, name: "یخچال", power: 300, qty: 1, hours: 10, voltage: 230, surge: 3, priority: "essential" },
  { id: 2, name: "لامپ LED", power: 10, qty: 10, hours: 6, voltage: 230, surge: 1, priority: "essential" },
  { id: 3, name: "تلویزیون LED", power: 100, qty: 1, hours: 5, voltage: 230, surge: 1, priority: "nonessential" },
];

const DEFAULT_SETTINGS = {
  projectCode: "",
  reportDate: new Date().toLocaleDateString("fa-IR"),
  projectName: "",
  customerName: "",
  location: "",
  projectPurpose: "تامین برق بارهای ضروری",
  designBasis: "بارهای ضروری + زمان بکاپ + حاشیه توسعه",
  designLoadScope: "essential-only",
  backupHoursTarget: 24,
  futureExpansionPercent: 15,
  installationSpaceNote: "",
  preferredDcVoltage: 48,
  availablePanelCount: 0,
  availableBatteryUnits: 0,
  availableInverterPower: 0,
  systemVoltage: 48,
  panelWatt: 600,
  panelVoc: 52,
  panelVmp: 44,
  sunHours: 5.5,
  inverterSafetyFactor: 1.2,
  inverterEfficiency: 0.92,
  batteryEfficiency: 0.9,
  depthOfDischarge: 0.8,
  autonomyDays: 1,
  controllerSafetyFactor: 1.25,
  dailyLossFactor: 0.78,
  batteryUnitVoltage: 12,
  batteryUnitAh: 100,
  simultaneousLoadFactor: 0.8,
  inverterMpptMin: 120,
  inverterMpptMax: 450,
  inverterDcMax: 500,
  batteryChemistry: "lithium",
  cableLossPercent: 3,
  tempCorrectionVoc: 1.12,
  pvCableLength: 20,
  batteryCableLength: 3,
  acCableLength: 25,
  conductorMaterial: "copper",
  fuseSafetyFactor: 1.25,
};

const INVERTER_CATALOG = [
  { model: "1.6k-12V", power: 1600, surge: 2500, voltage: 12, phases: "single" },
  { model: "3.2k-24V", power: 3200, surge: 5500, voltage: 24, phases: "single" },
  { model: "5.5k-48V", power: 5500, surge: 9000, voltage: 48, phases: "single" },
  { model: "6k-48V", power: 6000, surge: 10000, voltage: 48, phases: "single" },
  { model: "8k-96V", power: 8000, surge: 13000, voltage: 96, phases: "single" },
  { model: "10k-96V", power: 10000, surge: 15000, voltage: 96, phases: "single" },
];

const MODES = {
  equipment: { title: "محاسبه بر اساس تجهیزات", desc: "برای ثبت وسیله، تعداد، توان و ساعت کار روزانه", color: "bg-blue-600" },
  power: { title: "محاسبه بر اساس توان کل", desc: "وقتی مجموع توان مصرف کننده ها را می دانید", color: "bg-emerald-600" },
  current: { title: "محاسبه بر اساس جریان کل", desc: "وقتی جریان کل مصرف اندازه گیری شده است", color: "bg-orange-500" },
};

function normalizeDigits(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/٫/g, ".")
    .replace(/،/g, ",");
}

function num(v) {
  const n = Number(normalizeDigits(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function round2(v) {
  return Math.round((v + Number.EPSILON) * 100) / 100;
}

function ceilSafe(v) {
  if (!Number.isFinite(v) || v <= 0) return 0;
  return Math.ceil(v);
}

function format(v, max = 2) {
  return new Intl.NumberFormat("fa-IR", { maximumFractionDigits: max }).format(Number.isFinite(v) ? v : 0);
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function safePositive(v, fallback = 0) {
  return v > 0 ? v : fallback;
}

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function validateSettings(settings) {
  const s = {
    ...settings,
    systemVoltage: clamp(num(settings.systemVoltage), 12, 1000),
    panelWatt: clamp(num(settings.panelWatt), 50, 1000),
    panelVoc: clamp(num(settings.panelVoc), 10, 120),
    panelVmp: clamp(num(settings.panelVmp), 10, 120),
    sunHours: clamp(num(settings.sunHours), 1, 10),
    inverterSafetyFactor: clamp(num(settings.inverterSafetyFactor), 1, 2),
    inverterEfficiency: clamp(num(settings.inverterEfficiency), 0.7, 0.99),
    batteryEfficiency: clamp(num(settings.batteryEfficiency), 0.7, 0.99),
    depthOfDischarge: clamp(num(settings.depthOfDischarge), 0.3, 0.95),
    autonomyDays: clamp(num(settings.autonomyDays), 0.25, 10),
    controllerSafetyFactor: clamp(num(settings.controllerSafetyFactor), 1, 2),
    dailyLossFactor: clamp(num(settings.dailyLossFactor), 0.5, 0.95),
    batteryUnitVoltage: clamp(num(settings.batteryUnitVoltage), 2, 100),
    batteryUnitAh: clamp(num(settings.batteryUnitAh), 20, 2000),
    simultaneousLoadFactor: clamp(num(settings.simultaneousLoadFactor), 0.1, 1),
    inverterMpptMin: clamp(num(settings.inverterMpptMin), 30, 1000),
    inverterMpptMax: clamp(num(settings.inverterMpptMax), 40, 1000),
    inverterDcMax: clamp(num(settings.inverterDcMax), 40, 1500),
    cableLossPercent: clamp(num(settings.cableLossPercent), 0, 15),
    tempCorrectionVoc: clamp(num(settings.tempCorrectionVoc), 1, 1.35),
    pvCableLength: clamp(num(settings.pvCableLength), 1, 300),
    batteryCableLength: clamp(num(settings.batteryCableLength), 0.5, 50),
    acCableLength: clamp(num(settings.acCableLength), 1, 300),
    fuseSafetyFactor: clamp(num(settings.fuseSafetyFactor), 1, 2),
    designLoadScope: settings.designLoadScope === "all-loads" ? "all-loads" : "essential-only",
    backupHoursTarget: clamp(num(settings.backupHoursTarget), 1, 240),
    futureExpansionPercent: clamp(num(settings.futureExpansionPercent), 0, 100),
    installationSpaceNote: settings.installationSpaceNote || "",
    preferredDcVoltage: clamp(num(settings.preferredDcVoltage || settings.systemVoltage), 12, 1000),
    availablePanelCount: clamp(num(settings.availablePanelCount), 0, 100000),
    availableBatteryUnits: clamp(num(settings.availableBatteryUnits), 0, 100000),
    availableInverterPower: clamp(num(settings.availableInverterPower), 0, 1000000),
    conductorMaterial: settings.conductorMaterial === "aluminum" ? "aluminum" : "copper",
    batteryChemistry: settings.batteryChemistry === "lead-acid" ? "lead-acid" : "lithium",
  };
  if (s.inverterMpptMax < s.inverterMpptMin) s.inverterMpptMax = s.inverterMpptMin;
  if (s.inverterDcMax < s.inverterMpptMax) s.inverterDcMax = s.inverterMpptMax;
  return s;
}

function suggestInverter(requiredPower, systemVoltage, requiredSurge) {
  const candidates = INVERTER_CATALOG.filter((x) => x.voltage === systemVoltage && x.power >= requiredPower && x.surge >= requiredSurge);
  if (candidates.length) return candidates[0];
  const fallback = INVERTER_CATALOG.find((x) => x.power >= requiredPower && x.surge >= requiredSurge) || INVERTER_CATALOG[INVERTER_CATALOG.length - 1];
  return fallback;
}

function pickBestSeriesCount(settings, panelCount) {
  const maxPossibleSeries = Math.max(1, Math.min(panelCount, Math.floor(settings.inverterDcMax / Math.max(settings.panelVoc * settings.tempCorrectionVoc, 1))));
  const options = [];
  for (let series = 1; series <= maxPossibleSeries; series += 1) {
    const stringVmp = series * settings.panelVmp;
    const stringVocCold = series * settings.panelVoc * settings.tempCorrectionVoc;
    const withinMppt = stringVmp >= settings.inverterMpptMin && stringVmp <= settings.inverterMpptMax;
    const withinVoc = stringVocCold <= settings.inverterDcMax;
    if (withinMppt && withinVoc) options.push({ series, score: Math.abs((settings.inverterMpptMin + settings.inverterMpptMax) / 2 - stringVmp) });
  }
  if (!options.length) return null;
  options.sort((a, b) => a.score - b.score);
  return options[0].series;
}

function pickStandardSize(area) {
  const sizes = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];
  return sizes.find((s) => s >= area) || sizes[sizes.length - 1];
}

function pickStandardProtection(current) {
  const ratings = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400];
  return ratings.find((r) => r >= current) || ratings[ratings.length - 1];
}

function calcCableArea({ current, length, voltage, lossPercent, material = "copper" }) {
  const rho = material === "aluminum" ? 0.0282 : 0.0175;
  const dropVolts = Math.max((voltage * lossPercent) / 100, 0.5);
  const rawArea = (2 * length * current * rho) / Math.max(dropVolts, 0.1);
  return { rawArea: round2(rawArea), standardArea: pickStandardSize(rawArea) };
}

function buildBom({ result, settings }) {
  const s = result.sanitizedSettings;
  const rows = [
    { item: "پنل خورشیدی", spec: `${format(s.panelWatt)} وات | Voc ${format(s.panelVoc)}V | Vmp ${format(s.panelVmp)}V`, qty: `${format(result.panelRecommended, 0)} عدد`, note: result.panelsInSeries ? `${format(result.panelsInSeries, 0)}S × ${format(result.parallelStrings, 0)}P` : "نیازمند بازنگری" },
    { item: "اینورتر", spec: `${result.inverterSuggested.model} | ${format(result.inverterSuggested.power)}W | ${format(result.inverterSuggested.voltage)}VDC`, qty: "1 دستگاه", note: `Surge ${format(result.inverterSuggested.surge)}W` },
    { item: "بانک باتری", spec: `${format(s.batteryUnitVoltage)}V ${format(s.batteryUnitAh)}Ah | ${s.batteryChemistry === "lead-acid" ? "سرب اسیدی" : "لیتیوم"}`, qty: `${format(result.totalBatteryUnits, 0)} عدد`, note: `${format(result.batteriesInSeries, 0)}S × ${format(result.batteryParallelBanks, 0)}P` },
    { item: "کنترلر شارژ / MPPT", spec: `${format(result.controllerCurrent)}A | ${format(s.systemVoltage)}V`, qty: "1 دستگاه", note: `حداقل ${format(result.controllerCurrent)} آمپر` },
    { item: "کابل DC پنل", spec: `${format(result.cableSizing.pv.standardArea)} mm2 | ${s.conductorMaterial === "aluminum" ? "آلومینیوم" : "مس"}`, qty: `${format(s.pvCableLength)} متر`, note: `I≈${format(result.pvArrayCurrent)}A` },
    { item: "کابل DC باتری", spec: `${format(result.cableSizing.battery.standardArea)} mm2 | ${s.conductorMaterial === "aluminum" ? "آلومینیوم" : "مس"}`, qty: `${format(s.batteryCableLength)} متر`, note: `I≈${format(result.dcCurrentAtFullLoad)}A` },
    { item: "کابل AC خروجی", spec: `${format(result.cableSizing.ac.standardArea)} mm2 | ${s.conductorMaterial === "aluminum" ? "آلومینیوم" : "مس"}`, qty: `${format(s.acCableLength)} متر`, note: `I≈${format(result.acOutputCurrent)}A` },
    { item: "فیوز PV", spec: `${format(result.protections.pvFuse, 0)}A`, qty: `${format(Math.max(result.parallelStrings, 1), 0)} عدد`, note: "برای هر رشته یا combiner" },
    { item: "فیوز باتری", spec: `${format(result.protections.batteryFuse, 0)}A`, qty: "1 عدد", note: "بین باتری و اینورتر" },
    { item: "کلید مینیاتوری AC", spec: `${format(result.protections.acBreaker, 0)}A`, qty: "1 عدد", note: "خروجی AC اینورتر" },
  ];
  return rows;
}

function computeSizing({ mode, rows, settings, totalPowerInput, totalCurrentInput, totalVoltageInput, totalHoursInput }) {
  const s = validateSettings(settings);
  const warnings = [];
  const notes = [];

  const validRows = rows
    .map((r) => ({
      ...r,
      power: num(r.power),
      qty: num(r.qty),
      hours: num(r.hours),
      voltage: num(r.voltage),
      surge: Math.max(num(r.surge || 1), 1),
      priority: r.priority === "nonessential" ? "nonessential" : "essential",
    }))
    .filter((r) => r.power > 0 && r.qty > 0 && r.hours > 0 && r.voltage > 0);

  const items = validRows.map((r) => {
    const powerTotal = r.power * r.qty;
    const dailyEnergy = powerTotal * r.hours;
    const current = powerTotal / Math.max(r.voltage, 1);
    const surgePower = powerTotal * r.surge;
    return { ...r, powerTotal, dailyEnergy, current, surgePower };
  });
  const essentialItems = items.filter((r) => r.priority !== "nonessential");
  const nonEssentialItems = items.filter((r) => r.priority === "nonessential");
  const designItems = mode === "equipment" && s.designLoadScope === "essential-only" ? essentialItems : items;

  let basePower = designItems.reduce((s1, r) => s1 + r.powerTotal, 0);
  let baseEnergy = designItems.reduce((s1, r) => s1 + r.dailyEnergy, 0);
  let baseCurrent = designItems.reduce((s1, r) => s1 + r.current, 0);
  let networkVoltage = 230;
  let peakSurgePower = designItems.reduce((m, r) => Math.max(m, r.surgePower), 0);
  const essentialEnergy = essentialItems.reduce((s1, r) => s1 + r.dailyEnergy, 0);
  const nonEssentialEnergy = nonEssentialItems.reduce((s1, r) => s1 + r.dailyEnergy, 0);
  const essentialPower = essentialItems.reduce((s1, r) => s1 + r.powerTotal, 0);
  const nonEssentialPower = nonEssentialItems.reduce((s1, r) => s1 + r.powerTotal, 0);

  if (mode === "power") {
    basePower = num(totalPowerInput);
    networkVoltage = num(totalVoltageInput) || 230;
    baseCurrent = basePower / Math.max(networkVoltage, 1);
    baseEnergy = basePower * num(totalHoursInput);
    peakSurgePower = basePower * 1.3;
  }

  if (mode === "current") {
    networkVoltage = num(totalVoltageInput) || 230;
    baseCurrent = num(totalCurrentInput);
    basePower = baseCurrent * networkVoltage;
    baseEnergy = basePower * num(totalHoursInput);
    peakSurgePower = basePower * 1.3;
  }

  const expandedBasePower = basePower * (1 + s.futureExpansionPercent / 100);
  const expandedBaseEnergy = baseEnergy * (1 + s.futureExpansionPercent / 100);
  const simultaneousPower = expandedBasePower * s.simultaneousLoadFactor;
  const requiredContinuousInverterPower = simultaneousPower * s.inverterSafetyFactor / s.inverterEfficiency;
  const requiredSurgePower = Math.max(requiredContinuousInverterPower * 1.2, peakSurgePower);
  const inverterSuggested = suggestInverter(requiredContinuousInverterPower, s.systemVoltage, requiredSurgePower);

  const effectiveDailyLossFactor = s.dailyLossFactor * (1 - s.cableLossPercent / 100);
  const effectivePanelEnergyPerDay = s.panelWatt * s.sunHours * Math.max(effectiveDailyLossFactor, 0.1);
  const panelCountForEnergy = ceilSafe(expandedBaseEnergy / Math.max(effectivePanelEnergyPerDay, 1));

  const preferredOversizeMin = 1.1;
  const preferredOversizeMax = 1.35;
  const minPanelPowerForInverter = inverterSuggested.power * preferredOversizeMin;
  const maxPanelPowerForInverter = inverterSuggested.power * preferredOversizeMax;
  const panelCountMinByInverter = ceilSafe(minPanelPowerForInverter / s.panelWatt);
  const panelCountMaxByInverter = Math.max(panelCountMinByInverter, Math.floor(maxPanelPowerForInverter / s.panelWatt));
  let panelRecommended = Math.max(panelCountForEnergy, panelCountMinByInverter);
  if (panelCountMaxByInverter > 0 && panelRecommended > panelCountMaxByInverter) {
    warnings.push("تعداد پنل لازم برای انرژی روزانه از محدوده oversizing پیشنهادی اینورتر بیشتر شده است؛ احتمالاً اینورتر باید بزرگ تر انتخاب شود یا بار بازنگری شود.");
  }

  const bestSeries = pickBestSeriesCount(s, panelRecommended);
  let panelsInSeries = bestSeries || 0;
  let parallelStrings = bestSeries ? ceilSafe(panelRecommended / bestSeries) : 0;
  if (bestSeries) {
    panelRecommended = parallelStrings * bestSeries;
  }

  const panelArrayPower = panelRecommended * s.panelWatt;
  const controllerCurrent = (panelArrayPower / Math.max(s.systemVoltage, 1)) * s.controllerSafetyFactor;

  const autonomyDaysEffective = Math.max(s.autonomyDays, s.backupHoursTarget / 24);
  const batteryWhRequired = (expandedBaseEnergy * autonomyDaysEffective) / (s.batteryEfficiency * s.depthOfDischarge);
  const batteriesInSeries = ceilSafe(s.systemVoltage / s.batteryUnitVoltage);
  const oneSeriesBankWh = batteriesInSeries * s.batteryUnitVoltage * s.batteryUnitAh;
  const batteryParallelBanks = ceilSafe(batteryWhRequired / Math.max(oneSeriesBankWh, 1));
  const totalBatteryUnits = batteriesInSeries * batteryParallelBanks;
  const batteryNominalWh = totalBatteryUnits * s.batteryUnitVoltage * s.batteryUnitAh;
  const usableBatteryWh = batteryNominalWh * s.depthOfDischarge * s.batteryEfficiency;
  const backupHoursAtBaseLoad = usableBatteryWh / Math.max(expandedBasePower, 1);
  const dcCurrentAtFullLoad = inverterSuggested.power / Math.max(s.systemVoltage * s.inverterEfficiency, 1);
  const currentPerBatteryString = dcCurrentAtFullLoad / Math.max(batteryParallelBanks, 1);
  const acOutputCurrent = inverterSuggested.power / Math.max(networkVoltage, 1);
  const panelCurrentAtMpp = s.panelWatt / Math.max(s.panelVmp, 1);
  const pvArrayCurrent = panelCurrentAtMpp * Math.max(parallelStrings, 1);
  const recommendedChemistryDod = s.batteryChemistry === "lead-acid" ? 0.5 : 0.8;
  const cableSizing = {
    pv: calcCableArea({ current: pvArrayCurrent, length: s.pvCableLength, voltage: Math.max(s.panelVmp * Math.max(panelsInSeries, 1), s.systemVoltage), lossPercent: 3, material: s.conductorMaterial }),
    battery: calcCableArea({ current: dcCurrentAtFullLoad, length: s.batteryCableLength, voltage: s.systemVoltage, lossPercent: 1, material: s.conductorMaterial }),
    ac: calcCableArea({ current: acOutputCurrent, length: s.acCableLength, voltage: networkVoltage, lossPercent: Math.max(s.cableLossPercent, 1.5), material: s.conductorMaterial }),
  };
  const protections = {
    pvFuse: pickStandardProtection(pvArrayCurrent * s.fuseSafetyFactor),
    batteryFuse: pickStandardProtection(dcCurrentAtFullLoad * s.fuseSafetyFactor),
    acBreaker: pickStandardProtection(acOutputCurrent * s.fuseSafetyFactor),
  };

  const existingPanelPower = s.availablePanelCount * s.panelWatt;
  const existingBatteryBanksEquivalent = batteriesInSeries > 0 ? Math.floor(s.availableBatteryUnits / batteriesInSeries) : 0;
  const existingUsableBatteryWh = s.availableBatteryUnits * s.batteryUnitVoltage * s.batteryUnitAh * s.depthOfDischarge * s.batteryEfficiency;
  const additionalPanelCount = Math.max(panelRecommended - s.availablePanelCount, 0);
  const additionalBatteryUnits = Math.max(totalBatteryUnits - s.availableBatteryUnits, 0);
  const additionalInverterPower = Math.max(inverterSuggested.power - s.availableInverterPower, 0);

  const stringVocCold = panelsInSeries * s.panelVoc * s.tempCorrectionVoc;
  const stringVmp = panelsInSeries * s.panelVmp;
  const energyProductionDaily = panelRecommended * s.panelWatt * s.sunHours * Math.max(effectiveDailyLossFactor, 0.1);
  const energyMargin = expandedBaseEnergy > 0 ? energyProductionDaily / expandedBaseEnergy : 0;
  const pvToInverterRatio = inverterSuggested.power > 0 ? panelArrayPower / inverterSuggested.power : 0;
  const inverterLoadRatio = inverterSuggested.power > 0 ? simultaneousPower / inverterSuggested.power : 0;
  const batteryChargeCurrent = panelArrayPower / Math.max(s.systemVoltage, 1);
  const batteryChargeC = batteryParallelBanks > 0 && s.batteryUnitAh > 0 ? batteryChargeCurrent / (batteryParallelBanks * s.batteryUnitAh) : 0;
  const batteryDischargeC = s.batteryUnitAh > 0 ? currentPerBatteryString / s.batteryUnitAh : 0;
  const controllerPowerEquivalent = controllerCurrent * s.systemVoltage;
  const designChecks = [];
  const pushCheck = (title, status, value, recommendation) => designChecks.push({ title, status, value, recommendation });

  pushCheck(
    "ولتاژ Voc رشته در سرما",
    panelsInSeries && stringVocCold <= s.inverterDcMax ? "pass" : "fail",
    panelsInSeries ? `${format(stringVocCold)}V / حد ${format(s.inverterDcMax)}V` : "آرایش معتبر ندارد",
    "Voc تصحیح شده باید پایین تر از حداکثر DC اینورتر بماند."
  );
  pushCheck(
    "ولتاژ Vmp رشته در بازه MPPT",
    panelsInSeries && stringVmp >= s.inverterMpptMin && stringVmp <= s.inverterMpptMax ? "pass" : "fail",
    panelsInSeries ? `${format(stringVmp)}V / بازه ${format(s.inverterMpptMin)}-${format(s.inverterMpptMax)}V` : "آرایش معتبر ندارد",
    "ولتاژ کاری رشته باید داخل بازه MPPT باشد."
  );
  pushCheck(
    "حاشیه انرژی روزانه",
    energyMargin >= 1.15 ? "pass" : energyMargin >= 1 ? "warn" : "fail",
    `${format(energyMargin)}×`,
    "برای طراحی مطمئن، نسبت تولید روزانه به مصرف روزانه بهتر است حداقل حدود 1.15 باشد."
  );
  pushCheck(
    "نسبت توان پنل به اینورتر",
    pvToInverterRatio >= 1.1 && pvToInverterRatio <= 1.35 ? "pass" : pvToInverterRatio >= 1 && pvToInverterRatio <= 1.45 ? "warn" : "fail",
    `${format(pvToInverterRatio)}×`,
    "نسبت خیلی پایین باعث کم استفاده شدن از اینورتر و نسبت خیلی بالا باعث محدودیت توان ورودی می شود."
  );
  pushCheck(
    "نسبت بار همزمان به توان نامی اینورتر",
    inverterLoadRatio <= 0.8 ? "pass" : inverterLoadRatio <= 1 ? "warn" : "fail",
    `${format(inverterLoadRatio)}×`,
    "برای دوام بهتر، بار پیوسته بهتر است زیر 80 درصد توان نامی بماند."
  );
  pushCheck(
    "نرخ دشارژ هر رشته باتری",
    batteryDischargeC <= 0.5 ? "pass" : batteryDischargeC <= 0.8 ? "warn" : "fail",
    `${format(batteryDischargeC)}C`,
    "C-rate بالا باعث گرمایش، افت ولتاژ و کاهش عمر بانک باتری می شود."
  );
  pushCheck(
    "نرخ شارژ بانک باتری",
    batteryChargeC <= 0.5 ? "pass" : batteryChargeC <= 0.8 ? "warn" : "fail",
    `${format(batteryChargeC)}C`,
    "نرخ شارژ باید با شیمی باتری و BMS/دیتاشیت سازگار باشد."
  );
  pushCheck(
    "ظرفیت تقریبی کنترلر شارژ",
    controllerPowerEquivalent >= panelArrayPower ? "pass" : "warn",
    `${format(controllerPowerEquivalent)}W در برابر ${format(panelArrayPower)}W`,
    "ظرفیت معادل کنترلر باید از توان آرایه کمتر نباشد."
  );

  const criticalFails = designChecks.filter((x) => x.status === "fail").length;
  const warningCount = designChecks.filter((x) => x.status === "warn").length;
  const engineeringStatus = criticalFails > 0 ? "رد طراحی" : warningCount > 0 ? "طراحی مشروط" : "قابل قبول";
  const requirementSummary = [
    `مبنای طراحی: ${s.designBasis || "بارهای ضروری + زمان بکاپ + حاشیه توسعه"}`,
    `دامنه بار طراحی: ${s.designLoadScope === "essential-only" ? "فقط بارهای ضروری" : "کل بارهای ثبت شده"}`,
    `هدف پروژه: ${s.projectPurpose || "تامین برق بارهای ضروری"}`,
    `توان بار ضروری / غیراولویتی: ${format(essentialPower)} / ${format(nonEssentialPower)} W`,
    `انرژی بار ضروری / غیراولویتی: ${format(essentialEnergy)} / ${format(nonEssentialEnergy)} Wh/day`,
    `نیاز انرژی طراحی پس از حاشیه توسعه: ${format(expandedBaseEnergy)} Wh/day`,
    `نیاز توان همزمان طراحی: ${format(simultaneousPower)} W`,
    `هدف بکاپ: ${format(s.backupHoursTarget)} ساعت`,
  ];

  if (!bestSeries && panelRecommended > 0) {
    warnings.push("با مشخصات فعلی پنل و محدوده MPPT اینورتر، آرایش سری/موازی معتبری به دست نیامد. باید ولتاژ پنل یا محدوده ورودی اینورتر بازبینی شود.");
  }
  if (designItems.some((r) => r.voltage !== designItems[0]?.voltage)) {
    warnings.push("در لیست تجهیزات، ولتاژ بارها یکسان نیست. جمع جریان فقط در صورت هم ولتاژ بودن بارها معنی مستقیم دارد.");
  }
  if (s.batteryUnitVoltage > s.systemVoltage) {
    warnings.push("ولتاژ هر باتری از ولتاژ سیستم بزرگ تر است؛ این ترکیب برای سری بندی معتبر نیست.");
  }
  if (s.depthOfDischarge > recommendedChemistryDod + 0.05) {
    warnings.push(s.batteryChemistry === "lead-acid"
      ? "عمق دشارژ برای باتری سرب اسیدی زیاد انتخاب شده و به عمر باتری آسیب می زند."
      : "عمق دشارژ انتخاب شده برای اغلب باتری های لیتیومی قابل قبول است، ولی باید با دیتاشیت واقعی کنترل شود.");
  }
  if (currentPerBatteryString > s.batteryUnitAh * 0.5) {
    warnings.push("جریان دشارژ هر رشته باتری بالاست. بهتر است تعداد رشته های موازی بیشتر شود یا باتری با Ah بالاتر انتخاب شود.");
  }
  if (inverterSuggested.voltage !== s.systemVoltage) {
    warnings.push("اینورتر پیشنهادی از نظر ولتاژ DC دقیقاً با ولتاژ سیستم ورودی یکسان نیست؛ باید کاتالوگ واقعی تجهیزات بازبینی شود.");
  }
  if (panelArrayPower < minPanelPowerForInverter) {
    notes.push("توان آرایه پنل کمتر از oversizing پیشنهادی برای استفاده بهینه از اینورتر است.");
  }
  if (panelArrayPower > maxPanelPowerForInverter) {
    notes.push("توان آرایه پنل از oversizing پیشنهادی اینورتر عبور کرده است.");
  }
  if (s.simultaneousLoadFactor < 0.4) notes.push("ضریب همزمانی بسیار پایین است؛ برای کاربردهای واقعی حتماً با رفتار بار تطبیق داده شود.");
  if (s.installationSpaceNote.trim()) notes.push(`محدودیت محل نصب: ${s.installationSpaceNote}`);
  if (s.preferredDcVoltage !== s.systemVoltage) warnings.push("ولتاژ ترجیحی طراحی با ولتاژ واقعی سیستم یکسان نیست؛ بررسی تطابق الزامات پروژه توصیه می شود.");

  return {
    sanitizedSettings: s,
    warnings,
    notes,
    items,
    essentialItems,
    nonEssentialItems,
    designItems,
    basePower,
    baseEnergy,
    expandedBasePower,
    expandedBaseEnergy,
    baseCurrent,
    networkVoltage,
    simultaneousPower,
    requiredContinuousInverterPower,
    requiredSurgePower,
    inverterSuggested,
    panelCountForEnergy,
    panelRecommended,
    panelsInSeries,
    parallelStrings,
    panelArrayPower,
    batteryWhRequired,
    batteryParallelBanks,
    batteriesInSeries,
    totalBatteryUnits,
    controllerCurrent,
    usableBatteryWh,
    backupHoursAtBaseLoad,
    dcCurrentAtFullLoad,
    currentPerBatteryString,
    acOutputCurrent,
    pvArrayCurrent,
    cableSizing,
    protections,
    stringVocCold,
    stringVmp,
    energyProductionDaily,
    energyMargin,
    pvToInverterRatio,
    inverterLoadRatio,
    batteryChargeCurrent,
    batteryChargeC,
    batteryDischargeC,
    controllerPowerEquivalent,
    designChecks,
    engineeringStatus,
    criticalFails,
    warningCount,
    requirementSummary,
    essentialEnergy,
    nonEssentialEnergy,
    essentialPower,
    nonEssentialPower,
    autonomyDaysEffective,
    existingPanelPower,
    existingBatteryBanksEquivalent,
    existingUsableBatteryWh,
    additionalPanelCount,
    additionalBatteryUnits,
    additionalInverterPower,
    bom: buildBom({ result: {
      sanitizedSettings: s,
      panelRecommended, panelsInSeries, parallelStrings, batteriesInSeries, batteryParallelBanks, totalBatteryUnits, controllerCurrent, inverterSuggested, cableSizing, protections, dcCurrentAtFullLoad, acOutputCurrent, pvArrayCurrent
    }, settings: s }),
  };
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function buildReportRows({ mode, settings, result }) {
  const methodLabel = mode === "equipment" ? "جز به جز تجهیزات" : mode === "power" ? "توان کل مصرفی" : "جریان کل مصرفی";
  const s = result.sanitizedSettings;

  const projectRows = [
    ["عنوان سامانه", "گزارش مهندسی نیازسنجی و سایزینگ خورشیدی"],
    ["روش محاسبه", methodLabel],
    ["نام پروژه", settings.projectName],
    ["کد پروژه", settings.projectCode],
    ["محل پروژه", settings.location],
    ["هدف پروژه", settings.projectPurpose],
    ["دامنه بار طراحی", s.designLoadScope === "essential-only" ? "فقط بارهای ضروری" : "کل بارهای ثبت شده"],
    ["مبنای طراحی", settings.designBasis],
    ["هدف بکاپ", `${format(s.backupHoursTarget)} ساعت`],
    ["حاشیه توسعه", `${format(s.futureExpansionPercent)} %`],
    ["تاریخ گزارش", settings.reportDate],
  ].filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "");

  const resultRows = [
    ["وضعیت مهندسی طراحی", result.engineeringStatus],
    ["توان مبنای طراحی", `${format(round2(result.basePower))} وات`],
    ["توان طراحی با توسعه", `${format(round2(result.expandedBasePower))} وات`],
    ["انرژی مبنای طراحی", `${format(round2(result.baseEnergy))} وات ساعت`],
    ["انرژی طراحی با توسعه", `${format(round2(result.expandedBaseEnergy))} وات ساعت`],
    ["تولید روزانه آرایه", `${format(round2(result.energyProductionDaily))} وات ساعت`],
    ["حاشیه انرژی", `${format(round2(result.energyMargin))} ×`],
    ["توان همزمان", `${format(round2(result.simultaneousPower))} وات`],
    ["اینورتر پیوسته لازم", `${format(round2(result.requiredContinuousInverterPower))} وات`],
    ["حداقل توان Surge", `${format(round2(result.requiredSurgePower))} وات`],
    ["اینورتر پیشنهادی", `${result.inverterSuggested.model} | ${format(result.inverterSuggested.power)} وات / ${format(result.inverterSuggested.voltage)} ولت`],
    ["تعداد پنل", `${format(result.panelRecommended, 0)} عدد`],
    ["آرایش پنل", result.panelsInSeries ? `${format(result.panelsInSeries, 0)}S × ${format(result.parallelStrings, 0)}P` : "نیازمند بازنگری"],
    ["Vmp / Voc رشته", result.panelsInSeries ? `${format(result.stringVmp)} / ${format(result.stringVocCold)} ولت` : "نیازمند بازنگری"],
    ["کنترلر شارژ", `${format(round2(result.controllerCurrent))} آمپر`],
    ["کل باتری", `${format(result.totalBatteryUnits, 0)} عدد`],
    ["شارژ / دشارژ باتری", `${format(result.batteryChargeC)}C / ${format(result.batteryDischargeC)}C`],
    ["بکاپ تقریبی", `${format(round2(result.backupHoursAtBaseLoad))} ساعت`],
    ["بکاپ هدف", `${format(round2(result.autonomyDaysEffective * 24))} ساعت`],
  ];

  const availableRows = [
    ["پنل موجود", `${format(s.availablePanelCount, 0)} عدد | ${format(result.existingPanelPower)} وات نامی`],
    ["باتری موجود", `${format(s.availableBatteryUnits, 0)} عدد | ${format(result.existingUsableBatteryWh)} Wh قابل استفاده`],
    ["رشته معادل باتری موجود", `${format(result.existingBatteryBanksEquivalent, 0)} رشته`],
    ["اینورتر موجود", `${format(s.availableInverterPower)} وات`],
    ["کسری پنل", `${format(result.additionalPanelCount, 0)} عدد`],
    ["کسری باتری", `${format(result.additionalBatteryUnits, 0)} عدد`],
    ["کسری توان اینورتر", `${format(result.additionalInverterPower)} وات`],
  ];

  const designRows = [
    ["ولتاژ سیستم", `${format(s.systemVoltage)} ولت`],
    ["ولتاژ ترجیحی طراحی", `${format(s.preferredDcVoltage)} ولت`],
    ["توان هر پنل", `${format(s.panelWatt)} وات`],
    ["Voc / Vmp پنل", `${format(s.panelVoc)} / ${format(s.panelVmp)} ولت`],
    ["MPPT اینورتر", `${format(s.inverterMpptMin)} تا ${format(s.inverterMpptMax)} ولت`],
    ["حداکثر DC اینورتر", `${format(s.inverterDcMax)} ولت`],
    ["ساعت مفید تابش", `${format(s.sunHours)} ساعت`],
    ["روز پشتیبانی", `${format(s.autonomyDays)} روز`],
    ["هدف بکاپ", `${format(s.backupHoursTarget)} ساعت`],
    ["حاشیه توسعه", `${format(s.futureExpansionPercent)} %`],
    ["نوع باتری", s.batteryChemistry === "lead-acid" ? "سرب اسیدی" : "لیتیوم"],
    ["ولتاژ هر باتری", `${format(s.batteryUnitVoltage)} ولت`],
    ["ظرفیت هر باتری", `${format(s.batteryUnitAh)} آمپر ساعت`],
    ["کابل PV / Battery / AC", `${format(s.pvCableLength)} / ${format(s.batteryCableLength)} / ${format(s.acCableLength)} متر`],
    ["هادی", s.conductorMaterial === "aluminum" ? "آلومینیوم" : "مس"],
    ["محدودیت محل نصب", s.installationSpaceNote || "ثبت نشده"],
  ];

  return { projectRows, resultRows, availableRows, designRows, methodLabel };
}

function drawBox(ctx, x, y, w, h, r, fill, stroke) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawSection(ctx, x, y, w, h, title, rows, bg = "#ffffff") {
  drawBox(ctx, x, y, w, h, 22, bg, BRAND.border);
  ctx.fillStyle = BRAND.secondary;
  ctx.font = "bold 28px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(title, x + w - 28, y + 45);

  let currentY = y + 84;
  rows.forEach(([label, value]) => {
    ctx.fillStyle = BRAND.slate;
    ctx.font = "22px sans-serif";
    ctx.fillText(label, x + w - 28, currentY);
    ctx.fillStyle = BRAND.dark;
    ctx.font = "bold 22px sans-serif";
    ctx.fillText(String(value), x + 350, currentY);
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 22, currentY + 18);
    ctx.lineTo(x + w - 22, currentY + 18);
    ctx.stroke();
    currentY += 40;
  });
}

function drawSimpleTable(ctx, x, y, w, title, rows) {
  drawBox(ctx, x, y, w, 560, 22, "#ffffff", BRAND.border);
  ctx.fillStyle = BRAND.secondary;
  ctx.font = "bold 28px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(title, x + w - 28, y + 45);

  const cols = [
    { title: "نام تجهیز", width: 350 },
    { title: "تعداد", width: 130 },
    { title: "توان", width: 180 },
    { title: "ساعت", width: 150 },
    { title: "Surge", width: 140 },
    { title: "انرژی روزانه", width: 250 },
  ];

  let cursorX = x + w;
  const top = y + 80;
  cols.forEach((col) => {
    cursorX -= col.width;
    ctx.fillStyle = BRAND.soft;
    ctx.fillRect(cursorX, top, col.width, 54);
    ctx.strokeStyle = BRAND.border;
    ctx.strokeRect(cursorX, top, col.width, 54);
    ctx.fillStyle = BRAND.dark;
    ctx.font = "bold 20px sans-serif";
    ctx.fillText(col.title, cursorX + col.width - 16, top + 34);
  });

  rows.forEach((row, index) => {
    let rowX = x + w;
    const data = [row.name, format(row.qty, 0), `${format(row.power)} W`, `${format(row.hours)} h`, `${format(row.surge)}×`, `${format(row.dailyEnergy)} Wh`];
    const rowTop = top + 54 + index * 58;
    cols.forEach((col, i) => {
      rowX -= col.width;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(rowX, rowTop, col.width, 58);
      ctx.strokeStyle = BRAND.border;
      ctx.strokeRect(rowX, rowTop, col.width, 58);
      ctx.fillStyle = BRAND.slate;
      ctx.font = "20px sans-serif";
      ctx.fillText(data[i], rowX + col.width - 16, rowTop + 36);
    });
  });
}

function drawNoticeList(ctx, x, y, w, title, lines, bg) {
  drawBox(ctx, x, y, w, 220, 22, bg, BRAND.border);
  ctx.fillStyle = BRAND.dark;
  ctx.font = "bold 24px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(title, x + w - 24, y + 38);
  let yy = y + 78;
  lines.slice(0, 4).forEach((line) => {
    ctx.font = "20px sans-serif";
    ctx.fillStyle = BRAND.slate;
    ctx.fillText(`• ${line}`, x + w - 24, yy);
    yy += 34;
  });
}

async function renderReportToCanvas({ mode, settings, result, logoSrc }) {
  const { projectRows, resultRows, availableRows, designRows } = buildReportRows({ mode, settings, result });
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 2260;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = BRAND.primary;
  ctx.fillRect(0, 0, canvas.width, 180);

  try {
    const logo = await loadImage(logoSrc || DEFAULT_LOGO);
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(70, 35, 110, 110, 24);
    ctx.clip();
    ctx.drawImage(logo, 70, 35, 110, 110);
    ctx.restore();
  } catch {}

  ctx.textAlign = "right";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 46px sans-serif";
  ctx.fillText("گزارش مهندسی نیازسنجی سامانه خورشیدی", 1500, 78);
  ctx.font = "24px sans-serif";
  ctx.fillText("تمرکز بر نیاز پروژه، داشته های موجود و تجهیزات موردنیاز", 1500, 122);

  drawBox(ctx, 50, 220, 1500, 1985, 26, "#ffffff", BRAND.border);
  drawSection(ctx, 90, 260, 1420, 360, "مشخصات پروژه", projectRows);
  drawSection(ctx, 90, 650, 1420, 500, "نتایج محاسبات", resultRows);
  drawSection(ctx, 90, 1180, 1420, 260, "داشته های موجود و کسری تجهیزات", availableRows);
  drawSection(ctx, 90, 1470, 1420, 310, "پارامترهای طراحی", designRows);

  if (result.warnings.length) {
    drawNoticeList(ctx, 90, 1810, 690, "هشدارهای طراحی", result.warnings, BRAND.warning);
  }
  if (result.notes.length) {
    drawNoticeList(ctx, 820, 1810, 690, "یادداشت ها", result.notes, BRAND.success);
  }

  return canvas;
}

async function exportReportAsImage(props) {
  const canvas = await renderReportToCanvas(props);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${props.settings.projectName || "solar-summary-pro"}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }, "image/png");
}

async function exportReportAsPdf(props) {
  const canvas = await renderReportToCanvas(props);
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const imgData = canvas.toDataURL("image/png", 1);
  const pageWidth = 210;
  const pageHeight = 297;
  pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight, undefined, "FAST");
  pdf.save(`${props.settings.projectName || "solar-summary-pro"}.pdf`);
}

function runSelfTests() {
  console.assert(normalizeDigits("۱۲۳٫۴") === "123.4", "normalizeDigits should convert Persian decimals");
  console.assert(num("١٢") === 12, "num should convert Arabic digits");
  console.assert(round2(1.235) === 1.24, "round2 should round correctly");
  console.assert(ceilSafe(2.1) === 3, "ceilSafe should ceil positive numbers");
  const demo = computeSizing({
    mode: "power",
    rows: [],
    settings: DEFAULT_SETTINGS,
    totalPowerInput: 1000,
    totalCurrentInput: 0,
    totalVoltageInput: 230,
    totalHoursInput: 5,
  });
  console.assert(demo.baseEnergy === 5000, "computeSizing should calculate baseEnergy from total power");
  console.assert(demo.panelRecommended >= 1, "panelRecommended should be positive for positive load");
}

export default function SolarEnergySizingAppPro() {
  const [route, setRoute] = useState("intro");
  const [mode, setMode] = useState("equipment");
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [logoSrc, setLogoSrc] = useState(DEFAULT_LOGO);
  const [isExporting, setIsExporting] = useState(false);
  const [totalPowerInput, setTotalPowerInput] = useState("3000");
  const [totalCurrentInput, setTotalCurrentInput] = useState("15");
  const [totalVoltageInput, setTotalVoltageInput] = useState("230");
  const [totalHoursInput, setTotalHoursInput] = useState("6");
  const logoInputRef = useRef(null);

  useEffect(() => {
    runSelfTests();
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("solar-sizing-state-engineering-needs-v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.mode) setMode(parsed.mode);
        if (parsed.route && parsed.route !== "intro") setRoute(parsed.route);
        if (parsed.rows) setRows(parsed.rows);
        if (parsed.settings) setSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
        if (parsed.logoSrc) setLogoSrc(parsed.logoSrc);
        if (parsed.totalPowerInput !== undefined) setTotalPowerInput(String(parsed.totalPowerInput));
        if (parsed.totalCurrentInput !== undefined) setTotalCurrentInput(String(parsed.totalCurrentInput));
        if (parsed.totalVoltageInput !== undefined) setTotalVoltageInput(String(parsed.totalVoltageInput));
        if (parsed.totalHoursInput !== undefined) setTotalHoursInput(String(parsed.totalHoursInput));
      } catch {}
    }
    const timer = window.setTimeout(() => setRoute("home"), 1400);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || route === "intro") return;
    window.localStorage.setItem(
      "solar-sizing-state-engineering-needs-v1",
      JSON.stringify({ route, mode, rows, settings, logoSrc, totalPowerInput, totalCurrentInput, totalVoltageInput, totalHoursInput })
    );
  }, [route, mode, rows, settings, logoSrc, totalPowerInput, totalCurrentInput, totalVoltageInput, totalHoursInput]);

  const result = useMemo(
    () => computeSizing({ mode, rows, settings, totalPowerInput, totalCurrentInput, totalVoltageInput, totalHoursInput }),
    [mode, rows, settings, totalPowerInput, totalCurrentInput, totalVoltageInput, totalHoursInput]
  );

  const reportData = buildReportRows({ mode, settings, result });
  const methodLabel = MODES[mode]?.title || "محاسبات";
  const hasEquipmentRows = result.items.length > 0;
  const bomRows = result.bom || [];
  const setField = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

  const resetAll = () => {
    setRoute("home");
    setMode("equipment");
    setRows(DEFAULT_ROWS);
    setSettings(DEFAULT_SETTINGS);
    setLogoSrc(DEFAULT_LOGO);
    setTotalPowerInput("3000");
    setTotalCurrentInput("15");
    setTotalVoltageInput("230");
    setTotalHoursInput("6");
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoSrc(String(reader.result || DEFAULT_LOGO));
    reader.readAsDataURL(file);
  };

  const addRow = () => setRows((prev) => [...prev, { id: makeId(), name: "تجهیز جدید", power: "0", qty: "1", hours: "1", voltage: "230", surge: "1", priority: "essential" }]);
  const addPreset = (presetName) => {
    const preset = EQUIPMENT_PRESETS.find((x) => x.name === presetName);
    if (!preset) return;
    setRows((prev) => [...prev, { id: makeId(), name: preset.name, power: String(preset.power), qty: "1", hours: "1", voltage: String(preset.voltage), surge: String(preset.surge), priority: "essential" }]);
  };
  const updateRow = (id, key, value) => setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  const removeRow = (id) => setRows((prev) => prev.filter((r) => r.id !== id));

  const exportImage = async () => {
    try {
      setIsExporting(true);
      await exportReportAsImage({ mode, settings, result, logoSrc });
    } catch (error) {
      console.error(error);
      window.alert("خروجی عکس با خطا مواجه شد.");
    } finally {
      setIsExporting(false);
    }
  };

  const exportPdf = async () => {
    try {
      setIsExporting(true);
      await exportReportAsPdf({ mode, settings, result, logoSrc });
    } catch (error) {
      console.error(error);
      window.alert("خروجی PDF واقعی با خطا مواجه شد. بررسی کنید بسته jspdf در پروژه موجود باشد.");
    } finally {
      setIsExporting(false);
    }
  };

  if (route === "intro") {
    return (
      <div dir="rtl" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-6">
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at center, rgba(139,92,246,0.35), transparent 45%)" }} />
        <div className="relative flex flex-col items-center gap-6">
          <img src={logoSrc || DEFAULT_LOGO} alt="logo" className="h-40 w-40 rounded-[2rem] bg-white/10 object-cover shadow-2xl ring-4 ring-white/10 animate-pulse sm:h-52 sm:w-52" />
          <div className="h-2 w-56 overflow-hidden rounded-full bg-white/15"><div className="h-full w-2/3 rounded-full bg-violet-500" /></div>
          <p className="text-sm text-white/80">در حال راه اندازی نسخه مهندسی سامانه...</p>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 text-slate-900">
      <div className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <img src={logoSrc || DEFAULT_LOGO} alt="logo" className="h-11 w-11 rounded-2xl bg-slate-100 object-cover" />
            <div>
              <div className="text-sm font-bold md:text-base">گزارش مهندسی نیازسنجی سامانه خورشیدی</div>
              <div className="text-[11px] text-slate-500 md:text-xs">تمرکز بر نیاز پروژه، داشته های موجود و تجهیزات موردنیاز</div>
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" className="rounded-2xl" onClick={() => setRoute("home")}><Home className="ml-2 h-4 w-4" />خانه</Button>
            <Button variant="outline" className="rounded-2xl" onClick={() => setRoute("selector")}>انتخاب روش</Button>
            <Button variant="outline" className="rounded-2xl" onClick={() => logoInputRef.current?.click()}><Upload className="ml-2 h-4 w-4" />لوگو</Button>
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            <Button variant="outline" className="rounded-2xl" onClick={exportImage} disabled={isExporting}><ImageDown className="ml-2 h-4 w-4" />عکس</Button>
            <Button variant="outline" className="rounded-2xl" onClick={exportPdf} disabled={isExporting}><FileText className="ml-2 h-4 w-4" />PDF</Button>
            <Button variant="outline" className="rounded-2xl" onClick={resetAll}><RotateCcw className="ml-2 h-4 w-4" />بازنشانی</Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-3 md:p-6">
        {route === "home" && (
          <div className="mx-auto flex min-h-[calc(100vh-120px)] max-w-3xl items-center justify-center">
            <Card className="w-full rounded-[2rem] border-2 border-violet-200 bg-white shadow-xl">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col items-center text-center">
                  <img src={logoSrc || DEFAULT_LOGO} alt="logo" className="mb-5 h-28 w-28 rounded-[2rem] bg-slate-100 object-cover shadow-lg sm:h-32 sm:w-32" />
                  <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">گزارش مهندسی نیازسنجی سامانه خورشیدی</h1>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                    این نسخه برای فرم مهندسی استاندارد پروژه طراحی شده است؛ یعنی تعریف بارهای ضروری و غیراولویتی، هدف بکاپ، حاشیه توسعه، محدودیت های پروژه و تجهیزات موجود، سپس استخراج نیاز تجهیزاتی مهندسی شده.
                  </p>
                  <div className="mt-6 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                    <Button className="rounded-2xl px-8 py-6 text-base" onClick={() => setRoute("selector")}>شروع محاسبات <ChevronLeft className="mr-2 h-5 w-5" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {route === "selector" && (
          <div className="mx-auto max-w-5xl space-y-5">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold">انتخاب نوع محاسبه</h2>
              <p className="mt-2 text-sm text-slate-600">یکی از سه روش را انتخاب کنید تا فرم اختصاصی همان روش نمایش داده شود.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {Object.entries(MODES).map(([key, item]) => (
                <Card key={key} className="rounded-[1.75rem] border-2 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <CardContent className="p-5">
                    <div className={`mb-4 rounded-2xl ${item.color} px-4 py-4 text-white`}>
                      <div className="text-lg font-bold">{item.title}</div>
                      <div className="mt-1 text-sm text-white/90">{item.desc}</div>
                    </div>
                    <Button className="w-full rounded-2xl" onClick={() => { setMode(key); setRoute("workspace"); }}>انتخاب این روش</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {route === "workspace" && (
          <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <Card className="rounded-[1.75rem] shadow-sm">
                <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-lg"><Calculator className="h-5 w-5" />تعریف نیاز پروژه و مبنای طراحی - {methodLabel}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <LabeledInput label="نام پروژه" desc="عنوان گزارش فنی" value={settings.projectName} onChange={(v) => setField("projectName", v)} type="text" />
                    <LabeledInput label="محل پروژه" desc="شهر، سایت، یا اقلیم پروژه" value={settings.location} onChange={(v) => setField("location", v)} type="text" />
                    <LabeledInput label="هدف پروژه" desc="مثلاً تامین بارهای ضروری، بکاپ اداری، یا کاربری مخابراتی" value={settings.projectPurpose} onChange={(v) => setField("projectPurpose", v)} type="text" />
                    <LabeledInput label="مبنای طراحی" desc="مثلاً بار ضروری + زمان بکاپ + حاشیه توسعه" value={settings.designBasis} onChange={(v) => setField("designBasis", v)} type="text" />
                    <LabeledInput label="هدف بکاپ" desc="مدت تامین برق مورد انتظار در نبود تولید" value={settings.backupHoursTarget} onChange={(v) => setField("backupHoursTarget", v)} />
                    <LabeledInput label="حاشیه توسعه آینده" desc="درصد رشد بار برای توسعه آتی" value={settings.futureExpansionPercent} onChange={(v) => setField("futureExpansionPercent", v)} />
                    <LabeledInput label="ولتاژ ترجیحی طراحی" desc="ولتاژ مرجع مدنظر کارفرما یا پروژه" value={settings.preferredDcVoltage} onChange={(v) => setField("preferredDcVoltage", v)} />
                    <LabeledInput label="کد پروژه" desc="شماره داخلی یا ارجاع گزارش" value={settings.projectCode} onChange={(v) => setField("projectCode", v)} type="text" />
                    <LabeledInput label="محدودیت محل نصب" desc="مثلاً محدودیت فضا، سقف، اتاق باتری یا شرایط سایت" value={settings.installationSpaceNote} onChange={(v) => setField("installationSpaceNote", v)} type="text" />
                    <div className="rounded-2xl border bg-white p-3 shadow-sm">
                      <div className="mb-1 text-sm font-semibold text-slate-800">دامنه بار طراحی</div>
                      <div className="mb-3 text-xs leading-6 text-slate-500">انتخاب کنید محاسبات بر اساس فقط بارهای ضروری باشد یا کل بارهای ثبت شده</div>
                      <Select value={settings.designLoadScope} onValueChange={(v) => setField("designLoadScope", v)}>
                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="essential-only">فقط بارهای ضروری</SelectItem>
                          <SelectItem value="all-loads">کل بارهای ثبت شده</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {mode === "equipment" && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Select onValueChange={addPreset}>
                          <SelectTrigger className="w-full rounded-2xl sm:w-72"><SelectValue placeholder="افزودن تجهیز آماده" /></SelectTrigger>
                          <SelectContent>{EQUIPMENT_PRESETS.map((item) => <SelectItem key={item.name} value={item.name}>{item.name}</SelectItem>)}</SelectContent>
                        </Select>
                        <Button variant="outline" className="rounded-2xl" onClick={addRow}><Plus className="ml-2 h-4 w-4" />ردیف جدید</Button>
                      </div>
                      <div className="overflow-x-auto rounded-2xl border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>نام تجهیز</TableHead>
                              <TableHead>توان</TableHead>
                              <TableHead>تعداد</TableHead>
                              <TableHead>ساعت کار</TableHead>
                              <TableHead>ولتاژ</TableHead>
                              <TableHead>اولویت</TableHead>
                              <TableHead>Surge</TableHead>
                              <TableHead>حذف</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {rows.map((row) => (
                              <TableRow key={row.id}>
                                <TableCell className="min-w-[160px]"><Input value={row.name} onChange={(e) => updateRow(row.id, "name", e.target.value)} /></TableCell>
                                <TableCell><NumberStepperInput value={row.power} onChange={(v) => updateRow(row.id, "power", v)} step={10} min={0} /></TableCell>
                                <TableCell><NumberStepperInput value={row.qty} onChange={(v) => updateRow(row.id, "qty", v)} step={1} min={0} /></TableCell>
                                <TableCell><NumberStepperInput value={row.hours} onChange={(v) => updateRow(row.id, "hours", v)} step={1} min={0} /></TableCell>
                                <TableCell><NumberStepperInput value={row.voltage} onChange={(v) => updateRow(row.id, "voltage", v)} step={10} min={0} /></TableCell>
                                <TableCell>
                                  <Select value={row.priority || "essential"} onValueChange={(v) => updateRow(row.id, "priority", v)}>
                                    <SelectTrigger className="min-w-[140px] rounded-xl"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="essential">ضروری</SelectItem>
                                      <SelectItem value="nonessential">غیراولویتی</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell><NumberStepperInput value={row.surge ?? 1} onChange={(v) => updateRow(row.id, "surge", v)} step={0.1} min={1} max={8} /></TableCell>
                                <TableCell><Button variant="ghost" size="icon" onClick={() => removeRow(row.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {mode === "power" && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <LabeledInput label="توان کل مصرفی" desc="مجموع توان کل مصرف کننده ها" value={totalPowerInput} onChange={setTotalPowerInput} />
                      <LabeledInput label="ولتاژ شبکه" desc="ولتاژ بار یا شبکه" value={totalVoltageInput} onChange={setTotalVoltageInput} />
                      <LabeledInput label="ساعت کار روزانه" desc="میانگین ساعات کارکرد روزانه" value={totalHoursInput} onChange={setTotalHoursInput} />
                    </div>
                  )}

                  {mode === "current" && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <LabeledInput label="جریان کل مصرفی" desc="مجموع جریان مصرف کننده ها" value={totalCurrentInput} onChange={setTotalCurrentInput} />
                      <LabeledInput label="ولتاژ متناظر" desc="ولتاژ متناظر با جریان" value={totalVoltageInput} onChange={setTotalVoltageInput} />
                      <LabeledInput label="ساعت کار روزانه" desc="میانگین ساعات کارکرد روزانه" value={totalHoursInput} onChange={setTotalHoursInput} />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-[1.75rem] shadow-sm">
                <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-lg"><Battery className="h-5 w-5" />داشته های موجود پروژه</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <LabeledInput label="تعداد پنل موجود" desc="پنل های قابل استفاده در پروژه" value={settings.availablePanelCount} onChange={(v) => setField("availablePanelCount", v)} />
                    <LabeledInput label="تعداد باتری موجود" desc="مجموع باتری های قابل استفاده" value={settings.availableBatteryUnits} onChange={(v) => setField("availableBatteryUnits", v)} />
                    <LabeledInput label="توان اینورتر موجود" desc="توان نامی اینورتر یا اینورترهای موجود" value={settings.availableInverterPower} onChange={(v) => setField("availableInverterPower", v)} />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[1.75rem] shadow-sm">
                <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-lg"><Settings2 className="h-5 w-5" />پارامترهای طراحی</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <LabeledInput label="ولتاژ سیستم" desc="مثلاً 24 یا 48 ولت" value={settings.systemVoltage} onChange={(v) => setField("systemVoltage", v)} />
                    <LabeledInput label="توان هر پنل" desc="وات نامی پنل" value={settings.panelWatt} onChange={(v) => setField("panelWatt", v)} />
                    <LabeledInput label="Voc پنل" desc="ولتاژ مدار باز پنل" value={settings.panelVoc} onChange={(v) => setField("panelVoc", v)} />
                    <LabeledInput label="Vmp پنل" desc="ولتاژ کاری پنل" value={settings.panelVmp} onChange={(v) => setField("panelVmp", v)} />
                    <LabeledInput label="ساعت مفید تابش" desc="تابش موثر روزانه" value={settings.sunHours} onChange={(v) => setField("sunHours", v)} />
                    <LabeledInput label="ضریب اطمینان اینورتر" desc="معمولاً 1.1 تا 1.3" value={settings.inverterSafetyFactor} onChange={(v) => setField("inverterSafetyFactor", v)} />
                    <LabeledInput label="راندمان اینورتر" desc="مثلاً 0.92" value={settings.inverterEfficiency} onChange={(v) => setField("inverterEfficiency", v)} />
                    <LabeledInput label="راندمان باتری" desc="مثلاً 0.9" value={settings.batteryEfficiency} onChange={(v) => setField("batteryEfficiency", v)} />
                    <LabeledInput label="عمق دشارژ" desc="برای لیتیوم 0.8 متداول است" value={settings.depthOfDischarge} onChange={(v) => setField("depthOfDischarge", v)} />
                    <LabeledInput label="روز پشتیبانی" desc="کارکرد بدون تابش" value={settings.autonomyDays} onChange={(v) => setField("autonomyDays", v)} />
                    <LabeledInput label="ضریب ایمنی کنترلر" desc="مثلاً 1.25" value={settings.controllerSafetyFactor} onChange={(v) => setField("controllerSafetyFactor", v)} />
                    <LabeledInput label="ضریب تلفات سیستم" desc="تلفات کلی پنل تا بار" value={settings.dailyLossFactor} onChange={(v) => setField("dailyLossFactor", v)} />
                    <LabeledInput label="افت کابل درصد" desc="معمولاً 2 تا 5 درصد" value={settings.cableLossPercent} onChange={(v) => setField("cableLossPercent", v)} />
                    <LabeledInput label="ضریب همزمانی بار" desc="درصد بار روشن همزمان" value={settings.simultaneousLoadFactor} onChange={(v) => setField("simultaneousLoadFactor", v)} />
                    <LabeledInput label="حداقل MPPT اینورتر" desc="ولت" value={settings.inverterMpptMin} onChange={(v) => setField("inverterMpptMin", v)} />
                    <LabeledInput label="حداکثر MPPT اینورتر" desc="ولت" value={settings.inverterMpptMax} onChange={(v) => setField("inverterMpptMax", v)} />
                    <LabeledInput label="حداکثر DC اینورتر" desc="حد نهایی ولتاژ ورودی" value={settings.inverterDcMax} onChange={(v) => setField("inverterDcMax", v)} />
                    <LabeledInput label="ضریب تصحیح Voc دما" desc="مثلاً 1.1 تا 1.15" value={settings.tempCorrectionVoc} onChange={(v) => setField("tempCorrectionVoc", v)} />
                    <LabeledInput label="ولتاژ هر باتری" desc="مثلاً 12 ولت" value={settings.batteryUnitVoltage} onChange={(v) => setField("batteryUnitVoltage", v)} />
                    <LabeledInput label="ظرفیت هر باتری" desc="آمپر ساعت" value={settings.batteryUnitAh} onChange={(v) => setField("batteryUnitAh", v)} />
                    <LabeledInput label="طول کابل PV" desc="متر رفت و برگشت مسیر پنل" value={settings.pvCableLength} onChange={(v) => setField("pvCableLength", v)} />
                    <LabeledInput label="طول کابل باتری" desc="متر رفت و برگشت مسیر باتری" value={settings.batteryCableLength} onChange={(v) => setField("batteryCableLength", v)} />
                    <LabeledInput label="طول کابل AC" desc="متر مسیر خروجی AC" value={settings.acCableLength} onChange={(v) => setField("acCableLength", v)} />
                    <LabeledInput label="ضریب ایمنی فیوز" desc="معمولاً 1.25" value={settings.fuseSafetyFactor} onChange={(v) => setField("fuseSafetyFactor", v)} />
                    <div className="rounded-2xl border bg-white p-3 shadow-sm">
                      <div className="mb-1 text-sm font-semibold text-slate-800">نوع باتری</div>
                      <div className="mb-3 text-xs leading-6 text-slate-500">برای محدودیت DoD و تفسیر طراحی</div>
                      <Select value={settings.batteryChemistry} onValueChange={(v) => setField("batteryChemistry", v)}>
                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lithium">لیتیوم</SelectItem>
                          <SelectItem value="lead-acid">سرب اسیدی</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="rounded-2xl border bg-white p-3 shadow-sm">
                      <div className="mb-1 text-sm font-semibold text-slate-800">جنس هادی</div>
                      <div className="mb-3 text-xs leading-6 text-slate-500">برای تخمین سطح مقطع کابل</div>
                      <Select value={settings.conductorMaterial} onValueChange={(v) => setField("conductorMaterial", v)}>
                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="copper">مس</SelectItem>
                          <SelectItem value="aluminum">آلومینیوم</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="rounded-2xl" onClick={() => setRoute("selector")}><ArrowRight className="ml-2 h-4 w-4" />بازگشت</Button>
              </div>

              {!!result.warnings.length && (
                <AlertCard title="هشدارهای طراحی" color="amber">
                  {result.warnings.map((item, i) => <li key={i}>{item}</li>)}
                </AlertCard>
              )}
              {!!result.notes.length && (
                <AlertCard title="یادداشت ها" color="green">
                  {result.notes.map((item, i) => <li key={i}>{item}</li>)}
                </AlertCard>
              )}

              <div className="rounded-[1.75rem] border border-slate-300 bg-white shadow-xl">
                <div className="rounded-t-[1.75rem] px-4 py-4 text-white sm:px-6" style={{ background: `linear-gradient(90deg, ${BRAND.primary}, ${BRAND.secondary}, ${BRAND.dark})` }}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img src={logoSrc || DEFAULT_LOGO} alt="logo" className="h-14 w-14 rounded-2xl border border-white/20 bg-white/10 object-cover sm:h-16 sm:w-16" />
                      <div>
                        <div className="text-base font-extrabold sm:text-xl">گزارش مهندسی نیازسنجی سامانه خورشیدی</div>
                        <div className="mt-1 text-xs text-white/80 sm:text-sm">خلاصه فنی و کنترل قیود طراحی</div>
                      </div>
                    </div>
                    <div className="text-left text-[11px] leading-6 sm:text-xs">
                      <div>روش: {reportData.methodLabel}</div>
                      <div>تاریخ: {settings.reportDate || "-"}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 p-3 sm:p-4 md:p-5">
                  <div className="grid gap-3 md:grid-cols-2">
                    <A4Block title="مشخصات پروژه">{reportData.projectRows.map(([label, value]) => <ReportRow key={label} label={label} value={value} />)}</A4Block>
                    <A4Block title="نتایج محاسبات">{reportData.resultRows.map(([label, value]) => <ReportRow key={label} label={label} value={value} />)}</A4Block>
                  </div>

                  <A4Block title="پارامترهای طراحی">
                    <div className="grid gap-2 md:grid-cols-2">{reportData.designRows.map(([label, value]) => <ReportRow key={label} label={label} value={value} compact />)}</div>
                  </A4Block>

                  {hasEquipmentRows && (
                    <A4Block title="خلاصه مصرف کننده ها">
                      <div className="overflow-hidden rounded-2xl border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>نام تجهیز</TableHead>
                              <TableHead>تعداد</TableHead>
                              <TableHead>توان</TableHead>
                              <TableHead>ساعت</TableHead>
                              <TableHead>Surge</TableHead>
                              <TableHead>انرژی روزانه</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {result.items.slice(0, 6).map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{format(item.qty, 0)}</TableCell>
                                <TableCell>{format(item.power)} وات</TableCell>
                                <TableCell>{format(item.hours)} ساعت</TableCell>
                                <TableCell>{format(item.surge)}×</TableCell>
                                <TableCell>{format(item.dailyEnergy)} Wh</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </A4Block>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <MetricCard title="وضعیت طراحی" value={result.engineeringStatus} icon={<Info className="h-4 w-4" />} />
                    <MetricCard title="اینورتر پیشنهادی" value={`${result.inverterSuggested.model} | ${format(result.inverterSuggested.power)} وات`} icon={<Zap className="h-4 w-4" />} />
                    <MetricCard title="آرایش پنل" value={result.panelsInSeries ? `${format(result.panelsInSeries, 0)}S × ${format(result.parallelStrings, 0)}P` : "نیازمند بازنگری"} icon={<Calculator className="h-4 w-4" />} />
                    <MetricCard title="ولتاژ رشته پنل" value={result.panelsInSeries ? `${format(result.stringVmp)} / ${format(result.stringVocCold)} V` : "-"} icon={<Calculator className="h-4 w-4" />} />
                    <MetricCard title="باتری موردنیاز" value={`${format(result.totalBatteryUnits, 0)} عدد`} icon={<Battery className="h-4 w-4" />} />
                    <MetricCard title="نرخ شارژ / دشارژ" value={`${format(result.batteryChargeC)}C / ${format(result.batteryDischargeC)}C`} icon={<Battery className="h-4 w-4" />} />
                    <MetricCard title="جریان کنترلر" value={`${format(result.controllerCurrent)} آمپر`} icon={<Info className="h-4 w-4" />} />
                    <MetricCard title="حاشیه انرژی" value={`${format(result.energyMargin)} ×`} icon={<Info className="h-4 w-4" />} />
                  </div>

                  <A4Block title="داشته های موجود و کسری تجهیزات">
                    <div className="grid gap-3 md:grid-cols-2">
                      <ReportRow label="پنل موجود" value={`${format(result.sanitizedSettings.availablePanelCount, 0)} عدد | ${format(result.existingPanelPower)} وات نامی`} compact />
                      <ReportRow label="کسری پنل" value={`${format(result.additionalPanelCount, 0)} عدد`} compact />
                      <ReportRow label="باتری موجود" value={`${format(result.sanitizedSettings.availableBatteryUnits, 0)} عدد | ${format(result.existingUsableBatteryWh)} Wh قابل استفاده`} compact />
                      <ReportRow label="کسری باتری" value={`${format(result.additionalBatteryUnits, 0)} عدد`} compact />
                      <ReportRow label="اینورتر موجود" value={`${format(result.sanitizedSettings.availableInverterPower)} وات`} compact />
                      <ReportRow label="کسری توان اینورتر" value={`${format(result.additionalInverterPower)} وات`} compact />
                    </div>
                  </A4Block>

                  <A4Block title="طراحی کابل و حفاظت">
                    <div className="grid gap-3 md:grid-cols-2">
                      <ReportRow label="سطح مقطع کابل PV" value={`${format(result.cableSizing.pv.standardArea)} mm2`} compact />
                      <ReportRow label="فیوز PV" value={`${format(result.protections.pvFuse, 0)} A`} compact />
                      <ReportRow label="سطح مقطع کابل باتری" value={`${format(result.cableSizing.battery.standardArea)} mm2`} compact />
                      <ReportRow label="فیوز باتری" value={`${format(result.protections.batteryFuse, 0)} A`} compact />
                      <ReportRow label="سطح مقطع کابل AC" value={`${format(result.cableSizing.ac.standardArea)} mm2`} compact />
                      <ReportRow label="کلید مینیاتوری AC" value={`${format(result.protections.acBreaker, 0)} A`} compact />
                    </div>
                  </A4Block>

                  <A4Block title="کنترل قیود مهندسی">
                    <div className="grid gap-3 md:grid-cols-2">
                      {result.designChecks.map((check) => (
                        <div key={check.title} className={`rounded-2xl border p-3 shadow-sm ${check.status === "pass" ? "border-emerald-200 bg-emerald-50" : check.status === "warn" ? "border-amber-200 bg-amber-50" : "border-rose-200 bg-rose-50"}`}>
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <div className="font-bold">{check.title}</div>
                            <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${check.status === "pass" ? "bg-emerald-100 text-emerald-800" : check.status === "warn" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"}`}>
                              {check.status === "pass" ? "مجاز" : check.status === "warn" ? "نیازمند توجه" : "نامجاز"}
                            </span>
                          </div>
                          <div className="text-sm font-semibold text-slate-800">{check.value}</div>
                          <div className="mt-2 text-xs leading-6 text-slate-600">{check.recommendation}</div>
                        </div>
                      ))}
                    </div>
                  </A4Block>

                  <A4Block title="جمع بندی نیاز مهندسی پروژه">
                    <div className="space-y-2">
                      {result.requirementSummary.map((step, index) => (
                        <div key={index} className="rounded-2xl bg-slate-50 px-3 py-3 text-sm leading-7 text-slate-700">{step}</div>
                      ))}
                    </div>
                  </A4Block>

                  <A4Block title="تجهیزات مهندسی شده موردنیاز">
                    <div className="overflow-hidden rounded-2xl border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>آیتم</TableHead>
                            <TableHead>مشخصه</TableHead>
                            <TableHead>تعداد</TableHead>
                            <TableHead>توضیح</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bomRows.map((row) => (
                            <TableRow key={`${row.item}-${row.spec}`}>
                              <TableCell>{row.item}</TableCell>
                              <TableCell>{row.spec}</TableCell>
                              <TableCell>{row.qty}</TableCell>
                              <TableCell>{row.note}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </A4Block>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AlertCard({ title, color, children }) {
  const styles = color === "green"
    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
    : "border-amber-200 bg-amber-50 text-amber-900";
  return <div className={`rounded-2xl border p-4 shadow-sm ${styles}`}><div className="mb-2 flex items-center gap-2 font-bold">{color === "green" ? <Info className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}{title}</div><ul className="space-y-2 pr-5 text-sm leading-7 list-disc">{children}</ul></div>;
}

function MetricCard({ title, value, icon }) {
  return <div className="rounded-2xl border bg-slate-50 p-3 shadow-sm"><div className="mb-2 flex items-center gap-2 text-xs text-slate-500">{icon}{title}</div><div className="text-sm font-bold sm:text-base">{value}</div></div>;
}

function A4Block({ title, children }) {
  return <div className="rounded-[1.25rem] border bg-white p-3 shadow-sm"><div className="mb-3 text-sm font-bold text-indigo-700 sm:text-base">{title}</div><div className="space-y-2">{children}</div></div>;
}

function ReportRow({ label, value, compact = false }) {
  return <div className={compact ? "flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-xs sm:text-sm" : "flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3 text-xs sm:text-sm"}><span className="text-slate-600">{label}</span><span className="font-semibold text-slate-900">{value}</span></div>;
}

function LabeledInput({ label, desc, value, onChange, type = "number" }) {
  return <div className="rounded-2xl border bg-white p-3 shadow-sm"><div className="mb-1 text-sm font-semibold text-slate-800">{label}</div><div className="mb-3 text-xs leading-6 text-slate-500">{desc}</div>{type === "number" ? <NumberStepperInput value={value} onChange={onChange} /> : <Input value={value} onChange={(e) => onChange(e.target.value)} className="text-right" />}</div>;
}

function NumberStepperInput({ value, onChange, step = 1, min = -Infinity, max = Infinity }) {
  const adjust = (delta) => onChange(String(round2(Math.min(max, Math.max(min, num(value) + delta)))));
  const handleChange = (raw) => {
    const normalized = normalizeDigits(raw).replace(/,/g, "");
    if (normalized === "" || normalized === "-" || normalized === "." || normalized === "-.") return onChange(normalized);
    if (/^-?\d*\.?\d*$/.test(normalized)) onChange(normalized);
  };
  return (
    <div className="flex items-center gap-2">
      <Button type="button" variant="outline" className="h-10 w-10 rounded-xl px-0" onClick={() => adjust(-step)}>-</Button>
      <Input
        type="text"
        inputMode="decimal"
        value={value ?? ""}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={(e) => e.target.select()}
        onBlur={(e) => {
          const cleaned = normalizeDigits(e.target.value).replace(/,/g, "");
          if (cleaned === "" || cleaned === "-" || cleaned === "." || cleaned === "-.") return onChange(String(min > 0 ? min : 0));
          onChange(String(round2(Math.min(max, Math.max(min, num(cleaned))))));
        }}
        className="text-right"
      />
      <Button type="button" variant="outline" className="h-10 w-10 rounded-xl px-0" onClick={() => adjust(step)}>+</Button>
    </div>
  );
}
