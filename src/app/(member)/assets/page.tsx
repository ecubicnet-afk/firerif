"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, BarChart, Bar, LabelList
} from "recharts";
import {
  Upload, Save, Activity, CheckCircle2,
  Trash2, Sparkles, Loader2, List,
  ShieldCheck, TrendingUp, Globe,
  Banknote, Coins, Table, Layers,
  RefreshCw, PieChart as PieChartIcon
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatYen } from "@/lib/utils";

// --- Constants ---
const ASSET_TYPE_COLORS: Record<string, string> = {
  "投資信託": "#10b981",
  "株式": "#3b82f6",
  "ETF": "#f59e0b",
  "REIT": "#ec4899",
  "債券": "#8b5cf6",
  "現金": "#94a3b8",
  "その他": "#cbd5e1",
};

const REGION_COLORS: Record<string, string> = {
  "日本": "#3b82f6",
  "米国": "#ef4444",
  "全世界": "#8b5cf6",
  "現金": "#64748b",
  "その他の地域": "#cbd5e1",
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

// --- Chart Components ---
const RADIAN = Math.PI / 180;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomPieLabel = (props: any) => {
  const { cx, cy, midAngle, outerRadius, percent } = props;
  if (!percent || percent < 0.01) return null;
  const radius = (outerRadius || 100) + 32;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#0f172a" textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      style={{ fontSize: "18px", fontWeight: "900", filter: "drop-shadow(0px 2px 2px rgba(255,255,255,0.8))" }}>
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltipContent = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800">
        <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest leading-relaxed">
          {String(label || data.name || "詳細")}
        </p>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-bold" style={{ color: payload[0].color || payload[0].fill }}>評価額:</span>
          <span className="text-xs font-mono font-black">¥{Number(payload[0].value).toLocaleString()}</span>
        </div>
      </div>
    );
  }
  return null;
};

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
        displayValue: `¥${Math.floor(item.marketValue).toLocaleString()}`,
        fill: REGION_COLORS[item.region] || REGION_COLORS["その他の地域"],
      }));
  }, [consolidatedData]);

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
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l !== "");
    let items: HoldingItem[] = [];
    let totalValueFromHeader = 0;
    const isSBI = text.includes("保有証券一覧");

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
            norm.startsWith("投資信託(") || norm.startsWith("株式(")) &&
          cells.filter((c) => c !== "").length <= 2;
        if (isSection) {
          if (norm.includes("成長投資枠")) currentNisaType = "NISA成長";
          else if (norm.includes("つみたて投資枠")) currentNisaType = "NISAつみたて";
          else if (norm.includes("NISA預り")) currentNisaType = "NISA";
          isReadingData = false;
          continue;
        }
        const headerFound = cells.some((c) => {
          const h = toHalfWidth(c).trim();
          return h === "ファンド名" || h === "銘柄名称" || h === "銘柄名";
        });
        if (headerFound) {
          headers = cells.map((c) => toHalfWidth(c).trim());
          isReadingData = true;
          continue;
        }
        if (isReadingData && cells.length >= 3 && cells[0] !== "" && !cells[0].includes("合計")) {
          const obj: Record<string, string> = {};
          headers.forEach((h, idx) => {
            if (h) obj[h] = cells[idx];
          });
          const name = obj["ファンド名"] || obj["銘柄名称"] || obj["銘柄名"] || obj["銘柄"];
          const marketValue = parseNumber(obj["評価額"] || obj["時価評価額"]);
          const purchaseAmount = parseNumber(obj["取得金額"] || obj["取得価額"]);
          if (name && marketValue > 0) {
            items.push({
              source: fileName,
              name,
              marketValue,
              profit: parseNumber(obj["評価損益"]) || marketValue - purchaseAmount,
              nisaType: currentNisaType,
              assetType: "",
              region: "",
            });
          }
        }
      }
    } else {
      // 楽天証券等
      for (const line of lines) {
        const c = splitCSVLine(line);
        if (c[0] === "資産合計") totalValueFromHeader = parseNumber(c[1]);
      }
      const hIdx = lines.findIndex(
        (l) =>
          (l.includes("銘柄") || l.includes("ファンド")) &&
          (l.includes("評価額") || l.includes("時価評価額"))
      );
      if (hIdx !== -1) {
        const h = splitCSVLine(lines[hIdx]);
        items = lines
          .slice(hIdx + 1)
          .filter((l) => l.includes(","))
          .map((line) => {
            const c = splitCSVLine(line);
            const o: Record<string, string> = {};
            h.forEach((head, i) => (o[head] = c[i]));
            const n = o["銘柄"] || o["銘柄名"] || o["ファンド"];
            if (!n) return null;
            let nt = "特定/一般";
            const ai = o["口座"] || o["預り区分"] || o["口座区分"] || "";
            if (ai.includes("つみたて")) nt = "NISAつみたて";
            else if (ai.includes("成長") || ai.includes("NISA")) nt = "NISA成長";
            return {
              source: fileName,
              name: n,
              marketValue: parseNumber(o["評価額"] || o["時価評価額"]),
              profit: parseNumber(o["評価損益"]),
              nisaType: nt,
              assetType: "",
              region: "",
            };
          })
          .filter((i): i is HoldingItem => i !== null && i.marketValue > 0);
      }
    }

    // 分類ロジック
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

    if (items.length === 0) return null;

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
      files.forEach((f) => {
        const reader = new FileReader();
        reader.onload = async (ev) => {
          const text = ev.target?.result as string;
          const res = parseFileContent(text, f.name);
          if (res) {
            setAccountDatasets((prev) => [...prev.filter((p) => p.fileName !== f.name), res]);
            // Save to DB
            await fetch("/api/assets/holdings", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ source: f.name, items: res.items, cash: res.cash }),
            });
          }
        };
        reader.readAsText(f, "Shift-JIS");
      });
      e.target.value = "";
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
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-emerald-600 p-2 rounded-xl">
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
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 font-mono text-center md:text-left">
        <Card className="bg-emerald-50 border-emerald-100">
          <CardContent className="p-4">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">投資元本</p>
            <p className="text-lg font-black">{formatYen(aggregatedStats.purchaseAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter mb-1">時価評価額</p>
            <p className="text-lg font-black">{formatYen(aggregatedStats.equity)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter mb-1">損益額</p>
            <p className={`text-lg font-black ${aggregatedStats.profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {aggregatedStats.profit >= 0 ? "+" : ""}{formatYen(aggregatedStats.profit)}
            </p>
            <p className={`text-[11px] font-bold ${aggregatedStats.profit >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
              ({((aggregatedStats.profit / (aggregatedStats.purchaseAmount || 1)) * 100).toFixed(2)}%)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter mb-1">待機資金</p>
            <p className="text-lg font-black text-muted-foreground">{formatYen(aggregatedStats.cash)}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 text-white">
          <CardContent className="p-4">
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter mb-1">NISA</p>
            <p className="text-lg font-black">{formatYen(aggregatedStats.nisaValue)}</p>
            <p className="text-[11px] text-emerald-400 font-bold">
              比率: {aggregatedStats.nisaRatio.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upload Area */}
      <Card className="border-2 border-dashed border-emerald-100 hover:border-emerald-300 transition-all">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-50 p-3 rounded-xl">
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
      {activeTab === "dashboard" && aggregatedStats.equity > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h4 className="font-bold text-sm mb-6 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-500" /> 地域別配分
                </h4>
                <div className="h-[350px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={regionMix} dataKey="value" nameKey="name" cx="50%" cy="50%"
                        innerRadius={70} outerRadius={100} paddingAngle={5}
                        label={CustomPieLabel} labelLine={false}>
                        {regionMix.map((entry, index) => (
                          <Cell key={index} fill={REGION_COLORS[entry.name] || REGION_COLORS["その他の地域"]} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltipContent />} />
                      <Legend verticalAlign="bottom" formatter={(v: string) => <span className="text-xs font-bold">{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">合計</p>
                    <p className="text-lg font-black font-mono">{formatYen(aggregatedStats.equity)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h4 className="font-bold text-sm mb-6 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-500" /> 資産種別配分
                </h4>
                <div className="h-[350px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={assetTypeMix} dataKey="value" nameKey="name" cx="50%" cy="50%"
                        innerRadius={70} outerRadius={100} paddingAngle={5}
                        label={CustomPieLabel} labelLine={false}>
                        {assetTypeMix.map((entry, index) => (
                          <Cell key={index} fill={ASSET_TYPE_COLORS[entry.name] || ASSET_TYPE_COLORS["その他"]} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltipContent />} />
                      <Legend verticalAlign="bottom" formatter={(v: string) => <span className="text-xs font-bold">{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top 10 */}
          {top10Data.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h4 className="font-bold text-sm mb-6 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Top 10 保有銘柄
                </h4>
                <div className="h-[500px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={top10Data} layout="vertical" margin={{ left: 10, right: 150, top: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={1} hide />
                      <Bar dataKey="marketValue" radius={[0, 8, 8, 0]} barSize={28}>
                        <LabelList dataKey="name" position="top" offset={10}
                          style={{ fontSize: "12px", fontWeight: "700", fill: "#1e293b" }} />
                        <LabelList dataKey="displayValue" position="right" offset={10}
                          style={{ fontSize: "13px", fontWeight: "900", fill: "#334155", fontFamily: "monospace" }} />
                        {top10Data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={REGION_COLORS[entry.region] || REGION_COLORS["その他の地域"]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "dashboard" && aggregatedStats.equity === 0 && (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <PieChartIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-sm font-bold">CSVファイルを取り込むとポートフォリオ分析が表示されます</p>
          </CardContent>
        </Card>
      )}

      {/* Holdings Tab */}
      {activeTab === "holdings" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-muted border-b">
                    <th className="px-4 py-3 cursor-pointer hover:bg-accent text-xs font-bold text-muted-foreground" onClick={() => handleSort("name")}>銘柄 / 地域</th>
                    <th className="px-4 py-3 text-right cursor-pointer hover:bg-accent text-xs font-bold" onClick={() => handleSort("weight")}>比率</th>
                    <th className="px-4 py-3 text-right cursor-pointer hover:bg-accent text-xs font-bold text-muted-foreground" onClick={() => handleSort("cost")}>取得額</th>
                    <th className="px-4 py-3 text-right cursor-pointer hover:bg-accent text-xs font-bold text-muted-foreground" onClick={() => handleSort("marketValue")}>評価額</th>
                    <th className="px-4 py-3 text-right cursor-pointer hover:bg-accent text-xs font-bold text-muted-foreground" onClick={() => handleSort("profit")}>損益</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sortedData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium max-w-[300px] truncate">{item.name}</span>
                          <div className="flex gap-1 flex-wrap">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                              item.region === "全世界" ? "bg-purple-50 text-purple-600 border-purple-100" :
                              item.region === "米国" ? "bg-rose-50 text-rose-600 border-rose-100" :
                              item.region === "日本" ? "bg-blue-50 text-blue-600 border-blue-100" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {item.region}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-white">{item.nisaTypeDisplay}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                              item.assetType === "ETF" ? "bg-amber-50 text-amber-600 border-amber-100" :
                              item.assetType === "債券" ? "bg-violet-50 text-violet-600 border-violet-100" :
                              item.assetType === "株式" ? "bg-blue-50 text-blue-600 border-blue-100" :
                              "bg-indigo-50 text-indigo-600 border-indigo-100"
                            }`}>
                              {item.assetType}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-block px-3 py-1 bg-slate-900 text-white text-sm font-black font-mono rounded-lg">
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
                    </tr>
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
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h4 className="font-bold text-sm mb-6 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" /> 資産推移
              </h4>
              <div className="h-[350px] w-full">
                {history.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false}
                        tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }} />
                      <YAxis axisLine={false} tickLine={false}
                        tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }}
                        tickFormatter={(v: number) => `¥${(v / 10000).toFixed(0)}万`} />
                      <Tooltip />
                      <Area type="monotone" dataKey="totalAsset" name="総資産" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                      <Line type="monotone" dataKey="nisaValue" name="NISA" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
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

          <Card>
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
        </div>
      )}
    </div>
  );
}
