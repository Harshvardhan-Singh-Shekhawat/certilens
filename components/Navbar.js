"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/domains", label: "Domains" },
    { href: "/scans", label: "Scans" },
    { href: "/alerts", label: "Alerts" },
  ];

  return (
    <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold">
        Certi<span className="text-blue-500">Lens</span>
      </Link>

      {session && (
        <div className="flex gap-6 text-sm text-gray-400">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hover:text-white transition ${
                pathname === link.href ? "text-white font-semibold" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4">
        {session ? (
          <>
            <span className="text-sm text-gray-400">{session.user.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition"
            >
              Sign Out
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
  );
}