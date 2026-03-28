'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useERPStore } from '@/store/erp.store';
import { api, fmt, fmtPct } from '@/lib/api';
import AppLayout from '@/components/layout/AppLayout';

const TABS = [
  { id:'saldos',   label:'Saldos' },
  { id:'ratio',    label:'33% Banco/Venta' },
  { id:'arqueo',   label:'Arqueo de caja' },
  { id:'traspasos',label:'Traspasos' },
];

const BILLETES_MN  = [1000,500,200,100,50,20];
const MONEDAS_MN   = [10,5,2,1,0.5];
const BILLETES_USD = [100,50,20,10,5,1];

export default function ConciliacionPage() {
  const { activeCompany, activePeriod } = useERPStore();
  const cid   = activeCompany?.companyId;
  const color = activeCompany?.color || '#3b82f6';
  const qc    = useQueryClient();
  const [tab, setTab] = useState('saldos');

  const { data: balances } = useQuery({
    queryKey: ['balances', cid],
    queryFn:  () => api.get(`/companies/${cid}/flow/balances`).then(r => r.data),
    enabled: !!cid,
    refetchInterval: 10000,
  });

  const { data: ratio } = useQuery({
    queryKey: ['ratio', cid, activePeriod],
    queryFn:  () => api.get(`/companies/${cid}/flow/ratio?period=${activePeriod}`).then(r => r.data),
    enabled: !!cid && tab === 'ratio',
  });

  const { data: arqueos = [] } = useQuery({
    queryKey: ['cash-counts', cid, activePeriod],
    queryFn:  () => api.get(`/companies/${cid}/flow/cash-counts?period=${activePeriod}`).then(r => r.data),
    enabled: !!cid && tab === 'arqueo',
  });

  const transferM = useMutation({
    mutationFn: (data: any) => api.post(`/companies/${cid}/flow/transfer`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['balances', cid] }),
  });

  const arqueoM = useMutation({
    mutationFn: (data: any) => api.post(`/companies/${cid}/flow/cash-counts`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cash-counts', cid] });
    },
  });

  return (
    <AppLayout>
      <div className="max-w-5xl space-y-5">
        <h1 className="text-2xl font-bold">Conciliación</h1>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border">
          {TABS.map(t => (
            <button key={t.id}
              className="px-4 py-2.5 text-sm font-medium transition-colors"
              style={{
                color:        tab===t.id ? color : '#64748b',
                borderBottom: tab===t.id ? `2px solid ${color}` : '2px solid transparent',
              }}
              onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── SALDOS ───────────────────────────────────────── */}
        {tab === 'saldos' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="card-sm" style={{ borderLeft:`3px solid ${color}` }}>
                <p className="text-xs text-text-hint mb-1">Total MXN</p>
                <p className="text-2xl font-bold" style={{ color }}>{fmt(balances?.totalMxn||0)}</p>
              </div>
              <div className="card-sm" style={{ borderLeft:'3px solid #3b82f6' }}>
                <p className="text-xs text-text-hint mb-1">Total USD</p>
                <p className="text-2xl font-bold text-blue-400">
                  ${(balances?.totalUsd||0).toFixed(2)} USD
                </p>
              </div>
            </div>

            <div className="card p-0 overflow-hidden">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Cuenta</th>
                    <th>Tipo</th>
                    <th>Moneda</th>
                    <th className="text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {(balances?.accounts||[]).map((a: any) => (
                    <tr key={a.accountId}>
                      <td className="font-medium">{a.accountName}</td>
                      <td><span className="badge-gray text-xs">{a.type}</span></td>
                      <td>{a.currency}</td>
                      <td className="text-right font-bold"
                        style={{ color: a.balance>=0 ? color : '#f87171' }}>
                        {a.currency==='USD' ? `$${a.balance.toFixed(2)} USD` : fmt(a.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── RATIO 33% ────────────────────────────────────── */}
        {tab === 'ratio' && ratio && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="card-sm" style={{ borderLeft:`3px solid ${color}` }}>
                <p className="text-xs text-text-hint mb-1">Venta total del período</p>
                <p className="text-xl font-bold" style={{ color }}>{fmt(ratio.totalSale)}</p>
              </div>
              <div className="card-sm" style={{ borderLeft:'3px solid #3b82f6' }}>
                <p className="text-xs text-text-hint mb-1">Llegó al banco</p>
                <p className="text-xl font-bold text-blue-400">{fmt(ratio.totalBank)}</p>
              </div>
              <div className="card-sm" style={{ borderLeft:'3px solid #10b981' }}>
                <p className="text-xs text-text-hint mb-1">En efectivo</p>
                <p className="text-xl font-bold text-green-400">{fmt(ratio.totalCash)}</p>
              </div>
            </div>

            <div className="card">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-text-muted">% de la venta que llegó al banco</span>
                <span className="font-bold text-lg" style={{ color }}>{fmtPct(ratio.ratio)}</span>
              </div>
              <div className="h-3 bg-bg-tertiary rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{ width:`${Math.min((ratio.ratio||0)*100,100)}%`, background:color }}/>
              </div>
              <p className="text-xs text-text-hint mt-2">
                {ratio.ratio < 0.25
                  ? '⚠ Bajo — revisar depósitos pendientes'
                  : ratio.ratio > 0.85
                    ? '✓ Excelente cobertura bancaria'
                    : '✓ Nivel normal'}
              </p>
            </div>
          </div>
        )}

        {/* ── ARQUEO ───────────────────────────────────────── */}
        {tab === 'arqueo' && (
          <div className="space-y-4">
            <ArqueoForm
              accounts={balances?.accounts||[]}
              color={color}
              onSubmit={data => arqueoM.mutate(data)}
              loading={arqueoM.isPending}
            />
            {arqueos.length > 0 && (
              <div className="card p-0 overflow-hidden">
                <table className="table-base">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Cuenta</th>
                      <th className="text-right">Teórico</th>
                      <th className="text-right">Físico</th>
                      <th className="text-right">Diferencia</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {arqueos.map((a: any) => (
                      <tr key={a.id}>
                        <td>{a.date?.slice(0,10)}</td>
                        <td>{a.cashAccount?.name}</td>
                        <td className="text-right">{fmt(a.theoreticalBalance)}</td>
                        <td className="text-right">{fmt(a.physicalCount)}</td>
                        <td className="text-right font-bold"
                          style={{ color: Math.abs(a.difference)<1?'#10b981':'#f87171' }}>
                          {a.difference>=0?'+':''}{fmt(a.difference)}
                        </td>
                        <td>
                          <span className={Math.abs(a.difference)<1?'badge-green':'badge-red'}>
                            {Math.abs(a.difference)<1?'Cuadrado':'Diferencia'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TRASPASOS ────────────────────────────────────── */}
        {tab === 'traspasos' && (
          <TraspasoForm
            accounts={balances?.accounts||[]}
            color={color}
            onSubmit={data => transferM.mutate(data)}
            loading={transferM.isPending}
            success={transferM.isSuccess}
          />
        )}
      </div>
    </AppLayout>
  );
}

// ── Formulario de arqueo ──────────────────────────────────────
function ArqueoForm({ accounts, color, onSubmit, loading }: any) {
  const today = new Date().toISOString().slice(0,10);
  const [accountId, setAccountId] = useState('');
  const [date,      setDate]      = useState(today);
  const [counts,    setCounts]    = useState<Record<string,number>>({});
  const [notes,     setNotes]     = useState('');

  const billetes = [...BILLETES_MN.map(b=>({val:b,label:`$${b}`,tipo:'MN'})),
                    ...MONEDAS_MN.map(m=>({val:m,label:`$${m}`,tipo:'MN_MON'})),
                    ...BILLETES_USD.map(b=>({val:b,label:`$${b}USD`,tipo:'USD'}))];

  const totalMN  = BILLETES_MN.reduce((t,b)=>t+b*(counts[`MN_${b}`]||0),0)
                 + MONEDAS_MN.reduce((t,m)=>t+m*(counts[`MN_MON_${m}`]||0),0);
  const totalUSD = BILLETES_USD.reduce((t,b)=>t+b*(counts[`USD_${b}`]||0),0);

  const handleSubmit = () => {
    onSubmit({
      cashAccountId: accountId,
      date,
      physicalCount: totalMN,
      countDetail: { billetes_mn:counts, totalUSD },
      differenceNotes: notes,
      branchId: 'unica',
    });
  };

  return (
    <div className="card space-y-4">
      <h3 className="font-semibold">Arqueo de caja</h3>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-text-hint mb-1 block">Cuenta a arquear</label>
          <select className="input-base text-sm" value={accountId} onChange={e=>setAccountId(e.target.value)}>
            <option value="">— Seleccionar —</option>
            {accounts.map((a:any)=><option key={a.accountId} value={a.accountId}>{a.accountName}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-text-hint mb-1 block">Fecha del arqueo</label>
          <input type="date" className="input-base text-sm" value={date} onChange={e=>setDate(e.target.value)}/>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Billetes MN */}
        <div>
          <p className="text-xs font-semibold text-text-hint mb-2 uppercase">Billetes MXN</p>
          {BILLETES_MN.map(b=>(
            <div key={b} className="flex items-center gap-2 mb-1.5">
              <span className="text-xs w-16 text-text-muted">${b}</span>
              <input type="number" min="0" className="input-base text-xs text-right flex-1"
                value={counts[`MN_${b}`]||''} placeholder="0"
                onChange={e=>setCounts(c=>({...c,[`MN_${b}`]:+e.target.value}))}/>
              <span className="text-xs text-text-hint w-20 text-right">{fmt(b*(counts[`MN_${b}`]||0))}</span>
            </div>
          ))}
        </div>
        {/* Monedas MN */}
        <div>
          <p className="text-xs font-semibold text-text-hint mb-2 uppercase">Monedas MXN</p>
          {MONEDAS_MN.map(m=>(
            <div key={m} className="flex items-center gap-2 mb-1.5">
              <span className="text-xs w-16 text-text-muted">${m}</span>
              <input type="number" min="0" className="input-base text-xs text-right flex-1"
                value={counts[`MN_MON_${m}`]||''} placeholder="0"
                onChange={e=>setCounts(c=>({...c,[`MN_MON_${m}`]:+e.target.value}))}/>
              <span className="text-xs text-text-hint w-20 text-right">{fmt(m*(counts[`MN_MON_${m}`]||0))}</span>
            </div>
          ))}
        </div>
        {/* Dólares */}
        <div>
          <p className="text-xs font-semibold text-text-hint mb-2 uppercase">Dólares USD</p>
          {BILLETES_USD.map(b=>(
            <div key={b} className="flex items-center gap-2 mb-1.5">
              <span className="text-xs w-16 text-text-muted">${b}</span>
              <input type="number" min="0" className="input-base text-xs text-right flex-1"
                value={counts[`USD_${b}`]||''} placeholder="0"
                onChange={e=>setCounts(c=>({...c,[`USD_${b}`]:+e.target.value}))}/>
              <span className="text-xs text-text-hint w-20 text-right">${b*(counts[`USD_${b}`]||0)} USD</span>
            </div>
          ))}
        </div>
      </div>

      {/* Totales */}
      <div className="bg-bg-tertiary rounded-lg p-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-text-hint">Total físico MXN</p>
          <p className="text-xl font-bold" style={{ color }}>{fmt(totalMN)}</p>
        </div>
        <div>
          <p className="text-xs text-text-hint">Total físico USD</p>
          <p className="text-xl font-bold text-blue-400">${totalUSD.toFixed(2)} USD</p>
        </div>
      </div>

      <div>
        <label className="text-xs text-text-hint mb-1 block">Notas del arqueo</label>
        <input className="input-base text-sm" value={notes} onChange={e=>setNotes(e.target.value)}
          placeholder="Observaciones, diferencias justificadas…"/>
      </div>

      <div className="flex justify-end">
        <button className="btn-primary text-white" style={{ background:color }}
          onClick={handleSubmit}
          disabled={loading || !accountId}>
          {loading?'Guardando…':'Guardar arqueo'}
        </button>
      </div>
    </div>
  );
}

// ── Formulario de traspaso ────────────────────────────────────
function TraspasoForm({ accounts, color, onSubmit, loading, success }: any) {
  const today = new Date().toISOString().slice(0,10);
  const [form, setForm] = useState({
    fromAccountId:'', toAccountId:'', amount:'',
    currency:'MXN', date:today, reference:'', notes:'',
  });
  const set = (k:string,v:any) => setForm(f=>({...f,[k]:v}));

  return (
    <div className="card space-y-4">
      <div>
        <h3 className="font-semibold">Traspaso entre cuentas</h3>
        <p className="text-xs text-text-hint mt-0.5">Los traspasos no afectan el Estado de Resultados</p>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3">
          <p className="text-sm text-green-400">✓ Traspaso registrado correctamente</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-text-hint mb-1 block">Cuenta origen</label>
          <select className="input-base text-sm" value={form.fromAccountId} onChange={e=>set('fromAccountId',e.target.value)}>
            <option value="">— Seleccionar —</option>
            {accounts.map((a:any)=><option key={a.accountId} value={a.accountId}>{a.accountName} ({fmt(a.balance)})</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-text-hint mb-1 block">Cuenta destino</label>
          <select className="input-base text-sm" value={form.toAccountId} onChange={e=>set('toAccountId',e.target.value)}>
            <option value="">— Seleccionar —</option>
            {accounts.filter((a:any)=>a.accountId!==form.fromAccountId).map((a:any)=>(
              <option key={a.accountId} value={a.accountId}>{a.accountName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-text-hint mb-1 block">Monto *</label>
          <input type="number" min="0.01" step="0.01" className="input-base text-sm text-right font-bold"
            style={{ color }} value={form.amount} onChange={e=>set('amount',e.target.value)} placeholder="0.00"/>
        </div>
        <div>
          <label className="text-xs text-text-hint mb-1 block">Fecha</label>
          <input type="date" className="input-base text-sm" value={form.date} onChange={e=>set('date',e.target.value)}/>
        </div>
        <div className="col-span-2">
          <label className="text-xs text-text-hint mb-1 block">Notas / Referencia</label>
          <input className="input-base text-sm" value={form.notes} onChange={e=>set('notes',e.target.value)}
            placeholder="Motivo del traspaso…"/>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="btn-primary text-white" style={{ background:color }}
          onClick={() => onSubmit({...form, amount:Number(form.amount)})}
          disabled={loading || !form.fromAccountId || !form.toAccountId || !form.amount}>
          {loading?'Procesando…':'Registrar traspaso'}
        </button>
      </div>
    </div>
  );
}
