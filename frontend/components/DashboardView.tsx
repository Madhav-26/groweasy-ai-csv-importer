"use client";

import React from "react";
// FIX: Removed 'Database' from imports as it was unused
import { LayoutDashboard, Users, MessageSquare, Phone } from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
  { name: "Manage Leads", icon: Users, id: "manage" },
  { name: "WhatsApp Account", icon: MessageSquare, id: "whatsapp" },
  { name: "Tele Calling", icon: Phone, id: "tele" },
];

export default function DashboardView() {
  return <div className="p-6">{/* UI code here */}</div>;
}
