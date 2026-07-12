"use client";

import React from "react";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Phone,
  Target,
  Megaphone,
  Database,
  Globe,
  Share2,
  ShieldCheck,
  Key,
  Building,
  LucideIcon,
} from "lucide-react";

interface MenuItem {
  name: string;
  icon: LucideIcon;
  id: string;
}

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const mainItems: MenuItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
  { name: "Generate Leads", icon: Target, id: "generate" },
  { name: "Manage Leads", icon: Users, id: "manage" },
  { name: "Engage Leads", icon: Megaphone, id: "engage" },
];

const controlItems: MenuItem[] = [
  { name: "Team Members", icon: Users, id: "team" },
  { name: "Lead Sources", icon: Globe, id: "sources" },
  { name: "Ad Accounts", icon: Share2, id: "ads" },
  { name: "WhatsApp Account", icon: MessageSquare, id: "whatsapp" },
  { name: "Tele Calling", icon: Phone, id: "tele" },
  { name: "CRM Fields", icon: Database, id: "crm" },
  { name: "API Center", icon: Key, id: "api" },
];

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <div className="w-64 bg-slate-900 h-screen text-slate-400 p-4 flex flex-col fixed left-0 top-0 z-50 overflow-y-auto border-r border-slate-800 scrollbar-hide">
      <div className="text-white font-bold text-2xl mb-8 flex items-center gap-3 px-2 mt-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
          <ShieldCheck size={20} className="text-white" />
        </div>
        GrowEasy
      </div>

      <SectionLabel label="Main" />
      <nav className="space-y-1">
        {mainItems.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            active={activeView === item.id}
            onClick={() => onViewChange(item.id)}
          />
        ))}
      </nav>

      <SectionLabel label="Control Center" className="mt-8" />
      <nav className="space-y-1 flex-1">
        {controlItems.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            active={activeView === item.id}
            onClick={() => onViewChange(item.id)}
          />
        ))}
      </nav>

      <div className="mt-auto pt-8 border-t border-slate-800/50">
        <SidebarItem
          item={{ name: "Business Center", icon: Building, id: "business" }}
          active={activeView === "business"}
          onClick={() => onViewChange("business")}
        />
      </div>
    </div>
  );
}

function SectionLabel({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`text-[10px] font-bold text-slate-500 mb-3 px-2 uppercase tracking-[0.2em] ${className}`}
    >
      {label}
    </div>
  );
}

function SidebarItem({
  item,
  active,
  onClick,
}: {
  item: MenuItem;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <div
      onClick={onClick}
      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group ${
        active
          ? "bg-blue-600/10 text-white font-semibold"
          : "hover:bg-slate-800/50 hover:text-slate-200"
      }`}
    >
      {/* Active Indicator Bar */}
      {active && (
        <div className="absolute left-0 w-1 h-5 bg-blue-500 rounded-r-full" />
      )}

      <Icon
        size={18}
        className={`${active ? "text-blue-500" : "text-slate-500 group-hover:text-slate-300"}`}
      />
      <span className="text-sm tracking-tight">{item.name}</span>
    </div>
  );
}
