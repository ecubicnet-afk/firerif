"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, BarChart, Bar,
} from "recharts";
import {
  Upload, Save, Activity, CheckCircle2,
  Trash2, Sparkles, Loader2, List,
  ShieldCheck, TrendingUp, Globe,
  Banknote, Coins, Table, Layers,
  RefreshCw, PieChart as PieChartIcon,
  ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatYen } from "@/lib/utils";

// --- Constants ---
const ASSET_TYPE_COLORS: Record<string, string> = {
  "投資信託": "#059669",
  "株式": "#2563eb",
  "ETF": "#d97706",
  "REIT": "#db2777",
  "債券": "#7c3aed",
  "現金": "#64748b",
  "その他": "#6b7280",
};

const REGION_COLORS: Record<string, string> = {
  "日本": "#2563eb",
  "米国": "#dc2626",
  "全世界": "#7c3aed",
  "現金": "#64748b",
  "その他の地域": "#6b7280",
};

// --- Types ---
interface HoldingItem {
  id?: string;
  source: string;
  name: string;
  marketValue: number;
  profit: number;
  nisaType: string;
  assetType: string;
  region: string;
}

interface AccountDataset {
  fileName: string;
  items: HoldingItem[];
  total: number;
  cash: number;
}

interface Snapshot {
  id: string;
  date: string;
  totalAsset: number;
  totalProfit: number;
  nisaValue: number;
  cashValue: number;
  purchaseAmount: number;
}

// --- Utils ---
const toHalfWidth = (str: string) => {
  if (!str) return "";
  return String(str)
    .replace(/[！-～]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
    .replace(/　/g, " ");
};

const cleanValue = (val: string | number) =>
  String(val || "").replace(/["',円%+\s]/g, "").trim();

const parseNumber = (val: string | number) => {
  const cleaned = cleanValue(val);
  if (cleaned === "" || cleaned === "-") return 0;
  return parseFloat(cleaned) || 0;
};

const splitCSVLine = (line: string) => {
  const result: string[] = [];
  let inQuotes = false;
  let current = "";
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') inQuotes = !inQuotes;
    else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else current += char;
  }
  result.push(current.trim());
  return result.map((v) => v.replace(/^"|"$/g, "").trim());
};

const truncateName = (name: string, max: number = 18) =>
  name.length > max ? name.slice(0, max) + "…" : name;

// --- Chart Components ---
const RADIAN = Math.PI / 180;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomPieLabel = (props: any) => {
  const { cx, cy, midAngle, outerRadius, percent, name } = props;
  if (!percent || percent < 0.03) return null;
  const radius = (outerRadius || 100) + 28;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#334155" textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      style={{ fontSize: "11px", fontWeight: "700" }}>
      {`${name} ${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EnhancedTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-slate-900/95 backdrop-blur-sm text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700/50">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
        {String(label || data.name || "詳細")}
      </p>
      {payload.map((p: { name: string; value: number; color?: string; fill?: string }, i: number) => (
        <div key={i} className="flex items-center justify-between gap-6 text-xs">
          <span className="font-medium" style={{ color: p.color || p.fill || "#94a3b8" }}>
            {p.name}
          </span>
          <span className="font-mono font-bold">¥{Math.round(Number(p.value)).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HistoryTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 backdrop-blur-sm text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700/50">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
      {payload.map((p: { name: string; value: number; color?: string; stroke?: string }, i: number) => (
        <div key={i} className="flex items-center justify-between gap-6 text-xs">
          <span className="font-medium" style={{ color: p.color || p.stroke || "#94a3b8" }}>{p.name}</span>
          <span className="font-mono font-bold">¥{Math.round(Number(p.value)).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

// --- Animated number ---
function AnimatedValue({ value, className }: { value: string; className?: string }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={className}
    >
      {value}
    </motion.span>
  );
}

// --- Stat Card ---
function StatCard({
  label, value, subValue, icon: Icon, accent, className, delay = 0,
}: {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ElementType;
  accent: string;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className={`overflow-hidden ${className || ""}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent}`}>
              <Icon className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
          </div>
          <AnimatedValue value={value} className="text-xl font-black font-mono block" />
          {subValue && (
            <p className="text-[11px] font-bold text-muted-foreground mt-0.5">{subValue}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// --- Mobile Card View for Holdings ---
function HoldingCard({
  item, index,
}: {
  item: { name: string; region: string; assetType: string; nisaTypeDisplay: string; weight: number; cost: number; marketValue: number; profit: number; profitRate: number };
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{item.name}</p>
              <div className="flex gap-1 mt-1 flex-wrap">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  item.region === "全世界" ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" :
                  item.region === "米国" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                  item.region === "日本" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                  "bg-muted text-muted-foreground"
                }`}>{item.region}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-white dark:bg-slate-700">{item.nisaTypeDisplay}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  item.assetType === "ETF" ? "bg-amber-100 text-amber-700" :
                  item.assetType === "債券" ? "bg-violet-100 text-violet-700" :
                  item.assetType === "株式" ? "bg-blue-100 text-blue-700" :
                  "bg-emerald-100 text-emerald-700"
                }`}>{item.assetType}</span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-slate-900 text-white text-xs font-black font-mono rounded-lg dark:bg-slate-700">
              {item.weight.toFixed(1)}%
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs mt-3 pt-3 border-t">
            <div>
              <p className="text-muted-foreground text-[10px] mb-0.5">取得額</p>
              <p className="font-mono font-medium">{formatYen(item.cost)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-[10px] mb-0.5">評価額</p>
              <p className="font-mono font-bold">{formatYen(item.marketValue)}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-[10px] mb-0.5">損益</p>
              <p className={`font-mono font-bold ${item.profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {item.profit >= 0 ? "+" : ""}{formatYen(item.profit)}
              </p>
              <p className="text-[10px] font-mono text-muted-foreground">({item.profitRate.toFixed(2)}%)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// --- Main Component ---
export default function AssetsPage() {
  const [accountDatasets, setAccountDatasets] = useState<AccountDataset[]>([]);
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({ key: "marketValue", direction: "desc" });
  const [usdJpyRate, setUsdJpyRate] = useState(150);
  const [isRateLoading, setIsRateLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // --- Aggregation ---
  const aggregatedStats = useMemo(() => {
    const rawItems = accountDatasets.flatMap((d) => d.items);
    const equity = accountDatasets.reduce((sum, d) => sum + d.total, 0);
    const cash = accountDatasets.reduce((sum, d) => sum + (d.cash || 0), 0);
    const profit = rawItems.reduce((s, i) => s + i.profit, 0);
    const nisaValue = rawItems
      .filter((i) => i.nisaType.includes("NISA"))
      .reduce((s, i) => s + i.marketValue, 0);
    const purchaseAmount = equity - profit;
    const nisaRatio = equity > 0 ? (nisaValue / equity) * 100 : 0;
    return { equity, cash, profit, nisaValue, purchaseAmount, nisaRatio, rawItems };
  }, [accountDatasets]);

  const consolidatedData = useMemo(() => {
    const { rawItems, equity } = aggregatedStats;
    const grouped: Record<string, HoldingItem & { nisaTypes: Set<string> }> = {};
    for (const item of rawItems) {
      const key = item.name;
      if (!grouped[key]) {
        grouped[key] = { ...item, nisaTypes: new Set([item.nisaType]) };
      } else {
        grouped[key].marketValue += item.marketValue;
        grouped[key].profit += item.profit;
        grouped[key].nisaTypes.add(item.nisaType);
      }
    }
    return Object.values(grouped).map((i) => ({
      ...i,
      cost: i.marketValue - i.profit,
      profitRate: i.marketValue - i.profit !== 0 ? (i.profit / (i.marketValue - i.profit)) * 100 : 0,
      weight: equity > 0 ? (i.marketValue / equity) * 100 : 0,
      nisaTypeDisplay: Array.from(i.nisaTypes).join(" / "),
    }));
  }, [aggregatedStats]);

  const sortedData = useMemo(
    () =>
      [...consolidatedData].sort((a, b) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const valA = (a as any)[sortConfig.key];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const valB = (b as any)[sortConfig.key];
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      }),
    [consolidatedData, sortConfig]
  );

  // --- Chart Data ---
  const regionMix = useMemo(() => {
    const mix: Record<string, number> = {};
    consolidatedData.forEach((i) => {
      mix[i.region] = (mix[i.region] || 0) + i.marketValue;
    });
    if (aggregatedStats.cash > 0) mix["現金"] = aggregatedStats.cash;
    const sum = Object.values(mix).reduce((s, e) => s + e, 0);
    return Object.entries(mix)
      .map(([name, value]) => ({ name, value, percent: sum > 0 ? value / sum : 0 }))
      .sort((a, b) => b.value - a.value);
  }, [consolidatedData, aggregatedStats.cash]);

  const assetTypeMix = useMemo(() => {
    const mix: Record<string, number> = {};
    consolidatedData.forEach((i) => {
      mix[i.assetType] = (mix[i.assetType] || 0) + i.marketValue;
    });
    if (aggregatedStats.cash > 0) mix["現金"] = aggregatedStats.cash;
    const sum = Object.values(mix).reduce((s, e) => s + e, 0);
    return Object.entries(mix)
      .map(([name, value]) => ({ name, value, percent: sum > 0 ? value / sum : 0 }))
      .sort((a, b) => b.value - a.value);
  }, [consolidatedData, aggregatedStats.cash]);

  const top10Data = useMemo(() => {
    return [...consolidatedData]
      .sort((a, b) => b.marketValue - a.marketValue)
      .slice(0, 10)
      .map((item) => ({
        ...item,
        shortName: truncateName(item.name),
        displayValue: `¥${Math.floor(item.marketValue).toLocaleString()}`,
        fill: REGION_COLORS[item.region] || REGION_COLORS["その他の地域"],
      }));
  }, [consolidatedData]);

  // History chart with purchase line
  const historyChartData = useMemo(() => {
    return history.map((h) => ({
      ...h,
      displayDate: h.date.slice(5), // MM-DD
    }));
  }, [history]);

  // --- Handlers ---
  const fetchRate = useCallback(async () => {
    setIsRateLoading(true);
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/USD");
      if (!res.ok) throw new Error("レート取得失敗");
      const data = await res.json();
      if (data.rates?.JPY) setUsdJpyRate(data.rates.JPY);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRateLoading(false);
    }
  }, []);

  const fetchHoldings = useCallback(async () => {
    try {
      const res = await fetch("/api/assets/holdings");
      const data = await res.json();
      if (Array.isArray(data)) setAccountDatasets(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchSnapshots = useCallback(async () => {
    try {
      const res = await fetch("/api/assets/snapshots");
      const data = await res.json();
      if (Array.isArray(data)) setHistory(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const saveSnapshot = useCallback(async () => {
    if (aggregatedStats.equity === 0) return;
    setIsSaving(true);
    try {
      await fetch("/api/assets/snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          totalAsset: aggregatedStats.equity,
          totalProfit: aggregatedStats.profit,
          nisaValue: aggregatedStats.nisaValue,
          cashValue: aggregatedStats.cash,
          purchaseAmount: aggregatedStats.purchaseAmount,
        }),
      });
      setSaveStatus("success");
      setTimeout(() => setSaveStatus(null), 3000);
      fetchSnapshots();
    } catch {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  }, [aggregatedStats, selectedDate, fetchSnapshots]);

  const deleteSnapshot = useCallback(
    async (date: string) => {
      if (!confirm(`${date}の記録を削除しますか？`)) return;
      await fetch(`/api/assets/snapshots/${date}`, { method: "DELETE" });
      fetchSnapshots();
    },
    [fetchSnapshots]
  );

  const removeDataset = useCallback(
    async (fileName: string) => {
      await fetch("/api/assets/holdings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: fileName }),
      });
      setAccountDatasets((prev) => prev.filter((d) => d.fileName !== fileName));
    },
    []
  );

  const handleSort = useCallback(
    (key: string) => {
      setSortConfig((prev) => ({
        key,
        direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
      }));
    },
    []
  );

  // --- CSV Parsing ---
  const parseFileContent = useCallback((text: string, fileName: string): AccountDataset | null => {
    if (text.includes("\ufffd") || text.includes("ï¿½")) {
      console.warn("[CSV] Garbled characters detected, may need different encoding");
      return null;
    }

    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l !== "");
    if (lines.length < 2) {
      console.warn("[CSV] File too short:", lines.length, "lines");
      return null;
    }

    let items: HoldingItem[] = [];
    let totalValueFromHeader = 0;
    const isSBI = text.includes("保有証券一覧");

    const NAME_KEYS = ["ファンド名", "銘柄名称", "銘柄名", "銘柄", "ファンド"];
    const VALUE_KEYS = ["評価額", "時価評価額", "評価金額"];
    const COST_KEYS = ["取得金額", "取得価額", "買付金額"];
    const PROFIT_KEYS = ["評価損益", "損益", "評価損益（税引前）"];

    const findKey = (obj: Record<string, string>, keys: string[]) => {
      for (const k of keys) {
        if (obj[k] !== undefined && obj[k] !== "") return obj[k];
      }
      for (const k of Object.keys(obj)) {
        for (const target of keys) {
          if (k.includes(target) || target.includes(k)) return obj[k];
        }
      }
      return "";
    };

    if (isSBI) {
      let currentNisaType = "特定/一般";
      let isReadingData = false;
      let headers: string[] = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const cells = splitCSVLine(line);
        const norm = toHalfWidth(line);
        const isSection =
          (norm.startsWith("投資信託（") || norm.startsWith("株式（") ||
            norm.startsWith("投資信託(") || norm.startsWith("株式(") ||
            norm.includes("投資信託（") || norm.includes("株式（")) &&
          cells.filter((c) => c !== "").length <= 3;
        if (isSection) {
          if (norm.includes("成長投資枠")) currentNisaType = "NISA成長";
          else if (norm.includes("つみたて投資枠")) currentNisaType = "NISAつみたて";
          else if (norm.includes("NISA預り") || norm.includes("NISA")) currentNisaType = "NISA";
          isReadingData = false;
          continue;
        }
        const headerFound = cells.some((c) => {
          const h = toHalfWidth(c).trim();
          return NAME_KEYS.some((k) => h.includes(k) || k.includes(h));
        });
        if (headerFound && cells.some((c) => VALUE_KEYS.some((k) => toHalfWidth(c).includes(k)))) {
          headers = cells.map((c) => toHalfWidth(c).trim());
          isReadingData = true;
          continue;
        }
        if (!isReadingData && headerFound) {
          headers = cells.map((c) => toHalfWidth(c).trim());
          isReadingData = true;
          continue;
        }
        if (isReadingData && cells.length >= 3 && cells[0] !== "" && !cells[0].includes("合計")) {
          const obj: Record<string, string> = {};
          headers.forEach((h, idx) => {
            if (h) obj[h] = cells[idx] || "";
          });
          const name = findKey(obj, NAME_KEYS);
          const marketValue = parseNumber(findKey(obj, VALUE_KEYS));
          const purchaseAmount = parseNumber(findKey(obj, COST_KEYS));
          const profit = parseNumber(findKey(obj, PROFIT_KEYS));
          if (name && marketValue > 0) {
            items.push({
              source: fileName,
              name,
              marketValue,
              profit: profit || marketValue - purchaseAmount,
              nisaType: currentNisaType,
              assetType: "",
              region: "",
            });
          }
        }
      }
    } else {
      for (const line of lines) {
        const c = splitCSVLine(line);
        if (c[0] === "資産合計") totalValueFromHeader = parseNumber(c[1]);
      }
      const hIdx = lines.findIndex((l) => {
        const norm = toHalfWidth(l);
        const hasName = NAME_KEYS.some((k) => norm.includes(k));
        const hasValue = VALUE_KEYS.some((k) => norm.includes(k));
        return hasName && hasValue;
      });
      const hIdxFallback = hIdx === -1
        ? lines.findIndex((l) => {
            const norm = toHalfWidth(l);
            return NAME_KEYS.some((k) => norm.includes(k)) && l.includes(",");
          })
        : hIdx;
      const finalHIdx = hIdx !== -1 ? hIdx : hIdxFallback;

      if (finalHIdx !== -1) {
        const h = splitCSVLine(lines[finalHIdx]).map((c) => toHalfWidth(c).trim());
        items = lines
          .slice(finalHIdx + 1)
          .filter((l) => l.includes(","))
          .map((line) => {
            const c = splitCSVLine(line);
            const o: Record<string, string> = {};
            h.forEach((head, i) => (o[head] = c[i] || ""));
            const n = findKey(o, NAME_KEYS);
            if (!n) return null;
            let nt = "特定/一般";
            const ai = o["口座"] || o["預り区分"] || o["口座区分"] || o["勘定"] || "";
            if (ai.includes("つみたて")) nt = "NISAつみたて";
            else if (ai.includes("成長") || ai.includes("NISA")) nt = "NISA成長";
            return {
              source: fileName,
              name: n,
              marketValue: parseNumber(findKey(o, VALUE_KEYS)),
              profit: parseNumber(findKey(o, PROFIT_KEYS)),
              nisaType: nt,
              assetType: "",
              region: "",
            };
          })
          .filter((i): i is HoldingItem => i !== null && i.marketValue > 0);
      } else {
        console.warn("[CSV] No header row found. First 3 lines:", lines.slice(0, 3));
      }
    }

    items = items.map((i) => {
      const n = toHalfWidth(i.name).toUpperCase();
      let at = "投資信託";
      const trusts = ["ファンド", "インデックス", "信託", "SLIM", "IFREE", "全世界", "NASDAQ", "レバレッジ", "AM", "ヘッジ", "PLUS", "S&P500", "FANG"];
      if (n.includes("ETF")) at = "ETF";
      else if (n.includes("REIT") || n.includes("リート")) at = "REIT";
      else if (n.includes("米債") || n.includes("債券") || n.includes("BOND")) at = "債券";
      else if (!trusts.some((k) => n.includes(k))) at = "株式";
      let reg = at === "株式" ? "日本" : "その他の地域";
      const usKeys = ["米国", "S&P500", "NASDAQ", "FANG", "VTI", "NYダウ", "米債", "TESLA", "TSLA", "PALANTIR", "PLTR"];
      if (usKeys.some((k) => n.includes(k))) reg = "米国";
      else if (n.includes("全世界") || n.includes("オルカン") || n.includes("GLOBAL")) reg = "全世界";
      else if (n.includes("日本") || n.includes("日経") || n.includes("TOPIX")) reg = "日本";
      return { ...i, assetType: at, region: reg };
    });

    if (items.length === 0) {
      console.warn("[CSV] No items extracted from", fileName, "| Lines:", lines.length, "| SBI:", isSBI);
      return null;
    }

    return {
      fileName,
      items,
      total: items.reduce((s, x) => s + x.marketValue, 0),
      cash: Math.max(0, totalValueFromHeader - items.reduce((s, x) => s + x.marketValue, 0)),
    };
  }, []);

  const handleCSVUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      setUploadStatus(null);

      files.forEach((f) => {
        const tryParse = (text: string, encoding: string) => {
          const res = parseFileContent(text, f.name);
          if (res) return res;
          console.warn(`[CSV] Parse failed with ${encoding} for ${f.name}`);
          return null;
        };

        const reader = new FileReader();
        reader.onload = async (ev) => {
          const text = ev.target?.result as string;
          let res = tryParse(text, "Shift-JIS");

          if (!res) {
            const utf8Reader = new FileReader();
            utf8Reader.onload = async (ev2) => {
              const text2 = ev2.target?.result as string;
              res = tryParse(text2, "UTF-8");
              if (res) {
                setAccountDatasets((prev) => [...prev.filter((p) => p.fileName !== f.name), res!]);
                try {
                  await fetch("/api/assets/holdings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ source: f.name, items: res.items, cash: res.cash }),
                  });
                  setUploadStatus({ type: "success", message: `${res.items.length}件の銘柄を取り込みました` });
                } catch {
                  setUploadStatus({ type: "error", message: "データの保存に失敗しました" });
                }
              } else {
                setUploadStatus({ type: "error", message: `${f.name}: CSVの形式を確認してください（対応形式: SBI証券・楽天証券の保有証券CSV）` });
              }
            };
            utf8Reader.readAsText(f, "UTF-8");
            return;
          }

          setAccountDatasets((prev) => [...prev.filter((p) => p.fileName !== f.name), res!]);
          try {
            await fetch("/api/assets/holdings", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ source: f.name, items: res.items, cash: res.cash }),
            });
            setUploadStatus({ type: "success", message: `${res.items.length}件の銘柄を取り込みました` });
          } catch {
            setUploadStatus({ type: "error", message: "データの保存に失敗しました" });
          }
        };
        reader.onerror = () => {
          setUploadStatus({ type: "error", message: `${f.name}: ファイルの読み込みに失敗しました` });
        };
        reader.readAsText(f, "Shift-JIS");
      });
      e.target.value = "";
      setTimeout(() => setUploadStatus(null), 5000);
    },
    [parseFileContent]
  );

  const exportCSV = useCallback(
    (type: string) => {
      if (accountDatasets.length === 0) return;
      let data: Record<string, string | number>[] = [];
      let name = "";
      if (type === "holdings") {
        data = sortedData.map((i) => ({
          銘柄名: i.name,
          地域: i.region,
          資産種別: i.assetType,
          "比率(%)": i.weight.toFixed(2),
          評価額: i.marketValue,
          損益: i.profit,
        }));
        name = `assets_${selectedDate}.csv`;
      } else {
        data = history.map((h) => ({
          日付: h.date,
          総資産: h.totalAsset,
          投資元本: h.purchaseAmount,
          損益: h.totalProfit,
        }));
        name = "history.csv";
      }
      if (data.length === 0) return;
      const headers = Object.keys(data[0]).join(",");
      const rows = data.map((row) => Object.values(row).map((v) => `"${v}"`).join(",")).join("\n");
      const blob = new Blob(["\ufeff" + headers + "\n" + rows], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = name;
      link.click();
    },
    [accountDatasets, sortedData, history, selectedDate]
  );

  // --- Initial Load ---
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchHoldings(), fetchSnapshots(), fetchRate()]);
      setLoading(false);
    };
    init();
  }, [fetchHoldings, fetchSnapshots, fetchRate]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center py-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-3"
        >
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-emerald-500" />
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        </motion.div>
      </div>
    );
  }

  const profitRate = aggregatedStats.purchaseAmount !== 0
    ? (aggregatedStats.profit / aggregatedStats.purchaseAmount) * 100
    : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-2.5 rounded-xl shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">かんたん資産管理</h1>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> CSV取り込み対応
            </p>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-muted rounded-full text-[10px] font-mono">
              <Globe className="w-3 h-3 text-indigo-500" />
              <span className="text-muted-foreground">USD/JPY:</span>
              <span className="text-indigo-600 font-bold">¥{usdJpyRate.toFixed(2)}</span>
              <button onClick={fetchRate} className="ml-1 hover:text-indigo-800">
                <RefreshCw className={`w-2.5 h-2.5 ${isRateLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-background px-3 py-2 rounded-lg border text-sm"
          />
          <Button onClick={saveSnapshot} disabled={aggregatedStats.equity === 0 || isSaving} size="sm">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
            {saveStatus === "success" ? "保存済み" : "保存"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportCSV("holdings")} disabled={accountDatasets.length === 0}>
            <Table className="w-4 h-4 mr-1" /> 銘柄CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportCSV("history")} disabled={history.length === 0}>
            <Activity className="w-4 h-4 mr-1" /> 推移CSV
          </Button>
        </div>
      </motion.div>

      {/* Key Stats — Profit card prominent */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard
          label="投資元本"
          value={formatYen(aggregatedStats.purchaseAmount)}
          icon={Coins}
          accent="bg-emerald-600"
          delay={0}
        />
        <StatCard
          label="時価評価額"
          value={formatYen(aggregatedStats.equity)}
          icon={TrendingUp}
          accent="bg-blue-600"
          delay={0.05}
        />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="col-span-2 md:col-span-1"
        >
          <Card className={`overflow-hidden border-2 ${aggregatedStats.profit >= 0 ? "border-emerald-200 dark:border-emerald-800" : "border-rose-200 dark:border-rose-800"}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${aggregatedStats.profit >= 0 ? "bg-emerald-600" : "bg-rose-600"}`}>
                  {aggregatedStats.profit >= 0 ? <ArrowUpRight className="w-3.5 h-3.5 text-white" /> : <ArrowDownRight className="w-3.5 h-3.5 text-white" />}
                </div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">損益額</p>
              </div>
              <AnimatedValue
                value={`${aggregatedStats.profit >= 0 ? "+" : ""}${formatYen(aggregatedStats.profit)}`}
                className={`text-2xl font-black font-mono block ${aggregatedStats.profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}
              />
              <p className={`text-xs font-bold mt-0.5 ${aggregatedStats.profit >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                {profitRate >= 0 ? "+" : ""}{profitRate.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <StatCard
          label="待機資金"
          value={formatYen(aggregatedStats.cash)}
          icon={Banknote}
          accent="bg-slate-500"
          delay={0.15}
        />
        <StatCard
          label="NISA"
          value={formatYen(aggregatedStats.nisaValue)}
          subValue={`比率: ${aggregatedStats.nisaRatio.toFixed(1)}%`}
          icon={ShieldCheck}
          accent="bg-slate-900"
          className="bg-slate-900 text-white [&_p]:text-slate-400 dark:bg-slate-800"
          delay={0.2}
        />
      </div>

      {/* Upload Area */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
        <Card className="border-2 border-dashed border-emerald-200 hover:border-emerald-400 transition-all dark:border-emerald-800 dark:hover:border-emerald-600">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-xl">
                  <Upload className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold">CSVファイルを取り込み</p>
                  <p className="text-xs text-muted-foreground">SBI証券・楽天証券の保有証券CSVに対応</p>
                </div>
              </div>
              <label className="cursor-pointer">
                <Button asChild variant="default" size="sm">
                  <span>
                    <Upload className="w-4 h-4 mr-1" /> CSV追加
                  </span>
                </Button>
                <input type="file" multiple accept=".csv" className="hidden" onChange={handleCSVUpload} />
              </label>
            </div>
            <AnimatePresence>
              {uploadStatus && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mt-3 p-3 rounded-lg text-sm font-medium ${
                    uploadStatus.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                      : "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800"
                  }`}
                >
                  {uploadStatus.type === "success" ? <CheckCircle2 className="w-4 h-4 inline mr-1.5" /> : null}
                  {uploadStatus.message}
                </motion.div>
              )}
            </AnimatePresence>
            {accountDatasets.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">取り込み済みデータ</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {accountDatasets.map((d) => (
                    <div key={d.fileName} className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-lg text-xs font-mono">
                      <span className="truncate max-w-[200px]">{d.fileName}</span>
                      <button onClick={() => removeDataset(d.fileName)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex bg-muted p-1 rounded-lg overflow-x-auto gap-1">
        {[
          { id: "dashboard", label: "ポートフォリオ分析", icon: PieChartIcon },
          { id: "holdings", label: "銘柄リスト", icon: List },
          { id: "history", label: "推移・履歴", icon: Activity },
        ].map((t) => (
          <Button
            key={t.id}
            variant={activeTab === t.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(t.id)}
            className="whitespace-nowrap"
          >
            <t.icon className="w-4 h-4 mr-1" /> {t.label}
          </Button>
        ))}
      </div>

      {/* Dashboard Tab */}
      <AnimatePresence mode="wait">
        {activeTab === "dashboard" && aggregatedStats.equity > 0 && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Region Mix */}
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-bold text-sm mb-6 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-indigo-500" /> 地域別配分
                    </h4>
                    <div className="h-[320px] w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={regionMix} dataKey="value" nameKey="name" cx="50%" cy="45%"
                            innerRadius={65} outerRadius={95} paddingAngle={4}
                            label={CustomPieLabel} labelLine={false}
                            animationBegin={0} animationDuration={800}>
                            {regionMix.map((entry, index) => (
                              <Cell key={index} fill={REGION_COLORS[entry.name] || REGION_COLORS["その他の地域"]} strokeWidth={0} />
                            ))}
                          </Pie>
                          <Tooltip content={<EnhancedTooltip />} />
                          <Legend verticalAlign="bottom"
                            formatter={(v: string) => {
                              const item = regionMix.find((r) => r.name === v);
                              return <span className="text-xs font-bold">{v} {item ? `(${(item.percent * 100).toFixed(1)}%)` : ""}</span>;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">合計</p>
                        <p className="text-base font-black font-mono">{formatYen(aggregatedStats.equity)}</p>
                        <p className="text-[10px] text-muted-foreground">{consolidatedData.length}銘柄</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Asset Type Mix */}
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-bold text-sm mb-6 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-500" /> 資産種別配分
                    </h4>
                    <div className="h-[320px] w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={assetTypeMix} dataKey="value" nameKey="name" cx="50%" cy="45%"
                            innerRadius={65} outerRadius={95} paddingAngle={4}
                            label={CustomPieLabel} labelLine={false}
                            animationBegin={0} animationDuration={800}>
                            {assetTypeMix.map((entry, index) => (
                              <Cell key={index} fill={ASSET_TYPE_COLORS[entry.name] || ASSET_TYPE_COLORS["その他"]} strokeWidth={0} />
                            ))}
                          </Pie>
                          <Tooltip content={<EnhancedTooltip />} />
                          <Legend verticalAlign="bottom"
                            formatter={(v: string) => {
                              const item = assetTypeMix.find((a) => a.name === v);
                              return <span className="text-xs font-bold">{v} {item ? `(${(item.percent * 100).toFixed(1)}%)` : ""}</span>;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Top 10 — Horizontal bar chart (labels on Y axis, no overlap) */}
            {top10Data.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-bold text-sm mb-6 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Top {top10Data.length} 保有銘柄
                    </h4>
                    <div style={{ height: Math.max(300, top10Data.length * 48) }} className="w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={top10Data}
                          layout="vertical"
                          margin={{ left: 0, right: 100, top: 8, bottom: 8 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                          <XAxis type="number" hide />
                          <YAxis
                            dataKey="shortName"
                            type="category"
                            width={140}
                            tick={{ fontSize: 11, fontWeight: 600, fill: "#334155" }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip content={<EnhancedTooltip />} />
                          <Bar
                            dataKey="marketValue"
                            radius={[0, 6, 6, 0]}
                            barSize={24}
                            animationDuration={800}
                          >
                            {top10Data.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={REGION_COLORS[entry.region] || REGION_COLORS["その他の地域"]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === "dashboard" && aggregatedStats.equity === 0 && (
          <motion.div key="dashboard-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <PieChartIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-sm font-bold">CSVファイルを取り込むとポートフォリオ分析が表示されます</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Holdings Tab */}
        {activeTab === "holdings" && (
          <motion.div key="holdings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Desktop table */}
            <Card className="hidden md:block">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-muted border-b">
                        <th className="px-4 py-3 cursor-pointer hover:bg-accent text-xs font-bold text-muted-foreground" onClick={() => handleSort("name")}>
                          銘柄 / 地域 {sortConfig.key === "name" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                        </th>
                        <th className="px-4 py-3 text-right cursor-pointer hover:bg-accent text-xs font-bold" onClick={() => handleSort("weight")}>
                          比率 {sortConfig.key === "weight" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                        </th>
                        <th className="px-4 py-3 text-right cursor-pointer hover:bg-accent text-xs font-bold text-muted-foreground" onClick={() => handleSort("cost")}>
                          取得額 {sortConfig.key === "cost" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                        </th>
                        <th className="px-4 py-3 text-right cursor-pointer hover:bg-accent text-xs font-bold text-muted-foreground" onClick={() => handleSort("marketValue")}>
                          評価額 {sortConfig.key === "marketValue" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                        </th>
                        <th className="px-4 py-3 text-right cursor-pointer hover:bg-accent text-xs font-bold text-muted-foreground" onClick={() => handleSort("profit")}>
                          損益 {sortConfig.key === "profit" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {sortedData.map((item, idx) => (
                        <motion.tr
                          key={idx}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.02 }}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-medium max-w-[300px] truncate">{item.name}</span>
                              <div className="flex gap-1 flex-wrap">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                  item.region === "全世界" ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" :
                                  item.region === "米国" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                  item.region === "日本" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                                  "bg-muted text-muted-foreground"
                                }`}>{item.region}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-white dark:bg-slate-700">{item.nisaTypeDisplay}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                  item.assetType === "ETF" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                                  item.assetType === "債券" ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" :
                                  item.assetType === "株式" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                                  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                }`}>{item.assetType}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="inline-block px-3 py-1 bg-slate-900 text-white text-sm font-black font-mono rounded-lg dark:bg-slate-700">
                              {item.weight.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">{formatYen(item.cost)}</td>
                          <td className="px-4 py-3 text-right font-mono text-sm font-bold">{formatYen(item.marketValue)}</td>
                          <td className="px-4 py-3 text-right">
                            <div className={`text-sm font-mono font-bold ${item.profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                              {item.profit >= 0 ? "+" : ""}{formatYen(item.profit)}
                            </div>
                            <div className="text-[10px] font-mono text-muted-foreground">({item.profitRate.toFixed(2)}%)</div>
                          </td>
                        </motion.tr>
                      ))}
                      {aggregatedStats.cash > 0 && (
                        <tr className="bg-muted/30">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Banknote className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-bold text-muted-foreground">待機資金</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="inline-block px-3 py-1 bg-muted text-muted-foreground text-sm font-mono rounded-lg">
                              {((aggregatedStats.cash / (aggregatedStats.equity || 1)) * 100).toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-xs text-muted-foreground">-</td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-muted-foreground">{formatYen(aggregatedStats.cash)}</td>
                          <td className="px-4 py-3 text-right text-xs text-muted-foreground">-</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {sortedData.length === 0 && (
                  <div className="p-12 text-center text-muted-foreground">
                    <List className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-sm font-bold">CSVを取り込むと銘柄リストが表示されます</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mobile card view */}
            <div className="md:hidden space-y-3">
              {sortedData.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center text-muted-foreground">
                    <List className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-sm font-bold">CSVを取り込むと銘柄リストが表示されます</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {sortedData.map((item, idx) => (
                    <HoldingCard key={idx} item={item} index={idx} />
                  ))}
                  {aggregatedStats.cash > 0 && (
                    <Card className="bg-muted/30">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Banknote className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-bold text-muted-foreground">待機資金</span>
                        </div>
                        <span className="font-mono font-bold text-muted-foreground">{formatYen(aggregatedStats.cash)}</span>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h4 className="font-bold text-sm mb-6 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" /> 資産推移
                </h4>
                <div className="h-[350px] w-full">
                  {historyChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={historyChartData}>
                        <defs>
                          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorPurchase" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="displayDate" axisLine={false} tickLine={false}
                          tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }} />
                        <YAxis axisLine={false} tickLine={false}
                          tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }}
                          tickFormatter={(v: number) => `¥${(v / 10000).toFixed(0)}万`} />
                        <Tooltip content={<HistoryTooltip />} />
                        <Area type="monotone" dataKey="purchaseAmount" name="投資元本" stroke="#6366f1" strokeWidth={2}
                          strokeDasharray="5 5" fillOpacity={1} fill="url(#colorPurchase)"
                          animationDuration={800} />
                        <Area type="monotone" dataKey="totalAsset" name="総資産" stroke="#059669" strokeWidth={3}
                          fillOpacity={1} fill="url(#colorTotal)"
                          animationDuration={800} />
                        <Line type="monotone" dataKey="nisaValue" name="NISA" stroke="#2563eb" strokeWidth={2}
                          strokeDasharray="5 5" dot={false}
                          animationDuration={800} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                      スナップショットを保存すると推移グラフが表示されます
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* History table — desktop */}
            <Card className="hidden md:block">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-muted border-b">
                      <tr>
                        <th className="px-4 py-3 text-xs font-bold text-muted-foreground">日付</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground">総資産</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground">投資元本</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground">損益</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-muted-foreground">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {[...history].reverse().map((h) => (
                        <tr key={h.id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-4 py-3 font-mono text-muted-foreground">{h.date}</td>
                          <td className="px-4 py-3 text-right font-mono font-bold">{formatYen(h.totalAsset)}</td>
                          <td className="px-4 py-3 text-right font-mono text-muted-foreground">{formatYen(h.purchaseAmount || 0)}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`font-mono font-bold ${h.totalProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                              {h.totalProfit >= 0 ? "+" : ""}{formatYen(h.totalProfit)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => deleteSnapshot(h.date)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {history.length === 0 && (
                  <div className="p-12 text-center text-muted-foreground">
                    <Coins className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-sm font-bold">まだスナップショットがありません</p>
                    <p className="text-xs mt-1">CSVを取り込んだ後「保存」ボタンで記録できます</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* History — mobile card view */}
            <div className="md:hidden space-y-3">
              {history.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center text-muted-foreground">
                    <Coins className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-sm font-bold">まだスナップショットがありません</p>
                    <p className="text-xs mt-1">CSVを取り込んだ後「保存」ボタンで記録できます</p>
                  </CardContent>
                </Card>
              ) : (
                [...history].reverse().map((h) => (
                  <motion.div key={h.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-sm text-muted-foreground">{h.date}</span>
                          <button onClick={() => deleteSnapshot(h.date)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground text-[10px] mb-0.5">総資産</p>
                            <p className="font-mono font-bold">{formatYen(h.totalAsset)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-[10px] mb-0.5">投資元本</p>
                            <p className="font-mono">{formatYen(h.purchaseAmount || 0)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-muted-foreground text-[10px] mb-0.5">損益</p>
                            <p className={`font-mono font-bold ${h.totalProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                              {h.totalProfit >= 0 ? "+" : ""}{formatYen(h.totalProfit)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
