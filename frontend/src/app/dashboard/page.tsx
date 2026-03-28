'use client';
import { useQuery } from '@tanstack/react-query';
import { useERPStore } from '@/store/erp.store';
import { api, fmt, fmtPct } from '@/lib/api';
import AppLayout from '@/components/layout/AppLayout';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from 'recharts';

export default function DashboardPage() {
  const { activeCompany, activePeriod } = useERPStore();
  const cid = activeCompany?.companyId;
  const color = activeCompany?.color || '#3b82f6';

  // KPIs del período
  const { data: edo } = useQuery({
    queryKey: ['income-statement', cid, activePeriod],
    queryFn:  () => api.get(`/reports/companies/${cid}/income-statement?period=${activePeriod}`).then(r => r.data),
    enabled:  !!cid,
  });

  // Flujo — saldos actuales
  const { data: flow } = useQuery({
    queryKey: ['flow-balances', cid],
    queryFn:  () => api.get(`/companies/${cid}/flow/balances`).then(r => r.data),
    enabled:  !!cid,
  });

  // CxC resumen
  const { data: cxc } = useQuery({
    queryKey: ['cxc-summary', cid],
    queryFn:  () => api.get(`/companies/${cid}/cxc/summary`).then(r => r.data),
    enabled:  !!cid,
  });

  // Cortes recientes
  const { data: cutsData } = useQuery({
    queryKey: ['cuts-recent', cid, activePeriod],
    queryFn:  () => api.get(`/companies/${cid}/cuts?period=${activePeriod}&status=APROBADO`).then(r => r.data),
    enabled:  !!cid,
  });

  const s  = edo?.summary || {};
  const totalNet  = s.totalNetSale   || 0;
  const netIncome = s.netIncome      || 0;
  const grossProfit = s.grossProfit  || 0;

  // Datos para gráfica de resultado
  const chartData = [
    { name: 'Ingresos',  value: totalNet,     color: color },
    { name: 'Costo',     value: s.totalCost   || 0, color: '#f59e0b' },
    { name: 'Gastos',    value: s.totalExpenses||0, color: '#8b5cf6' },
    { name: 'Utilidad',  value: Math.max(netIncome, 0), color: '#10b981' },
  ];

  // Datos de flujo para pie
  const flowData = (flow?.accounts || [])
    .filter((a: any) => a.balance > 0)
    .map((a: any) => ({ name: a.accountName, value: a.balance }));

  const COLORS = [color, '#10b981', '#f59e0b', '#8b5cf6', '#3b82f6'];

  return (
    <AppLayout>
      <div className="max-w-6xl space-y-6">
        <h1 className="text-2xl font-bold">
          Dashboard — <span style={{ color }}>{activeCompany?.companyName}</span>
        </h1>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPI label="Venta neta"     value={fmt(totalNet)}    color={color}
            sub={`${fmtPct(s.pctMeta||0)} de meta`}/>
          <KPI label="Utilidad bruta" value={fmt(grossProfit)} color="#10b981"
            sub={`Margen ${fmtPct(s.grossMargin||0)}`}/>
          <KPI label="Utilidad neta"  value={fmt(netIncome)}
            color={netIncome >= 0 ? '#10b981' : '#f87171'}
            sub={`Margen ${fmtPct(s.netMargin||0)}`}/>
          <KPI label="Saldo total"
            value={fmt(flow?.totalMxn || 0)} color="#06b6d4"
            sub={`+ $${(flow?.totalUsd || 0).toFixed(2)} USD`}/>
        </div>

        {/* Barra de meta */}
        {s.totalNetSale > 0 && s.metaVenta > 0 && (
          <div className="card">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-muted">Cumplimiento de meta</span>
              <span className="font-semibold" style={{ color }}>
                {fmt(totalNet)} / {fmt(s.metaVenta)}
              </span>
            </div>
            <div className="h-2.5 bg-bg-tertiary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min((s.pctMeta||0)*100, 100)}%`,
                  background: color,
                }}
              />
            </div>
          </div>
        )}

        {/* Gráficas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Resultado del mes */}
          <div className="card">
            <h3 className="text-xs font-semibold text-text-hint uppercase tracking-wider mb-4">
              Resultado del mes
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{ top:4, right:8, bottom:4, left:8 }}>
                <XAxis dataKey="name" tick={{ fill:'#64748b', fontSize:11 }}/>
                <YAxis tick={{ fill:'#64748b', fontSize:10 }}
                  tickFormatter={v => `$${(v/1000).toFixed(0)}k`}/>
                <Tooltip
                  formatter={v => [fmt(v as number), '']}
                  contentStyle={{ background:'#1e293b', border:'1px solid #334155', borderRadius:8 }}
                  labelStyle={{ color:'#f1f5f9' }}
                />
                <Bar dataKey="value" radius={[4,4,0,0]}>
                  {chartData.map((d,i) => <Cell key={i} fill={d.color}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Distribución de saldos */}
          <div className="card">
            <h3 className="text-xs font-semibold text-text-hint uppercase tracking-wider mb-4">
              Distribución de saldos
            </h3>
            {flowData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={flowData} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" outerRadius={70}
                    label={({ name, percent }) => `${name}: ${(percent*100).toFixed(0)}%`}>
                    {flowData.map((_:any, i:number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]}/>
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v:any) => [fmt(v), '']}
                    contentStyle={{ background:'#1e293b', border:'1px solid #334155', borderRadius:8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-text-hint text-sm">
                Sin movimientos en el período
              </div>
            )}
          </div>
        </div>

        {/* CxC + Cortes recientes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Resumen CxC */}
          <div className="card">
            <h3 className="text-xs font-semibold text-text-hint uppercase tracking-wider mb-4">
              Cuentas por cobrar
            </h3>
            <div className="space-y-3">
              <Row label="Total pendiente" value={fmt(cxc?.totalPending||0)} color="#f59e0b"/>
              <Row label="Vencido"         value={fmt(cxc?.totalOverdue||0)} color="#f87171"/>
              <Row label="# de cuentas"   value={cxc?.pendingCount||0}/>
            </div>
            {(cxc?.byClient||[]).slice(0,5).map((c:any) => (
              <div key={c.client.id}
                className="flex justify-between items-center py-1.5 border-t border-border/50">
                <span className="text-sm text-text-muted truncate">{c.client.name}</span>
                <span className="text-sm font-medium text-amber-400">{fmt(c.balance)}</span>
              </div>
            ))}
          </div>

          {/* Cortes recientes */}
          <div className="card">
            <h3 className="text-xs font-semibold text-text-hint uppercase tracking-wider mb-4">
              Últimos cortes aprobados
            </h3>
            {(cutsData || []).slice(0,6).map((cut: any) => (
              <div key={cut.id}
                className="flex justify-between items-center py-1.5 border-b border-border/50">
                <div>
                  <span className="text-xs font-mono text-text-hint">{cut.folio}</span>
                  <span className="text-xs text-text-hint ml-2">{cut.branch?.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold" style={{ color }}>
                    {fmt(cut.lines?.reduce((t:number,l:any) => t+Number(l.netAmount||0), 0))}
                  </span>
                </div>
              </div>
            ))}
            {(!cutsData || cutsData.length === 0) && (
              <p className="text-sm text-text-hint">Sin cortes aprobados este período</p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function KPI({ label, value, color, sub }: any) {
  return (
    <div className="card-sm" style={{ borderLeft: `3px solid ${color}` }}>
      <p className="text-xs text-text-hint mb-1 uppercase tracking-wide">{label}</p>
      <p className="text-xl font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-xs text-text-hint mt-0.5">{sub}</p>}
    </div>
  );
}

function Row({ label, value, color }: any) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-sm font-semibold" style={{ color: color||'#f1f5f9' }}>{value}</span>
    </div>
  );
}
