// ── gastos/page.tsx ───────────────────────────────────────────
'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useERPStore } from '@/store/erp.store';
import { api, fmt, fmtDate } from '@/lib/api';
import AppLayout from '@/components/layout/AppLayout';
import { useRouter } from 'next/navigation';

export default function GastosPage() {
  const { activeCompany, activePeriod } = useERPStore();
  const cid   = activeCompany?.companyId;
  const color = activeCompany?.color || '#f59e0b';
  const qc    = useQueryClient();
  const router = useRouter();
  const [view, setView] = useState<'list'|'new'>('list');
  const [showExternal, setShowExternal] = useState(false);

  const { data: gastos = [], isLoading } = useQuery({
    queryKey: ['expenses', cid, activePeriod, showExternal],
    queryFn:  () => api.get(`/companies/${cid}/expenses?period=${activePeriod}&isExternal=${showExternal}`).then(r => r.data),
    enabled:  !!cid,
  });

  const { data: rubros = [] } = useQuery({
    queryKey: ['rubrics-expenses', cid],
    queryFn:  () => api.get(`/companies/${cid}/schema/rubrics/expenses`).then(r => r.data),
    enabled:  !!cid,
  });

  const { data: cuentas = [] } = useQuery({
    queryKey: ['cash-accounts', cid],
    queryFn:  () => api.get(`/companies/${cid}/flow/balances`).then(r => r.data?.accounts || []),
    enabled:  !!cid,
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers', cid],
    queryFn:  () => api.get(`/companies/${cid}/suppliers`).then(r => r.data).catch(() => []),
    enabled:  !!cid,
  });

  const createM = useMutation({
    mutationFn: (data: any) => api.post(`/companies/${cid}/expenses`, data),
    onSuccess:  () => { qc.invalidateQueries({ queryKey:['expenses',cid] }); setView('list'); },
  });

  const deleteM = useMutation({
    mutationFn: (id: string) => api.delete(`/companies/${cid}/expenses/${id}`),
    onSuccess:  () => qc.invalidateQueries({ queryKey:['expenses',cid] }),
  });

  const totalMes = gastos.reduce((t:number,g:any) => t+Number(g.total||0), 0);

  return (
    <AppLayout>
      <div className="max-w-5xl space-y-5">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Gastos y Compras</h1>
            <p className="text-sm text-text-hint mt-0.5">
              {gastos.length} registros · Total:{' '}
              <span className="font-semibold" style={{color}}>{fmt(totalMes)}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${showExternal?'border-red-500 text-red-400':'border-border text-text-hint'}`}
              onClick={() => setShowExternal(!showExternal)}
            >
              {showExternal ? '✓ Operaciones externas' : 'Operaciones externas'}
            </button>
            <button
              className="text-xs px-3 py-1.5 rounded-full border border-border text-text-hint hover:border-border-light"
              onClick={() => router.push('/documentos')}
            >
              📷 Subir ticket
            </button>
            <button
              className="btn-primary text-white text-sm"
              style={{background:color}}
              onClick={() => setView(view==='new'?'list':'new')}
            >
              {view==='new'?'← Volver':'+ Registrar gasto'}
            </button>
          </div>
        </div>

        {view === 'new' && (
          <GastoForm
            rubros={rubros} cuentas={cuentas} suppliers={suppliers} color={color}
            onSubmit={data => createM.mutate(data)}
            loading={createM.isPending}
            error={createM.error?.message}
          />
        )}

        <div className="card p-0 overflow-hidden">
          <table className="table-base">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Concepto</th>
                <th>Proveedor</th>
                <th>Rubro</th>
                <th>Método</th>
                <th className="text-right">Monto</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-8 text-text-hint">Cargando…</td></tr>
              ) : gastos.length===0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-text-hint">Sin gastos registrados</td></tr>
              ) : gastos.map((g:any) => (
                <tr key={g.id}>
                  <td>{fmtDate(g.date)}</td>
                  <td className="max-w-[160px] truncate">{g.concept}</td>
                  <td>{g.supplier?.name||'—'}</td>
                  <td><span className="text-xs bg-bg-tertiary px-1.5 py-0.5 rounded">{g.rubric?.name||'—'}</span></td>
                  <td><span className="text-xs capitalize">{g.paymentMethod||'—'}</span></td>
                  <td className="text-right font-semibold" style={{color}}>{fmt(g.total)}</td>
                  <td>
                    <span className={g.paymentStatus==='PAGADO'?'badge-green':'badge-amber'}>
                      {g.paymentStatus}
                    </span>
                    {g.isExternal && <span className="badge-red ml-1">Ext.</span>}
                  </td>
                  <td>
                    <button className="text-xs text-red-400 hover:underline"
                      onClick={() => {if(window.confirm('¿Eliminar?')) deleteM.mutate(g.id);}}>
                      Eliminar
                    </button>
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

function GastoForm({ rubros, cuentas, suppliers, color, onSubmit, loading, error }: any) {
  const today = new Date().toISOString().slice(0,10);
  const [form, setForm] = useState({
    date:today, rubricId:'', supplierId:'', cashAccountId:'',
    concept:'', subtotal:'', tax:'', currency:'MXN',
    paymentStatus:'PAGADO', paymentMethod:'efectivo',
    invoiceRef:'', isExternal:false, externalNotes:'',
  });
  const set = (k:string,v:any) => setForm(f=>({...f,[k]:v}));
  const total = Number(form.subtotal||0) + Number(form.tax||0);

  return (
    <div className="card space-y-4">
      <h3 className="font-semibold">Registrar gasto / compra</h3>
      <div className="grid grid-cols-3 gap-3">
        <Campo label="Rubro *">
          <select className="input-base text-sm" value={form.rubricId} onChange={e=>set('rubricId',e.target.value)}>
            <option value="">— Seleccionar —</option>
            {rubros.map((r:any)=><option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </Campo>
        <Campo label="Concepto *">
          <input className="input-base text-sm" value={form.concept} onChange={e=>set('concept',e.target.value)} placeholder="Descripción del gasto"/>
        </Campo>
        <Campo label="Proveedor">
          <select className="input-base text-sm" value={form.supplierId} onChange={e=>set('supplierId',e.target.value)}>
            <option value="">— Opcional —</option>
            {suppliers.map((s:any)=><option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Campo>
        <Campo label="Subtotal *">
          <input type="number" min="0" step="0.01" className="input-base text-sm text-right" value={form.subtotal} onChange={e=>set('subtotal',e.target.value)} placeholder="0.00"/>
        </Campo>
        <Campo label="IVA">
          <input type="number" min="0" step="0.01" className="input-base text-sm text-right" value={form.tax} onChange={e=>set('tax',e.target.value)} placeholder="0.00"/>
        </Campo>
        <Campo label="Total">
          <div className="input-base text-sm text-right font-bold" style={{color}}>{fmt(total)}</div>
        </Campo>
        <Campo label="Método de pago">
          <select className="input-base text-sm" value={form.paymentMethod} onChange={e=>set('paymentMethod',e.target.value)}>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="tarjeta">Tarjeta</option>
          </select>
        </Campo>
        <Campo label="Estado">
          <select className="input-base text-sm" value={form.paymentStatus} onChange={e=>set('paymentStatus',e.target.value)}>
            <option value="PAGADO">Pagado</option>
            <option value="PENDIENTE">Pendiente (CxP)</option>
          </select>
        </Campo>
        <Campo label="Cuenta de flujo">
          <select className="input-base text-sm" value={form.cashAccountId} onChange={e=>set('cashAccountId',e.target.value)} disabled={form.paymentStatus==='PENDIENTE'}>
            <option value="">— Seleccionar —</option>
            {cuentas.map((c:any)=><option key={c.accountId} value={c.accountId}>{c.accountName}</option>)}
          </select>
        </Campo>
        <Campo label="Fecha">
          <input type="date" className="input-base text-sm" value={form.date} onChange={e=>set('date',e.target.value)}/>
        </Campo>
        <Campo label="No. Factura">
          <input className="input-base text-sm" value={form.invoiceRef} onChange={e=>set('invoiceRef',e.target.value)} placeholder="Opcional"/>
        </Campo>
        <Campo label="">
          <label className="flex items-center gap-2 mt-4 cursor-pointer">
            <input type="checkbox" checked={form.isExternal} onChange={e=>set('isExternal',e.target.checked)} className="accent-red-500"/>
            <span className="text-sm text-red-400">Operación externa al negocio</span>
          </label>
        </Campo>
      </div>
      {form.isExternal && (
        <Campo label="Nota de operación externa">
          <input className="input-base text-sm" value={form.externalNotes} onChange={e=>set('externalNotes',e.target.value)} placeholder="Ej: Gasto personal del socio"/>
        </Campo>
      )}
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex justify-end gap-3">
        <button className="btn-primary text-white" style={{background:color}}
          onClick={() => onSubmit({...form,subtotal:Number(form.subtotal),tax:Number(form.tax),cashAccountId:form.cashAccountId||undefined,supplierId:form.supplierId||undefined,rubricId:form.rubricId||undefined})}
          disabled={loading || !form.concept || !form.subtotal}>
          {loading?'Guardando…':'Registrar gasto'}
        </button>
      </div>
    </div>
  );
}

function Campo({ label, children }:any) {
  return (
    <div>
      {label && <label className="text-xs text-text-hint mb-1 block">{label}</label>}
      {children}
    </div>
  );
}
