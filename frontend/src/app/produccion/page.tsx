'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useERPStore } from '@/store/erp.store';
import { api, fmt } from '@/lib/api';
import AppLayout from '@/components/layout/AppLayout';

const TABS = [
  { id:'pt',        label:'Producto Terminado' },
  { id:'lotes',     label:'Producción / Lotes' },
];

const TIPO_LABELS: Record<string,string>  = { RES:'Res', CER:'Cerdo' };
const SABOR_LABELS: Record<string,string> = { NAT:'Natural', CHI:'Chile rojo', BBQ:'BBQ' };
const PRES_LABELS:  Record<string,string> = { '100G':'100g', '250G':'250g', '500G':'500g', '1KG':'1kg' };

export default function ProduccionPage() {
  const { activeCompany, activePeriod } = useERPStore();
  const cid   = activeCompany?.companyId;
  const color = activeCompany?.color || '#B5451B';
  const qc    = useQueryClient();
  const [tab, setTab] = useState('pt');

  if (activeCompany?.companyCode !== 'machete') {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-text-hint">Este módulo solo está disponible para Machete.</p>
        </div>
      </AppLayout>
    );
  }

  const { data: ptInventory = [] } = useQuery({
    queryKey: ['pt-inventory', cid],
    queryFn:  () => api.get(`/companies/${cid}/machete/inventory/pt`).then(r => r.data),
    enabled: !!cid,
  });

  const { data: batches = [] } = useQuery({
    queryKey: ['batches', cid, activePeriod],
    queryFn:  () => api.get(`/companies/${cid}/machete/batches?period=${activePeriod}`).then(r => r.data),
    enabled: !!cid && tab === 'lotes',
  });

  const { data: recipes = [] } = useQuery({
    queryKey: ['recipes', cid],
    queryFn:  () => api.get(`/companies/${cid}/machete/recipes`).then(r => r.data),
    enabled: !!cid && tab === 'lotes',
  });

  const statusM = useMutation({
    mutationFn: ({ id, status }:{ id:string; status:string }) =>
      api.put(`/companies/${cid}/machete/batches/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey:['batches',cid] }),
  });

  // Alertas de stock bajo
  const alertas = ptInventory.filter((p:any) => p.lowStock);

  return (
    <AppLayout>
      <div className="max-w-5xl space-y-5">
        <div>
          <h1 className="text-2xl font-bold">Producción e Inventarios — Machete</h1>
          {alertas.length > 0 && (
            <div className="mt-2 flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
              <span className="text-red-400 text-sm">⚠ {alertas.length} producto{alertas.length>1?'s':''} bajo mínimo:</span>
              {alertas.slice(0,5).map((p:any) => (
                <span key={p.id} className="badge-red text-xs">{p.name}</span>
              ))}
            </div>
          )}
        </div>

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

        {/* ── PRODUCTO TERMINADO ────────────────────────────── */}
        {tab === 'pt' && (
          <div className="space-y-3">
            {['RES','CER'].map(tipo => (
              <div key={tipo} className="card p-0 overflow-hidden">
                <div className="px-5 py-3 border-b border-border" style={{ background:color+'11' }}>
                  <p className="text-sm font-bold" style={{ color }}>{TIPO_LABELS[tipo]}</p>
                </div>
                <table className="table-base">
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Sabor</th>
                      <th>Presentación</th>
                      <th className="text-right">Stock</th>
                      <th className="text-right">Mínimo</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ptInventory
                      .filter((p:any) => p.meatType === tipo)
                      .map((p:any) => (
                        <tr key={p.id}>
                          <td><code className="text-xs bg-bg-tertiary px-1.5 py-0.5 rounded">{p.sku}</code></td>
                          <td>{SABOR_LABELS[p.flavor]||p.flavor}</td>
                          <td>{PRES_LABELS[p.presentation]||p.presentation}</td>
                          <td className="text-right font-bold"
                            style={{ color: p.lowStock ? '#f87171' : '#10b981' }}>
                            {p.stock} pzas
                          </td>
                          <td className="text-right text-text-hint">{p.minStock}</td>
                          <td>
                            <span className={p.lowStock ? 'badge-red' : 'badge-green'}>
                              {p.lowStock ? '⚠ Bajo mínimo' : '✓ OK'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}

        {/* ── LOTES ─────────────────────────────────────────── */}
        {tab === 'lotes' && (
          <div className="space-y-4">
            <NuevoLoteForm
              recipes={recipes}
              companyId={cid!}
              color={color}
              onSuccess={() => qc.invalidateQueries({ queryKey:['batches',cid] })}
            />

            {batches.length > 0 && (
              <div className="card p-0 overflow-hidden">
                <table className="table-base">
                  <thead>
                    <tr>
                      <th>Receta</th>
                      <th>Inicio</th>
                      <th className="text-right">kg entrada</th>
                      <th className="text-right">kg salida</th>
                      <th className="text-right">Rendimiento</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map((b:any) => {
                      const rend = b.realYield ? (b.realYield*100).toFixed(1)+'%' : '—';
                      const ok   = b.yieldOk !== false;
                      return (
                        <tr key={b.id}>
                          <td><code className="text-xs bg-bg-tertiary px-1.5 py-0.5 rounded">{b.recipeKey}</code></td>
                          <td>{b.startDate?.slice(0,10)}</td>
                          <td className="text-right">{b.kgInput} kg</td>
                          <td className="text-right">{b.kgOutput ? `${b.kgOutput} kg` : '—'}</td>
                          <td className="text-right font-semibold"
                            style={{ color: b.status==='TERMINADO' ? (ok?'#10b981':'#f87171') : '#64748b' }}>
                            {rend}
                          </td>
                          <td>
                            <span className={
                              b.status==='TERMINADO'?'badge-green':
                              b.status==='SECANDO'?'badge-blue':
                              'badge-amber'
                            }>{b.status}</span>
                          </td>
                          <td>
                            {b.status === 'MARINANDO' && (
                              <button className="text-xs text-blue-400 hover:underline"
                                onClick={() => statusM.mutate({id:b.id, status:'SECANDO'})}>
                                → Secando
                              </button>
                            )}
                            {b.status === 'SECANDO' && (
                              <CerrarLoteBtn batch={b} recipes={recipes} color={color} companyId={cid!}
                                onSuccess={() => {
                                  qc.invalidateQueries({ queryKey:['batches',cid] });
                                  qc.invalidateQueries({ queryKey:['pt-inventory',cid] });
                                }}/>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {batches.length === 0 && (
              <p className="text-text-hint text-sm text-center py-8">Sin lotes en este período</p>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

// ── Formulario nuevo lote ─────────────────────────────────────
function NuevoLoteForm({ recipes, companyId, color, onSuccess }: any) {
  const today = new Date().toISOString().slice(0,10);
  const [open,    setOpen]    = useState(false);
  const [recipe,  setRecipe]  = useState('');
  const [kgInput, setKgInput] = useState('');
  const [date,    setDate]    = useState(today);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  const selectedRecipe = recipes.find((r:any) => r.id === recipe);

  // Calcular insumos necesarios
  const insumosPlan = selectedRecipe && kgInput
    ? selectedRecipe.ingredients.map((ing:any) => ({
        inputName: ing.inputName,
        quantity:  +((Number(kgInput) * 1000 / 100) * ing.quantityPer100g).toFixed(4),
        unit:      ing.unit,
      }))
    : [];

  const guardar = async () => {
    if (!recipe || !kgInput) { setError('Selecciona receta y kg objetivo'); return; }
    setError(''); setSaving(true);
    try {
      await api.post(`/companies/${companyId}/machete/batches`, {
        recipeId:   recipe,
        recipeKey:  selectedRecipe.key,
        startDate:  date,
        kgInput:    Number(kgInput),
        inputsUsed: insumosPlan,
      });
      setOpen(false); setRecipe(''); setKgInput('');
      onSuccess();
    } catch(e: any) {
      setError(e.response?.data?.message || 'Error al iniciar lote');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Iniciar nuevo lote de producción</h3>
        <button className="text-sm text-blue-400 hover:underline"
          onClick={() => setOpen(!open)}>
          {open ? '▲ Cerrar' : '▼ Nuevo lote'}
        </button>
      </div>

      {open && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-text-hint mb-1 block">Receta (tipo × sabor)</label>
              <select className="input-base text-sm" value={recipe}
                onChange={e => setRecipe(e.target.value)}>
                <option value="">— Seleccionar —</option>
                {recipes.map((r:any) => (
                  <option key={r.id} value={r.id}>
                    {r.key} (rendimiento teórico: {(r.theoreticalYield*100).toFixed(0)}%)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-hint mb-1 block">kg de producto objetivo</label>
              <input type="number" min="0.1" step="0.1" className="input-base text-sm text-right"
                value={kgInput} onChange={e => setKgInput(e.target.value)} placeholder="0.0 kg"/>
            </div>
            <div>
              <label className="text-xs text-text-hint mb-1 block">Fecha de inicio</label>
              <input type="date" className="input-base text-sm" value={date}
                onChange={e => setDate(e.target.value)}/>
            </div>
          </div>

          {insumosPlan.length > 0 && (
            <div className="bg-bg-tertiary rounded-lg p-3">
              <p className="text-xs font-semibold text-text-hint uppercase mb-2">
                Insumos que se descontarán del inventario:
              </p>
              <div className="grid grid-cols-3 gap-2">
                {insumosPlan.map((ing:any) => (
                  <div key={ing.inputName} className="text-xs text-text-muted">
                    <span className="font-medium">{ing.inputName}:</span>{' '}
                    {ing.quantity.toFixed(3)} {ing.unit}
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex justify-end">
            <button className="btn-primary text-white text-sm"
              style={{ background:color }}
              onClick={guardar} disabled={saving || !recipe || !kgInput}>
              {saving ? 'Iniciando…' : 'Iniciar lote (descuenta MP)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Botón para cerrar lote ────────────────────────────────────
function CerrarLoteBtn({ batch, recipes, color, companyId, onSuccess }: any) {
  const [open,    setOpen]    = useState(false);
  const [kgSalida,setKgSalida]= useState('');
  const [dist,    setDist]    = useState<Record<string,string>>({});
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  // SKUs de esta receta
  const recipe = recipes.find((r:any) => r.id === batch.recipeId);

  const cerrar = async () => {
    if (!kgSalida) { setError('Ingresa kg de salida'); return; }
    const distribution = Object.entries(dist)
      .filter(([,v]) => Number(v)>0)
      .map(([sku, units]) => ({ sku, units: Number(units) }));
    if (distribution.length === 0) { setError('Ingresa las unidades producidas por SKU'); return; }
    setError(''); setSaving(true);
    try {
      await api.put(`/companies/${companyId}/machete/batches/${batch.id}/close`, {
        kgOutput:     Number(kgSalida),
        distribution,
        endDate:      new Date().toISOString().slice(0,10),
      });
      onSuccess();
    } catch(e:any) {
      setError(e.response?.data?.message || 'Error al cerrar lote');
    } finally {
      setSaving(false);
    }
  };

  const PRES = ['100G','250G','500G','1KG'];
  const tipos = batch.recipeKey.split('-');
  const skus  = PRES.map(p => `${tipos[0]}-${tipos[1]}-${p}`);

  return (
    <>
      <button className="text-xs text-green-400 hover:underline"
        onClick={() => setOpen(true)}>
        Terminar lote
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-secondary rounded-xl w-full max-w-md">
            <div className="p-5 border-b border-border flex justify-between">
              <h3 className="font-semibold">Cerrar lote {batch.recipeKey}</h3>
              <button onClick={() => setOpen(false)} className="text-text-hint hover:text-text">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs text-text-hint mb-1 block">kg de producto obtenido</label>
                <input type="number" min="0" step="0.01" className="input-base text-right font-bold"
                  style={{ color }}
                  value={kgSalida} onChange={e => setKgSalida(e.target.value)} placeholder="0.00 kg"/>
                {kgSalida && (
                  <p className="text-xs text-text-hint mt-1">
                    Rendimiento: {(Number(kgSalida)/Number(batch.kgInput)*100).toFixed(1)}%
                    (teórico: {(recipes.find((r:any)=>r.id===batch.recipeId)?.theoreticalYield*100).toFixed(0)}%)
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs text-text-hint mb-2 block">Distribución por SKU (unidades producidas)</label>
                <div className="grid grid-cols-2 gap-2">
                  {skus.map(sku => (
                    <div key={sku}>
                      <label className="text-xs text-text-hint mb-1 block">{sku.split('-').pop()}</label>
                      <input type="number" min="0" className="input-base text-sm text-right"
                        value={dist[sku]||''} placeholder="0 piezas"
                        onChange={e => setDist(d => ({...d,[sku]:e.target.value}))}/>
                    </div>
                  ))}
                </div>
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-3">
              <button className="btn-secondary text-sm" onClick={() => setOpen(false)}>Cancelar</button>
              <button className="btn-primary text-white text-sm"
                style={{ background:color }}
                onClick={cerrar} disabled={saving}>
                {saving ? 'Cerrando…' : 'Cerrar lote y cargar PT'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
