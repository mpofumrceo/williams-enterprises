"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wrench,
  FolderKanban,
  Images,
  Newspaper,
  User,
  Star,
  Users,
  DollarSign,
  Receipt,
  FileText,
  Mail,
  Phone,
  Share2,
  Image,
  Info,
  Bot,
  Shield,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ShoppingCart,
  HelpCircle,
  Clapperboard,
} from "lucide-react";
import { cn } from "@/src/lib/utils/cn";
import { useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/pos", label: "Point of Sale", icon: ShoppingCart },
  { href: "/admin/services", label: "Services", icon: Wrench },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/news", label: "News", icon: Newspaper },
  { href: "/admin/founder", label: "Founder", icon: User },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/faq", label: "FAQ", icon: HelpCircle },
  { href: "/admin/about", label: "About & Stats", icon: Info },
  { href: "/admin/heroes", label: "Hero Backgrounds", icon: Image },
  { href: "/admin/showcase", label: "Home Showcase", icon: Clapperboard },
  { href: "/admin/contact", label: "Contact", icon: Phone },
  { href: "/admin/social", label: "Social Links", icon: Share2 },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { href: "/admin/employees", label: "Employees", icon: Users },
  { href: "/admin/payroll", label: "Payroll", icon: DollarSign },
  { href: "/admin/expenses", label: "Expenses", icon: Receipt },
  { href: "/admin/quotations", label: "Quotations", icon: FileText },
  { href: "/admin/miwilly", label: "Stebo Ai Knowledge", icon: Bot },
  { href: "/admin/users", label: "Users", icon: Shield },
  { href: "/admin/activity", label: "Activity Logs", icon: Activity },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/portal/auth");
    router.refresh();
  }

  const sidebar = (
    <aside
      className={cn(
        "flex h-full flex-col bg-navy text-white transition-all",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        {!collapsed && (
          <div>
            <p className="text-sm font-bold">Williams Enterprises</p>
            <p className="text-xs text-amber-400">Management Portal</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden rounded-lg p-1 hover:bg-white/10 lg:block"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft className={cn("h-5 w-5 transition", collapsed && "rotate-180")} />
        </button>
        <button
          onClick={() => setMobileOpen(false)}
          className="rounded-lg p-1 hover:bg-white/10 lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "mb-0.5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                active ? "bg-amber-600 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
              )}
              title={label}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-2">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 transition hover:bg-red-600/20 hover:text-red-300"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-navy p-3 text-white shadow-lg lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="hidden lg:block">{sidebar}</div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64">{sidebar}</div>
        </div>
      )}
    </>
  );
}
