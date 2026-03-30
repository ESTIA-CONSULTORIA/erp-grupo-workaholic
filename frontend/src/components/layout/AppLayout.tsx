'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useERPStore } from '@/store/erp.store';
import { mesActual } from '@/lib/api';

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const NAV = [
  { href:'/dashboard',         icon:'▦', label:'Dashboard' },
  { href:'/cortes',            icon:'✎', label:'Cortes' },
  { href:'/gastos',            icon:'◎', label:'Gastos / Compras' },
  { href:'/conciliacion',      icon:'⊜', label:'Conciliación' },
  { href:'/cxc',               icon:'◷', label:'CxC / CxP' },
  { href:'/reportes',          icon:'∑', label:'Est. Financieros' },
  { href:'/documentos',        icon:'⊞', label:'Documentos' },
  { href:'/consolidado',       icon:'◈', label:'Consolidado',   roles:['admin','gerente','contador'] },
  // ── Machete exclusivo ────────────────────────────────────
  { href:'/pos',               icon:'🏪', label:'POS',           companies:['machete'] },
  { href:'/produccion',        icon:'⚙',  label:'Inventarios',   companies:['machete'] },
  { href:'/catalogo',          icon:'≋',  label:'Catálogo',      companies:['machete'] },
  { href:'/machete-reportes',  icon:'📊',  label:'Rpt. Ventas',   companies:['machete'] },
  // ── Admin ────────────────────────────────────────────────
  { href:'/admin',             icon:'⊛', label:'Admin',         roles:['admin'] },
];

// Últimos 12 meses
function getUltimos12() {
  const result = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    const label = `${MESES[d.getMonth()]} ${d.getFullYear()}`;
    result.push({ key, label });
  }
  return result;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { user, activeCompany, activePeriod,
          setActiveCompany, setActivePeriod, logout } = useERPStore();
  const [collapsed, setCollapsed] = useState(false);

  // Redirigir al login si no hay sesión
  useEffect(() => {
    if (!user) router.push('/login');
  }, [user]);

  if (!user || !activeCompany) return null;

  const color    = activeCompany.color || '#3b82f6';
  const periodos = getUltimos12();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── SIDEBAR ────────────────────────────────────────── */}
      <aside
        className="flex flex-col bg-bg-secondary border-r border-border transition-all duration-200 flex-shrink-0"
        style={{ width: collapsed ? 56 : 220 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 p-4 border-b border-border min-h-[60px]">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background: color }}
          >
            GW
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold truncate">Grupo Workaholic</span>
          )}
        </div>

        {/* Selector empresa */}
        {!collapsed && (
          <div className="p-3 border-b border-border space-y-2">
            <select
              value={activeCompany.companyId}
              onChange={e => {
                const c = user.companies.find(c => c.companyId === e.target.value);
                if (c) { setActiveCompany(c); router.push('/dashboard'); }
              }}
              className="input-base text-xs"
              style={{ borderColor: color + '66' }}
            >
              {user.companies.map(c => (
                <option key={c.companyId} value={c.companyId}>{c.companyName}</option>
              ))}
            </select>

            <select
              value={activePeriod}
              onChange={e => setActivePeriod(e.target.value)}
              className="input-base text-xs"
            >
              {periodos.map(p => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto py-2">
          {NAV.filter((item: any) => {
            if (item.roles     && !item.roles.includes(activeCompany.roleCode))    return false;
            if (item.companies && !item.companies.includes(activeCompany.companyCode)) return false;
            return true;
          }).map(item => {
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className="flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg text-sm transition-all cursor-pointer"
                  style={{
                    background:  active ? color + '22' : 'transparent',
                    color:       active ? color        : '#94a3b8',
                    borderLeft:  active ? `3px solid ${color}` : '3px solid transparent',
                  }}
                >
                  <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span className="truncate font-medium">{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Usuario */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-bg-tertiary flex items-center justify-center text-xs font-semibold flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{user.name}</p>
                <p className="text-xs text-text-hint capitalize">{activeCompany.roleCode}</p>
              </div>
            )}
            <button
              onClick={logout}
              className="text-text-hint hover:text-red-400 transition-colors text-sm flex-shrink-0"
              title="Cerrar sesión"
            >⏻</button>
          </div>
        </div>

        {/* Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 text-xs text-text-hint hover:text-text transition-colors border-t border-border"
        >
          {collapsed ? '▶' : '◀'}
        </button>
      </aside>

      {/* ── CONTENIDO ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-[60px] border-b border-border flex items-center px-6 gap-3 flex-shrink-0"
          style={{ borderBottomColor: color + '44' }}>
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold text-white"
            style={{ background: color }}
          >
            {activeCompany.companyName}
          </span>
          <span className="px-3 py-1 rounded-full text-xs bg-bg-tertiary text-text-muted">
            {periodos.find(p => p.key === activePeriod)?.label || activePeriod}
          </span>
        </header>

        {/* Página */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
