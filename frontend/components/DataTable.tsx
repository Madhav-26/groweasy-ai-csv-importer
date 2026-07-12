"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataTableProps {
  // FIX: Added 'number' to the type here
  data: Record<string, string | number>[];
  title: string;
}

export default function DataTable({ data, title }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  if (!data || data.length === 0) return null;

  const headers = Object.keys(data[0]);
  const totalPages = Math.ceil(data.length / pageSize);
  const currentData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col w-full overflow-hidden">
      <div className="p-4 border-b border-slate-100 font-semibold text-slate-700 bg-white flex justify-between items-center">
        <span>{title}</span>
        <span className="text-sm font-normal text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          Total: {data.length} rows
        </span>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[500px] w-full">
        <table className="w-full text-left border-collapse min-w-max">
          <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
            <tr>
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider border-b bg-slate-50"
                >
                  {h.replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentData.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50 transition">
                {headers.map((h) => (
                  <td
                    key={h}
                    className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap"
                  >
                    {row[h]?.toString() || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white">
          <span className="text-sm text-slate-500 italic">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 border rounded hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 border rounded hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
