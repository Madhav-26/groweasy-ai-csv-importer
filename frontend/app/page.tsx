"use client";

import React, { useState, ChangeEvent, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import DataTable from "../components/DataTable";
import * as Papa from "papaparse";
import {
  Upload,
  Loader2,
  Settings,
  Globe,
  Users,
  BarChart3,
  FileJson,
  FileSpreadsheet,
  Eye,
  X,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";

// --- API URL defined outside to keep dependency arrays constant ---
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

// --- Strict TypeScript Interfaces ---

type TableDataRow = Record<string, string | number>;

interface LeadRecord {
  id: string;
  importId: string;
  created_at?: string | null;
  createdAt?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  mobile_without_country_code?: string | null;
  countryCode?: string | null;
  company?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  leadOwner?: string | null;
  crmStatus?: string | null;
  crm_status?: string | null;
  crmNote?: string | null;
  dataSource?: string | null;
  possessionTime?: string | null;
  description?: string | null;
  [key: string]: string | number | null | undefined;
}

interface LeadStats {
  total: number;
  quality: string;
  sources: number;
}

interface HistoryItem {
  id: string;
  fileName: string;
  totalRows: number;
  imported: number;
  skipped: number;
  createdAt: string;
  leads?: LeadRecord[];
}

interface KPIChipProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: "blue" | "green" | "purple" | "orange";
}

const sanitizeForTable = (records: LeadRecord[]): TableDataRow[] => {
  return records.map((record) => ({
    "Created Date": String(record.created_at || record.createdAt || ""),
    Name: String(record.name || ""),
    Email: String(record.email || ""),
    Mobile: String(record.mobile_without_country_code || record.phone || ""),
    Company: String(record.company || ""),
    City: String(record.city || ""),
    State: String(record.state || ""),
    Country: String(record.country || ""),
    "Lead Owner": String(record.leadOwner || ""),
    "CRM Status": String(record.crmStatus || record.crm_status || ""),
    "Data Source": String(record.dataSource || ""),
    "CRM Note": String(record.crmNote || ""),
    "Possession Time": String(record.possessionTime || ""),
    Description: String(record.description || ""),
  }));
};

export default function Home() {
  const [activeView, setActiveView] = useState<string>("dashboard");
  const [step, setStep] = useState<number>(1);
  const [selectedFileName, setSelectedFileName] = useState<string>("");

  const [previewData, setPreviewData] = useState<TableDataRow[]>([]);
  const [masterLeads, setMasterLeads] = useState<LeadRecord[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [dbStats, setDbStats] = useState<LeadStats>({
    total: 0,
    quality: "0",
    sources: 0,
  });

  const [viewingImportId, setViewingImportId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const loadDashboardData = useCallback(async () => {
    try {
      const ts = Date.now();
      const [rStats, rLeads] = await Promise.all([
        fetch(`${API_URL}/api/dashboard-stats?t=${ts}`, {
          cache: "no-store",
        }),
        fetch(`${API_URL}/api/leads?t=${ts}`, { cache: "no-store" }),
      ]);
      if (rStats.ok) {
        const s = await rStats.json();
        setDbStats({
          total: s.totalLeads ?? 0,
          quality: s.qualityScore ?? "0",
          sources: s.uniqueSources ?? 0,
        });
        setHistory(s.history || []);
      }
      if (rLeads.ok) setMasterLeads(await rLeads.json());
    } catch (err: unknown) {
      if (err instanceof Error) console.error("Sync error:", err.message);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const ts = Date.now();

    fetch(`${API_URL}/api/dashboard-stats?t=${ts}`, {
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data) {
          setDbStats({
            total: data.totalLeads ?? 0,
            quality: data.qualityScore ?? "0",
            sources: data.uniqueSources ?? 0,
          });
          setHistory(data.history || []);
        }
      });

    fetch(`${API_URL}/api/leads?t=${ts}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data) {
          setMasterLeads(data);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const displayLeads = viewingImportId
    ? masterLeads.filter((l) => l.importId === viewingImportId)
    : masterLeads;

  const filteredLeads = displayLeads.filter((l) => {
    const matchesSearch =
      String(l.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      String(l.email || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const leadStatus = String(l.crm_status || l.crmStatus || "");
    const matchesStatus = statusFilter === "all" || leadStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const triggerDownload = (content: string, fileName: string, type: string) => {
    const blob = new Blob([content], { type });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const convertToCSV = (data: LeadRecord[]) => {
    if (data.length === 0) return "";
    const headers = [
      "created_at",
      "name",
      "email",
      "phone",
      "company",
      "city",
      "state",
      "country",
      "crmStatus",
      "dataSource",
      "crmNote",
      "description",
    ];
    return [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((h) => {
            let val = row[h];
            if (h === "created_at") val = row.createdAt || row.created_at;
            return `"${String(val || "").replace(/"/g, '""')}"`;
          })
          .join(","),
      ),
    ].join("\n");
  };

  const handleRowExport = (item: HistoryItem, format: "csv" | "json") => {
    const specificLeads = masterLeads.filter((l) => l.importId === item.id);
    if (format === "json")
      triggerDownload(
        JSON.stringify(specificLeads, null, 2),
        `${item.fileName}.json`,
        "application/json",
      );
    else
      triggerDownload(
        convertToCSV(specificLeads),
        `${item.fileName}.csv`,
        "text/csv",
      );
  };

  const handleGlobalExport = (format: "csv" | "json") => {
    if (format === "json")
      triggerDownload(
        JSON.stringify(filteredLeads, null, 2),
        `Master_CRM.json`,
        "application/json",
      );
    else
      triggerDownload(
        convertToCSV(filteredLeads),
        `Master_CRM.csv`,
        "text/csv",
      );
  };

  const onFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setSelectedFileName(f.name);
      Papa.parse(f, {
        header: true,
        complete: (r: Papa.ParseResult<TableDataRow>) => {
          setPreviewData(r.data);
          setStep(2);
          setActiveView("generate");
        },
      });
    }
  };

  const processWithAI = async () => {
    if (!previewData.length) return;
    setStep(3);
    try {
      const res = await fetch(`${API_URL}/api/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawData: previewData,
          fileName: selectedFileName,
        }),
      });
      if (res.ok) {
        await loadDashboardData();
        setStep(1);
        setActiveView("manage");
      }
    } catch (err: unknown) {
      if (err instanceof Error)
        console.error("AI Mapping failed:", err.message);
      setStep(2);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fcfdfe]">
      <Sidebar
        activeView={activeView}
        onViewChange={(v) => {
          setActiveView(v);
          setViewingImportId(null);
          setSearchQuery("");
        }}
      />

      <div className="flex-1 min-w-0 ml-0 lg:ml-64 p-4 sm:p-6 lg:p-10 font-sans text-slate-900">
        {activeView === "dashboard" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Dashboard
                </h1>
                <p className="text-slate-500 text-sm">
                  Monitor lead conversion health.
                </p>
              </div>
              <button
                onClick={() => setActiveView("generate")}
                className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 shadow-sm hover:bg-blue-700 transition-all"
              >
                <Plus size={18} /> Import Leads
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <KPIChip
                label="Total Leads"
                value={dbStats.total}
                icon={<Users size={20} />}
                color="blue"
              />
              <KPIChip
                label="AI Quality"
                value={`${dbStats.quality}%`}
                icon={<CheckCircle size={20} />}
                color="green"
              />
              <KPIChip
                label="Sources"
                value={dbStats.sources}
                icon={<Globe size={20} />}
                color="purple"
              />
              <KPIChip
                label="Processed"
                value={history.reduce((acc, curr) => acc + curr.imported, 0)}
                icon={<BarChart3 size={20} />}
                color="orange"
              />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={18} className="text-blue-600" />
                <h3 className="font-semibold text-slate-800 tracking-tight">
                  System Performance
                </h3>
              </div>
              <div className="h-32 flex items-center justify-center border border-dashed rounded-xl text-slate-400 text-xs italic">
                AI Precision Analytics - Ready to populate on next import.
              </div>
            </div>
          </div>
        )}

        {activeView === "manage" && (
          <div className="space-y-8 animate-in fade-in duration-500 w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Manage Leads</h2>
                <p className="text-slate-500 text-sm">
                  {viewingImportId ? "Filtered view" : "Master lead database."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                {viewingImportId && (
                  <button
                    onClick={() => {
                      setViewingImportId(null);
                      setSearchQuery("");
                    }}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-rose-600 font-medium hover:bg-rose-50 rounded-lg border border-rose-100 transition-all"
                  >
                    <X size={16} /> Clear
                  </button>
                )}
                <button
                  onClick={() => handleGlobalExport("json")}
                  className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50"
                >
                  JSON
                </button>
                <button
                  onClick={() => handleGlobalExport("csv")}
                  className="flex-1 md:flex-none bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800"
                >
                  CSV
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 font-bold uppercase tracking-widest text-slate-500 text-[10px]">
                Upload History
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="text-slate-400 text-[10px] uppercase border-b border-slate-100 font-bold">
                    <tr>
                      <th className="px-6 py-4">Filename</th>
                      <th className="px-6 py-4 text-center text-[11px]">
                        Date
                      </th>
                      <th className="px-6 py-4 text-center">Imported</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.length > 0 ? (
                      history.map((h) => (
                        <tr
                          key={h.id}
                          className={`text-sm hover:bg-slate-50/10 ${viewingImportId === h.id ? "bg-blue-50/30" : ""}`}
                        >
                          <td className="px-6 py-4 font-semibold truncate max-w-[250px]">
                            {h.fileName}
                          </td>
                          <td className="px-6 py-4 text-center text-slate-500 text-xs">
                            <div className="flex flex-col items-center">
                              <span className="flex items-center gap-1 font-medium">
                                <Calendar size={12} />{" "}
                                {new Date(h.createdAt).toLocaleDateString()}
                              </span>
                              <span className="opacity-50">
                                <Clock size={10} />{" "}
                                {new Date(h.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center text-emerald-600 font-bold">
                            {h.imported}
                          </td>
                          <td className="px-6 py-4 text-right flex justify-end gap-2">
                            <button
                              onClick={() => setViewingImportId(h.id)}
                              className="p-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleRowExport(h, "csv")}
                              className="p-2 text-emerald-700 border border-emerald-100 rounded-lg hover:bg-emerald-50"
                            >
                              <FileSpreadsheet size={16} />
                            </button>
                            <button
                              onClick={() => handleRowExport(h, "json")}
                              className="p-2 text-blue-700 border border-blue-100 rounded-lg hover:bg-blue-50"
                            >
                              <FileJson size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-8 text-center text-slate-400"
                        >
                          No records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4 w-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  {viewingImportId ? "Filtered Leads" : "Global CRM Database"}
                </h3>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full pl-9 pr-4 py-2 border rounded-lg text-xs focus:outline-none focus:border-blue-400"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2 px-3 border rounded-lg bg-white w-full sm:w-auto">
                    <Filter size={14} className="text-slate-400" />
                    <select
                      className="bg-transparent text-xs text-slate-600 focus:outline-none py-2 w-full"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="GOOD_LEAD_FOLLOW_UP">Good Lead</option>
                      <option value="SALE_DONE">Sale Done</option>
                      <option value="DID_NOT_CONNECT">No Connect</option>
                      <option value="BAD_LEAD">Bad Lead</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm w-full overflow-hidden">
                <DataTable
                  data={sanitizeForTable(filteredLeads)}
                  title="Lead Records"
                />
              </div>
            </div>
          </div>
        )}

        {activeView === "generate" && (
          <div className="max-w-4xl mx-auto py-8 animate-in fade-in">
            <header className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[11px] font-semibold uppercase tracking-wider mb-4">
                <Sparkles size={12} /> Lead Generator
              </div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Import Leads
              </h1>
            </header>
            {step === 1 && (
              <div className="p-12 border-2 border-dashed border-slate-200 rounded-xl bg-white text-center relative cursor-pointer hover:border-blue-400 transition-all">
                <Upload size={40} className="mx-auto text-blue-600 mb-4" />
                <p className="font-semibold text-slate-800">
                  Drop Lead CSV to Map
                </p>
                <input
                  type="file"
                  accept=".csv"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={onFileSelect}
                />
              </div>
            )}
            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                      <BarChart3 size={24} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {previewData.length} records ready.
                      </p>
                      <p className="text-slate-500 text-xs">
                        {selectedFileName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={processWithAI}
                    className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                  >
                    Start AI Mapping
                  </button>
                </div>
                <DataTable data={previewData} title="Buffer Preview" />
              </div>
            )}
            {step === 3 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Loader2
                  className="animate-spin text-blue-600 mb-4"
                  size={48}
                />
                <p className="font-semibold text-slate-800">
                  Engines Mapping Leads...
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function KPIChip({ label, value, icon, color }: KPIChipProps) {
  const themes = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
  };
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col items-start shadow-sm transition-all hover:shadow-md">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 border ${themes[color]}`}
      >
        {icon}
      </div>
      <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-xl sm:text-2xl font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function FeatureDetail({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center text-center transition-all group">
      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-blue-500">
        {icon}
      </div>
      <h4 className="font-semibold text-slate-800 text-xs">{title}</h4>
      <p className="text-slate-400 text-[10px] mt-1 font-normal">{desc}</p>
    </div>
  );
}
