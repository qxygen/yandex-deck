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

function usdTooltipFormatter(value: unknown, name?: unknown): [string, string] {
  return [`$${USD2.format(num(value))}bn`, String(name ?? "")];
}

function percentTooltipFormatter(
  value: unknown,
  name?: unknown
): [string, string] {
  return [`${num(value).toFixed(1)}%`, String(name ?? "")];
}

function impliedTooltipFormatter(value: unknown): string {
  return `${num(value).toFixed(1)}%`;
}

const annual = [
  { year: 2021, revenue: 356.2, ebitda: 32.1, reported: -14.7, adjusted: 8.0 },
  { year: 2022, revenue: 521.7, ebitda: 64.1, reported: 47.6, adjusted: 10.8 },
  { year: 2023, revenue: 800.1, ebitda: 97.0, reported: 21.8, adjusted: 27.4 },
  {
    year: 2024,
    revenue: 1094.6,
    ebitda: 188.6,
    reported: 11.5,
    adjusted: 100.9,
  },
  {
    year: 2025,
    revenue: 1441.1,
    ebitda: 280.8,
    reported: 79.6,
    adjusted: 141.4,
  },
].map((d, i, arr) => ({
  ...d,
  revenueUsd: toUsdBn(d.revenue),
  ebitdaUsd: toUsdBn(d.ebitda),
  reportedUsd: toUsdBn(d.reported),
  adjustedUsd: toUsdBn(d.adjusted),
  margin: +((d.ebitda / d.revenue) * 100).toFixed(1),
  revGrowth:
    i === 0 ? null : +(((d.revenue / arr[i - 1].revenue) - 1) * 100).toFixed(1),
  ebitdaGrowth:
    i === 0 ? null : +(((d.ebitda / arr[i - 1].ebitda) - 1) * 100).toFixed(1),
}));

const segments2025 = [
  {
    id: "search",
    name: "Search & AI",
    revenue: 551.2,
    margin: 44.5,
    color: "#ffd21f",
    role: "Core profit engine",
    thesis:
      "The economic anchor of the Yandex story. It funds the broader ecosystem and deserves the highest confidence in valuation.",
    scenarioMargins: { bear: 40, base: 44, bull: 46 },
  },
  {
    id: "city",
    name: "City Services",
    revenue: 804.5,
    margin: 7.8,
    color: "#ff9f1a",
    role: "Scale and logistics",
    thesis:
      "Large and strategically important. The key question is whether scale can convert into meaningfully higher long-run margins.",
    scenarioMargins: { bear: 5, base: 8, bull: 10.5 },
  },
  {
    id: "personal",
    name: "Personal Services",
    revenue: 214.3,
    margin: 3.3,
    color: "#8b5cf6",
    role: "Engagement and retention",
    thesis:
      "Supports ecosystem stickiness, but still needs to prove stronger earnings conversion over time.",
    scenarioMargins: { bear: 2, base: 4, bull: 6 },
  },
  {
    id: "b2b",
    name: "B2B Tech",
    revenue: 48.2,
    margin: 19.6,
    color: "#22c55e",
    role: "Enterprise optionality",
    thesis:
      "Still small, but strategically attractive and relevant for diversified earnings quality.",
    scenarioMargins: { bear: 16, base: 20, bull: 24 },
  },
].map((d) => ({
  ...d,
  share: +((d.revenue / 1618.2) * 100).toFixed(1),
  revenueUsd: toUsdBn(d.revenue),
}));

const ydexMonthlyData = [{"date":"2018-02-01","closeRub":2343.5,"volumeMn":1.64},{"date":"2018-03-01","closeRub":2287,"volumeMn":1.22},{"date":"2018-04-01","closeRub":2097.5,"volumeMn":3.61},{"date":"2018-05-01","closeRub":2076.5,"volumeMn":2.04},{"date":"2018-06-01","closeRub":2244,"volumeMn":2.12},{"date":"2018-07-01","closeRub":2250,"volumeMn":2.14},{"date":"2018-08-01","closeRub":2150,"volumeMn":2.51},{"date":"2018-09-01","closeRub":2160.5,"volumeMn":1.96},{"date":"2018-10-01","closeRub":1916.5,"volumeMn":14.36},{"date":"2018-11-01","closeRub":1965,"volumeMn":5.86},{"date":"2018-12-01","closeRub":1930,"volumeMn":3.7},{"date":"2019-01-01","closeRub":2212,"volumeMn":3.47},{"date":"2019-02-01","closeRub":2208,"volumeMn":5.9},{"date":"2019-03-01","closeRub":2293.6,"volumeMn":3.19},{"date":"2019-04-01","closeRub":2391,"volumeMn":3.31},{"date":"2019-05-01","closeRub":2336.6,"volumeMn":3.74},{"date":"2019-06-01","closeRub":2405.4,"volumeMn":3.48},{"date":"2019-07-01","closeRub":2490,"volumeMn":8.32},{"date":"2019-08-01","closeRub":2462.8,"volumeMn":5.27},{"date":"2019-09-01","closeRub":2263.4,"volumeMn":5.12},{"date":"2019-10-01","closeRub":2125.8,"volumeMn":29.11},{"date":"2019-11-01","closeRub":2693,"volumeMn":15.14},{"date":"2019-12-01","closeRub":2697,"volumeMn":7.34},{"date":"2020-01-01","closeRub":2873.4,"volumeMn":9.18},{"date":"2020-02-01","closeRub":2659.8,"volumeMn":17.12},{"date":"2020-03-01","closeRub":2714.4,"volumeMn":23.69},{"date":"2020-04-01","closeRub":2850.8,"volumeMn":16.97},{"date":"2020-05-01","closeRub":2833.2,"volumeMn":8.75},{"date":"2020-06-01","closeRub":3545.6,"volumeMn":13.77},{"date":"2020-07-01","closeRub":4257,"volumeMn":13.79},{"date":"2020-08-01","closeRub":5089.4,"volumeMn":60.22},{"date":"2020-09-01","closeRub":5062,"volumeMn":53.33},{"date":"2020-10-01","closeRub":4561,"volumeMn":25.13},{"date":"2020-11-01","closeRub":5278,"volumeMn":20.8},{"date":"2020-12-01","closeRub":5167,"volumeMn":13.53},{"date":"2021-01-01","closeRub":4760.6,"volumeMn":14.68},{"date":"2021-02-01","closeRub":4813.2,"volumeMn":18.38},{"date":"2021-03-01","closeRub":4859,"volumeMn":23.85},{"date":"2021-04-01","closeRub":4934.8,"volumeMn":23.95},{"date":"2021-05-01","closeRub":4942,"volumeMn":14.18},{"date":"2021-06-01","closeRub":5176.6,"volumeMn":11.65},{"date":"2021-07-01","closeRub":4970.4,"volumeMn":10.79},{"date":"2021-08-01","closeRub":5615,"volumeMn":9.85},{"date":"2021-09-01","closeRub":5804.6,"volumeMn":11.41},{"date":"2021-10-01","closeRub":5879.2,"volumeMn":13.67},{"date":"2021-11-01","closeRub":5359.4,"volumeMn":16.79},{"date":"2021-12-01","closeRub":4569.4,"volumeMn":20.23},{"date":"2022-01-01","closeRub":3717.6,"volumeMn":49.42},{"date":"2022-02-01","closeRub":1931.2,"volumeMn":86.38},{"date":"2022-03-01","closeRub":2259,"volumeMn":6.05},{"date":"2022-04-01","closeRub":1766.6,"volumeMn":19.51},{"date":"2022-05-01","closeRub":1567.8,"volumeMn":4.28},{"date":"2022-06-01","closeRub":1603.8,"volumeMn":10.12},{"date":"2022-07-01","closeRub":1952,"volumeMn":13.27},{"date":"2022-08-01","closeRub":2170.6,"volumeMn":13.13},{"date":"2022-09-01","closeRub":1877.6,"volumeMn":24.72},{"date":"2022-10-01","closeRub":2109,"volumeMn":17.54},{"date":"2022-11-01","closeRub":1996.6,"volumeMn":14.32},{"date":"2022-12-01","closeRub":1817.8,"volumeMn":8.86},{"date":"2023-01-01","closeRub":2047.2,"volumeMn":6.34},{"date":"2023-02-01","closeRub":2015,"volumeMn":11.56},{"date":"2023-03-01","closeRub":1901.6,"volumeMn":10.82},{"date":"2023-04-01","closeRub":2070.6,"volumeMn":13.85},{"date":"2023-05-01","closeRub":2324.2,"volumeMn":28.85},{"date":"2023-06-01","closeRub":2439.6,"volumeMn":23.84},{"date":"2023-07-01","closeRub":2635,"volumeMn":20.48},{"date":"2023-08-01","closeRub":2689,"volumeMn":26.28},{"date":"2023-09-01","closeRub":2402.2,"volumeMn":20.32},{"date":"2023-10-01","closeRub":2612,"volumeMn":25.84},{"date":"2023-11-01","closeRub":2523.4,"volumeMn":17.15},{"date":"2023-12-01","closeRub":2540,"volumeMn":33.06},{"date":"2024-01-01","closeRub":3026,"volumeMn":30.19},{"date":"2024-02-01","closeRub":3383,"volumeMn":68.83},{"date":"2024-03-01","closeRub":3994,"volumeMn":41.96},{"date":"2024-04-01","closeRub":4149.6,"volumeMn":23.68},{"date":"2024-05-01","closeRub":3996.8,"volumeMn":18.52},{"date":"2024-06-01","closeRub":4071.2,"volumeMn":3},{"date":"2024-07-01","closeRub":3892,"volumeMn":6.08},{"date":"2024-08-01","closeRub":3765,"volumeMn":39.11},{"date":"2024-09-01","closeRub":4007.5,"volumeMn":29.04},{"date":"2024-10-01","closeRub":3666.5,"volumeMn":16.53},{"date":"2024-11-01","closeRub":3320,"volumeMn":24.59},{"date":"2024-12-01","closeRub":3994,"volumeMn":26.34},{"date":"2025-01-01","closeRub":4092,"volumeMn":15.18},{"date":"2025-02-01","closeRub":4423,"volumeMn":23.23},{"date":"2025-03-01","closeRub":4476,"volumeMn":16.88},{"date":"2025-04-01","closeRub":4106,"volumeMn":21.18},{"date":"2025-05-01","closeRub":4172,"volumeMn":12.31},{"date":"2025-06-01","closeRub":4167,"volumeMn":13.5},{"date":"2025-07-01","closeRub":4181,"volumeMn":17.47},{"date":"2025-08-01","closeRub":4282.5,"volumeMn":12.95},{"date":"2025-09-01","closeRub":3926.5,"volumeMn":11.28},{"date":"2025-10-01","closeRub":3978.5,"volumeMn":17.92},{"date":"2025-11-01","closeRub":4185.5,"volumeMn":9.42},{"date":"2025-12-01","closeRub":4567,"volumeMn":13.05},{"date":"2026-01-01","closeRub":4735,"volumeMn":8.51},{"date":"2026-02-01","closeRub":4796,"volumeMn":10.71},{"date":"2026-03-01","closeRub":4237,"volumeMn":14.9},{"date":"2026-04-01","closeRub":4353.5,"volumeMn":10.35}];

const usdRubMonthly = [{"date":"2017-02-01","usdRub":58.3058},{"date":"2017-03-01","usdRub":56.2665},{"date":"2017-04-01","usdRub":56.9311},{"date":"2017-05-01","usdRub":56.5617},{"date":"2017-06-01","usdRub":58.9401},{"date":"2017-07-01","usdRub":59.7719},{"date":"2017-08-01","usdRub":58.006},{"date":"2017-09-01","usdRub":57.4898},{"date":"2017-10-01","usdRub":58.3289},{"date":"2017-11-01","usdRub":58.438},{"date":"2017-12-01","usdRub":57.6114},{"date":"2018-01-01","usdRub":56.2075},{"date":"2018-02-01","usdRub":56.3291},{"date":"2018-03-01","usdRub":57.1444},{"date":"2018-04-01","usdRub":62.9408},{"date":"2018-05-01","usdRub":62.403},{"date":"2018-06-01","usdRub":62.7338},{"date":"2018-07-01","usdRub":62.5078},{"date":"2018-08-01","usdRub":67.5458},{"date":"2018-09-01","usdRub":65.5503},{"date":"2018-10-01","usdRub":65.8789},{"date":"2018-11-01","usdRub":66.951},{"date":"2018-12-01","usdRub":69.8319},{"date":"2019-01-01","usdRub":65.4103},{"date":"2019-02-01","usdRub":65.9151},{"date":"2019-03-01","usdRub":65.634},{"date":"2019-04-01","usdRub":64.6373},{"date":"2019-05-01","usdRub":65.4306},{"date":"2019-06-01","usdRub":63.2305},{"date":"2019-07-01","usdRub":63.6284},{"date":"2019-08-01","usdRub":66.7657},{"date":"2019-09-01","usdRub":64.8569},{"date":"2019-10-01","usdRub":64.1328},{"date":"2019-11-01","usdRub":64.3195},{"date":"2019-12-01","usdRub":61.9863},{"date":"2020-01-01","usdRub":63.9203},{"date":"2020-02-01","usdRub":66.8806},{"date":"2020-03-01","usdRub":78.4426},{"date":"2020-04-01","usdRub":74.3813},{"date":"2020-05-01","usdRub":70.1445},{"date":"2020-06-01","usdRub":71.1734},{"date":"2020-07-01","usdRub":74.4114},{"date":"2020-08-01","usdRub":74.0718},{"date":"2020-09-01","usdRub":77.6319},{"date":"2020-10-01","usdRub":79.5257},{"date":"2020-11-01","usdRub":76.4033},{"date":"2020-12-01","usdRub":74.4121},{"date":"2021-01-01","usdRub":75.7404},{"date":"2021-02-01","usdRub":74.6196},{"date":"2021-03-01","usdRub":75.6987},{"date":"2021-04-01","usdRub":75.2073},{"date":"2021-05-01","usdRub":73.4341},{"date":"2021-06-01","usdRub":73.1522},{"date":"2021-07-01","usdRub":73.1409},{"date":"2021-08-01","usdRub":73.2274},{"date":"2021-09-01","usdRub":72.7514},{"date":"2021-10-01","usdRub":70.9464},{"date":"2021-11-01","usdRub":74.0838},{"date":"2021-12-01","usdRub":74.6539},{"date":"2022-01-01","usdRub":77.3792},{"date":"2022-02-01","usdRub":94.6025},{"date":"2022-03-01","usdRub":83.2},{"date":"2022-04-01","usdRub":70.96},{"date":"2022-05-01","usdRub":61.5},{"date":"2022-06-01","usdRub":51.45},{"date":"2022-07-01","usdRub":61.62},{"date":"2022-08-01","usdRub":60.23},{"date":"2022-09-01","usdRub":58.45},{"date":"2022-10-01","usdRub":61.4775},{"date":"2022-11-01","usdRub":60.99},{"date":"2022-12-01","usdRub":69.9},{"date":"2023-01-01","usdRub":69.82},{"date":"2023-02-01","usdRub":74.97},{"date":"2023-03-01","usdRub":77.5975},{"date":"2023-04-01","usdRub":80.25},{"date":"2023-05-01","usdRub":81.1025},{"date":"2023-06-01","usdRub":89.55},{"date":"2023-07-01","usdRub":91.6025},{"date":"2023-08-01","usdRub":96.025},{"date":"2023-09-01","usdRub":97.9675},{"date":"2023-10-01","usdRub":93.4},{"date":"2023-11-01","usdRub":89.4525},{"date":"2023-12-01","usdRub":90.36},{"date":"2024-01-01","usdRub":90.0175},{"date":"2024-02-01","usdRub":91.15},{"date":"2024-03-01","usdRub":92.48},{"date":"2024-04-01","usdRub":93.0525},{"date":"2024-05-01","usdRub":90.1},{"date":"2024-06-01","usdRub":85.5332},{"date":"2024-07-01","usdRub":85.9988},{"date":"2024-08-01","usdRub":90.6509},{"date":"2024-09-01","usdRub":92.9955},{"date":"2024-10-01","usdRub":97.3705},{"date":"2024-11-01","usdRub":106.4955},{"date":"2024-12-01","usdRub":113.4955},{"date":"2025-01-01","usdRub":98.575},{"date":"2025-02-01","usdRub":89.375},{"date":"2025-03-01","usdRub":83},{"date":"2025-04-01","usdRub":82},{"date":"2025-05-01","usdRub":77.5},{"date":"2025-06-01","usdRub":78.2},{"date":"2025-07-01","usdRub":81.1},{"date":"2025-08-01","usdRub":79.9},{"date":"2025-09-01","usdRub":82.9},{"date":"2025-10-01","usdRub":80.8},{"date":"2025-11-01","usdRub":77.5},{"date":"2025-12-01","usdRub":78.75},{"date":"2026-01-01","usdRub":76},{"date":"2026-02-01","usdRub":77.3},{"date":"2026-03-01","usdRub":81.3},{"date":"2026-04-01","usdRub":74.76}];

const lineItems: LineItem[] = [
  {
    id: "ppe",
    title: "Property and equipment",
    side: "asset",
    defaultClass: "operating",
    value2025: 331.2,
    value2024: 230.1,
    rationale: "Core infrastructure used to run the platform.",
    examples: "Servers, data-center hardware, logistics assets.",
  },
  {
    id: "intangibles",
    title: "Goodwill and intangible assets",
    side: "asset",
    defaultClass: "operating",
    value2025: 187.1,
    value2024: 182.9,
    rationale:
      "Economic assets tied to acquired businesses and software capabilities.",
    examples: "Goodwill, developed software, customer relationships.",
  },
  {
    id: "rou",
    title: "Right-of-use assets",
    side: "asset",
    defaultClass: "operating",
    value2025: 92.3,
    value2024: 88.2,
    rationale: "Leased assets support operations.",
    examples: "Office and logistics leases capitalized under IFRS 16.",
  },
  {
    id: "content",
    title: "Content assets",
    side: "asset",
    defaultClass: "operating",
    value2025: 48.1,
    value2024: 38.9,
    rationale: "Supports content-driven services and engagement.",
    examples: "Licenses and content advances.",
  },
  {
    id: "deferredTaxAssets",
    title: "Deferred tax assets",
    side: "asset",
    defaultClass: "operating",
    value2025: 29.9,
    value2024: 17.1,
    rationale: "Linked to accounting and operating activity.",
    examples: "Tax losses and timing differences.",
  },
  {
    id: "loansNonCurrent",
    title: "Loans to customers, non-current",
    side: "asset",
    defaultClass: "financing",
    value2025: 26.1,
    value2024: 3.0,
    rationale: "Treated as financing-style assets.",
    examples: "Longer-dated lending balances.",
  },
  {
    id: "debtSecuritiesNonCurrent",
    title: "Debt securities, non-current",
    side: "asset",
    defaultClass: "financing",
    value2025: 24.8,
    value2024: 0.0,
    rationale: "Treasury and investment balances.",
    examples: "Debt instruments outside the operating loop.",
  },
  {
    id: "otherNonCurrent",
    title: "Other non-current assets",
    side: "asset",
    defaultClass: "operating",
    value2025: 39.6,
    value2024: 31.8,
    rationale: "Operating by default unless clearly financing-specific.",
    examples: "Longer-dated operating advances and platform assets.",
  },
  {
    id: "inventory",
    title: "Inventory",
    side: "asset",
    defaultClass: "operating",
    value2025: 33.2,
    value2024: 30.9,
    rationale: "Working capital for commerce and related services.",
    examples: "Marketplace inventory balances.",
  },
  {
    id: "receivables",
    title: "Trade accounts receivable",
    side: "asset",
    defaultClass: "operating",
    value2025: 95.5,
    value2024: 89.0,
    rationale: "Receivables arise from operating transactions.",
    examples: "Advertising and service receivables.",
  },
  {
    id: "prepaids",
    title: "Prepaid expenses",
    side: "asset",
    defaultClass: "operating",
    value2025: 23.0,
    value2024: 26.5,
    rationale: "Normal operating timing difference.",
    examples: "Service prepayments and vendor advances.",
  },
  {
    id: "vat",
    title: "VAT reclaimable",
    side: "asset",
    defaultClass: "operating",
    value2025: 32.5,
    value2024: 33.4,
    rationale: "Tax working-capital item linked to operations.",
    examples: "Recoverable indirect taxes.",
  },
  {
    id: "loansCurrent",
    title: "Loans to customers, current",
    side: "asset",
    defaultClass: "financing",
    value2025: 91.4,
    value2024: 69.0,
    rationale: "Classified as financing-style deployment.",
    examples: "Current lending and fintech balances.",
  },
  {
    id: "debtSecuritiesCurrent",
    title: "Debt securities, current",
    side: "asset",
    defaultClass: "financing",
    value2025: 15.2,
    value2024: 0.0,
    rationale: "Treasury-style holdings.",
    examples: "Short-term debt investments.",
  },
  {
    id: "fundsReceivable",
    title: "Funds receivable",
    side: "asset",
    defaultClass: "operating",
    value2025: 10.0,
    value2024: 16.5,
    rationale: "Working operating balance.",
    examples: "Settlement-related receivables.",
  },
  {
    id: "termDeposits",
    title: "Term deposits",
    side: "asset",
    defaultClass: "financing",
    value2025: 0.0,
    value2024: 0.9,
    rationale: "Classic financing asset.",
    examples: "Short-term deposits held as liquid balances.",
  },
  {
    id: "cash",
    title: "Cash and cash equivalents",
    side: "asset",
    defaultClass: "financing",
    value2025: 250.2,
    value2024: 211.6,
    rationale: "Treated as financing asset in reformulation.",
    examples: "Cash and near-cash balances.",
  },
  {
    id: "otherCurrentAssets",
    title: "Other current assets",
    side: "asset",
    defaultClass: "operating",
    value2025: 38.1,
    value2024: 28.9,
    rationale: "Operating unless clearly treasury or financial.",
    examples: "Miscellaneous current operating balances.",
  },
  {
    id: "debtNonCurrent",
    title: "Debt, non-current",
    side: "liability",
    defaultClass: "financing",
    value2025: 179.6,
    value2024: 99.1,
    rationale: "Direct financing obligation.",
    examples: "Borrowings and non-current debt instruments.",
  },
  {
    id: "leaseNonCurrent",
    title: "Lease liabilities, non-current",
    side: "liability",
    defaultClass: "financing",
    value2025: 72.2,
    value2024: 65.9,
    rationale: "Debt-like financing under the course framework.",
    examples: "IFRS 16 lease liabilities.",
  },
  {
    id: "deferredTaxLiabilities",
    title: "Deferred tax liabilities",
    side: "liability",
    defaultClass: "operating",
    value2025: 16.0,
    value2024: 10.1,
    rationale: "Operating accounting consequence.",
    examples: "Timing differences from accounting and tax treatment.",
  },
  {
    id: "financialLiabilitiesNonCurrent",
    title: "Financial Services liabilities, non-current",
    side: "liability",
    defaultClass: "financing",
    value2025: 17.8,
    value2024: 7.9,
    rationale: "Treated as financing burden linked to fintech balances.",
    examples: "Longer-dated financial-services obligations.",
  },
  {
    id: "otherNonCurrentLiabilities",
    title: "Other non-current liabilities",
    side: "liability",
    defaultClass: "operating",
    value2025: 9.0,
    value2024: 10.3,
    rationale: "Operating until clearly debt-like.",
    examples: "Miscellaneous long-term platform obligations.",
  },
  {
    id: "apOther",
    title: "Accounts payable and other liabilities",
    side: "liability",
    defaultClass: "operating",
    value2025: 210.4,
    value2024: 255.8,
    rationale: "Classic operating liabilities.",
    examples: "Trade payables, accruals, operating settlements.",
  },
  {
    id: "debtCurrent",
    title: "Debt, current",
    side: "liability",
    defaultClass: "financing",
    value2025: 90.1,
    value2024: 160.9,
    rationale: "Short-term financing obligation.",
    examples: "Current borrowings and maturities.",
  },
  {
    id: "financialLiabilitiesCurrent",
    title: "Financial Services liabilities, current",
    side: "liability",
    defaultClass: "financing",
    value2025: 249.7,
    value2024: 100.2,
    rationale:
      "Financing-style liabilities linked to financial services balances.",
    examples: "Customer funds and current fintech obligations.",
  },
  {
    id: "taxesPayable",
    title: "Taxes payable",
    side: "liability",
    defaultClass: "operating",
    value2025: 66.6,
    value2024: 45.9,
    rationale: "Working operating obligation.",
    examples: "Current tax payables due to operations.",
  },
  {
    id: "contractLiabilities",
    title: "Contract liabilities",
    side: "liability",
    defaultClass: "operating",
    value2025: 39.9,
    value2024: 32.6,
    rationale:
      "Operating liability from contracts and advance billings.",
    examples: "Deferred revenue and advance payments.",
  },
  {
    id: "provisions",
    title: "Provisions",
    side: "liability",
    defaultClass: "operating",
    value2025: 47.5,
    value2024: 0.0,
    rationale: "Operating obligation related to the business.",
    examples: "Claims, reserves and estimated operating obligations.",
  },
  {
    id: "leaseCurrent",
    title: "Lease liabilities, current",
    side: "liability",
    defaultClass: "financing",
    value2025: 18.3,
    value2024: 16.1,
    rationale: "Current debt-like lease burden.",
    examples: "Current IFRS 16 lease liabilities.",
  },
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
  reported: {
    label: "Reported",
    currentE: 79.6,
    accent: "#60a5fa",
    nextYearBase: 115,
    secondYearBase: 150,
    pe: 21.5,
  },
  hybrid: {
    label: "Hybrid",
    currentE: 92.9,
    accent: "#f59e0b",
    nextYearBase: 140,
    secondYearBase: 190,
    pe: 18.4,
  },
  adjusted: {
    label: "Adjusted",
    currentE: 141.4,
    accent: "#22c55e",
    nextYearBase: 176,
    secondYearBase: 220,
    pe: 12.1,
  },
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



function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function residualValue(
  B0: number,
  E1: number,
  E2: number,
  D1: number,
  r: number,
  g: number
) {
  const B1 = B0 + E1 - D1;
  const RE1 = E1 - r * B0;
  const RE2 = E2 - r * B1;
  const value = B0 + RE1 / (1 + r) + RE2 / ((1 + r) * (r - g));
  const noGrowth = B0 + RE1 / (1 + r) + RE2 / ((1 + r) * r);
  const impliedG =
    r - RE2 / (((market.marketCapRubBn - B0 - RE1 / (1 + r)) * (1 + r)) || 1e-9);
  return { B1, RE1, RE2, value, noGrowth, speculative: market.marketCapRubBn - noGrowth, impliedG };
}

function StatCard({
  label,
  value,
  suffix = "",
  accent = "#ffffff",
  sub,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  accent?: string;
  sub?: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-sm">
      <div className="text-xs uppercase tracking-[0.22em] text-white/45">{label}</div>
      <div className="mt-3 text-3xl font-semibold" style={{ color: accent }}>
        {value}
        {suffix}
      </div>
      {sub ? <div className="mt-2 text-sm leading-6 text-white/55">{sub}</div> : null}
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="text-xs uppercase tracking-[0.3em] text-[#ffd21f]">{eyebrow}</div>
      <h2 className="max-w-5xl text-4xl font-semibold leading-tight text-white md:text-5xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="max-w-4xl text-base leading-7 text-white/65 md:text-lg">{subtitle}</p>
      ) : null}
    </div>
  );
}

function Range({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-white/70">
        <span>{label}</span>
        <span className="font-medium text-white">{format ? format(value) : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10"
      />
    </div>
  );
}

function GlassButton({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-2xl border px-4 py-2 text-sm transition-all duration-300",
        active
          ? "border-[#ffd21f]/60 bg-[#ffd21f]/15 text-white shadow-lg"
          : "border-white/10 bg-white/5 text-white/65 hover:border-white/20 hover:bg-white/10 hover:text-white"
      )}
    >
      {children}
    </button>
  );
}

function LegendPills({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/65"
        >
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
          <span>{item.label}</span>
        </div>
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
      <path
        d={`M${lineEndX},${lineEndY} L${x},${y} L${finalX},${y}`}
        stroke={fill}
        strokeWidth={1.5}
        fill="none"
        opacity={0.9}
      />
      <circle cx={lineEndX} cy={lineEndY} r={2.5} fill={fill} />
      <text
        x={finalX + (isRight ? 4 : -4)}
        y={y - 4}
        fill="rgba(255,255,255,0.92)"
        textAnchor={isRight ? "start" : "end"}
        fontSize={13}
        fontWeight={600}
      >
        {name}
      </text>
      <text
        x={finalX + (isRight ? 4 : -4)}
        y={y + 14}
        fill="rgba(255,255,255,0.58)"
        textAnchor={isRight ? "start" : "end"}
        fontSize={12}
      >
        {(percent * 100).toFixed(1)}%
      </text>
    </g>
  );
}

function SlideContainer({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex h-full w-full min-h-0 flex-col"
    >
      {children}
    </motion.div>
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
      <div className="mb-4 flex items-center gap-3 text-white/60">
        <FileBarChart className="h-4 w-4" />
        earnings waterfall
      </div>

      <LegendPills
        items={[
          { label: "Checkpoints", color: "#f59e0b" },
          { label: "Positive adjustments", color: "#22c55e" },
          { label: "Negative adjustments", color: "#ef4444" },
        ]}
      />

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
              <div className="mb-3 text-center text-xs uppercase tracking-[0.18em] text-white/45">
                {bar.label}
              </div>
              <div className="relative h-[280px] w-full">
                {idx > 0 ? (
                  <div
                    className="absolute left-[-30px] h-px w-[34px] bg-white/20"
                    style={{ bottom: scale(bar.prev) }}
                  />
                ) : null}
                <motion.div
                  initial={{ opacity: 0, y: 12, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: h }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="absolute left-1/2 w-[72px] -translate-x-1/2 rounded-2xl"
                  style={{
                    bottom,
                    background: `linear-gradient(180deg, ${fill}, rgba(255,255,255,0.08))`,
                    boxShadow: `0 0 32px ${fill}40`,
                  }}
                />
              </div>
              <div className="mt-3 text-lg font-semibold text-white">
                {isDelta ? `${bar.value > 0 ? "+" : ""}${fmtUsdBn(bar.value)}` : fmtUsdBn(bar.current)}
              </div>
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
  const [priceView, setPriceView] = useState<"usd" | "rub">("usd");
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
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        setSlide((s) => Math.min(s + 1, slideMeta.length - 1));
      }
      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        setSlide((s) => Math.max(s - 1, 0));
      }
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

  const dividend = useMemo(() => (market.dividendRub * market.shares) / 1000, []);
  const currentBasis = basisConfig[basis];
  const baseE1 = currentBasis.nextYearBase + e1Adjust;
  const baseE2 = currentBasis.secondYearBase + e2Adjust;
  const valuation = useMemo(
    () => residualValue(351.2, baseE1, baseE2, dividend, r, g),
    [baseE1, baseE2, dividend, r, g]
  );
  const valuePerShare = (valuation.value / market.shares) * 1000;
  const noGrowthPerShare = (valuation.noGrowth / market.shares) * 1000;
  const upside = (valuation.value / market.marketCapRubBn - 1) * 100;

  const basePM = 8.6;
  const baseATO = 3.27;
  const baseRNOA = +(basePM * baseATO).toFixed(1);
  const baseReOI = 1441.1 * (basePM / 100 - r / baseATO);
  const liveRNOA = +(pm * ato).toFixed(1);
  const liveReOI = 1441.1 * (pm / 100 - r / ato);

  const activeSegment = segments2025.find((s) => s.id === selectedSegment) ?? segments2025[0];
  const visibleLineItems = lineItems.filter((item) =>
    item.side === (explorerMode === "assets" ? "asset" : "liability")
  );
  const activeLine = lineItems.find((item) => item.id === selectedLine) ?? visibleLineItems[0];
  const effectiveClass = (item: LineItem): Classification =>
    classificationOverrides[item.id] ?? item.defaultClass;

  const explorerTotals = useMemo(() => {
    const oa = lineItems
      .filter((i) => i.side === "asset" && effectiveClass(i) === "operating")
      .reduce((sum, i) => sum + i.value2025, 0);
    const fa = lineItems
      .filter((i) => i.side === "asset" && effectiveClass(i) === "financing")
      .reduce((sum, i) => sum + i.value2025, 0);
    const ol = lineItems
      .filter((i) => i.side === "liability" && effectiveClass(i) === "operating")
      .reduce((sum, i) => sum + i.value2025, 0);
    const fl = lineItems
      .filter((i) => i.side === "liability" && effectiveClass(i) === "financing")
      .reduce((sum, i) => sum + i.value2025, 0);
    const noa = oa - ol;
    const nd = fl - fa;
    const equity = noa - nd;
    return { oa, fa, ol, fl, noa, nd, equity };
  }, [classificationOverrides]);

  const stackData = [
    { name: "Book value", value: toUsdBn(351.2), color: "#94a3b8" },
    {
      name: "No-growth premium",
      value: Math.max(toUsdBn(valuation.noGrowth - 351.2), 0),
      color: currentBasis.accent,
    },
    {
      name: "Speculative premium",
      value: Math.max(toUsdBn(valuation.speculative), 0),
      color: "#ef4444",
    },
  ];

  const impliedGauge = [
    {
      name: "Implied g",
      value: Math.max(Math.min(valuation.impliedG * 100, 10), 0),
      fill: currentBasis.accent,
    },
  ];

  const usdRubLookup = useMemo(
    () =>
      usdRubMonthly.map((d) => ({
        ...d,
        ts: new Date(d.date).getTime(),
      })),
    []
  );

  const findFxForDate = (dateStr: string) => {
    const ts = new Date(dateStr).getTime();
    let chosen = usdRubLookup[0]?.usdRub ?? FX_RATE;
    for (const row of usdRubLookup) {
      if (row.ts <= ts) chosen = row.usdRub;
      else break;
    }
    return chosen;
  };

  const ydexChartData = useMemo(
    () =>
      ydexMonthlyData.map((d) => {
        const fx = findFxForDate(d.date);
        return {
          ...d,
          fx,
          closeUsd: +(d.closeRub / fx).toFixed(2),
        };
      }),
    [usdRubLookup]
  );
const priceYearTicks = useMemo(() => {
  const ticks = ydexChartData
    .filter((d, i, arr) => {
      const dt = new Date(d.date);
      return dt.getMonth() === 0 || i === 0 || i === arr.length - 1;
    })
    .map((d) => d.date);

  return Array.from(new Set(ticks));
}, [ydexChartData]);


  const activePriceLabel = priceView === "usd" ? "Price (USD)" : "Price (RUB)";
  const activePricePrefix = priceView === "usd" ? "$" : "₽";

  const earningsChartData = annual.map((d) => ({
    year: d.year,
    Reported: d.reportedUsd,
    Adjusted: d.adjustedUsd,
  }));

  const marginChartData = annual.map((d) => ({
    year: d.year,
    margin: d.margin,
    revenueGrowth: d.revGrowth ?? 0,
    ebitdaGrowth: d.ebitdaGrowth ?? 0,
  }));

  const driverCompare = [
    { metric: "PM", Base: basePM, Live: pm },
    { metric: "ATO", Base: baseATO, Live: ato },
  ];

  const outcomeCompare = [
    { metric: "RNOA", Base: baseRNOA, Live: liveRNOA, kind: "pct" },
    { metric: "ReOI", Base: toUsdBn(baseReOI), Live: toUsdBn(liveReOI), kind: "usd" },
  ];

  const slides = [
    <SlideContainer key="overview">
      <div className="grid flex-1 grid-cols-1 gap-8 xl:grid-cols-[1fr_1fr]">
        <div className="space-y-8">
          <SectionTitle
            eyebrow="Business overview"
            title="Yandex is a multi-vertical digital platform"
            subtitle="The company combines a high-margin search business with logistics, media, subscription, and B2B technology activities. The investment question is not whether Yandex is relevant, but whether the wider ecosystem deserves more than the search engine alone."
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <div className="flex items-center gap-3 text-white/60">
                <Building2 className="h-4 w-4" />
                what the business does
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-white/70">
                <li>• Search, advertising and AI products</li>
                <li>• Ride-hailing, delivery and commerce logistics</li>
                <li>• Media, subscriptions and consumer services</li>
                <li>• Cloud and enterprise technology</li>
              </ul>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <div className="flex items-center gap-3 text-white/60">
                <Network className="h-4 w-4" />
                why it is interesting
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-white/70">
                <li>• Clear platform logic and ecosystem depth</li>
                <li>• Visible improvement in operating momentum</li>
                <li>• Large gap between reported and adjusted earnings views</li>
                <li>• Useful case for accounting-based valuation</li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatCard label="Share price" value={fmtUsdShare(market.priceRub)} accent="#ffd21f" />
            <StatCard label="Market cap" value={fmtUsdBn(market.marketCapRubBn)} />
            <StatCard label="2025 revenue" value={fmtUsdBn(1441.1)} accent="#ffd21f" />
            <StatCard label="2025 adj. EBITDA" value={fmtUsdBn(280.8)} accent="#22c55e" />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/8 to-white/[0.03] p-6 shadow-2xl">
          <div className="absolute -right-14 -top-10 h-36 w-36 rounded-full bg-[#ffd21f]/10 blur-3xl" />
          <div className="absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-white/70">
              <Sparkles className="h-4 w-4" />
              YDEX price chart
            </div>

            <div className="flex items-center gap-2">
              <GlassButton active={priceView === "usd"} onClick={() => setPriceView("usd")}>
                USD
              </GlassButton>
              <GlassButton active={priceView === "rub"} onClick={() => setPriceView("rub")}>
                RUB
              </GlassButton>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm text-white/55">
                {priceView === "usd"
                  ? "Share price in USD, converted from RUB using monthly USD/RUB"
                  : "Share price in RUB"}
              </div>
              <div className="text-xs text-white/45">years marked on x-axis</div>
            </div>

            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart key={priceView} data={ydexChartData}>
                  <defs>
                    <linearGradient id="priceFillBright" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffe45c" stopOpacity={0.55} />
                      <stop offset="55%" stopColor="#ffd21f" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#ffd21f" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
<XAxis
  dataKey="date"
  ticks={priceYearTicks}
  tickFormatter={(value) => String(new Date(value).getFullYear())}
  stroke="rgba(255,255,255,0.5)"
/>
<YAxis
  stroke="rgba(255,255,255,0.5)"
  tickFormatter={(value) =>
    `${priceView === "usd" ? "$" : "₽"}${Math.round(num(value))}`
  }
/>
                  <Tooltip
                    {...tooltipStyle}
                    formatter={(value) => [`${activePricePrefix}${USD2.format(num(value))}`, activePriceLabel]}
                    labelFormatter={(label) => String(label)}
                  />
                  <Area
  type="monotone"
  dataKey={priceView === "usd" ? "closeUsd" : "closeRub"}
  stroke={priceView === "usd" ? "#ffe45c" : "#ffb347"}
  fill="url(#priceFillBright)"
  strokeWidth={3.5}
/>
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 border-t border-white/10 pt-4">
              <div className="mb-2 text-sm text-white/55">Volume</div>
              <div className="h-[130px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ydexChartData}>
                    <defs>
                      <linearGradient id="volFillBright" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ffcf5a" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#b87416" stopOpacity={0.55} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
<XAxis
  dataKey="date"
  ticks={priceYearTicks}
  tickFormatter={(value) => String(new Date(value).getFullYear())}
  stroke="rgba(255,255,255,0.5)"
/>
                    <Tooltip
                      {...tooltipStyle}
                      formatter={(value) => [`${num(value).toFixed(2)}m`, "Volume"]}
                      labelFormatter={(label) => String(label)}
                    />
                    <Bar dataKey="volumeMn" fill="url(#volFillBright)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SlideContainer>,

    <SlideContainer key="structure">
      <div className="grid flex-1 grid-cols-1 gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-8">
          <SectionTitle
            eyebrow="Business structure"
            title="Different segments, different economics"
            subtitle="Yandex is not one business. Search & AI is the core profit engine, while the rest of the ecosystem contributes scale, engagement and optionality with very different margin profiles."
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {segments2025.map((s) => (
              <motion.button
                key={s.id}
                whileHover={{ y: -4, scale: 1.01 }}
                onClick={() => setSelectedSegment(s.id)}
                className={cn(
                  "rounded-[1.75rem] border p-5 text-left transition",
                  selectedSegment === s.id
                    ? "border-white/25 bg-white/10 shadow-2xl"
                    : "border-white/10 bg-white/5"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-medium text-white">{s.name}</div>
                    <div className="mt-2 text-sm text-white/60">{s.role}</div>
                  </div>
                  <div className="h-3 w-3 rounded-full" style={{ background: s.color }} />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-white/40">Revenue</div>
                    <div className="mt-2 text-2xl font-semibold text-white">{fmtUsdBn(s.revenue)}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-white/40">EBITDA margin</div>
                    <div className="mt-2 text-2xl font-semibold text-white">{s.margin.toFixed(1)}%</div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="grid grid-rows-[minmax(0,1fr)_auto] gap-6 min-h-0">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center gap-3 text-white/60">
              <Boxes className="h-4 w-4" />
              revenue mix
            </div>

            <LegendPills
              items={segments2025.map((s) => ({ label: `${s.name} · ${s.share}%`, color: s.color }))}
            />

            <div className="mt-4 h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 20, right: 110, bottom: 20, left: 110 }}>
                  <Pie
                    data={segments2025}
                    dataKey="revenueUsd"
                    nameKey="name"
                    innerRadius={74}
                    outerRadius={122}
                    paddingAngle={3}
                    labelLine={false}
                    label={renderPieLabel}
                  >
                    {segments2025.map((s) => (
                      <Cell key={s.id} fill={s.color} stroke="rgba(255,255,255,0.9)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    {...tooltipStyle}
                    formatter={(value, _name, p: any) => [
                      `$${USD2.format(num(value))}bn`,
                      String(p?.payload?.name ?? ""),
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-black/20 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm text-white/55">Segment economics</div>
                <div className="mt-2 text-2xl font-semibold text-white">{activeSegment.name}</div>
              </div>
              <div
                className="rounded-full px-3 py-1 text-sm"
                style={{ background: `${activeSegment.color}20`, color: activeSegment.color }}
              >
                {scenarios[scenario].label}
              </div>
            </div>

            <div className="mt-4 text-sm leading-7 text-white/70">{activeSegment.thesis}</div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {(["bear", "base", "bull"] as ScenarioKey[]).map((key) => (
                <div
                  key={key}
                  className={cn(
                    "rounded-2xl border p-3",
                    scenario === key ? "border-white/25 bg-white/10" : "border-white/10 bg-white/5"
                  )}
                >
                  <div className="text-xs uppercase tracking-[0.2em] text-white/45">{key}</div>
                  <div className="mt-2 text-xl font-semibold text-white">
                    {activeSegment.scenarioMargins[key].toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SlideContainer>,

    <SlideContainer key="framing">
      <div className="grid flex-1 grid-cols-1 gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="flex flex-col justify-between gap-8">
          <div className="space-y-8">
            <SectionTitle
              eyebrow="Investment framing"
              title="The same stock looks different depending on which earnings base you trust"
              subtitle="This is the core setup for the whole valuation. Reported earnings look noisy, adjusted earnings look generous, and hybrid is the working bridge between the two."
            />

            <div className="flex flex-wrap gap-3">
              <GlassButton active={basis === "reported"} onClick={() => setBasis("reported")}>
                Reported basis
              </GlassButton>
              <GlassButton active={basis === "hybrid"} onClick={() => setBasis("hybrid")}>
                Hybrid basis
              </GlassButton>
              <GlassButton active={basis === "adjusted"} onClick={() => setBasis("adjusted")}>
                Adjusted basis
              </GlassButton>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatCard label="Share price" value={fmtUsdShare(market.priceRub)} accent="#ffd21f" />
            <StatCard label="Market cap" value={fmtUsdBn(market.marketCapRubBn)} />
            <StatCard
              label={`${currentBasis.label} P/E`}
              value={currentBasis.pe.toFixed(1)}
              suffix="x"
              accent={currentBasis.accent}
            />
            <StatCard
              label="Live value / share"
              value={fmtUsdShare(valuePerShare)}
              accent={upside >= 0 ? "#22c55e" : "#f87171"}
              sub={`${upside >= 0 ? "+" : ""}${upside.toFixed(1)}% vs market`}
            />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/8 to-white/[0.03] p-6 shadow-2xl">
          <div className="absolute -right-16 -top-12 h-40 w-40 rounded-full bg-[#ffd21f]/10 blur-3xl" />
          <div className="absolute -bottom-14 -left-10 h-44 w-44 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-white/70">
                <Sparkles className="h-4 w-4" />
                current active lens
              </div>
              <div className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/60">USD values</div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                { label: "Reported", value: 79.6, accent: basisConfig.reported.accent },
                { label: "Hybrid", value: 92.9, accent: basisConfig.hybrid.accent },
                { label: "Adjusted", value: 141.4, accent: basisConfig.adjusted.accent },
              ].map((c) => (
                <div key={c.label} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm text-white/55">{c.label}</div>
                  <div className="mt-3 text-2xl font-semibold" style={{ color: c.accent }}>
                    {fmtUsdBn(c.value)}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <div className="text-sm text-white/50">Default view</div>
              <div className="mt-3 text-2xl font-semibold text-white">Wait</div>
              <div className="mt-3 text-sm leading-7 text-white/70">
                The business looks strong, but under the default hybrid base the margin of safety is limited.
                That is why the presentation comes back to a disciplined wait view.
              </div>
            </div>
          </div>
        </div>
      </div>
    </SlideContainer>,

    <SlideContainer key="momentum">
      <div className="space-y-8">
        <SectionTitle
          eyebrow="Financial momentum"
          title="Revenue scale and operating leverage accelerated in 2024–2025"
          subtitle="Switch between scale, profitability and earnings quality without losing the timeline."
        />

        <div className="grid flex-1 grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr] min-h-0">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex flex-wrap gap-3">
              <GlassButton active={momentumMode === "scale"} onClick={() => setMomentumMode("scale")}>
                Scale
              </GlassButton>
              <GlassButton active={momentumMode === "margin"} onClick={() => setMomentumMode("margin")}>
                Margins & growth
              </GlassButton>
              <GlassButton active={momentumMode === "earnings"} onClick={() => setMomentumMode("earnings")}>
                Earnings quality
              </GlassButton>
            </div>

            {momentumMode === "scale" && (
              <>
                <LegendPills
                  items={[
                    { label: "Revenue", color: "#ffd21f" },
                    { label: "Adjusted EBITDA", color: "#22c55e" },
                  ]}
                />
                <div className="mt-4 h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={annual}>
                      <defs>
                        <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ffd21f" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="#ffd21f" stopOpacity={0.03} />
                        </linearGradient>
                        <linearGradient id="ebitdaFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.18} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                      <XAxis dataKey="year" stroke="rgba(255,255,255,0.45)" />
                      <YAxis stroke="rgba(255,255,255,0.45)" />
                      <Tooltip
                        {...tooltipStyle}
                        formatter={(value, name) => [
                          `$${USD2.format(num(value))}bn`,
                          name === "revenueUsd" ? "Revenue" : "Adjusted EBITDA",
                        ]}
                      />
                      <Legend
                        formatter={(value) => (
                          <span style={{ color: "rgba(255,255,255,0.75)" }}>
                            {value === "revenueUsd" ? "Revenue" : "Adjusted EBITDA"}
                          </span>
                        )}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenueUsd"
                        stroke="#ffd21f"
                        fillOpacity={1}
                        fill="url(#revFill)"
                        strokeWidth={3}
                      />
                      <Area
                        type="monotone"
                        dataKey="ebitdaUsd"
                        stroke="#22c55e"
                        fillOpacity={1}
                        fill="url(#ebitdaFill)"
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {momentumMode === "margin" && (
              <>
                <LegendPills
                  items={[
                    { label: "EBITDA margin", color: "#f59e0b" },
                    { label: "Revenue growth", color: "#60a5fa" },
                    { label: "EBITDA growth", color: "#22c55e" },
                  ]}
                />
                <div className="mt-4 h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={marginChartData}>
                      <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                      <XAxis dataKey="year" stroke="rgba(255,255,255,0.45)" />
                      <YAxis stroke="rgba(255,255,255,0.45)" />
                      <Tooltip {...tooltipStyle} formatter={percentTooltipFormatter} />
                      <Legend
                        formatter={(value) => (
                          <span style={{ color: "rgba(255,255,255,0.75)" }}>{value}</span>
                        )}
                      />
                      <Bar dataKey="margin" name="EBITDA margin" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="revenueGrowth" name="Revenue growth" fill="#60a5fa" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="ebitdaGrowth" name="EBITDA growth" fill="#22c55e" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {momentumMode === "earnings" && (
              <>
                <LegendPills
                  items={[
                    { label: "Reported NI", color: "#60a5fa" },
                    { label: "Adjusted NI", color: "#22c55e" },
                  ]}
                />
                <div className="mt-4 h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={earningsChartData}>
                      <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                      <XAxis dataKey="year" stroke="rgba(255,255,255,0.45)" />
                      <YAxis stroke="rgba(255,255,255,0.45)" />
                      <Tooltip {...tooltipStyle} formatter={usdTooltipFormatter} />
                      <Legend
                        formatter={(value) => (
                          <span style={{ color: "rgba(255,255,255,0.75)" }}>{value}</span>
                        )}
                      />
                      <Bar dataKey="Reported" fill="#60a5fa" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="Adjusted" fill="#22c55e" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>

          <div className="grid gap-4 min-h-0">
            <StatCard label="2025 revenue" value={fmtUsdBn(1441.1)} accent="#ffd21f" />
            <StatCard label="2025 adj. EBITDA" value={fmtUsdBn(280.8)} accent="#22c55e" />
            <StatCard label="2025 EBITDA margin" value="19.5" suffix="%" accent="#ffffff" />

            <div className="rounded-[2rem] border border-white/10 bg-black/20 p-5">
              <div className="mb-3 flex items-center gap-3 text-sm text-white/60">
                <BarChart3 className="h-4 w-4" />
                reading the chart
              </div>
              <div className="text-base leading-7 text-white/70">
                {momentumMode === "scale" &&
                  "Scale mode shows how revenue and adjusted EBITDA widened apart in absolute terms, with much stronger operational leverage in 2024–2025."}
                {momentumMode === "margin" &&
                  "Margin mode shows that profitability improvement was not just about scale; margin and EBITDA growth both accelerated alongside revenue growth."}
                {momentumMode === "earnings" &&
                  "Earnings mode highlights the growing gap between reported and adjusted net income, which is the key valuation tension later in the deck."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SlideContainer>,

    <SlideContainer key="earnings">
      <div className="grid flex-1 grid-cols-1 gap-8 xl:grid-cols-[0.86fr_1.14fr]">
        <div className="space-y-8">
          <SectionTitle
            eyebrow="Earnings quality"
            title="Reported → hybrid → adjusted"
            subtitle="Hybrid is the working bridge between noisy reported earnings and generous management adjustments."
          />

          <div className="grid gap-4">
            <StatCard label="Reported NI" value={fmtUsdBn(79.6)} accent="#60a5fa" />
            <StatCard
              label="Hybrid NI"
              value={fmtUsdBn(92.9)}
              accent="#f59e0b"
              sub="Analytical estimate, not an official metric"
            />
            <StatCard
              label="Adjusted NI"
              value={fmtUsdBn(141.4)}
              accent="#22c55e"
              sub="Management-style clean earnings"
            />
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-black/20 p-5">
            <div className="mb-3 text-sm text-white/50">How hybrid is calculated</div>
            <div className="text-sm leading-7 text-white/70">
              Hybrid NI = Reported NI + FX and one-off normalization, but it keeps SBC as a real
              operating expense. In other words, hybrid removes obvious noise from reported earnings,
              yet stops short of fully accepting management add-backs.
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="mb-5 flex flex-wrap gap-3">
              <GlassButton active={basis === "reported"} onClick={() => setBasis("reported")}>
                Reported
              </GlassButton>
              <GlassButton active={basis === "hybrid"} onClick={() => setBasis("hybrid")}>
                Hybrid
              </GlassButton>
              <GlassButton active={basis === "adjusted"} onClick={() => setBasis("adjusted")}>
                Adjusted
              </GlassButton>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <StatCard
                label="Current P/E"
                value={currentBasis.pe.toFixed(1)}
                suffix="x"
                accent={currentBasis.accent}
              />
              <StatCard label="No-growth value / share" value={fmtUsdShare(noGrowthPerShare)} accent="#ffffff" />
              <StatCard
                label="Implied g"
                value={(valuation.impliedG * 100).toFixed(1)}
                suffix="%"
                accent={upside >= 0 ? "#22c55e" : "#f87171"}
              />
            </div>
          </div>

          <WaterfallChart />
        </div>
      </div>
    </SlideContainer>,

    <SlideContainer key="reformulation">
      <div className="space-y-8">
        <SectionTitle
          eyebrow="Reformulated statements"
          title="From mixed IFRS totals to operating and financing logic"
          subtitle="The main deck keeps reformulation simple. The full click-by-click statement explorer is placed in the P.S. slide for appendix or Q&A."
        />

        <div className="grid flex-1 min-h-0 grid-cols-1 gap-6 xl:grid-cols-[1fr_0.95fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="mb-6 flex items-center gap-3 text-white/60">
              <Database className="h-4 w-4" />
              2025 reformulation map
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="text-sm text-white/50">Operating assets</div>
                <div className="mt-3 text-3xl font-semibold text-white">{fmtUsdBn(960.5)}</div>
                <div className="mt-3 text-sm leading-7 text-white/60">
                  PPE, intangibles, ROU assets, content assets, receivables, inventory, prepaid and operating current assets.
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="text-sm text-white/50">Operating liabilities</div>
                <div className="mt-3 text-3xl font-semibold text-white">{fmtUsdBn(389.4)}</div>
                <div className="mt-3 text-sm leading-7 text-white/60">
                  AP, contract liabilities, taxes payable, deferred taxes, provisions and other operating liabilities.
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="text-sm text-white/50">Financing assets</div>
                <div className="mt-3 text-3xl font-semibold text-white">{fmtUsdBn(407.7)}</div>
                <div className="mt-3 text-sm leading-7 text-white/60">
                  Cash, debt securities, loans to customers and other treasury-style balances.
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="text-sm text-white/50">Financing liabilities</div>
                <div className="mt-3 text-3xl font-semibold text-white">{fmtUsdBn(627.7)}</div>
                <div className="mt-3 text-sm leading-7 text-white/60">
                  Debt, leases and financial-services liabilities treated as financing burden.
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="mb-4 text-sm text-white/60">Accounting identity</div>
            <LegendPills
              items={[
                { label: "NOA", color: "#ffd21f" },
                { label: "Net debt", color: "#ffffff" },
                { label: "Equity", color: "#22c55e" },
              ]}
            />

            <div className="mt-6 flex flex-col gap-4">
              <motion.div
                layout
                className="rounded-3xl border border-[#ffd21f]/20 bg-[#ffd21f]/10 px-5 py-6 text-center"
              >
                <div className="text-sm text-white/60">Net operating assets</div>
                <div className="mt-2 text-3xl font-semibold text-[#ffd21f]">{fmtUsdBn(571.1)}</div>
              </motion.div>

              <div className="text-center text-xl text-white/35">−</div>

              <motion.div
                layout
                className="rounded-3xl border border-white/10 bg-black/20 px-5 py-6 text-center"
              >
                <div className="text-sm text-white/50">Net financing debt</div>
                <div className="mt-2 text-3xl font-semibold text-white">{fmtUsdBn(220.0)}</div>
              </motion.div>

              <div className="text-center text-xl text-white/35">=</div>

              <motion.div
                layout
                className="rounded-3xl border border-[#22c55e]/25 bg-[#22c55e]/10 px-5 py-6 text-center"
              >
                <div className="text-sm text-white/60">Common equity</div>
                <div className="mt-2 text-3xl font-semibold text-[#22c55e]">{fmtUsdBn(351.2)}</div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </SlideContainer>,

    <SlideContainer key="drivers">
      <div className="grid flex-1 grid-cols-1 gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-8">
          <SectionTitle
            eyebrow="Profitability engine"
            title="PM × ATO → RNOA → residual operating income"
            subtitle="Instead of an abstract scatter, this slide compares the 2025 base economics with the current live scenario across the core valuation drivers and outcomes."
          />

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 space-y-5">
            <Range
              label="Profit margin (PM)"
              value={pm}
              min={3}
              max={15}
              step={0.1}
              onChange={setPm}
              format={(v) => `${v.toFixed(1)}%`}
            />
            <Range
              label="Asset turnover (ATO)"
              value={ato}
              min={1.5}
              max={4.5}
              step={0.01}
              onChange={setAto}
              format={(v) => `${v.toFixed(2)}x`}
            />
            <Range
              label="Required return r"
              value={r * 100}
              min={10}
              max={15}
              step={0.1}
              onChange={(v) => setR(v / 100)}
              format={(v) => `${v.toFixed(1)}%`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Live RNOA" value={liveRNOA.toFixed(1)} suffix="%" accent="#ffd21f" />
            <StatCard
              label="Live ReOI"
              value={fmtUsdBn(liveReOI)}
              accent={liveReOI >= 0 ? "#22c55e" : "#f87171"}
            />
          </div>
        </div>

        <div className="grid grid-rows-[auto_auto_1fr] gap-6">
          <div className="grid grid-cols-4 gap-4">
            <StatCard label="PM" value={pm.toFixed(1)} suffix="%" accent="#ffd21f" sub={`base ${basePM.toFixed(1)}%`} />
            <StatCard label="ATO" value={ato.toFixed(2)} suffix="x" accent="#60a5fa" sub={`base ${baseATO.toFixed(2)}x`} />
            <StatCard label="RNOA" value={liveRNOA.toFixed(1)} suffix="%" accent="#f59e0b" sub={`base ${baseRNOA.toFixed(1)}%`} />
            <StatCard label="ReOI" value={fmtUsdBn(liveReOI)} accent="#22c55e" sub={`base ${fmtUsdBn(baseReOI)}`} />
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="mb-4 text-sm text-white/60">Driver comparison</div>
            <LegendPills
              items={[
                { label: "Base 2025", color: "#94a3b8" },
                { label: "Live scenario", color: currentBasis.accent },
              ]}
            />
            <div className="mt-4 h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={driverCompare}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="metric" stroke="rgba(255,255,255,0.45)" />
                  <YAxis stroke="rgba(255,255,255,0.45)" />
                  <Tooltip {...tooltipStyle} formatter={percentTooltipFormatter} />
                  <Legend formatter={(value) => <span style={{ color: "rgba(255,255,255,0.75)" }}>{value}</span>} />
                  <Bar dataKey="Base" fill="rgba(148,163,184,0.9)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Live" fill={currentBasis.accent} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="mb-4 text-sm text-white/60">Outcome comparison</div>
            <LegendPills
              items={[
                { label: "Base 2025", color: "#94a3b8" },
                { label: "Live scenario", color: currentBasis.accent },
              ]}
            />
            <div className="mt-4 h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={outcomeCompare}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="metric" stroke="rgba(255,255,255,0.45)" />
                  <YAxis stroke="rgba(255,255,255,0.45)" />
                  <Tooltip
                    {...tooltipStyle}
                    formatter={(value, name, item: any) => [
                      item?.payload?.kind === "usd"
                        ? `$${USD2.format(num(value))}bn`
                        : `${num(value).toFixed(1)}%`,
                      String(name ?? ""),
                    ]}
                  />
                  <Legend formatter={(value) => <span style={{ color: "rgba(255,255,255,0.75)" }}>{value}</span>} />
                  <Bar dataKey="Base" fill="rgba(148,163,184,0.9)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Live" fill={currentBasis.accent} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </SlideContainer>,

    <SlideContainer key="valuation">
      <div className="space-y-8">
        <SectionTitle
          eyebrow="Residual earnings valuation"
          title="Anchored value first, speculative value second"
          subtitle="This is the center of the interactive deck. You can change earnings assumptions, required return and terminal growth and see how the investment case changes in real time."
        />

        <div className="grid flex-1 grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 space-y-5">
            <div className="flex flex-wrap gap-3">
              <GlassButton active={scenario === "bear"} onClick={() => setScenario("bear")}>
                Bear
              </GlassButton>
              <GlassButton active={scenario === "base"} onClick={() => setScenario("base")}>
                Base
              </GlassButton>
              <GlassButton active={scenario === "bull"} onClick={() => setScenario("bull")}>
                Bull
              </GlassButton>
            </div>

            <Range
              label="2026 earnings"
              value={baseE1}
              min={80}
              max={220}
              step={1}
              onChange={(v) => setE1Adjust(v - currentBasis.nextYearBase)}
              format={(v) => fmtUsdBn(v)}
            />

            <Range
              label="2027 earnings"
              value={baseE2}
              min={90}
              max={250}
              step={1}
              onChange={(v) => setE2Adjust(v - currentBasis.secondYearBase)}
              format={(v) => fmtUsdBn(v)}
            />

            <Range
              label="Required return r"
              value={r * 100}
              min={10}
              max={15}
              step={0.1}
              onChange={(v) => setR(v / 100)}
              format={(v) => `${v.toFixed(1)}%`}
            />

            <Range
              label="Terminal growth g"
              value={g * 100}
              min={1}
              max={5}
              step={0.1}
              onChange={(v) => setG(v / 100)}
              format={(v) => `${v.toFixed(1)}%`}
            />

            <div className="grid grid-cols-2 gap-4 pt-3">
              <StatCard label="Equity value" value={fmtUsdBn(valuation.value)} accent={currentBasis.accent} />
              <StatCard
                label="Value / share"
                value={fmtUsdShare(valuePerShare)}
                accent={upside >= 0 ? "#22c55e" : "#f87171"}
                sub={`${upside >= 0 ? "+" : ""}${upside.toFixed(1)}% vs market`}
              />
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <div className="mb-4 text-sm text-white/60">Market cap decomposition</div>

              <LegendPills items={stackData.map((d) => ({ label: d.name, color: d.color }))} />

              <div className="mt-4 h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={stackData}>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" horizontal={false} />
                    <XAxis type="number" stroke="rgba(255,255,255,0.45)" />
                    <YAxis type="category" dataKey="name" width={140} stroke="rgba(255,255,255,0.45)" />
                    <Tooltip {...tooltipStyle} formatter={(value) => `$${USD2.format(num(value))}bn`} />
                    <Bar dataKey="value" radius={[0, 12, 12, 0]}>
                      {stackData.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <StatCard label="Book value" value={fmtUsdBn(351.2)} />
              <StatCard label="No-growth value" value={fmtUsdBn(valuation.noGrowth)} accent="#ffffff" />
              <StatCard label="Speculative premium" value={fmtUsdBn(valuation.speculative)} accent="#ef4444" />
            </div>
          </div>
        </div>
      </div>
    </SlideContainer>,

    <SlideContainer key="implied">
      <div className="grid flex-1 grid-cols-1 gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-8">
          <SectionTitle
            eyebrow="Market expectations"
            title="Reverse-engineer the growth rate implied by the market price"
            subtitle="Instead of arguing vaguely that the stock is optimistic or pessimistic, translate price into an explicit long-run growth requirement."
          />

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="mb-5 flex flex-wrap gap-3">
              <GlassButton active={basis === "reported"} onClick={() => setBasis("reported")}>
                Reported
              </GlassButton>
              <GlassButton active={basis === "hybrid"} onClick={() => setBasis("hybrid")}>
                Hybrid
              </GlassButton>
              <GlassButton active={basis === "adjusted"} onClick={() => setBasis("adjusted")}>
                Adjusted
              </GlassButton>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Market cap" value={fmtUsdBn(market.marketCapRubBn)} />
              <StatCard
                label="Implied g"
                value={(valuation.impliedG * 100).toFixed(1)}
                suffix="%"
                accent={currentBasis.accent}
              />
              <StatCard label="No-growth anchor" value={fmtUsdBn(valuation.noGrowth)} />
              <StatCard
                label="Speculative share"
                value={`${Math.max((valuation.speculative / market.marketCapRubBn) * 100, 0).toFixed(0)}%`}
                accent="#ef4444"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="mb-4 text-sm text-white/60">Implied growth dial</div>
            <LegendPills items={[{ label: "Implied long-run growth rate", color: currentBasis.accent }]} />

            <div className="mt-4 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="55%" outerRadius="100%" data={impliedGauge} startAngle={180} endAngle={0}>
                  <RadialBar dataKey="value" cornerRadius={20} background />
                  <Tooltip {...tooltipStyle} formatter={impliedTooltipFormatter} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>

            <div className="-mt-14 text-center text-5xl font-semibold text-white">
              {(valuation.impliedG * 100).toFixed(1)}%
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-black/20 p-6">
            <div className="text-sm text-white/50">Plausibility test</div>
            <div className="mt-3 text-xl leading-8 text-white">
              {(valuation.impliedG * 100) < 3 &&
                "The market-implied growth rate looks modest. The stock may be easier to justify if earnings quality is credible."}
              {(valuation.impliedG * 100) >= 3 &&
                (valuation.impliedG * 100) < 6 &&
                "The market-implied growth rate is meaningful but still plausible for a strong platform, depending on monetization outside Search."}
              {(valuation.impliedG * 100) >= 6 &&
                "The market-implied growth rate looks demanding. The current price leaves limited room for disappointment unless one uses a very generous earnings base."}
            </div>
          </div>
        </div>
      </div>
    </SlideContainer>,

    <SlideContainer key="recommendation">
      <div className="grid flex-1 grid-cols-1 gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-8">
          <SectionTitle
            eyebrow="Recommendation"
            title="High-quality business. Limited margin of safety."
            subtitle="Default view: Wait."
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { name: "Buy", active: false, color: "#22c55e" },
              { name: "Wait", active: true, color: "#f59e0b" },
              { name: "Sell", active: false, color: "#ef4444" },
            ].map((card) => (
              <div
                key={card.name}
                className={cn(
                  "rounded-[1.75rem] border p-5 transition-all",
                  card.active ? "border-white/30 bg-white/10 shadow-2xl" : "border-white/10 bg-white/5 opacity-60"
                )}
              >
                <div className="text-sm text-white/55">State</div>
                <div className="mt-4 text-3xl font-semibold" style={{ color: card.color }}>
                  {card.name}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-3 text-white/60">
                <Brain className="h-4 w-4" />
                What I know
              </div>
              <div className="mt-4 text-sm leading-7 text-white/70">
                Search & AI is the core profit anchor, 2025 operating momentum was real, and the
                company now has more visible earnings power than in prior years.
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-3 text-white/60">
                <Wallet className="h-4 w-4" />
                What is uncertain
              </div>
              <div className="mt-4 text-sm leading-7 text-white/70">
                The broader ecosystem still needs to prove durable margin expansion. That is where
                most of the valuation disagreement lives.
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-3 text-white/60">
                <ShieldAlert className="h-4 w-4" />
                Margin of safety
              </div>
              <div className="mt-4 text-sm leading-7 text-white/70">
                Under the default hybrid base, the stock looks interesting but not cheap enough to
                force a buy call.
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#ffd21f]/10 to-orange-500/10 p-6">
            <div className="flex items-center gap-3 text-white/60">
              <CircleDollarSign className="h-4 w-4" />
              investment call
            </div>
            <div className="mt-5 text-4xl font-semibold text-white">Wait</div>
            <div className="mt-5 text-lg leading-8 text-white/75">
              The business is strong and strategically impressive, but the current price leaves only
              a limited margin of safety unless one adopts a much more generous earnings base or a
              more optimistic long-run margin story.
            </div>
            <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5 text-sm leading-7 text-white/70">
              The stock is not an obvious avoid. It is a name to keep on the radar, but the default
              committee conclusion here is disciplined wait rather than buy.
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center gap-3 text-white/60">
              <Layers3 className="h-4 w-4" />
              keyboard shortcuts
            </div>
            <ul className="space-y-3 text-sm leading-7 text-white/70">
              <li>• press slide number digits to jump directly</li>
              <li>• multi-digit input works, so 1 then 1 jumps to slide 11</li>
              <li>• left / right arrows move one slide</li>
            </ul>
          </div>
        </div>
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

                  <GlassButton onClick={() => setClassificationOverrides({})}>Reset</GlassButton>
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
                        selected ? "border-white/25 bg-white/10" : "border-white/10 bg-white/5 hover:bg-white/8"
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
              <div className="mt-2 text-2xl font-semibold text-white">{activeLine.title}</div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <StatCard label="2025" value={fmtUsdBn(activeLine.value2025)} accent="#ffffff" />
                <StatCard label="2024" value={fmtUsdBn(activeLine.value2024)} accent="#94a3b8" />
              </div>

              <div className="mt-4 text-sm leading-7 text-white/70">{activeLine.rationale}</div>
              <div className="mt-3 text-sm leading-7 text-white/50">{activeLine.examples}</div>

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
    </SlideContainer>,
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,210,31,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.08),transparent_28%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1720px] flex-col px-4 py-4 md:px-6 md:py-6">
        <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-white/8">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#ffd21f] to-orange-500"
            animate={{ width: `${((slide + 1) / slideMeta.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <div className="relative flex-1 overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-5 shadow-2xl backdrop-blur md:p-8">
          <AnimatePresence mode="wait">{slides[slide]}</AnimatePresence>
        </div>

        <footer className="mt-4 flex items-center justify-between gap-4 rounded-[2rem] border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
          <div className="flex flex-wrap gap-2">
            {slideMeta.map((s, i) => (
              <button
                key={s.key}
                onClick={() => setSlide(i)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs transition",
                  i === slide
                    ? "bg-[#ffd21f]/15 text-white"
                    : "bg-white/5 text-white/45 hover:bg-white/10 hover:text-white/75"
                )}
              >
                {i + 1}. {s.title}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60">
              Digits + arrows
            </div>
            <button
              onClick={() => setSlide((s) => Math.max(s - 1, 0))}
              className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/70 hover:bg-white/10 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setSlide((s) => Math.min(s + 1, slideMeta.length - 1))}
              className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/70 hover:bg-white/10 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}