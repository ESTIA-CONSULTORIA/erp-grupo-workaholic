'use client';
import { useQuery } from '@tanstack/react-query';
import { useERPStore } from '@/store/erp.store';
import { api, fmt, fmtPct } from '@/lib/api';
import AppLayout from '@/components/layout/AppLayout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ConsolidadoPage() {
  const { activePeriod } = useERPStore();

  const { data, isLoading } = useQuery({
    queryKey: ['consolidated', activePeriod],
    queryFn:  () => api.get(`/reports/consolidated?period=${activePeriod}`).then(r => r.data),
  });

  const g = data?.groupTotal || {};

  const chartData = (data?.companies || []).map((c: any) => ({
    name:    c.companyName,
    venta:   c.netSale,
    gastos:  c.expenses,
    color:   c.color,
  }));

  return (
    <AppLayout>
      <div className="max-w-5xl space-y-6">
        <h1 className="text-2xl font-bold">Grupo Workaholic — Consolidado</h1>
        <p className="text-text-hint text-sm -mt-4">{activePeriod}</p>

        {/* KPIs del grupo */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPI label="Venta total grupo" value={fmt(g.netSale)}   color="#3b82f6"/>
          <KPI label="Gastos totales"    value={fmt(g.expenses)}  color="#8b5cf6"/>
          <KPI label="CxC pendiente"     value={fmt(g.cxcBalance)}color="#f59e0b"/>
          <KPI label="Utilidad grupo"
            value={fmt(g.netIncome)}
            color={g.netIncome >= 0 ? '#10b981' : '#f87171'}/>
        </div>

        {/* Gráfica comparativa */}
        {chartData.length > 0 && (
          <div className="card">
            <h3 className="text-xs font-semibold text-text-hint uppercase tracking-wider mb-4">
              Venta neta por empresa
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top:4,right:8,bottom:4,left:8 }}>
                <XAxis dataKey="name" tick={{ fill:'#64748b', fontSize:12 }}/>
                <YAxis tick={{ fill:'#64748b', fontSize:10 }}
                  tickFormatter={v => `$${(v/1000).toFixed(0)}k`}/>
                <Tooltip
                  formatter={(v:any) => [fmt(v),'']}
                  contentStyle={{ background:'#1e293b', border:'1px solid #334155', borderRadius:8 }}/>
                <Bar dataKey="venta" name="Venta" radius={[4,4,0,0]}>
                  {chartData.map((d:any,i:number) => <Cell key={i} fill={d.color}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tabla por empresa */}
        <div className="card p-0 overflow-hidden">
          <table className="table-base">
            <thead>
              <tr>
                <th>Empresa</th>
                <th className="text-right">Venta neta</th>
                <th className="text-right">Gastos</th>
                <th className="text-right">CxC</th>
                <th className="text-right">Utilidad</th>
                <th className="text-right">Margen</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-8 text-text-hint">Cargando…</td></tr>
              ) : (data?.companies || []).map((c: any) => (
                <tr key={c.companyId}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }}/>
                      <span className="font-medium">{c.companyName}</span>
                    </div>
                  </td>
                  <td className="text-right font-semibold" style={{ color: c.color }}>
                    {fmt(c.netSale)}
                  </td>
                  <td className="text-right text-purple-400">{fmt(c.expenses)}</td>
                  <td className="text-right text-amber-400">{fmt(c.cxcBalance)}</td>
                  <td className="text-right font-semibold"
                    style={{ color: c.netIncome>=0?'#10b981':'#f87171' }}>
                    {fmt(c.netIncome)}
                  </td>
                  <td className="text-right text-text-hint">
                    {c.netSale > 0 ? fmtPct(c.netIncome/c.netSale) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border">
                <td className="font-bold">TOTAL GRUPO</td>
                <td className="text-right font-bold text-blue-400">{fmt(g.netSale)}</td>
                <td className="text-right font-bold text-purple-400">{fmt(g.expenses)}</td>
                <td className="text-right font-bold text-amber-400">{fmt(g.cxcBalance)}</td>
                <td className="text-right font-bold text-lg"
                  style={{ color: g.netIncome>=0?'#10b981':'#f87171' }}>
                  {fmt(g.netIncome)}
                </td>
                <td className="text-right text-text-hint">
                  {g.netSale > 0 ? fmtPct(g.netIncome/g.netSale) : '—'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <p className="text-xs text-text-hint text-center">
          El dashboard consolidado muestra solo KPIs agregados. Los datos transaccionales de cada empresa son independientes.
        </p>
      </div>
    </AppLayout>
  );
}

function KPI({ label, value, color }: any) {
  return (
    <div className="card-sm" style={{ borderLeft:`3px solid ${color}` }}>
      <p className="text-xs text-text-hint mb-1">{label}</p>
      <p className="text-xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}
