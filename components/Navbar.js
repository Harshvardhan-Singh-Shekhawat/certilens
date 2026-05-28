"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Globe,
  ScanLine,
  Bell,
  History,
  AlertTriangle,
  Shield,
  Menu,
  X,
  LogOut,
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/domains", label: "Domains", icon: Globe },
  { href: "/scans", label: "Scans", icon: ScanLine },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/history", label: "History", icon: History },
  { href: "/anomalies", label: "Anomalies", icon: AlertTriangle },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const firstName = session?.user?.name?.split(" ")[0] || "";

  return (
    <>
      <nav className="border-b border-gray-800/60 px-6 py-4 flex items-center justify-between bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="text-xl font-bold flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-500" />
          Certi<span className="text-blue-500">Lens</span>
        </Link>

        {/* Desktop nav */}
        {session && (
          <div className="hidden lg:flex gap-1 text-sm">
            {links.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition ${
                    active
                      ? "bg-blue-500/10 text-blue-400 font-semibold"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs text-gray-500">{getGreeting()}</span>
                <span className="text-sm font-medium text-white">{firstName}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="hidden sm:flex items-center gap-1.5 text-sm bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition text-gray-300"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-gray-400 hover:text-white"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </>
          ) : (
            <Link
              href="/signin"
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      {session && mobileOpen && (
        <div className="lg:hidden bg-gray-900 border-b border-gray-800 px-4 py-3 space-y-1 sticky top-[65px] z-40">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  active
                    ? "bg-blue-500/10 text-blue-400 font-semibold"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-gray-800 mt-2">
            <div className="px-4 py-2 text-xs text-gray-500">
              {getGreeting()}, {firstName}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 w-full transition"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </>
  );
}