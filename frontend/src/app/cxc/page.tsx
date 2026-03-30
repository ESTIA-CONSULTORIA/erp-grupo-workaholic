'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useERPStore } from '@/store/erp.store';
import { api, fmt, fmtDate } from '@/lib/api';
import AppLayout from '@/components/layout/AppLayout';

export default function CxCPage() {
  const { activeCompany, activePeriod } = useERPStore();
  const cid   = activeCompany?.companyId;
  const color = activeCompany?.color || '#f59e0b';
  const qc    = useQueryClient();
  const [selected, setSelected] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('');

  const { data: summary } = useQuery({
    queryKey: ['cxc-summary', cid],
    queryFn:  () => api.get(`/companies/${cid}/cxc/summary`).then(r => r.data),
    enabled: !!cid,
  });

  const { data: cxcs = [], isLoading } = useQuery({
    queryKey: ['cxc', cid, activePeriod, filterStatus],
    queryFn:  () => api.get(`/companies/${cid}/cxc?period=${activePeriod}${filterStatus?`&status=${filterStatus}`:''}`).then(r => r.data),
    enabled: !!cid,
  });

  const payM = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.post(`/companies/${cid}/cxc/${id}/payments`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cxc', cid] });
      qc.invalidateQueries({ queryKey: ['cxc-summary', cid] });
      setSelected(null);
    },
  });

  const STATUS_COLOR: Record<string, string> = {
    PENDIENTE: '#f59e0b',
    PARCIAL:   '#3b82f6',
    PAGADO:    '#10b981',
    VENCIDO:   '#f87171',
  };

  return (
    <AppLayout>
      <div className="max-w-5xl space-y-5">
        <h1 className="text-2xl font-bold">Cuentas por Cobrar</h1>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card-sm" style={{ borderLeft:`3px solid ${color}` }}>
            <p className="text-xs text-text-hint mb-1">Total pendiente</p>
            <p className="text-xl font-bold" style={{ color }}>{fmt(summary?.totalPending||0)}</p>
          </div>
          <div className="card-sm" style={{ borderLeft:'3px solid #f87171' }}>
            <p className="text-xs text-text-hint mb-1">Vencido</p>
            <p className="text-xl font-bold text-red-400">{fmt(summary?.totalOverdue||0)}</p>
          </div>
          <div className="card-sm" style={{ borderLeft:'3px solid #64748b' }}>
            <p className="text-xs text-text-hint mb-1">Cuentas abiertas</p>
            <p className="text-xl font-bold text-text-muted">{summary?.pendingCount||0}</p>
          </div>
        </div>

        {/* Nota importante */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-4 py-3">
          <p className="text-sm text-blue-400">
            <strong>Nota:</strong> Los abonos de CxC no se contabilizan como venta del período.
            Solo reducen el saldo pendiente del cliente y generan entrada de flujo.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          {['', 'PENDIENTE', 'PARCIAL', 'VENCIDO', 'PAGADO'].map(st => (
            <button key={st}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filterStatus===st ? 'text-white' : 'border-border text-text-hint'
              }`}
              style={filterStatus===st ? { background:color, borderColor:color } : {}}
              onClick={() => setFilterStatus(st)}>
              {st||'Todos'}
            </button>
          ))}
        </div>

        {/* Tabla */}
        <div className="card p-0 overflow-hidden">
          <table className="table-base">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Vencimiento</th>
                <th className="text-right">Original</th>
                <th className="text-right">Abonado</th>
                <th className="text-right">Saldo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-8 text-text-hint">Cargando…</td></tr>
              ) : cxcs.length===0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-text-hint">Sin cuentas por cobrar</td></tr>
              ) : cxcs.map((c: any) => (
                <tr key={c.id}>
                  <td className="font-medium">{c.client?.name}</td>
                  <td>{fmtDate(c.date)}</td>
                  <td>{c.dueDate ? fmtDate(c.dueDate) : '—'}</td>
                  <td className="text-right">{fmt(c.originalAmount)}</td>
                  <td className="text-right text-green-400">{fmt(c.paidAmount)}</td>
                  <td className="text-right font-bold" style={{ color:STATUS_COLOR[c.status] }}>
                    {fmt(c.balance)}
                  </td>
                  <td>
                    <span className="text-xs px-2 py-0.5 rounded font-medium"
                      style={{ background:STATUS_COLOR[c.status]+'22', color:STATUS_COLOR[c.status] }}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    {c.status !== 'PAGADO' && (
                      <button className="text-xs text-blue-400 hover:underline"
                        onClick={() => setSelected(c)}>
                        Abonar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal abonar */}
      {selected && (
        <AbonoModal
          cxc={selected} color={color}
          onPay={data => payM.mutate({ id: selected.id, data })}
          loading={payM.isPending}
          onClose={() => setSelected(null)}
        />
      )}
    </AppLayout>
  );
}

function AbonoModal({ cxc, color, onPay, loading, onClose }: any) {
  const [form, setForm] = useState({
    amount:        '',
    currency:      'MXN',
    date:          new Date().toISOString().slice(0,10),
    paymentMethod: 'EFECTIVO_MXN',
    reference:     '',
  });
  const set = (k: string, v: any) => setForm(f => ({...f,[k]:v}));
  const maxAmount = Number(cxc.balance);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-secondary rounded-xl w-full max-w-md">
        <div className="p-5 border-b border-border flex justify-between">
          <div>
            <h2 className="font-bold">Registrar abono</h2>
            <p className="text-xs text-text-hint mt-0.5">{cxc.client?.name}</p>
          </div>
          <button onClick={onClose} className="text-text-hint hover:text-text">✕</button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex justify-between text-sm bg-bg-tertiary rounded-lg px-4 py-3">
            <span className="text-text-muted">Saldo pendiente</span>
            <span className="font-bold" style={{ color }}>{fmt(maxAmount)}</span>
          </div>

          <div>
            <label className="text-xs text-text-hint mb-1 block">Monto del abono *</label>
            <input type="number" min="0.01" max={maxAmount} step="0.01"
              className="input-base text-right font-bold text-lg"
              style={{ color }}
              value={form.amount} onChange={e => set('amount', e.target.value)}
              placeholder="0.00"/>
            <p className="text-xs text-text-hint mt-1">Máximo: {fmt(maxAmount)}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-hint mb-1 block">Método</label>
              <select className="input-base text-sm" value={form.paymentMethod}
                onChange={e => set('paymentMethod',e.target.value)}>
                <option value="EFECTIVO_MXN">Efectivo MXN</option>
                <option value="EFECTIVO_USD">Efectivo USD</option>
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="TARJETA">Tarjeta</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-text-hint mb-1 block">Fecha</label>
              <input type="date" className="input-base text-sm" value={form.date}
                onChange={e => set('date',e.target.value)}/>
            </div>
          </div>

          <div>
            <label className="text-xs text-text-hint mb-1 block">Referencia (opcional)</label>
            <input className="input-base text-sm" value={form.reference}
              onChange={e => set('reference',e.target.value)} placeholder="Número de transferencia…"/>
          </div>
        </div>
        <div className="p-5 border-t border-border flex justify-end gap-3">
          <button className="btn-secondary text-sm" onClick={onClose}>Cancelar</button>
          <button className="btn-primary text-white text-sm" style={{ background:color }}
            onClick={() => onPay({ ...form, amount:Number(form.amount), currency:'MXN' })}
            disabled={loading || !form.amount || Number(form.amount) > maxAmount}>
            {loading ? 'Guardando…' : 'Confirmar abono'}
          </button>
        </div>
      </div>
    </div>
  );
}
