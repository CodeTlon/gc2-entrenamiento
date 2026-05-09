'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  ListChecks,
  FileText,
  Tag,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
} from 'lucide-react'
import { signOutAction } from '@/actions/auth'

const NAV = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/entrenadores', label: 'Entrenadores', icon: Users },
  { href: '/dashboard/planes', label: 'Planes', icon: ListChecks },
  { href: '/dashboard/blog', label: 'Blog', icon: FileText },
  { href: '/dashboard/categorias', label: 'Categorías', icon: Tag },
  { href: '/dashboard/contacto', label: 'Contacto', icon: Settings },
]

export default function DashboardShell({
  children,
  email,
}: {
  children: React.ReactNode
  email: string
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  return (
    <div className="min-h-screen flex" style={{ background: '#0A1628' }}>

      {/* Sidebar desktop */}
      <aside
        className="hidden md:flex w-[240px] flex-shrink-0 flex-col sticky top-0 h-screen"
        style={{ background: '#0D2247', borderRight: '1px solid #102E66' }}
      >
        <SidebarContent isActive={isActive} email={email} />
      </aside>

      {/* Drawer mobile — backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ background: 'rgba(10,22,40,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer mobile — panel */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: '#0D2247', borderRight: '1px solid #102E66' }}
      >
        <SidebarContent
          isActive={isActive}
          email={email}
          onNavigate={() => setOpen(false)}
          showClose
        />
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header
          className="sticky top-0 z-30 h-14 px-4 flex items-center gap-3"
          style={{ borderBottom: '1px solid #102E66', background: '#0D2247' }}
        >
          {/* Mobile: hamburger + logo */}
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-md text-white/60 hover:text-white transition-colors flex-shrink-0"
            style={{ border: '1px solid #102E66' }}
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu size={18} />
          </button>

          <Link href="/dashboard" className="md:hidden flex-shrink-0">
            <Image
              src="/images/logo.png"
              alt="GC2"
              width={80}
              height={26}
              className="h-6 w-auto"
              sizes="80px"
            />
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-accent transition-colors px-3 py-2 rounded-md"
              style={{ border: '1px solid #102E66' }}
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">Ver sitio</span>
            </a>
            <form action={signOutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white px-3 py-2 rounded-md transition-colors"
                style={{ border: '1px solid #102E66' }}
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 px-4 md:px-8 py-6 md:py-8 w-full max-w-5xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

function SidebarContent({
  isActive,
  email,
  onNavigate,
  showClose,
}: {
  isActive: (href: string, exact?: boolean) => boolean
  email: string
  onNavigate?: () => void
  showClose?: boolean
}) {
  return (
    <>
      {/* Logo */}
      <div
        className="h-14 px-4 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: '1px solid #102E66' }}
      >
        <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-2.5">
          <Image
            src="/images/logo.png"
            alt="GC2"
            width={90}
            height={28}
            className="h-7 w-auto"
            sizes="90px"
          />
          <span
            className="text-[10px] font-body font-bold uppercase tracking-[2px] text-white/35 leading-none"
          >
            Admin
          </span>
        </Link>
        {showClose && (
          <button
            onClick={onNavigate}
            className="w-7 h-7 flex items-center justify-center rounded text-white/50 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body font-medium transition-all duration-150 group"
              style={{
                background: active ? 'rgba(56,189,248,0.1)' : 'transparent',
                color: active ? '#38BDF8' : 'rgba(255,255,255,0.6)',
              }}
            >
              <Icon size={15} className="flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={13} className="opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div
        className="px-4 py-3 flex-shrink-0"
        style={{ borderTop: '1px solid #102E66' }}
      >
        <p className="text-[11px] text-white/30 truncate">{email}</p>
      </div>
    </>
  )
}
