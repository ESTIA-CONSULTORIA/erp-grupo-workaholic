'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useERPStore } from '@/store/erp.store';
import { api, fmt, fmtDate } from '@/lib/api';
import AppLayout from '@/components/layout/AppLayout';

const STATUS_BADGE: Record<string, string> = {
  BORRADOR:  'badge-gray',
  ENVIADO:   'badge-amber',
  APROBADO:  'badge-green',
  RECHAZADO: 'badge-red',
};

const STATUS_LABEL: Record<string, string> = {
  BORRADOR:  'Borrador',
  ENVIADO:   'Enviado',
  APROBADO:  'Aprobado',
  RECHAZADO: 'Rechazado',
};

export default function CortesPage() {
  const { activeCompany, activePeriod } = useERPStore();
  const cid   = activeCompany?.companyId;
  const color = activeCompany?.color || '#3b82f6';
  const qc    = useQueryClient();
  const [view, setView] = useState<'list'|'new'>('list');
  const [selected, setSelected] = useState<any>(null);

  const canCapture = useERPStore(s => s.hasPermission('capturar_cortes'));
  const canApprove = useERPStore(s => s.hasPermission('aprobar_cortes'));

  // Lista de cortes del período
  const { data: cortes = [], isLoading } = useQuery({
    queryKey: ['cuts', cid, activePeriod],
    queryFn:  () => api.get(`/companies/${cid}/cuts?period=${activePeriod}`).then(r => r.data),
    enabled:  !!cid,
  });

  // Rubros para el formulario
  const { data: rubros = [] } = useQuery({
    queryKey: ['rubrics-cuts', cid],
    queryFn:  () => api.get(`/companies/${cid}/schema/rubrics/cuts`).then(r => r.data),
    enabled:  !!cid,
  });

  // Cuentas de flujo
  const { data: cuentas = [] } = useQuery({
    queryKey: ['cash-accounts', cid],
    queryFn:  () => api.get(`/companies/${cid}/flow/balances`).then(r => r.data?.accounts || []),
    enabled:  !!cid,
  });

  // Clientes
  const { data: clientes = [] } = useQuery({
    queryKey: ['clients', cid],
    queryFn:  () => api.get(`/companies/${cid}/clients`).then(r => r.data).catch(() => []),
    enabled:  !!cid,
  });

  // Mutaciones
  const approveM = useMutation({
    mutationFn: (id: string) => api.put(`/companies/${cid}/cuts/${id}/approve`),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['cuts', cid] }),
  });

  const submitM = useMutation({
    mutationFn: (id: string) => api.put(`/companies/${cid}/cuts/${id}/submit`),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['cuts', cid] }),
  });

  const totalAprobado = cortes
    .filter((c: any) => c.status === 'APROBADO')
    .reduce((t: number, c: any) =>
      t + (c.lines || []).reduce((s: number, l: any) => s + Number(l.netAmount||0), 0), 0);

  return (
    <AppLayout>
      <div className="max-w-5xl space-y-5">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Cortes</h1>
            <p className="text-sm text-text-hint mt-0.5">
              {cortes.length} cortes · Total aprobado:{' '}
              <span className="font-semibold" style={{ color }}>{fmt(totalAprobado)}</span>
            </p>
          </div>
          {canCapture && (
            <button
              className="btn-primary text-white"
              style={{ background: color }}
              onClick={() => setView(view === 'new' ? 'list' : 'new')}
            >
              {view === 'new' ? '← Volver' : '+ Nuevo corte'}
            </button>
          )}
        </div>

        {/* Formulario nuevo corte */}
        {view === 'new' && (
          <NuevoCorteForm
            companyId={cid!}
            rubros={rubros}
            cuentas={cuentas}
            clientes={clientes}
            color={color}
            onSuccess={() => {
              setView('list');
              qc.invalidateQueries({ queryKey: ['cuts', cid] });
            }}
          />
        )}

        {/* Lista de cortes */}
        {view === 'list' && (
          <div className="card overflow-hidden p-0">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Folio</th>
                  <th>Fecha</th>
                  <th>Sucursal</th>
                  <th>Capturó</th>
                  <th className="text-right">Venta neta</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={7} className="text-center py-8 text-text-hint">Cargando…</td></tr>
                ) : cortes.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-text-hint">Sin cortes en este período</td></tr>
                ) : cortes.map((c: any) => {
                  const total = (c.lines||[]).reduce((t:number,l:any) => t+Number(l.netAmount||0), 0);
                  return (
                    <tr key={c.id}>
                      <td><code className="text-xs bg-bg-tertiary px-1.5 py-0.5 rounded">{c.folio}</code></td>
                      <td>{fmtDate(c.date)}</td>
                      <td>{c.branch?.name || '—'}</td>
                      <td>{c.createdBy?.name || '—'}</td>
                      <td className="text-right font-semibold" style={{ color }}>{fmt(total)}</td>
                      <td><span className={STATUS_BADGE[c.status]}>{STATUS_LABEL[c.status]}</span></td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            className="text-xs text-blue-400 hover:underline"
                            onClick={() => setSelected(c)}
                          >Ver</button>
                          {canCapture && c.status === 'BORRADOR' && (
                            <button
                              className="text-xs text-amber-400 hover:underline"
                              onClick={() => submitM.mutate(c.id)}
                            >Enviar</button>
                          )}
                          {canApprove && c.status === 'ENVIADO' && (
                            <button
                              className="text-xs text-green-400 hover:underline"
                              onClick={() => approveM.mutate(c.id)}
                            >Aprobar</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal detalle corte */}
        {selected && (
          <DetalleCorte corte={selected} onClose={() => setSelected(null)} color={color}/>
        )}
      </div>
    </AppLayout>
  );
}

// ── Formulario nuevo corte ─────────────────────────────────────
function NuevoCorteForm({ companyId, rubros, cuentas, clientes, color, onSuccess }: any) {
  const today = new Date().toISOString().slice(0,10);
  const [fecha,   setFecha]   = useState(today);
  const [notas,   setNotas]   = useState('');
  const [lineas,  setLineas]  = useState<any[]>([]);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  const agregarLinea = () => setLineas(ls => [...ls, {
    rubricId:'', paymentType:'CONTADO', currency:'MXN',
    cashAccountId:'', clientId:'',
    grossAmount:0, discount:0, courtesy:0,
  }]);

  const setLinea = (i: number, campo: string, val: any) =>
    setLineas(ls => ls.map((l,j) => j===i ? {...l, [campo]:val} : l));

  const netAmount = (l: any) => Number(l.grossAmount||0) - Number(l.discount||0) - Number(l.courtesy||0);

  const totalNeto = lineas.reduce((t,l) => t + netAmount(l), 0);

  const guardar = async () => {
    if (lineas.length === 0) { setError('Agrega al menos una línea'); return; }
    for (const l of lineas) {
      if (!l.rubricId) { setError('Selecciona el concepto en todas las líneas'); return; }
      if (netAmount(l) < 0) { setError('El monto neto no puede ser negativo'); return; }
    }
    setError(''); setSaving(true);
    try {
      await api.post(`/companies/${companyId}/cuts`, {
        date: fecha, notes: notas,
        branchId: 'unica', // se resuelve en backend
        lines: lineas.map(l => ({
          ...l,
          grossAmount: Number(l.grossAmount||0),
          discount:    Number(l.discount||0),
          courtesy:    Number(l.courtesy||0),
          cashAccountId: l.cashAccountId || undefined,
          clientId:      l.clientId      || undefined,
        })),
      });
      onSuccess();
    } catch(e: any) {
      setError(e.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card space-y-4">
      <h3 className="font-semibold text-base">Nuevo corte</h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-text-hint mb-1 block">Fecha</label>
          <input type="date" className="input-base" value={fecha}
            onChange={e => setFecha(e.target.value)} max={today}/>
        </div>
        <div>
          <label className="text-xs text-text-hint mb-1 block">Notas (opcional)</label>
          <input type="text" className="input-base" value={notas}
            onChange={e => setNotas(e.target.value)} placeholder="Turno, observaciones…"/>
        </div>
      </div>

      {/* Líneas */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-text-hint uppercase tracking-wide">Líneas de ingreso</span>
          <button onClick={agregarLinea} className="text-xs text-blue-400 hover:underline">+ Agregar línea</button>
        </div>

        {lineas.length === 0 && (
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <p className="text-sm text-text-hint">Haz clic en "+ Agregar línea" para comenzar</p>
          </div>
        )}

        {lineas.map((l, i) => {
          const rubro = rubros.find((r:any) => r.id === l.rubricId);
          return (
            <div key={i} className="bg-bg rounded-lg p-3 mb-2 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-text-hint mb-1 block">Concepto *</label>
                  <select className="input-base text-xs"
                    value={l.rubricId} onChange={e => setLinea(i,'rubricId',e.target.value)}>
                    <option value="">— Seleccionar —</option>
                    {rubros.map((r:any) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-text-hint mb-1 block">Tipo de cobro</label>
                  <select className="input-base text-xs"
                    value={l.paymentType} onChange={e => setLinea(i,'paymentType',e.target.value)}>
                    {rubro?.allowsContado !== false && <option value="CONTADO">Contado</option>}
                    {rubro?.allowsCxC    && <option value="CXC">A crédito (CxC)</option>}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-text-hint mb-1 block">Cuenta de flujo</label>
                  <select className="input-base text-xs"
                    value={l.cashAccountId} onChange={e => setLinea(i,'cashAccountId',e.target.value)}
                    disabled={l.paymentType === 'CXC'}>
                    <option value="">— Seleccionar —</option>
                    {cuentas.map((c:any) => (
                      <option key={c.accountId} value={c.accountId}>{c.accountName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {rubro?.requiresClient && (
                  <div>
                    <label className="text-xs text-text-hint mb-1 block">Cliente</label>
                    <select className="input-base text-xs"
                      value={l.clientId} onChange={e => setLinea(i,'clientId',e.target.value)}>
                      <option value="">— Seleccionar —</option>
                      {clientes.map((c:any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="text-xs text-text-hint mb-1 block">Importe bruto *</label>
                  <input type="number" min="0" step="0.01" className="input-base text-xs text-right"
                    value={l.grossAmount||''} placeholder="0.00"
                    onChange={e => setLinea(i,'grossAmount',e.target.value)}/>
                </div>
                {rubro?.allowsDiscount && (
                  <div>
                    <label className="text-xs text-text-hint mb-1 block">Descuento</label>
                    <input type="number" min="0" step="0.01" className="input-base text-xs text-right"
                      value={l.discount||''} placeholder="0.00"
                      onChange={e => setLinea(i,'discount',e.target.value)}/>
                  </div>
                )}
                {rubro?.allowsCourtesy && (
                  <div>
                    <label className="text-xs text-text-hint mb-1 block">Cortesía</label>
                    <input type="number" min="0" step="0.01" className="input-base text-xs text-right"
                      value={l.courtesy||''} placeholder="0.00"
                      onChange={e => setLinea(i,'courtesy',e.target.value)}/>
                  </div>
                )}
                <div>
                  <label className="text-xs text-text-hint mb-1 block">Neto</label>
                  <div className="input-base text-xs text-right font-semibold" style={{ color }}>
                    {fmt(netAmount(l))}
                  </div>
                </div>
              </div>

              <button onClick={() => setLineas(ls => ls.filter((_,j) => j!==i))}
                className="text-xs text-red-400 hover:underline">Eliminar línea</button>
            </div>
          );
        })}
      </div>

      {lineas.length > 0 && (
        <div className="flex justify-end items-center gap-3 border-t border-border pt-3">
          <span className="text-sm text-text-muted">Total neto:</span>
          <span className="text-xl font-bold" style={{ color }}>{fmt(totalNeto)}</span>
        </div>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-3 justify-end">
        <button className="btn-secondary" onClick={() => setLineas([])}>Limpiar</button>
        <button className="btn-primary text-white" style={{ background: color }}
          onClick={guardar} disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar corte'}
        </button>
      </div>
    </div>
  );
}

// ── Detalle corte (modal simplificado) ────────────────────────
function DetalleCorte({ corte, onClose, color }: any) {
  const total = (corte.lines||[]).reduce((t:number,l:any) => t+Number(l.netAmount||0), 0);
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-secondary rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="p-5 border-b border-border flex justify-between items-start">
          <div>
            <code className="text-sm bg-bg-tertiary px-2 py-1 rounded">{corte.folio}</code>
            <span className="ml-3 text-text-muted text-sm">{fmtDate(corte.date)}</span>
          </div>
          <button onClick={onClose} className="text-text-hint hover:text-text">✕</button>
        </div>
        <div className="p-5">
          <table className="table-base">
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Tipo</th>
                <th className="text-right">Bruto</th>
                <th className="text-right">Desc.</th>
                <th className="text-right">Neto</th>
              </tr>
            </thead>
            <tbody>
              {(corte.lines||[]).map((l:any) => (
                <tr key={l.id}>
                  <td>{l.rubric?.name}</td>
                  <td><span className={l.paymentType==='CONTADO'?'badge-green':'badge-blue'}>{l.paymentType}</span></td>
                  <td className="text-right">{fmt(l.grossAmount)}</td>
                  <td className="text-right text-red-400">{Number(l.discount)>0?fmt(l.discount):'—'}</td>
                  <td className="text-right font-semibold" style={{color}}>{fmt(l.netAmount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="text-right font-bold pt-2">TOTAL</td>
                <td className="text-right font-bold text-lg pt-2" style={{color}}>{fmt(total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
