'use client';
import { useQuery } from '@tanstack/react-query';
import { useERPStore } from '@/store/erp.store';
import { api, fmt, fmtPct } from '@/lib/api';
import AppLayout from '@/components/layout/AppLayout';

export default function ReportesPage() {
  const { activeCompany, activePeriod } = useERPStore();
  const cid   = activeCompany?.companyId;
  const color = activeCompany?.color || '#3b82f6';

  const { data: edo, isLoading } = useQuery({
    queryKey: ['income-statement', cid, activePeriod],
    queryFn:  () => api.get(`/reports/companies/${cid}/income-statement?period=${activePeriod}`).then(r => r.data),
    enabled:  !!cid,
  });

  if (isLoading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64 text-text-hint">Calculando estado de resultados…</div>
    </AppLayout>
  );

  const s = edo?.summary || {};

  return (
    <AppLayout>
      <div className="max-w-4xl space-y-5">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Estado de Resultados</h1>
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold text-white"
              style={{ background: color }}>
              {activeCompany?.companyName}
            </span>
            <span className="px-3 py-1 rounded-full text-xs bg-bg-tertiary text-text-muted">
              {activePeriod}
            </span>
          </div>
        </div>

        {/* Secciones del ER dinámico */}
        {(edo?.sections || []).map((section: any) => (
          <div key={section.id} className="card p-0 overflow-hidden">
            {/* Header sección */}
            <div className="px-5 py-3 border-b border-border"
              style={{ background: color + '11' }}>
              <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color }}>
                {section.name}
              </h2>
              {section.affectsResult === false && (
                <span className="text-xs text-text-hint">(No afecta resultado operativo)</span>
              )}
            </div>

            {/* Grupos */}
            {section.groups.map((group: any) => (
              <div key={group.id}>
                {group.name && (
                  <div className="px-5 py-2 bg-bg-tertiary/30">
                    <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                      {group.name}
                    </span>
                  </div>
                )}

                {/* Rubros */}
                {group.rubrics.map((r: any) => {
                  const val = r.net || r.cost || 0;
                  const pct = s.totalNetSale > 0 ? val / s.totalNetSale : 0;
                  return (
                    <div key={r.rubricId}
                      className="flex items-center justify-between px-5 py-2 border-b border-border/30 hover:bg-bg-tertiary/20 transition-colors">
                      <div className="flex-1">
                        <span className="text-sm text-text-muted">{r.name}</span>
                        {r.allowsCxC && (
                          <div className="text-xs text-text-hint mt-0.5 flex gap-3">
                            {r.contado > 0 && <span>Contado: {fmt(r.contado)}</span>}
                            {r.cxc > 0     && <span className="text-amber-400">CxC: {fmt(r.cxc)}</span>}
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <span className="text-sm font-semibold" style={{ color: val>0?color:'#f87171' }}>
                          {fmt(val)}
                        </span>
                        {s.totalNetSale > 0 && (
                          <div className="text-xs text-text-hint">{fmtPct(pct)}</div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Subtotal del grupo */}
                {group.isSummary && (
                  <div className="flex justify-between px-5 py-2 bg-bg-tertiary/40">
                    <span className="text-xs font-bold text-text-muted uppercase">Subtotal {group.name}</span>
                    <span className="text-sm font-bold" style={{ color }}>{fmt(group.total)}</span>
                  </div>
                )}
              </div>
            ))}

            {/* Total sección */}
            <div className="flex justify-between px-5 py-3 border-t border-border"
              style={{ background: color + '11' }}>
              <span className="text-sm font-bold">Total {section.name}</span>
              <span className="text-base font-bold" style={{ color }}>{fmt(section.total)}</span>
            </div>
          </div>
        ))}

        {/* Resultados finales */}
        <div className="card space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-hint">Resumen del ejercicio</h2>

          <ResultRow label="Venta neta"        value={fmt(s.totalNetSale)}    color={color}/>
          <ResultRow label="Costo de ventas"   value={fmt(s.totalCost)}       color="#f59e0b"
            sub={`Margen bruto: ${fmtPct(s.grossMargin||0)}`}/>
          <ResultRow label="Utilidad bruta"    value={fmt(s.grossProfit)}     color="#10b981" bold/>
          <ResultRow label="Gastos generales"  value={fmt(s.totalExpenses)}   color="#8b5cf6"/>

          <div className="border-t border-border pt-3 mt-1">
            <ResultRow label="Resultado antes de impuestos"
              value={fmt(s.operatingIncome)}
              color={s.operatingIncome >= 0 ? '#10b981' : '#f87171'} bold/>
          </div>

          <div className="border-t-2 border-border pt-3 mt-1">
            <ResultRow label="UTILIDAD / PÉRDIDA NETA DEL EJERCICIO"
              value={fmt(s.netIncome)}
              color={s.netIncome >= 0 ? '#10b981' : '#f87171'}
              bold big/>
            <div className="text-right text-sm text-text-hint mt-1">
              Margen neto: {fmtPct(s.netMargin||0)}
            </div>
          </div>
        </div>

        {/* Flujo inicial / final */}
        {edo?.flow && (
          <div className="card">
            <h2 className="text-sm font-bold uppercase tracking-wider text-text-hint mb-4">
              Flujo por cuenta
            </h2>
            <table className="table-base">
              <thead>
                <tr>
                  <th>Cuenta</th>
                  <th className="text-right">Entradas</th>
                  <th className="text-right">Salidas</th>
                  <th className="text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {edo.flow.map((f: any) => (
                  <tr key={f.accountId}>
                    <td>{f.accountName}</td>
                    <td className="text-right text-green-400">{fmt(f.inflows)}</td>
                    <td className="text-right text-red-400">{fmt(f.outflows)}</td>
                    <td className="text-right font-semibold" style={{ color }}>
                      {fmt(f.inflows - f.outflows)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CxC pendiente */}
        {s.cxcBalance > 0 && (
          <div className="card border-amber-500/30">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-amber-400">CxC pendiente al cierre</p>
                <p className="text-xs text-text-hint mt-0.5">
                  Saldo que clientes deben y aún no han pagado
                </p>
              </div>
              <span className="text-xl font-bold text-amber-400">{fmt(s.cxcBalance)}</span>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function ResultRow({ label, value, color, sub, bold, big }: any) {
  return (
    <div className="flex justify-between items-start py-1.5">
      <span className={`text-sm ${bold ? 'font-semibold' : 'text-text-muted'}`}>{label}</span>
      <div className="text-right">
        <span className={`font-bold ${big ? 'text-xl' : 'text-base'}`} style={{ color }}>{value}</span>
        {sub && <div className="text-xs text-text-hint">{sub}</div>}
      </div>
    </div>
  );
}
