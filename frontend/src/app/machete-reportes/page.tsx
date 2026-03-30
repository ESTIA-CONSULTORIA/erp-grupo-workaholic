'use client';
import { useQuery } from '@tanstack/react-query';
import { useERPStore } from '@/store/erp.store';
import { api, fmt, fmtPct } from '@/lib/api';
import AppLayout from '@/components/layout/AppLayout';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from 'recharts';

const COLORES = ['#B5451B','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899'];

export default function MacheteReportesPage() {
  const { activeCompany, activePeriod } = useERPStore();
  const cid   = activeCompany?.companyId;
  const color = activeCompany?.color || '#B5451B';

  const { data: report, isLoading } = useQuery({
    queryKey: ['machete-sales-report', cid, activePeriod],
    queryFn:  () => api.get(`/companies/${cid}/machete/reports/sales?period=${activePeriod}`).then(r => r.data),
    enabled:  !!cid && activeCompany?.companyCode === 'machete',
  });

  if (activeCompany?.companyCode !== 'machete') {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-text-hint">Este módulo solo está disponible para Machete.</p>
        </div>
      </AppLayout>
    );
  }

  if (isLoading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64 text-text-hint">
        Calculando reportes…
      </div>
    </AppLayout>
  );

  const r  = report || {};
  const p  = r.production || {};

  return (
    <AppLayout>
      <div className="max-w-5xl space-y-6">
        <h1 className="text-2xl font-bold">
          Reportes Machete — <span style={{color}}>{activePeriod}</span>
        </h1>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <KPI label="Venta total"      value={fmt(r.totalRevenue)} color={color}/>
          <KPI label="Unidades vendidas" value={r.totalUnits||0}    color="#f59e0b"/>
          <KPI label="Lotes producidos" value={p.lotes||0}          color="#10b981"/>
          <KPI label="Rendimiento prom." value={fmtPct(p.avgYield||0)} color="#3b82f6"/>
          <KPI label="Merma total"
            value={`${(p.totalWaste||0).toFixed(2)} kg`}
            color="#f87171"/>
        </div>

        {/* Gráficas */}
        <div className="grid grid-cols-2 gap-4">
          <GraficaBar titulo="Venta por tipo de carne"
            datos={(r.byMeatType||[]).map((d:any)=>({name:d.tipo, value:d.revenue}))}
            color={color}/>
          <GraficaBar titulo="Venta por sabor"
            datos={(r.byFlavor||[]).map((d:any)=>({name:d.sabor, value:d.revenue}))}
            color="#f59e0b"/>
          <GraficaBar titulo="Venta por presentación"
            datos={(r.byPresentation||[]).map((d:any)=>({name:d.presentacion, value:d.revenue}))}
            color="#10b981"/>
          <GraficaPie titulo="Venta por canal"
            datos={(r.byChannel||[]).map((d:any)=>({name:d.canal, value:d.revenue}))}/>
        </div>

        {/* Producción */}
        <div className="card">
          <h3 className="text-xs font-semibold text-text-hint uppercase tracking-wider mb-4">
            Producción del mes
          </h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-text-hint">Lotes terminados</p>
              <p className="text-2xl font-bold" style={{color}}>{p.lotes||0}</p>
            </div>
            <div>
              <p className="text-xs text-text-hint">kg de carne entrada</p>
              <p className="text-2xl font-bold text-text-muted">{(p.totalKgIn||0).toFixed(2)} kg</p>
            </div>
            <div>
              <p className="text-xs text-text-hint">kg de carne seca</p>
              <p className="text-2xl font-bold text-green-400">{(p.totalKgOut||0).toFixed(2)} kg</p>
            </div>
            <div>
              <p className="text-xs text-text-hint">Merma total</p>
              <p className="text-2xl font-bold text-red-400">{(p.totalWaste||0).toFixed(2)} kg</p>
            </div>
          </div>

          {/* Barra rendimiento */}
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-text-hint">Rendimiento promedio</span>
              <span className="font-semibold" style={{color}}>{fmtPct(p.avgYield||0)}</span>
            </div>
            <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
              <div className="h-full rounded-full"
                style={{ width:`${(p.avgYield||0)*100}%`, background:color }}/>
            </div>
          </div>
        </div>

        {/* Tabla detalle por SKU */}
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-3 border-b border-border" style={{background:color+'11'}}>
            <p className="text-sm font-bold uppercase tracking-wider" style={{color}}>
              Detalle por SKU
            </p>
          </div>
          <table className="table-base">
            <thead>
              <tr>
                <th>Producto</th>
                <th className="text-right">Unidades</th>
                <th className="text-right">Importe</th>
                <th className="text-right">% del total</th>
              </tr>
            </thead>
            <tbody>
              {(r.bySKU||[]).map((s:any) => (
                <tr key={s.name}>
                  <td className="font-medium">{s.name}</td>
                  <td className="text-right">{s.units}</td>
                  <td className="text-right font-semibold" style={{color}}>{fmt(s.revenue)}</td>
                  <td className="text-right text-text-hint">
                    {r.totalRevenue>0 ? fmtPct(s.revenue/r.totalRevenue) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

function GraficaBar({ titulo, datos, color }: any) {
  return (
    <div className="card">
      <p className="text-xs font-semibold text-text-hint uppercase tracking-wider mb-3">{titulo}</p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={datos} margin={{top:4,right:8,bottom:16,left:8}}>
          <XAxis dataKey="name" tick={{fill:'#64748b',fontSize:11}} angle={-10} textAnchor="end"/>
          <YAxis tick={{fill:'#64748b',fontSize:10}}
            tickFormatter={(v:any) => `$${(v/1000).toFixed(0)}k`}/>
          <Tooltip
            formatter={(v:any) => [fmt(v),'']}
            contentStyle={{background:'#1e293b',border:'1px solid #334155',borderRadius:8}}/>
          <Bar dataKey="value" radius={[4,4,0,0]}>
            {datos.map((_:any,i:number) => <Cell key={i} fill={COLORES[i%COLORES.length]}/>)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function GraficaPie({ titulo, datos }: any) {
  return (
    <div className="card">
      <p className="text-xs font-semibold text-text-hint uppercase tracking-wider mb-3">{titulo}</p>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={datos} dataKey="value" nameKey="name"
            cx="50%" cy="50%" outerRadius={60}
            label={({name,percent}:any) => `${name}: ${(percent*100).toFixed(0)}%`}>
            {datos.map((_:any,i:number) => <Cell key={i} fill={COLORES[i%COLORES.length]}/>)}
          </Pie>
          <Tooltip
            formatter={(v:any) => [fmt(v),'']}
            contentStyle={{background:'#1e293b',border:'1px solid #334155',borderRadius:8}}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
