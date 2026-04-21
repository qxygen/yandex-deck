import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  Brain,
  Boxes,
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Database,
  FileBarChart,
  Layers3,
  Network,
  ShieldAlert,
  Sparkles,
  Wallet,
} from "lucide-react";

const RADIAN = Math.PI / 180;
const FX_RATE = 75.237;
const USD2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const toUsdBn = (rubBn: number) => rubBn / FX_RATE;
const toUsdShare = (rub: number) => rub / FX_RATE;
const fmtUsdBn = (rubBn: number) => `$${USD2.format(toUsdBn(rubBn))}bn`;
const fmtUsdShare = (rub: number) => `$${USD2.format(toUsdShare(rub))}`;
const num = (value: unknown) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

type Basis = "reported" | "hybrid" | "adjusted";
type ScenarioKey = "bear" | "base" | "bull";
type MomentumMode = "scale" | "margin" | "earnings";
type ExplorerMode = "assets" | "liabilities";
type Classification = "operating" | "financing";

type LineItem = {
  id: string;
  title: string;
  side: "asset" | "liability";
  defaultClass: Classification;
  value2025: number;
  value2024: number;
  rationale: string;
  examples: string;
};

const tooltipStyle = {
  contentStyle: {
    background: "rgba(10,10,14,0.96)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 16,
    color: "white",
    boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
  },
  labelStyle: { color: "rgba(255,255,255,0.72)" },
  itemStyle: { color: "white" },
};

const annual = [
  { year: 2021, revenue: 356.2, ebitda: 32.1, reported: -14.7, adjusted: 8.0 },
  { year: 2022, revenue: 521.7, ebitda: 64.1, reported: 47.6, adjusted: 10.8 },
  { year: 2023, revenue: 800.1, ebitda: 97.0, reported: 21.8, adjusted: 27.4 },
  { year: 2024, revenue: 1094.6, ebitda: 188.6, reported: 11.5, adjusted: 100.9 },
  { year: 2025, revenue: 1441.1, ebitda: 280.8, reported: 79.6, adjusted: 141.4 },
].map((d, i, arr) => ({
  ...d,
  revenueUsd: toUsdBn(d.revenue),
  ebitdaUsd: toUsdBn(d.ebitda),
  reportedUsd: toUsdBn(d.reported),
  adjustedUsd: toUsdBn(d.adjusted),
  margin: +(d.ebitda / d.revenue * 100).toFixed(1),
  revGrowth: i === 0 ? null : +(((d.revenue / arr[i - 1].revenue) - 1) * 100).toFixed(1),
  ebitdaGrowth: i === 0 ? null : +(((d.ebitda / arr[i - 1].ebitda) - 1) * 100).toFixed(1),
}));

const segments2025 = [
  {
    id: "search",
    name: "Search & AI",
    revenue: 551.2,
    margin: 44.5,
    color: "#ffd21f",
    role: "Core profit engine",
    thesis: "The economic anchor of the Yandex story. It funds the broader ecosystem and deserves the highest confidence in valuation.",
    scenarioMargins: { bear: 40, base: 44, bull: 46 },
  },
  {
    id: "city",
    name: "City Services",
    revenue: 804.5,
    margin: 7.8,
    color: "#ff9f1a",
    role: "Scale and logistics",
    thesis: "Large and strategically important. The key question is whether scale can convert into meaningfully higher long-run margins.",
    scenarioMargins: { bear: 5, base: 8, bull: 10.5 },
  },
  {
    id: "personal",
    name: "Personal Services",
    revenue: 214.3,
    margin: 3.3,
    color: "#8b5cf6",
    role: "Engagement and retention",
    thesis: "Supports ecosystem stickiness, but still needs to prove stronger earnings conversion over time.",
    scenarioMargins: { bear: 2, base: 4, bull: 6 },
  },
  {
    id: "b2b",
    name: "B2B Tech",
    revenue: 48.2,
    margin: 19.6,
    color: "#22c55e",
    role: "Enterprise optionality",
    thesis: "Still small, but strategically attractive and relevant for diversified earnings quality.",
    scenarioMargins: { bear: 16, base: 20, bull: 24 },
  },
].map((d) => ({ ...d, share: +(d.revenue / 1618.2 * 100).toFixed(1), revenueUsd: toUsdBn(d.revenue) }));

const ydexPriceData = [{"date":"2021-07-19","close":69.07,"vol":1.824},{"date":"2021-07-26","close":66.06,"vol":3.562},{"date":"2021-08-02","close":66.07,"vol":2.048},{"date":"2021-08-09","close":66.12,"vol":1.583},{"date":"2021-08-16","close":67.27,"vol":2.206},{"date":"2021-08-23","close":70.55,"vol":1.916},{"date":"2021-08-30","close":76.19,"vol":4.387},{"date":"2021-09-06","close":78.0,"vol":2.407},{"date":"2021-09-13","close":77.47,"vol":2.754},{"date":"2021-09-20","close":77.76,"vol":1.883},{"date":"2021-09-27","close":70.56,"vol":2.271},{"date":"2021-10-04","close":75.0,"vol":1.985},{"date":"2021-10-11","close":78.81,"vol":2.034},{"date":"2021-10-18","close":80.51,"vol":2.076},{"date":"2021-10-25","close":82.42,"vol":1.861},{"date":"2021-11-01","close":82.78,"vol":2.462},{"date":"2021-11-08","close":80.68,"vol":1.553},{"date":"2021-11-15","close":76.27,"vol":2.491},{"date":"2021-11-22","close":73.71,"vol":3.48},{"date":"2021-11-29","close":75.72,"vol":2.557},{"date":"2021-12-06","close":77.53,"vol":1.7},{"date":"2021-12-13","close":74.87,"vol":2.478},{"date":"2021-12-20","close":72.63,"vol":2.664},{"date":"2021-12-27","close":67.48,"vol":1.466},{"date":"2022-01-03","close":65.04,"vol":1.814},{"date":"2022-01-10","close":62.04,"vol":2.092},{"date":"2022-01-17","close":57.89,"vol":3.249},{"date":"2022-01-24","close":48.12,"vol":5.925},{"date":"2022-01-31","close":50.9,"vol":7.227},{"date":"2022-02-07","close":46.03,"vol":4.071},{"date":"2022-02-14","close":41.74,"vol":5.344},{"date":"2022-02-21","close":24.78,"vol":13.215},{"date":"2022-02-28","close":22.86,"vol":5.003},{"date":"2022-03-07","close":23.78,"vol":0.0},{"date":"2022-03-14","close":23.78,"vol":0.0},{"date":"2022-03-21","close":23.78,"vol":0.0},{"date":"2022-03-28","close":23.78,"vol":0.0},{"date":"2022-04-04","close":23.78,"vol":0.0},{"date":"2022-04-11","close":23.78,"vol":0.0},{"date":"2022-04-18","close":23.78,"vol":0.0},{"date":"2022-04-25","close":23.78,"vol":0.0},{"date":"2022-05-02","close":23.78,"vol":0.0},{"date":"2022-05-09","close":23.78,"vol":0.0},{"date":"2022-05-16","close":23.78,"vol":0.0},{"date":"2022-05-23","close":23.78,"vol":0.0},{"date":"2022-05-30","close":23.78,"vol":0.0},{"date":"2022-06-06","close":23.78,"vol":0.0},{"date":"2022-06-13","close":23.78,"vol":0.0},{"date":"2022-06-20","close":23.78,"vol":0.0},{"date":"2022-06-27","close":23.78,"vol":0.0},{"date":"2022-07-04","close":23.78,"vol":0.0},{"date":"2022-07-11","close":23.78,"vol":0.0},{"date":"2022-07-18","close":23.78,"vol":0.0},{"date":"2022-07-25","close":23.78,"vol":0.0},{"date":"2022-08-01","close":23.78,"vol":0.0},{"date":"2022-08-08","close":23.78,"vol":0.0},{"date":"2022-08-15","close":23.78,"vol":0.0},{"date":"2022-08-22","close":23.78,"vol":0.0},{"date":"2022-08-29","close":23.78,"vol":0.0},{"date":"2022-09-05","close":23.78,"vol":0.0},{"date":"2022-09-12","close":23.78,"vol":0.0},{"date":"2022-09-19","close":23.78,"vol":0.0},{"date":"2022-09-26","close":23.78,"vol":0.0},{"date":"2022-10-03","close":23.78,"vol":0.0},{"date":"2022-10-10","close":23.78,"vol":0.0},{"date":"2022-10-17","close":23.78,"vol":0.0},{"date":"2022-10-24","close":23.78,"vol":0.0},{"date":"2022-10-31","close":23.78,"vol":0.0},{"date":"2022-11-07","close":23.78,"vol":0.0},{"date":"2022-11-14","close":23.78,"vol":0.0},{"date":"2022-11-21","close":23.78,"vol":0.0},{"date":"2022-11-28","close":23.78,"vol":0.0},{"date":"2022-12-05","close":23.78,"vol":0.0},{"date":"2022-12-12","close":23.78,"vol":0.0},{"date":"2022-12-19","close":23.78,"vol":0.0},{"date":"2022-12-26","close":23.78,"vol":0.0},{"date":"2023-01-02","close":23.78,"vol":0.0},{"date":"2023-01-09","close":23.78,"vol":0.0},{"date":"2023-01-16","close":23.78,"vol":0.0},{"date":"2023-01-23","close":23.78,"vol":0.0},{"date":"2023-01-30","close":23.78,"vol":0.0},{"date":"2023-02-06","close":23.78,"vol":0.0},{"date":"2023-02-13","close":23.78,"vol":0.0},{"date":"2023-02-20","close":23.78,"vol":0.0},{"date":"2023-02-27","close":23.78,"vol":0.0},{"date":"2023-03-06","close":23.78,"vol":0.0},{"date":"2023-03-13","close":23.78,"vol":0.0},{"date":"2023-03-20","close":23.78,"vol":0.0},{"date":"2023-03-27","close":23.78,"vol":0.0},{"date":"2023-04-03","close":23.78,"vol":0.0},{"date":"2023-04-10","close":23.78,"vol":0.0},{"date":"2023-04-17","close":23.78,"vol":0.0},{"date":"2023-04-24","close":23.78,"vol":0.0},{"date":"2023-05-01","close":23.78,"vol":0.0},{"date":"2023-05-08","close":23.78,"vol":0.0},{"date":"2023-05-15","close":23.78,"vol":0.0},{"date":"2023-05-22","close":23.78,"vol":0.0},{"date":"2023-05-29","close":23.78,"vol":0.0},{"date":"2023-06-05","close":23.78,"vol":0.0},{"date":"2023-06-12","close":23.78,"vol":0.0},{"date":"2023-06-19","close":23.78,"vol":0.0},{"date":"2023-06-26","close":23.78,"vol":0.0},{"date":"2023-07-03","close":23.78,"vol":0.0},{"date":"2023-07-10","close":23.78,"vol":0.0},{"date":"2023-07-17","close":23.78,"vol":0.0},{"date":"2023-07-24","close":23.78,"vol":0.0},{"date":"2023-07-31","close":23.78,"vol":0.0},{"date":"2023-08-07","close":23.78,"vol":0.0},{"date":"2023-08-14","close":23.78,"vol":0.0},{"date":"2023-08-21","close":23.78,"vol":0.0},{"date":"2023-08-28","close":23.78,"vol":0.0},{"date":"2023-09-04","close":23.78,"vol":0.0},{"date":"2023-09-11","close":23.78,"vol":0.0},{"date":"2023-09-18","close":23.78,"vol":0.0},{"date":"2023-09-25","close":23.78,"vol":0.0},{"date":"2023-10-02","close":23.78,"vol":0.0},{"date":"2023-10-09","close":23.78,"vol":0.0},{"date":"2023-10-16","close":23.78,"vol":0.0},{"date":"2023-10-23","close":23.78,"vol":0.0},{"date":"2023-10-30","close":23.78,"vol":0.0},{"date":"2023-11-06","close":23.78,"vol":0.0},{"date":"2023-11-13","close":23.78,"vol":0.0},{"date":"2023-11-20","close":23.78,"vol":0.0},{"date":"2023-11-27","close":23.78,"vol":0.0},{"date":"2023-12-04","close":23.78,"vol":0.0},{"date":"2023-12-11","close":23.78,"vol":0.0},{"date":"2023-12-18","close":23.78,"vol":0.0},{"date":"2023-12-25","close":23.78,"vol":0.0},{"date":"2024-01-01","close":23.78,"vol":0.0},{"date":"2024-01-08","close":23.78,"vol":0.0},{"date":"2024-01-15","close":23.78,"vol":0.0},{"date":"2024-01-22","close":23.78,"vol":0.0},{"date":"2024-01-29","close":23.78,"vol":0.0},{"date":"2024-02-05","close":23.78,"vol":0.0},{"date":"2024-02-12","close":23.78,"vol":0.0},{"date":"2024-02-19","close":23.78,"vol":0.0},{"date":"2024-02-26","close":23.78,"vol":0.0},{"date":"2024-03-04","close":23.78,"vol":0.0},{"date":"2024-03-11","close":23.78,"vol":0.0},{"date":"2024-03-18","close":23.78,"vol":0.0},{"date":"2024-03-25","close":23.78,"vol":0.0},{"date":"2024-04-01","close":23.78,"vol":0.0},{"date":"2024-04-08","close":23.78,"vol":0.0},{"date":"2024-04-15","close":23.78,"vol":0.0},{"date":"2024-04-22","close":23.78,"vol":0.0},{"date":"2024-04-29","close":23.78,"vol":0.0},{"date":"2024-05-06","close":23.78,"vol":0.0},{"date":"2024-05-13","close":23.78,"vol":0.0},{"date":"2024-05-20","close":23.78,"vol":0.0},{"date":"2024-05-27","close":23.78,"vol":0.0},{"date":"2024-06-03","close":23.78,"vol":0.0},{"date":"2024-06-10","close":23.78,"vol":0.0},{"date":"2024-06-17","close":23.78,"vol":0.0},{"date":"2024-06-24","close":23.78,"vol":0.0},{"date":"2024-07-01","close":23.78,"vol":0.0},{"date":"2024-07-08","close":23.78,"vol":0.0},{"date":"2024-07-15","close":23.78,"vol":0.0},{"date":"2024-07-22","close":23.78,"vol":0.0},{"date":"2024-07-29","close":23.78,"vol":0.0},{"date":"2024-08-05","close":23.78,"vol":0.0},{"date":"2024-08-12","close":23.78,"vol":0.0},{"date":"2024-08-19","close":23.78,"vol":0.0},{"date":"2024-08-26","close":23.78,"vol":0.0},{"date":"2024-09-02","close":23.78,"vol":0.0},{"date":"2024-09-09","close":23.78,"vol":0.0},{"date":"2024-09-16","close":23.78,"vol":0.0},{"date":"2024-09-23","close":23.78,"vol":0.0},{"date":"2024-09-30","close":23.78,"vol":0.0},{"date":"2024-10-07","close":23.78,"vol":0.0},{"date":"2024-10-14","close":23.78,"vol":0.0},{"date":"2024-10-21","close":23.78,"vol":0.0},{"date":"2024-10-28","close":23.78,"vol":0.0},{"date":"2024-11-04","close":23.78,"vol":0.0},{"date":"2024-11-11","close":23.78,"vol":0.0},{"date":"2024-11-18","close":23.78,"vol":0.0},{"date":"2024-11-25","close":23.78,"vol":0.0},{"date":"2024-12-02","close":23.78,"vol":0.0},{"date":"2024-12-09","close":23.78,"vol":0.0},{"date":"2024-12-16","close":23.78,"vol":0.0},{"date":"2024-12-23","close":23.78,"vol":0.0},{"date":"2024-12-30","close":23.78,"vol":0.0},{"date":"2025-01-06","close":23.78,"vol":0.0},{"date":"2025-01-13","close":23.78,"vol":0.0},{"date":"2025-01-20","close":23.78,"vol":0.0},{"date":"2025-01-27","close":23.78,"vol":0.0},{"date":"2025-02-03","close":23.78,"vol":0.0},{"date":"2025-02-10","close":23.78,"vol":0.0},{"date":"2025-02-17","close":23.78,"vol":0.0},{"date":"2025-02-24","close":23.78,"vol":0.0},{"date":"2025-03-03","close":23.78,"vol":0.0},{"date":"2025-03-10","close":23.78,"vol":0.0},{"date":"2025-03-17","close":23.78,"vol":0.0},{"date":"2025-03-24","close":23.78,"vol":0.0},{"date":"2025-03-31","close":23.78,"vol":0.0},{"date":"2025-04-07","close":23.78,"vol":0.0},{"date":"2025-04-14","close":23.78,"vol":0.0},{"date":"2025-04-21","close":23.78,"vol":0.0},{"date":"2025-04-28","close":23.78,"vol":0.0},{"date":"2025-05-05","close":23.78,"vol":0.0},{"date":"2025-05-12","close":23.78,"vol":0.0},{"date":"2025-05-19","close":23.78,"vol":0.0},{"date":"2025-05-26","close":23.78,"vol":0.0},{"date":"2025-06-02","close":23.78,"vol":0.0},{"date":"2025-06-09","close":23.78,"vol":0.0},{"date":"2025-06-16","close":23.78,"vol":0.0},{"date":"2025-06-23","close":23.78,"vol":0.0},{"date":"2025-06-30","close":23.78,"vol":0.0},{"date":"2025-07-07","close":23.78,"vol":0.0},{"date":"2025-07-14","close":23.78,"vol":0.0},{"date":"2025-07-21","close":23.78,"vol":0.0},{"date":"2025-07-28","close":23.78,"vol":0.0},{"date":"2025-08-04","close":23.78,"vol":0.0},{"date":"2025-08-11","close":23.78,"vol":0.0},{"date":"2025-08-18","close":23.78,"vol":0.0},{"date":"2025-08-25","close":23.78,"vol":0.0},{"date":"2025-09-01","close":23.78,"vol":0.0},{"date":"2025-09-08","close":23.78,"vol":0.0},{"date":"2025-09-15","close":23.78,"vol":0.0},{"date":"2025-09-22","close":23.78,"vol":0.0},{"date":"2025-09-29","close":23.78,"vol":0.0},{"date":"2025-10-06","close":23.78,"vol":0.0},{"date":"2025-10-13","close":23.78,"vol":0.0},{"date":"2025-10-20","close":23.78,"vol":0.0},{"date":"2025-10-27","close":23.78,"vol":0.0},{"date":"2025-11-03","close":23.78,"vol":0.0},{"date":"2025-11-10","close":23.78,"vol":0.0},{"date":"2025-11-17","close":23.78,"vol":0.0},{"date":"2025-11-24","close":23.78,"vol":0.0},{"date":"2025-12-01","close":23.78,"vol":0.0},{"date":"2025-12-08","close":23.78,"vol":0.0},{"date":"2025-12-15","close":23.78,"vol":0.0},{"date":"2025-12-22","close":23.78,"vol":0.0},{"date":"2025-12-29","close":23.78,"vol":0.0},{"date":"2026-01-05","close":53.96,"vol":4.371},{"date":"2026-01-12","close":53.84,"vol":5.707},{"date":"2026-01-19","close":56.04,"vol":3.522},{"date":"2026-01-26","close":54.61,"vol":4.083},{"date":"2026-02-02","close":54.81,"vol":3.116},{"date":"2026-02-09","close":51.31,"vol":3.682},{"date":"2026-02-16","close":52.4,"vol":4.555},{"date":"2026-02-23","close":52.6,"vol":3.669},{"date":"2026-03-02","close":52.84,"vol":4.673},{"date":"2026-03-09","close":50.37,"vol":4.599},{"date":"2026-03-16","close":50.15,"vol":4.172},{"date":"2026-03-23","close":54.59,"vol":5.037},{"date":"2026-03-30","close":56.32,"vol":3.173},{"date":"2026-04-06","close":55.07,"vol":3.389},{"date":"2026-04-13","close":57.13,"vol":4.316},{"date":"2026-04-20","close":57.92,"vol":0.589}];

const lineItems: LineItem[] = [
  { id: "ppe", title: "Property and equipment", side: "asset", defaultClass: "operating", value2025: 331.2, value2024: 230.1, rationale: "Core infrastructure used to run the platform.", examples: "Servers, data-center hardware, logistics assets." },
  { id: "intangibles", title: "Goodwill and intangible assets", side: "asset", defaultClass: "operating", value2025: 187.1, value2024: 182.9, rationale: "Economic assets tied to acquired businesses and software capabilities.", examples: "Goodwill, developed software, customer relationships." },
  { id: "rou", title: "Right-of-use assets", side: "asset", defaultClass: "operating", value2025: 92.3, value2024: 88.2, rationale: "Leased assets support operations.", examples: "Office and logistics leases capitalized under IFRS 16." },
  { id: "content", title: "Content assets", side: "asset", defaultClass: "operating", value2025: 48.1, value2024: 38.9, rationale: "Supports content-driven services and engagement.", examples: "Licenses and content advances." },
  { id: "deferredTaxAssets", title: "Deferred tax assets", side: "asset", defaultClass: "operating", value2025: 29.9, value2024: 17.1, rationale: "Linked to accounting and operating activity.", examples: "Tax losses and timing differences." },
  { id: "loansNonCurrent", title: "Loans to customers, non-current", side: "asset", defaultClass: "financing", value2025: 26.1, value2024: 3.0, rationale: "Treated as financing-style assets.", examples: "Longer-dated lending balances." },
  { id: "debtSecuritiesNonCurrent", title: "Debt securities, non-current", side: "asset", defaultClass: "financing", value2025: 24.8, value2024: 0.0, rationale: "Treasury and investment balances.", examples: "Debt instruments outside the operating loop." },
  { id: "otherNonCurrent", title: "Other non-current assets", side: "asset", defaultClass: "operating", value2025: 39.6, value2024: 31.8, rationale: "Operating by default unless clearly financing-specific.", examples: "Longer-dated operating advances and platform assets." },
  { id: "inventory", title: "Inventory", side: "asset", defaultClass: "operating", value2025: 33.2, value2024: 30.9, rationale: "Working capital for commerce and related services.", examples: "Marketplace inventory balances." },
  { id: "receivables", title: "Trade accounts receivable", side: "asset", defaultClass: "operating", value2025: 95.5, value2024: 89.0, rationale: "Receivables arise from operating transactions.", examples: "Advertising and service receivables." },
  { id: "prepaids", title: "Prepaid expenses", side: "asset", defaultClass: "operating", value2025: 23.0, value2024: 26.5, rationale: "Normal operating timing difference.", examples: "Service prepayments and vendor advances." },
  { id: "vat", title: "VAT reclaimable", side: "asset", defaultClass: "operating", value2025: 32.5, value2024: 33.4, rationale: "Tax working-capital item linked to operations.", examples: "Recoverable indirect taxes." },
  { id: "loansCurrent", title: "Loans to customers, current", side: "asset", defaultClass: "financing", value2025: 91.4, value2024: 69.0, rationale: "Classified as financing-style deployment.", examples: "Current lending and fintech balances." },
  { id: "debtSecuritiesCurrent", title: "Debt securities, current", side: "asset", defaultClass: "financing", value2025: 15.2, value2024: 0.0, rationale: "Treasury-style holdings.", examples: "Short-term debt investments." },
  { id: "fundsReceivable", title: "Funds receivable", side: "asset", defaultClass: "operating", value2025: 10.0, value2024: 16.5, rationale: "Working operating balance.", examples: "Settlement-related receivables." },
  { id: "termDeposits", title: "Term deposits", side: "asset", defaultClass: "financing", value2025: 0.0, value2024: 0.9, rationale: "Classic financing asset.", examples: "Short-term deposits held as liquid balances." },
  { id: "cash", title: "Cash and cash equivalents", side: "asset", defaultClass: "financing", value2025: 250.2, value2024: 211.6, rationale: "Treated as financing asset in reformulation.", examples: "Cash and near-cash balances." },
  { id: "otherCurrentAssets", title: "Other current assets", side: "asset", defaultClass: "operating", value2025: 38.1, value2024: 28.9, rationale: "Operating unless clearly treasury or financial.", examples: "Miscellaneous current operating balances." },
  { id: "debtNonCurrent", title: "Debt, non-current", side: "liability", defaultClass: "financing", value2025: 179.6, value2024: 99.1, rationale: "Direct financing obligation.", examples: "Borrowings and non-current debt instruments." },
  { id: "leaseNonCurrent", title: "Lease liabilities, non-current", side: "liability", defaultClass: "financing", value2025: 72.2, value2024: 65.9, rationale: "Debt-like financing under the course framework.", examples: "IFRS 16 lease liabilities." },
  { id: "deferredTaxLiabilities", title: "Deferred tax liabilities", side: "liability", defaultClass: "operating", value2025: 16.0, value2024: 10.1, rationale: "Operating accounting consequence.", examples: "Timing differences from accounting and tax treatment." },
  { id: "financialLiabilitiesNonCurrent", title: "Financial Services liabilities, non-current", side: "liability", defaultClass: "financing", value2025: 17.8, value2024: 7.9, rationale: "Treated as financing burden linked to fintech balances.", examples: "Longer-dated financial-services obligations." },
  { id: "otherNonCurrentLiabilities", title: "Other non-current liabilities", side: "liability", defaultClass: "operating", value2025: 9.0, value2024: 10.3, rationale: "Operating until clearly debt-like.", examples: "Miscellaneous long-term platform obligations." },
  { id: "apOther", title: "Accounts payable and other liabilities", side: "liability", defaultClass: "operating", value2025: 210.4, value2024: 255.8, rationale: "Classic operating liabilities.", examples: "Trade payables, accruals, operating settlements." },
  { id: "debtCurrent", title: "Debt, current", side: "liability", defaultClass: "financing", value2025: 90.1, value2024: 160.9, rationale: "Short-term financing obligation.", examples: "Current borrowings and maturities." },
  { id: "financialLiabilitiesCurrent", title: "Financial Services liabilities, current", side: "liability", defaultClass: "financing", value2025: 249.7, value2024: 100.2, rationale: "Financing-style liabilities linked to financial services balances.", examples: "Customer funds and current fintech obligations." },
  { id: "taxesPayable", title: "Taxes payable", side: "liability", defaultClass: "operating", value2025: 66.6, value2024: 45.9, rationale: "Working operating obligation.", examples: "Current tax payables due to operations." },
  { id: "contractLiabilities", title: "Contract liabilities", side: "liability", defaultClass: "operating", value2025: 39.9, value2024: 32.6, rationale: "Operating liability from contracts and advance billings.", examples: "Deferred revenue and advance payments." },
  { id: "provisions", title: "Provisions", side: "liability", defaultClass: "operating", value2025: 47.5, value2024: 0.0, rationale: "Operating obligation related to the business.", examples: "Claims, reserves and estimated operating obligations." },
  { id: "leaseCurrent", title: "Lease liabilities, current", side: "liability", defaultClass: "financing", value2025: 18.3, value2024: 16.1, rationale: "Current debt-like lease burden.", examples: "Current IFRS 16 lease liabilities." },
];

const market = {
  priceRub: 4287,
  marketCapRubBn: 1674.2,
  shares: 390.54828,
  dividendRub: 110,
};

const scenarios = {
  bear: { e1Delta: -20, e2Delta: -25, r: 0.14, g: 0.02, label: "Bear" },
  base: { e1Delta: 0, e2Delta: 0, r: 0.125, g: 0.03, label: "Base" },
  bull: { e1Delta: 15, e2Delta: 15, r: 0.115, g: 0.04, label: "Bull" },
};

const basisConfig = {
  reported: { label: "Reported", currentE: 79.6, accent: "#60a5fa", nextYearBase: 115, secondYearBase: 150, pe: 21.5 },
  hybrid: { label: "Hybrid", currentE: 92.9, accent: "#f59e0b", nextYearBase: 140, secondYearBase: 190, pe: 18.4 },
  adjusted: { label: "Adjusted", currentE: 141.4, accent: "#22c55e", nextYearBase: 176, secondYearBase: 220, pe: 12.1 },
} as const;

const slideMeta = [
  { key: "overview", title: "Business overview" },
  { key: "structure", title: "Business structure" },
  { key: "framing", title: "Investment framing" },
  { key: "momentum", title: "Financial momentum" },
  { key: "earnings", title: "Earnings quality" },
  { key: "reformulation", title: "Reformulation" },
  { key: "drivers", title: "Profitability engine" },
  { key: "valuation", title: "Residual earnings" },
  { key: "implied", title: "Market expectations" },
  { key: "recommendation", title: "Recommendation" },
  { key: "appendix", title: "P.S. Explorer" },
];

const yearTick = (value: string) => {
  const [y, m] = value.split("-");
  return m === "01" ? y : "";
};

function usdTooltipFormatter(value: unknown, name?: unknown): [string, string] {
  return [`$${USD2.format(num(value))}bn`, String(name ?? "")];
}

function percentTooltipFormatter(value: unknown, name?: unknown): [string, string] {
  return [`${num(value).toFixed(1)}%`, String(name ?? "")];
}

function impliedTooltipFormatter(value: unknown): string {
  return `${num(value).toFixed(1)}%`;
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function residualValue(B0: number, E1: number, E2: number, D1: number, r: number, g: number) {
  const B1 = B0 + E1 - D1;
  const RE1 = E1 - r * B0;
  const RE2 = E2 - r * B1;
  const value = B0 + RE1 / (1 + r) + RE2 / ((1 + r) * (r - g));
  const noGrowth = B0 + RE1 / (1 + r) + RE2 / ((1 + r) * r);
  const impliedG = r - RE2 / (((market.marketCapRubBn - B0 - RE1 / (1 + r)) * (1 + r)) || 1e-9);
  return { B1, RE1, RE2, value, noGrowth, speculative: market.marketCapRubBn - noGrowth, impliedG };
}

function StatCard({ label, value, suffix = "", accent = "#ffffff", sub }: { label: string; value: string | number; suffix?: string; accent?: string; sub?: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-sm">
      <div className="text-xs uppercase tracking-[0.22em] text-white/45">{label}</div>
      <div className="mt-3 text-3xl font-semibold" style={{ color: accent }}>{value}{suffix}</div>
      {sub ? <div className="mt-2 text-sm leading-6 text-white/55">{sub}</div> : null}
    </div>
  );
}

function SectionTitle({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="space-y-3">
      <div className="text-xs uppercase tracking-[0.3em] text-[#ffd21f]">{eyebrow}</div>
      <h2 className="max-w-5xl text-4xl font-semibold leading-tight text-white md:text-5xl">{title}</h2>
      {subtitle ? <p className="max-w-4xl text-base leading-7 text-white/65 md:text-lg">{subtitle}</p> : null}
    </div>
  );
}

function Range({ label, value, min, max, step, onChange, format }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; format?: (v: number) => string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-white/70">
        <span>{label}</span>
        <span className="font-medium text-white">{format ? format(value) : value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10" />
    </div>
  );
}

function GlassButton({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn("rounded-2xl border px-4 py-2 text-sm transition-all duration-300", active ? "border-[#ffd21f]/60 bg-[#ffd21f]/15 text-white shadow-lg" : "border-white/10 bg-white/5 text-white/65 hover:border-white/20 hover:bg-white/10 hover:text-white")}>{children}</button>
  );
}

function LegendPills({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/65"><span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} /><span>{item.label}</span></div>
      ))}
    </div>
  );
}

function renderPieLabel(props: any) {
  const { cx, cy, midAngle, outerRadius, percent, name, fill } = props;
  const radius = outerRadius + 24;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const lineEndX = cx + (outerRadius + 8) * Math.cos(-midAngle * RADIAN);
  const lineEndY = cy + (outerRadius + 8) * Math.sin(-midAngle * RADIAN);
  const isRight = x > cx;
  const finalX = x + (isRight ? 14 : -14);
  return (
    <g>
      <path d={`M${lineEndX},${lineEndY} L${x},${y} L${finalX},${y}`} stroke={fill} strokeWidth={1.5} fill="none" opacity={0.9} />
      <circle cx={lineEndX} cy={lineEndY} r={2.5} fill={fill} />
      <text x={finalX + (isRight ? 4 : -4)} y={y - 4} fill="rgba(255,255,255,0.92)" textAnchor={isRight ? "start" : "end"} fontSize={13} fontWeight={600}>{name}</text>
      <text x={finalX + (isRight ? 4 : -4)} y={y + 14} fill="rgba(255,255,255,0.58)" textAnchor={isRight ? "start" : "end"} fontSize={12}>{(percent * 100).toFixed(1)}%</text>
    </g>
  );
}

function SlideContainer({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="relative flex h-full w-full min-h-0 flex-col">{children}</motion.div>
  );
}

function WaterfallChart() {
  const values = [79.6, 13.3, 92.9, 50.1, -1.6, 141.4];
  const labels = ["Reported", "+ FX & one-off", "Hybrid", "+ SBC add-backs", "− Tax effect", "Adjusted"];
  const kinds = ["total", "delta", "checkpoint", "delta", "delta", "total"] as const;
  const colors = ["#60a5fa", "#22c55e", "#f59e0b", "#8b5cf6", "#ef4444", "#22c55e"];
  let running = 0;
  const bars = values.map((value, i) => {
    const prev = running;
    if (kinds[i] === "delta") running += value;
    else running = value;
    return { label: labels[i], value, prev, current: running, kind: kinds[i], color: colors[i] };
  });
  const maxValue = Math.max(...bars.map((b) => Math.max(b.prev, b.current)), 0) * 1.15;
  const height = 260;
  const scale = (v: number) => (v / maxValue) * height;

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
      <div className="mb-4 flex items-center gap-3 text-white/60"><FileBarChart className="h-4 w-4" /> earnings waterfall</div>
      <LegendPills items={[{ label: "Checkpoints", color: "#f59e0b" }, { label: "Positive adjustments", color: "#22c55e" }, { label: "Negative adjustments", color: "#ef4444" }]} />
      <div className="mt-6 flex items-end justify-between gap-4 overflow-x-auto pb-2">
        {bars.map((bar, idx) => {
          const isDelta = bar.kind === "delta";
          const start = isDelta ? Math.min(bar.prev, bar.current) : 0;
          const end = isDelta ? Math.max(bar.prev, bar.current) : bar.current;
          const h = Math.max(scale(end) - scale(start), 16);
          const bottom = scale(start);
          const fill = !isDelta ? bar.color : bar.value >= 0 ? "#22c55e" : "#ef4444";
          return (
            <div key={bar.label} className="relative flex min-w-[120px] flex-col items-center">
              <div className="mb-3 text-center text-xs uppercase tracking-[0.18em] text-white/45">{bar.label}</div>
              <div className="relative h-[280px] w-full">
                {idx > 0 ? <div className="absolute left-[-30px] h-px w-[34px] bg-white/20" style={{ bottom: scale(bar.prev) }} /> : null}
                <motion.div initial={{ opacity: 0, y: 12, height: 0 }} animate={{ opacity: 1, y: 0, height: h }} transition={{ duration: 0.5, delay: idx * 0.05 }} className="absolute left-1/2 w-[72px] -translate-x-1/2 rounded-2xl" style={{ bottom, background: `linear-gradient(180deg, ${fill}, rgba(255,255,255,0.08))`, boxShadow: `0 0 32px ${fill}40` }} />
              </div>
              <div className="mt-3 text-lg font-semibold text-white">{isDelta ? `${bar.value > 0 ? "+" : ""}${fmtUsdBn(bar.value)}` : fmtUsdBn(bar.current)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function YandexInteractivePresentation() {
  const [slide, setSlide] = useState(0);
  const [basis, setBasis] = useState<Basis>("hybrid");
  const [scenario, setScenario] = useState<ScenarioKey>("base");
  const [momentumMode, setMomentumMode] = useState<MomentumMode>("scale");
  const [explorerMode, setExplorerMode] = useState<ExplorerMode>("assets");
  const [selectedSegment, setSelectedSegment] = useState(segments2025[0].id);
  const [selectedLine, setSelectedLine] = useState(lineItems[0].id);
  const [classificationOverrides, setClassificationOverrides] = useState<Record<string, Classification>>({});
  const [r, setR] = useState(scenarios.base.r);
  const [g, setG] = useState(scenarios.base.g);
  const [pm, setPm] = useState(8.6);
  const [ato, setAto] = useState(3.27);
  const [e1Adjust, setE1Adjust] = useState(0);
  const [e2Adjust, setE2Adjust] = useState(0);
  const [digitBuffer, setDigitBuffer] = useState("");
  const digitTimer = useRef<number | null>(null);

  useEffect(() => {
    const sc = scenarios[scenario];
    setR(sc.r);
    setG(sc.g);
    setE1Adjust(sc.e1Delta);
    setE2Adjust(sc.e2Delta);
  }, [scenario]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") setSlide((s) => Math.min(s + 1, slideMeta.length - 1));
      if (e.key === "ArrowLeft" || e.key === "PageUp") setSlide((s) => Math.max(s - 1, 0));
      if (/^[0-9]$/.test(e.key)) {
        const next = `${digitBuffer}${e.key}`;
        setDigitBuffer(next);
        if (digitTimer.current) window.clearTimeout(digitTimer.current);
        digitTimer.current = window.setTimeout(() => {
          const idx = Number(next) - 1;
          if (idx >= 0 && idx < slideMeta.length) setSlide(idx);
          setDigitBuffer("");
        }, 550);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [digitBuffer]);

  const dividend = useMemo(() => market.dividendRub * market.shares / 1000, []);
  const currentBasis = basisConfig[basis];
  const baseE1 = currentBasis.nextYearBase + e1Adjust;
  const baseE2 = currentBasis.secondYearBase + e2Adjust;
  const valuation = useMemo(() => residualValue(351.2, baseE1, baseE2, dividend, r, g), [baseE1, baseE2, dividend, r, g]);
  const valuePerShare = valuation.value / market.shares * 1000;
  const noGrowthPerShare = valuation.noGrowth / market.shares * 1000;
  const upside = (valuation.value / market.marketCapRubBn - 1) * 100;

  const basePM = 8.6;
  const baseATO = 3.27;
  const baseRNOA = +(basePM * baseATO).toFixed(1);
  const baseReOI = 1441.1 * (basePM / 100 - r / baseATO);
  const liveRNOA = +(pm * ato).toFixed(1);
  const liveReOI = 1441.1 * (pm / 100 - r / ato);

  const activeSegment = segments2025.find((s) => s.id === selectedSegment) ?? segments2025[0];
  const visibleLineItems = lineItems.filter((item) => item.side === (explorerMode === "assets" ? "asset" : "liability"));
  const activeLine = lineItems.find((item) => item.id === selectedLine) ?? visibleLineItems[0];
  const effectiveClass = (item: LineItem): Classification => classificationOverrides[item.id] ?? item.defaultClass;

  const explorerTotals = useMemo(() => {
    const oa = lineItems.filter((i) => i.side === "asset" && effectiveClass(i) === "operating").reduce((sum, i) => sum + i.value2025, 0);
    const fa = lineItems.filter((i) => i.side === "asset" && effectiveClass(i) === "financing").reduce((sum, i) => sum + i.value2025, 0);
    const ol = lineItems.filter((i) => i.side === "liability" && effectiveClass(i) === "operating").reduce((sum, i) => sum + i.value2025, 0);
    const fl = lineItems.filter((i) => i.side === "liability" && effectiveClass(i) === "financing").reduce((sum, i) => sum + i.value2025, 0);
    const noa = oa - ol;
    const nd = fl - fa;
    const equity = noa - nd;
    return { oa, fa, ol, fl, noa, nd, equity };
  }, [classificationOverrides]);

  const stackData = [
    { name: "Book value", value: toUsdBn(351.2), color: "#94a3b8" },
    { name: "No-growth premium", value: Math.max(toUsdBn(valuation.noGrowth - 351.2), 0), color: currentBasis.accent },
    { name: "Speculative premium", value: Math.max(toUsdBn(valuation.speculative), 0), color: "#ef4444" },
  ];

  const impliedGauge = [{ name: "Implied g", value: Math.max(Math.min(valuation.impliedG * 100, 10), 0), fill: currentBasis.accent }];
  const earningsChartData = annual.map((d) => ({ year: d.year, Reported: d.reportedUsd, Adjusted: d.adjustedUsd }));
  const marginChartData = annual.map((d) => ({ year: d.year, margin: d.margin, revenueGrowth: d.revGrowth ?? 0, ebitdaGrowth: d.ebitdaGrowth ?? 0 }));
  const driverCompare = [{ metric: "PM", Base: basePM, Live: pm }, { metric: "ATO", Base: baseATO, Live: ato }];
  const outcomeCompare = [{ metric: "RNOA", Base: baseRNOA, Live: liveRNOA }, { metric: "ReOI", Base: toUsdBn(baseReOI), Live: toUsdBn(liveReOI) }];

  const slides = [
    <SlideContainer key="overview">
      <div className="grid flex-1 grid-cols-1 gap-8 xl:grid-cols-[1fr_1fr]">
        <div className="space-y-8">
          <SectionTitle eyebrow="Business overview" title="Yandex is a multi-vertical digital platform" subtitle="The company combines a high-margin search business with logistics, media, subscription, and B2B technology activities. The investment question is not whether Yandex is relevant, but whether the wider ecosystem deserves more than the search engine alone." />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <div className="flex items-center gap-3 text-white/60"><Building2 className="h-4 w-4" /> what the business does</div>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-white/70"><li>• Search, advertising and AI products</li><li>• Ride-hailing, delivery and commerce logistics</li><li>• Media, subscriptions and consumer services</li><li>• Cloud and enterprise technology</li></ul>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <div className="flex items-center gap-3 text-white/60"><Network className="h-4 w-4" /> why it is interesting</div>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-white/70"><li>• Clear platform logic and ecosystem depth</li><li>• Visible improvement in operating momentum</li><li>• Large gap between reported and adjusted earnings views</li><li>• Useful case for accounting-based valuation</li></ul>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatCard label="Share price" value={fmtUsdShare(market.priceRub)} accent="#ffd21f" />
            <StatCard label="Market cap" value={fmtUsdBn(market.marketCapRubBn)} />
            <StatCard label="2025 revenue" value={fmtUsdBn(1441.1)} accent="#ffd21f" />
            <StatCard label="2025 adj. EBITDA" value={fmtUsdBn(280.8)} accent="#22c55e" />
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/8 to-white/[0.03] p-6 shadow-2xl">
          <div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3 text-white/70"><Sparkles className="h-4 w-4" /> YDEX weekly chart</div><div className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/60">price in USD · volume in mn shares</div></div>
          <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ydexPriceData}>
                  <defs><linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ffd21f" stopOpacity={0.45} /><stop offset="95%" stopColor="#ffd21f" stopOpacity={0.02} /></linearGradient></defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={yearTick} minTickGap={28} stroke="rgba(255,255,255,0.45)" />
                  <YAxis stroke="rgba(255,255,255,0.45)" domain={[0, 'dataMax + 10']} />
                  <Tooltip {...tooltipStyle} formatter={(value) => [`$${USD2.format(num(value))}`, "Price"]} labelFormatter={(label) => String(label)} />
                  <Area type="monotone" dataKey="close" stroke="#ffd21f" fill="url(#priceFill)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ydexPriceData}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={yearTick} minTickGap={28} stroke="rgba(255,255,255,0.45)" />
                  <YAxis stroke="rgba(255,255,255,0.45)" />
                  <Tooltip {...tooltipStyle} formatter={(value) => [`${num(value).toFixed(3)}m`, "Volume"]} labelFormatter={(label) => String(label)} />
                  <Bar dataKey="vol" fill="rgba(255,255,255,0.28)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </SlideContainer>,

    <SlideContainer key="structure">
      <div className="grid flex-1 grid-cols-1 gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-8">
          <SectionTitle eyebrow="Business structure" title="Different segments, different economics" subtitle="Yandex is not one business. Search & AI is the core profit engine, while the rest of the ecosystem contributes scale, engagement and optionality with very different margin profiles." />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {segments2025.map((s) => (
              <motion.button key={s.id} whileHover={{ y: -4, scale: 1.01 }} onClick={() => setSelectedSegment(s.id)} className={cn("rounded-[1.75rem] border p-5 text-left transition", selectedSegment === s.id ? "border-white/25 bg-white/10 shadow-2xl" : "border-white/10 bg-white/5")}>
                <div className="flex items-start justify-between gap-4"><div><div className="text-lg font-medium text-white">{s.name}</div><div className="mt-2 text-sm text-white/60">{s.role}</div></div><div className="h-3 w-3 rounded-full" style={{ background: s.color }} /></div>
                <div className="mt-6 grid grid-cols-2 gap-4"><div><div className="text-xs uppercase tracking-[0.2em] text-white/40">Revenue</div><div className="mt-2 text-2xl font-semibold text-white">{fmtUsdBn(s.revenue)}</div></div><div><div className="text-xs uppercase tracking-[0.2em] text-white/40">EBITDA margin</div><div className="mt-2 text-2xl font-semibold text-white">{s.margin.toFixed(1)}%</div></div></div>
              </motion.button>
            ))}
          </div>
        </div>
        <div className="grid grid-rows-[minmax(0,1fr)_auto] gap-6 min-h-0">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center gap-3 text-white/60"><Boxes className="h-4 w-4" /> revenue mix</div>
            <LegendPills items={segments2025.map((s) => ({ label: `${s.name} · ${s.share}%`, color: s.color }))} />
            <div className="mt-4 h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 20, right: 110, bottom: 20, left: 110 }}>
                  <Pie data={segments2025} dataKey="revenueUsd" nameKey="name" innerRadius={74} outerRadius={122} paddingAngle={3} labelLine={false} label={renderPieLabel}>{segments2025.map((s) => <Cell key={s.id} fill={s.color} stroke="rgba(255,255,255,0.9)" strokeWidth={2} />)}</Pie>
                  <Tooltip {...tooltipStyle} formatter={(value, _name, p: any) => [`$${USD2.format(num(value))}bn`, String(p?.payload?.name ?? "")]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-black/20 p-5">
            <div className="flex items-center justify-between gap-4"><div><div className="text-sm text-white/55">Segment economics</div><div className="mt-2 text-2xl font-semibold text-white">{activeSegment.name}</div></div><div className="rounded-full px-3 py-1 text-sm" style={{ background: `${activeSegment.color}20`, color: activeSegment.color }}>{scenarios[scenario].label}</div></div>
            <div className="mt-4 text-sm leading-7 text-white/70">{activeSegment.thesis}</div>
            <div className="mt-5 grid grid-cols-3 gap-3">{(["bear", "base", "bull"] as ScenarioKey[]).map((key) => <div key={key} className={cn("rounded-2xl border p-3", scenario === key ? "border-white/25 bg-white/10" : "border-white/10 bg-white/5")}><div className="text-xs uppercase tracking-[0.2em] text-white/45">{key}</div><div className="mt-2 text-xl font-semibold text-white">{activeSegment.scenarioMargins[key].toFixed(1)}%</div></div>)}</div>
          </div>
        </div>
      </div>
    </SlideContainer>,

    <SlideContainer key="framing">
      <div className="grid flex-1 grid-cols-1 gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="flex flex-col justify-between gap-8">
          <div className="space-y-8">
            <SectionTitle eyebrow="Investment framing" title="The same stock looks different depending on which earnings base you trust" subtitle="This is the core setup for the whole valuation. Reported earnings look noisy, adjusted earnings look generous, and hybrid is my working bridge between the two." />
            <div className="flex flex-wrap gap-3"><GlassButton active={basis === "reported"} onClick={() => setBasis("reported")}>Reported basis</GlassButton><GlassButton active={basis === "hybrid"} onClick={() => setBasis("hybrid")}>Hybrid basis</GlassButton><GlassButton active={basis === "adjusted"} onClick={() => setBasis("adjusted")}>Adjusted basis</GlassButton></div>
          </div>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4"><StatCard label="Share price" value={fmtUsdShare(market.priceRub)} accent="#ffd21f" /><StatCard label="Market cap" value={fmtUsdBn(market.marketCapRubBn)} /><StatCard label={`${currentBasis.label} P/E`} value={currentBasis.pe.toFixed(1)} suffix="x" accent={currentBasis.accent} /><StatCard label="Live value / share" value={fmtUsdShare(valuePerShare)} accent={upside >= 0 ? "#22c55e" : "#f87171"} sub={`${upside >= 0 ? "+" : ""}${upside.toFixed(1)}% vs market`} /></div>
        </div>
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/8 to-white/[0.03] p-6 shadow-2xl">
          <div className="absolute -right-16 -top-12 h-40 w-40 rounded-full bg-[#ffd21f]/10 blur-3xl" />
          <div className="absolute -bottom-14 -left-10 h-44 w-44 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="space-y-6">
            <div className="flex items-center justify-between"><div className="flex items-center gap-3 text-white/70"><Sparkles className="h-4 w-4" /> current active lens</div><div className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/60">USD values</div></div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">{[{ label: "Reported", value: 79.6, accent: basisConfig.reported.accent }, { label: "Hybrid", value: 92.9, accent: basisConfig.hybrid.accent }, { label: "Adjusted", value: 141.4, accent: basisConfig.adjusted.accent }].map((c) => <div key={c.label} className="rounded-3xl border border-white/10 bg-white/5 p-4"><div className="text-sm text-white/55">{c.label}</div><div className="mt-3 text-2xl font-semibold" style={{ color: c.accent }}>{fmtUsdBn(c.value)}</div></div>)}</div>
            <div className="rounded-3xl border border-white/10 bg-black/20 p-5"><div className="text-sm text-white/50">Default view</div><div className="mt-3 text-2xl font-semibold text-white">Wait</div><div className="mt-3 text-sm leading-7 text-white/70">The business looks strong, but under the default hybrid base the margin of safety is limited. That is why the presentation comes back to a disciplined wait view.</div></div>
          </div>
        </div>
      </div>
    </SlideContainer>,

    <SlideContainer key="momentum">
      <div className="space-y-8">
        <SectionTitle eyebrow="Financial momentum" title="Revenue scale and operating leverage accelerated in 2024–2025" subtitle="Switch between scale, profitability and earnings quality without losing the timeline." />
        <div className="grid flex-1 grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr] min-h-0">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex flex-wrap gap-3"><GlassButton active={momentumMode === "scale"} onClick={() => setMomentumMode("scale")}>Scale</GlassButton><GlassButton active={momentumMode === "margin"} onClick={() => setMomentumMode("margin")}>Margins & growth</GlassButton><GlassButton active={momentumMode === "earnings"} onClick={() => setMomentumMode("earnings")}>Earnings quality</GlassButton></div>
            {momentumMode === "scale" && <><LegendPills items={[{ label: "Revenue", color: "#ffd21f" }, { label: "Adjusted EBITDA", color: "#22c55e" }]} /><div className="mt-4 h-[400px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={annual}><defs><linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ffd21f" stopOpacity={0.6} /><stop offset="95%" stopColor="#ffd21f" stopOpacity={0.03} /></linearGradient><linearGradient id="ebitdaFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.18} /><stop offset="95%" stopColor="#22c55e" stopOpacity={0.01} /></linearGradient></defs><CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} /><XAxis dataKey="year" stroke="rgba(255,255,255,0.45)" /><YAxis stroke="rgba(255,255,255,0.45)" /><Tooltip {...tooltipStyle} formatter={(value, name) => [`$${USD2.format(num(value))}bn`, name === "revenueUsd" ? "Revenue" : "Adjusted EBITDA"]} /><Legend formatter={(value) => <span style={{ color: "rgba(255,255,255,0.75)" }}>{value === "revenueUsd" ? "Revenue" : "Adjusted EBITDA"}</span>} /><Area type="monotone" dataKey="revenueUsd" stroke="#ffd21f" fillOpacity={1} fill="url(#revFill)" strokeWidth={3} /><Area type="monotone" dataKey="ebitdaUsd" stroke="#22c55e" fillOpacity={1} fill="url(#ebitdaFill)" strokeWidth={3} /></AreaChart></ResponsiveContainer></div></>}
            {momentumMode === "margin" && <><LegendPills items={[{ label: "EBITDA margin", color: "#f59e0b" }, { label: "Revenue growth", color: "#60a5fa" }, { label: "EBITDA growth", color: "#22c55e" }]} /><div className="mt-4 h-[400px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={marginChartData}><CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} /><XAxis dataKey="year" stroke="rgba(255,255,255,0.45)" /><YAxis stroke="rgba(255,255,255,0.45)" /><Tooltip {...tooltipStyle} formatter={percentTooltipFormatter} /><Legend formatter={(value) => <span style={{ color: "rgba(255,255,255,0.75)" }}>{value}</span>} /><Bar dataKey="margin" name="EBITDA margin" fill="#f59e0b" radius={[8, 8, 0, 0]} /><Bar dataKey="revenueGrowth" name="Revenue growth" fill="#60a5fa" radius={[8, 8, 0, 0]} /><Bar dataKey="ebitdaGrowth" name="EBITDA growth" fill="#22c55e" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div></>}
            {momentumMode === "earnings" && <><LegendPills items={[{ label: "Reported NI", color: "#60a5fa" }, { label: "Adjusted NI", color: "#22c55e" }]} /><div className="mt-4 h-[400px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={earningsChartData}><CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} /><XAxis dataKey="year" stroke="rgba(255,255,255,0.45)" /><YAxis stroke="rgba(255,255,255,0.45)" /><Tooltip {...tooltipStyle} formatter={usdTooltipFormatter} /><Legend formatter={(value) => <span style={{ color: "rgba(255,255,255,0.75)" }}>{value}</span>} /><Bar dataKey="Reported" fill="#60a5fa" radius={[8, 8, 0, 0]} /><Bar dataKey="Adjusted" fill="#22c55e" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div></>}
          </div>
          <div className="grid gap-4 min-h-0"><StatCard label="2025 revenue" value={fmtUsdBn(1441.1)} accent="#ffd21f" /><StatCard label="2025 adj. EBITDA" value={fmtUsdBn(280.8)} accent="#22c55e" /><StatCard label="2025 EBITDA margin" value="19.5" suffix="%" accent="#ffffff" /><div className="rounded-[2rem] border border-white/10 bg-black/20 p-5"><div className="mb-3 flex items-center gap-3 text-sm text-white/60"><BarChart3 className="h-4 w-4" /> reading the chart</div><div className="text-base leading-7 text-white/70">{momentumMode === "scale" && "Scale mode shows how revenue and adjusted EBITDA widened apart in absolute terms, with much stronger operational leverage in 2024–2025."}{momentumMode === "margin" && "Margin mode shows that profitability improvement was not just about scale; margin and EBITDA growth both accelerated alongside revenue growth."}{momentumMode === "earnings" && "Earnings mode highlights the growing gap between reported and adjusted net income, which is the key valuation tension later in the deck."}</div></div></div>
        </div>
      </div>
    </SlideContainer>,

    <SlideContainer key="earnings">
      <div className="grid flex-1 grid-cols-1 gap-8 xl:grid-cols-[0.86fr_1.14fr]">
        <div className="space-y-8">
          <SectionTitle eyebrow="Earnings quality" title="Reported → hybrid → adjusted" subtitle="Hybrid is the working bridge between noisy reported earnings and generous management adjustments." />
          <div className="grid gap-4"><StatCard label="Reported NI" value={fmtUsdBn(79.6)} accent="#60a5fa" /><StatCard label="Hybrid NI" value={fmtUsdBn(92.9)} accent="#f59e0b" sub="Analytical estimate, not an official metric" /><StatCard label="Adjusted NI" value={fmtUsdBn(141.4)} accent="#22c55e" sub="Management-style clean earnings" /></div>
          <div className="rounded-[2rem] border border-white/10 bg-black/20 p-5"><div className="mb-3 text-sm text-white/50">How hybrid is calculated</div><div className="text-sm leading-7 text-white/70">Hybrid NI = Reported NI + FX and one-off normalization, but it keeps SBC as a real operating expense. In other words, hybrid removes obvious noise from reported earnings, yet stops short of fully accepting management add-backs.</div></div>
        </div>
        <div className="grid gap-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6"><div className="mb-5 flex flex-wrap gap-3"><GlassButton active={basis === "reported"} onClick={() => setBasis("reported")}>Reported</GlassButton><GlassButton active={basis === "hybrid"} onClick={() => setBasis("hybrid")}>Hybrid</GlassButton><GlassButton active={basis === "adjusted"} onClick={() => setBasis("adjusted")}>Adjusted</GlassButton></div><div className="grid grid-cols-1 gap-4 md:grid-cols-3"><StatCard label="Current P/E" value={currentBasis.pe.toFixed(1)} suffix="x" accent={currentBasis.accent} /><StatCard label="No-growth value / share" value={fmtUsdShare(noGrowthPerShare)} accent="#ffffff" /><StatCard label="Implied g" value={(valuation.impliedG * 100).toFixed(1)} suffix="%" accent={upside >= 0 ? "#22c55e" : "#f87171"} /></div></div>
          <WaterfallChart />
        </div>
      </div>
    </SlideContainer>,

    <SlideContainer key="reformulation">
      <div className="space-y-8">
        <SectionTitle eyebrow="Reformulated statements" title="From mixed IFRS totals to operating and financing logic" subtitle="The main deck keeps reformulation simple. The full click-by-click statement explorer is placed in the P.S. slide for appendix or Q&A." />
        <div className="grid flex-1 min-h-0 grid-cols-1 gap-6 xl:grid-cols-[1fr_0.95fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6"><div className="mb-6 flex items-center gap-3 text-white/60"><Database className="h-4 w-4" /> 2025 reformulation map</div><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><div className="rounded-3xl border border-white/10 bg-black/20 p-5"><div className="text-sm text-white/50">Operating assets</div><div className="mt-3 text-3xl font-semibold text-white">{fmtUsdBn(960.5)}</div><div className="mt-3 text-sm leading-7 text-white/60">PPE, intangibles, ROU assets, content assets, receivables, inventory, prepaid and operating current assets.</div></div><div className="rounded-3xl border border-white/10 bg-black/20 p-5"><div className="text-sm text-white/50">Operating liabilities</div><div className="mt-3 text-3xl font-semibold text-white">{fmtUsdBn(389.4)}</div><div className="mt-3 text-sm leading-7 text-white/60">AP, contract liabilities, taxes payable, deferred taxes, provisions and other operating liabilities.</div></div><div className="rounded-3xl border border-white/10 bg-black/20 p-5"><div className="text-sm text-white/50">Financing assets</div><div className="mt-3 text-3xl font-semibold text-white">{fmtUsdBn(407.7)}</div><div className="mt-3 text-sm leading-7 text-white/60">Cash, debt securities, loans to customers and other treasury-style balances.</div></div><div className="rounded-3xl border border-white/10 bg-black/20 p-5"><div className="text-sm text-white/50">Financing liabilities</div><div className="mt-3 text-3xl font-semibold text-white">{fmtUsdBn(627.7)}</div><div className="mt-3 text-sm leading-7 text-white/60">Debt, leases and financial-services liabilities treated as financing burden.</div></div></div></div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6"><div className="mb-4 text-sm text-white/60">Accounting identity</div><LegendPills items={[{ label: "NOA", color: "#ffd21f" }, { label: "Net debt", color: "#ffffff" }, { label: "Equity", color: "#22c55e" }]} /><div className="mt-6 flex flex-col gap-4"><motion.div layout className="rounded-3xl border border-[#ffd21f]/20 bg-[#ffd21f]/10 px-5 py-6 text-center"><div className="text-sm text-white/60">Net operating assets</div><div className="mt-2 text-3xl font-semibold text-[#ffd21f]">{fmtUsdBn(571.1)}</div></motion.div><div className="text-center text-xl text-white/35">−</div><motion.div layout className="rounded-3xl border border-white/10 bg-black/20 px-5 py-6 text-center"><div className="text-sm text-white/50">Net financing debt</div><div className="mt-2 text-3xl font-semibold text-white">{fmtUsdBn(220.0)}</div></motion.div><div className="text-center text-xl text-white/35">=</div><motion.div layout className="rounded-3xl border border-[#22c55e]/25 bg-[#22c55e]/10 px-5 py-6 text-center"><div className="text-sm text-white/60">Common equity</div><div className="mt-2 text-3xl font-semibold text-[#22c55e]">{fmtUsdBn(351.2)}</div></motion.div></div></div>
        </div>
      </div>
    </SlideContainer>,

    <SlideContainer key="drivers">
      <div className="grid flex-1 grid-cols-1 gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-8">
          <SectionTitle eyebrow="Profitability engine" title="PM × ATO → RNOA → residual operating income" subtitle="Instead of showing an abstract scatter, this slide compares the 2025 base economics with the current live scenario across the core valuation drivers and outcomes." />
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 space-y-5"><Range label="Profit margin (PM)" value={pm} min={3} max={15} step={0.1} onChange={setPm} format={(v) => `${v.toFixed(1)}%`} /><Range label="Asset turnover (ATO)" value={ato} min={1.5} max={4.5} step={0.01} onChange={setAto} format={(v) => `${v.toFixed(2)}x`} /><Range label="Required return r" value={r * 100} min={10} max={15} step={0.1} onChange={(v) => setR(v / 100)} format={(v) => `${v.toFixed(1)}%`} /></div>
          <div className="grid grid-cols-2 gap-4"><StatCard label="Live RNOA" value={liveRNOA.toFixed(1)} suffix="%" accent="#ffd21f" /><StatCard label="Live ReOI" value={fmtUsdBn(liveReOI)} accent={liveReOI >= 0 ? "#22c55e" : "#f87171"} /></div>
        </div>
        <div className="grid grid-rows-[auto_auto_1fr] gap-6">
          <div className="grid grid-cols-4 gap-4">
            <StatCard label="PM" value={pm.toFixed(1)} suffix="%" accent="#ffd21f" sub={`base ${basePM.toFixed(1)}%`} />
            <StatCard label="ATO" value={ato.toFixed(2)} suffix="x" accent="#60a5fa" sub={`base ${baseATO.toFixed(2)}x`} />
            <StatCard label="RNOA" value={liveRNOA.toFixed(1)} suffix="%" accent="#f59e0b" sub={`base ${baseRNOA.toFixed(1)}%`} />
            <StatCard label="ReOI" value={fmtUsdBn(liveReOI)} accent="#22c55e" sub={`base ${fmtUsdBn(baseReOI)}`} />
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6"><div className="mb-4 text-sm text-white/60">Driver comparison</div><LegendPills items={[{ label: "Base 2025", color: "#94a3b8" }, { label: "Live scenario", color: currentBasis.accent }]} /><div className="mt-4 h-[220px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={driverCompare}><CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} /><XAxis dataKey="metric" stroke="rgba(255,255,255,0.45)" /><YAxis stroke="rgba(255,255,255,0.45)" /><Tooltip {...tooltipStyle} formatter={percentTooltipFormatter} /><Legend formatter={(value) => <span style={{ color: "rgba(255,255,255,0.75)" }}>{value}</span>} /><Bar dataKey="Base" fill="rgba(148,163,184,0.9)" radius={[8,8,0,0]} /><Bar dataKey="Live" fill={currentBasis.accent} radius={[8,8,0,0]} /></BarChart></ResponsiveContainer></div></div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6"><div className="mb-4 text-sm text-white/60">Outcome comparison</div><LegendPills items={[{ label: "Base 2025", color: "#94a3b8" }, { label: "Live scenario", color: currentBasis.accent }]} /><div className="mt-4 h-[220px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={outcomeCompare}><CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} /><XAxis dataKey="metric" stroke="rgba(255,255,255,0.45)" /><YAxis stroke="rgba(255,255,255,0.45)" /><Tooltip {...tooltipStyle} formatter={(value, name, item: any) => [item?.payload?.metric === 'ReOI' ? `$${USD2.format(num(value))}bn` : `${num(value).toFixed(1)}%`, String(name ?? '')]} /><Legend formatter={(value) => <span style={{ color: "rgba(255,255,255,0.75)" }}>{value}</span>} /><Bar dataKey="Base" fill="rgba(148,163,184,0.9)" radius={[8,8,0,0]} /><Bar dataKey="Live" fill={currentBasis.accent} radius={[8,8,0,0]} /></BarChart></ResponsiveContainer></div></div>
        </div>
      </div>
    </SlideContainer>,

    <SlideContainer key="valuation">
      <div className="space-y-8">
        <SectionTitle eyebrow="Residual earnings valuation" title="Anchored value first, speculative value second" subtitle="This is the center of the interactive deck. You can change earnings assumptions, required return and terminal growth and see how the investment case changes in real time." />
        <div className="grid flex-1 grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 space-y-5"><div className="flex flex-wrap gap-3"><GlassButton active={scenario === "bear"} onClick={() => setScenario("bear")}>Bear</GlassButton><GlassButton active={scenario === "base"} onClick={() => setScenario("base")}>Base</GlassButton><GlassButton active={scenario === "bull"} onClick={() => setScenario("bull")}>Bull</GlassButton></div><Range label="2026 earnings" value={baseE1} min={80} max={220} step={1} onChange={(v) => setE1Adjust(v - currentBasis.nextYearBase)} format={(v) => fmtUsdBn(v)} /><Range label="2027 earnings" value={baseE2} min={90} max={250} step={1} onChange={(v) => setE2Adjust(v - currentBasis.secondYearBase)} format={(v) => fmtUsdBn(v)} /><Range label="Required return r" value={r * 100} min={10} max={15} step={0.1} onChange={(v) => setR(v / 100)} format={(v) => `${v.toFixed(1)}%`} /><Range label="Terminal growth g" value={g * 100} min={1} max={5} step={0.1} onChange={(v) => setG(v / 100)} format={(v) => `${v.toFixed(1)}%`} /><div className="grid grid-cols-2 gap-4 pt-3"><StatCard label="Equity value" value={fmtUsdBn(valuation.value)} accent={currentBasis.accent} /><StatCard label="Value / share" value={fmtUsdShare(valuePerShare)} accent={upside >= 0 ? "#22c55e" : "#f87171"} sub={`${upside >= 0 ? "+" : ""}${upside.toFixed(1)}% vs market`} /></div></div>
          <div className="grid gap-6"><div className="rounded-[2rem] border border-white/10 bg-white/5 p-6"><div className="mb-4 text-sm text-white/60">Market cap decomposition</div><LegendPills items={stackData.map((d) => ({ label: d.name, color: d.color }))} /><div className="mt-4 h-[320px]"><ResponsiveContainer width="100%" height="100%"><BarChart layout="vertical" data={stackData}><CartesianGrid stroke="rgba(255,255,255,0.08)" horizontal={false} /><XAxis type="number" stroke="rgba(255,255,255,0.45)" /><YAxis type="category" dataKey="name" width={140} stroke="rgba(255,255,255,0.45)" /><Tooltip {...tooltipStyle} formatter={(value) => `$${USD2.format(num(value))}bn`} /><Bar dataKey="value" radius={[0,12,12,0]}>{stackData.map((d) => <Cell key={d.name} fill={d.color} />)}</Bar></BarChart></ResponsiveContainer></div></div><div className="grid grid-cols-1 gap-4 md:grid-cols-3"><StatCard label="Book value" value={fmtUsdBn(351.2)} /><StatCard label="No-growth value" value={fmtUsdBn(valuation.noGrowth)} accent="#ffffff" /><StatCard label="Speculative premium" value={fmtUsdBn(valuation.speculative)} accent="#ef4444" /></div></div>
        </div>
      </div>
    </SlideContainer>,

    <SlideContainer key="implied">
      <div className="grid flex-1 grid-cols-1 gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-8"><SectionTitle eyebrow="Market expectations" title="Reverse-engineer the growth rate implied by the market price" subtitle="Instead of arguing vaguely that the stock is optimistic or pessimistic, translate price into an explicit long-run growth requirement." /><div className="rounded-[2rem] border border-white/10 bg-white/5 p-6"><div className="mb-5 flex flex-wrap gap-3"><GlassButton active={basis === "reported"} onClick={() => setBasis("reported")}>Reported</GlassButton><GlassButton active={basis === "hybrid"} onClick={() => setBasis("hybrid")}>Hybrid</GlassButton><GlassButton active={basis === "adjusted"} onClick={() => setBasis("adjusted")}>Adjusted</GlassButton></div><div className="grid grid-cols-2 gap-4"><StatCard label="Market cap" value={fmtUsdBn(market.marketCapRubBn)} /><StatCard label="Implied g" value={(valuation.impliedG * 100).toFixed(1)} suffix="%" accent={currentBasis.accent} /><StatCard label="No-growth anchor" value={fmtUsdBn(valuation.noGrowth)} /><StatCard label="Speculative share" value={`${Math.max(valuation.speculative / market.marketCapRubBn * 100, 0).toFixed(0)}%`} accent="#ef4444" /></div></div></div>
        <div className="grid gap-6"><div className="rounded-[2rem] border border-white/10 bg-white/5 p-6"><div className="mb-4 text-sm text-white/60">Implied growth dial</div><LegendPills items={[{ label: "Implied long-run growth rate", color: currentBasis.accent }]} /><div className="mt-4 h-[320px]"><ResponsiveContainer width="100%" height="100%"><RadialBarChart innerRadius="55%" outerRadius="100%" data={impliedGauge} startAngle={180} endAngle={0}><RadialBar dataKey="value" cornerRadius={20} background /><Tooltip {...tooltipStyle} formatter={impliedTooltipFormatter} /></RadialBarChart></ResponsiveContainer></div><div className="-mt-14 text-center text-5xl font-semibold text-white">{(valuation.impliedG * 100).toFixed(1)}%</div></div><div className="rounded-[2rem] border border-white/10 bg-black/20 p-6"><div className="text-sm text-white/50">Plausibility test</div><div className="mt-3 text-xl leading-8 text-white">{(valuation.impliedG * 100) < 3 && "The market-implied growth rate looks modest. The stock may be easier to justify if earnings quality is credible."}{(valuation.impliedG * 100) >= 3 && (valuation.impliedG * 100) < 6 && "The market-implied growth rate is meaningful but still plausible for a strong platform, depending on monetization outside Search."}{(valuation.impliedG * 100) >= 6 && "The market-implied growth rate looks demanding. The current price leaves limited room for disappointment unless one uses a very generous earnings base."}</div></div></div>
      </div>
    </SlideContainer>,

    <SlideContainer key="recommendation">
      <div className="grid flex-1 grid-cols-1 gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-8"><SectionTitle eyebrow="Recommendation" title="High-quality business. Limited margin of safety." subtitle="Default view: Wait." /><div className="grid grid-cols-1 gap-4 md:grid-cols-3">{[{ name: "Buy", active: false, color: "#22c55e" }, { name: "Wait", active: true, color: "#f59e0b" }, { name: "Sell", active: false, color: "#ef4444" }].map((card) => <div key={card.name} className={cn("rounded-[1.75rem] border p-5 transition-all", card.active ? "border-white/30 bg-white/10 shadow-2xl" : "border-white/10 bg-white/5 opacity-60")}><div className="text-sm text-white/55">State</div><div className="mt-4 text-3xl font-semibold" style={{ color: card.color }}>{card.name}</div></div>)}</div><div className="grid grid-cols-1 gap-4 md:grid-cols-3"><div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5"><div className="flex items-center gap-3 text-white/60"><Brain className="h-4 w-4" /> What I know</div><div className="mt-4 text-sm leading-7 text-white/70">Search & AI is the core profit anchor, 2025 operating momentum was real, and the company now has more visible earnings power than in prior years.</div></div><div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5"><div className="flex items-center gap-3 text-white/60"><Wallet className="h-4 w-4" /> What is uncertain</div><div className="mt-4 text-sm leading-7 text-white/70">The broader ecosystem still needs to prove durable margin expansion. That is where most of the valuation disagreement lives.</div></div><div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5"><div className="flex items-center gap-3 text-white/60"><ShieldAlert className="h-4 w-4" /> Margin of safety</div><div className="mt-4 text-sm leading-7 text-white/70">Under the default hybrid base, the stock looks interesting but not cheap enough to force a buy call.</div></div></div></div>
        <div className="grid gap-6"><div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#ffd21f]/10 to-orange-500/10 p-6"><div className="flex items-center gap-3 text-white/60"><CircleDollarSign className="h-4 w-4" /> investment call</div><div className="mt-5 text-4xl font-semibold text-white">Wait</div><div className="mt-5 text-lg leading-8 text-white/75">The business is strong and strategically impressive, but the current price leaves only a limited margin of safety unless one adopts a much more generous earnings base or a more optimistic long-run margin story.</div><div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5 text-sm leading-7 text-white/70">The stock is not an obvious avoid. It is a name to keep on the radar, but the default committee conclusion here is disciplined wait rather than buy.</div></div><div className="rounded-[2rem] border border-white/10 bg-white/5 p-6"><div className="mb-4 flex items-center gap-3 text-white/60"><Layers3 className="h-4 w-4" /> keyboard shortcuts</div><ul className="space-y-3 text-sm leading-7 text-white/70"><li>• press slide number digits to jump directly</li><li>• multi-digit input works, so 1 then 1 jumps to slide 11</li><li>• left / right arrows move one slide</li></ul></div></div>
      </div>
    </SlideContainer>,

<SlideContainer key="appendix">
  <div className="space-y-8">
    <SectionTitle
      eyebrow="P.S. Appendix"
      title="Statement explorer"
      subtitle="Appendix slide for Q&A. The main presentation keeps reformulation simple; this slide lets you challenge the classification item by item."
    />

    <div className="grid flex-1 min-h-0 grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="grid min-h-0 gap-6">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-white/60">
              <Database className="h-4 w-4" />
              statement explorer
            </div>

            <div className="flex gap-2">
              <GlassButton
                active={explorerMode === "assets"}
                onClick={() => {
                  setExplorerMode("assets");
                  const first = lineItems.find((i) => i.side === "asset");
                  if (first) setSelectedLine(first.id);
                }}
              >
                Assets
              </GlassButton>

              <GlassButton
                active={explorerMode === "liabilities"}
                onClick={() => {
                  setExplorerMode("liabilities");
                  const first = lineItems.find((i) => i.side === "liability");
                  if (first) setSelectedLine(first.id);
                }}
              >
                Liabilities
              </GlassButton>

              <GlassButton onClick={() => setClassificationOverrides({})}>
                Reset
              </GlassButton>
            </div>
          </div>

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {visibleLineItems.map((item) => {
              const selected = item.id === selectedLine;
              const currentClass = effectiveClass(item);

              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedLine(item.id)}
                  className={cn(
                    "w-full rounded-2xl border px-4 py-3 text-left transition",
                    selected
                      ? "border-white/25 bg-white/10"
                      : "border-white/10 bg-white/5 hover:bg-white/8"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm text-white">{item.title}</div>
                      <div className="mt-1 text-xs text-white/45">
                        2025: {fmtUsdBn(item.value2025)} · 2024: {fmtUsdBn(item.value2024)}
                      </div>
                    </div>

                    <div
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.18em]",
                        currentClass === "operating"
                          ? "bg-[#ffd21f]/15 text-[#ffd21f]"
                          : "bg-[#60a5fa]/15 text-[#60a5fa]"
                      )}
                    >
                      {currentClass}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-black/20 p-5">
          <div className="text-sm text-white/50">Current item</div>
          <div className="mt-2 text-2xl font-semibold text-white">
            {activeLine.title}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <StatCard
              label="2025"
              value={fmtUsdBn(activeLine.value2025)}
              accent="#ffffff"
            />
            <StatCard
              label="2024"
              value={fmtUsdBn(activeLine.value2024)}
              accent="#94a3b8"
            />
          </div>

          <div className="mt-4 text-sm leading-7 text-white/70">
            {activeLine.rationale}
          </div>

          <div className="mt-3 text-sm leading-7 text-white/50">
            {activeLine.examples}
          </div>

          <div className="mt-5 flex gap-3">
            <GlassButton
              active={effectiveClass(activeLine) === "operating"}
              onClick={() =>
                setClassificationOverrides((prev) => ({
                  ...prev,
                  [activeLine.id]: "operating",
                }))
              }
            >
              Classify as operating
            </GlassButton>

            <GlassButton
              active={effectiveClass(activeLine) === "financing"}
              onClick={() =>
                setClassificationOverrides((prev) => ({
                  ...prev,
                  [activeLine.id]: "financing",
                }))
              }
            >
              Classify as financing
            </GlassButton>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <div className="mb-4 text-sm text-white/60">Live reformulated book</div>

          <LegendPills
            items={[
              { label: "Operating book", color: "#ffd21f" },
              { label: "Financing book", color: "#60a5fa" },
              { label: "Equity anchor", color: "#22c55e" },
            ]}
          />

          <div className="mt-5 grid grid-cols-2 gap-4">
            <StatCard label="OA" value={fmtUsdBn(explorerTotals.oa)} accent="#ffd21f" />
            <StatCard label="OL" value={fmtUsdBn(explorerTotals.ol)} accent="#ffd21f" />
            <StatCard label="FA" value={fmtUsdBn(explorerTotals.fa)} accent="#60a5fa" />
            <StatCard label="FL" value={fmtUsdBn(explorerTotals.fl)} accent="#60a5fa" />
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <div className="mb-4 text-sm text-white/60">Accounting identity</div>

          <div className="flex flex-col gap-4">
            <motion.div
              layout
              className="rounded-3xl border border-[#ffd21f]/20 bg-[#ffd21f]/10 px-5 py-5 text-center"
            >
              <div className="text-sm text-white/60">Net operating assets</div>
              <div className="mt-2 text-3xl font-semibold text-[#ffd21f]">
                {fmtUsdBn(explorerTotals.noa)}
              </div>
            </motion.div>

            <div className="text-center text-xl text-white/35">−</div>

            <motion.div
              layout
              className="rounded-3xl border border-[#60a5fa]/20 bg-[#60a5fa]/10 px-5 py-5 text-center"
            >
              <div className="text-sm text-white/60">Net financing debt</div>
              <div className="mt-2 text-3xl font-semibold text-[#60a5fa]">
                {fmtUsdBn(explorerTotals.nd)}
              </div>
            </motion.div>

            <div className="text-center text-xl text-white/35">=</div>

            <motion.div
              layout
              className="rounded-3xl border border-[#22c55e]/25 bg-[#22c55e]/10 px-5 py-5 text-center"
            >
              <div className="text-sm text-white/60">Common equity</div>
              <div className="mt-2 text-3xl font-semibold text-[#22c55e]">
                {fmtUsdBn(explorerTotals.equity)}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  </div>
</SlideContainer>
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,210,31,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.08),transparent_28%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-[1720px] flex-col px-4 py-4 md:px-6 md:py-6">
        <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-white/8"><motion.div className="h-full rounded-full bg-gradient-to-r from-[#ffd21f] to-orange-500" animate={{ width: `${((slide + 1) / slideMeta.length) * 100}%` }} transition={{ duration: 0.4 }} /></div>
        <div className="relative flex-1 overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-5 shadow-2xl backdrop-blur md:p-8"><AnimatePresence mode="wait">{slides[slide]}</AnimatePresence></div>
        <footer className="mt-4 flex items-center justify-between gap-4 rounded-[2rem] border border-white/10 bg-white/5 px-4 py-3 backdrop-blur"><div className="flex flex-wrap gap-2">{slideMeta.map((s, i) => <button key={s.key} onClick={() => setSlide(i)} className={cn("rounded-full px-3 py-1.5 text-xs transition", i === slide ? "bg-[#ffd21f]/15 text-white" : "bg-white/5 text-white/45 hover:bg-white/10 hover:text-white/75")}>{i + 1}. {s.title}</button>)}</div><div className="flex items-center gap-2"><div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60">Digits + arrows</div><button onClick={() => setSlide((s) => Math.max(s - 1, 0))} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/70 hover:bg-white/10 hover:text-white"><ChevronLeft className="h-4 w-4" /></button><button onClick={() => setSlide((s) => Math.min(s + 1, slideMeta.length - 1))} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/70 hover:bg-white/10 hover:text-white"><ChevronRight className="h-4 w-4" /></button></div></footer>
      </div>
    </div>
  );
}
