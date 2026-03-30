'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useERPStore } from '@/store/erp.store';
import { api, fmt } from '@/lib/api';
import AppLayout from '@/components/layout/AppLayout';

const TABS = [
  { id:'precios',  label:'Precios por SKU' },
  { id:'recetas',  label:'Recetas' },
];

const TIPO_LABELS: Record<string,string>  = { RES:'Res', CER:'Cerdo' };
const SABOR_LABELS: Record<string,string> = { NAT:'Natural', CHI:'Chile rojo', BBQ:'BBQ' };
const CANALES = ['priceMostrador','priceMayoreo','priceOnline','priceML'];
const CANAL_LABELS = ['Mostrador','Mayoreo','Online','ML'];

export default function CatalogoPage() {
  const { activeCompany } = useERPStore();
  const cid   = activeCompany?.companyId;
  const color = activeCompany?.color || '#B5451B';
  const qc    = useQueryClient();
  const [tab, setTab] = useState('precios');

  const { data: products = [] } = useQuery({
    queryKey: ['products', cid],
    queryFn:  () => api.get(`/companies/${cid}/machete/products`).then(r => r.data),
    enabled: !!cid,
  });

  const { data: recipes = [] } = useQuery({
    queryKey: ['recipes', cid],
    queryFn:  () => api.get(`/companies/${cid}/machete/recipes`).then(r => r.data),
    enabled: !!cid && tab==='recetas',
  });

  const pricesM = useMutation({
    mutationFn: ({ sku, prices }:{ sku:string; prices:any }) =>
      api.put(`/companies/${cid}/machete/products/${sku}/prices`, prices),
    onSuccess: () => { qc.invalidateQueries({queryKey:['products',cid]}); },
  });

  const recipeM = useMutation({
    mutationFn: (data:any) => api.post(`/companies/${cid}/machete/recipes`, data),
    onSuccess: () => qc.invalidateQueries({queryKey:['recipes',cid]}),
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

  return (
    <AppLayout>
      <div className="max-w-5xl space-y-5">
        <h1 className="text-2xl font-bold">Catálogo — Machete</h1>

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

        {/* ── PRECIOS ──────────────────────────────────────── */}
        {tab === 'precios' && (
          <div className="space-y-4">
            <p className="text-sm text-text-hint">
              Edita el precio por canal y haz clic en ✓ para guardar esa fila.
            </p>
            {['RES','CER'].map(tipo => (
              <div key={tipo} className="card p-0 overflow-hidden">
                <div className="px-5 py-3 border-b border-border" style={{background:color+'11'}}>
                  <p className="text-sm font-bold" style={{color}}>{TIPO_LABELS[tipo]}</p>
                </div>
                <table className="table-base">
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Sabor</th>
                      <th>Presentación</th>
                      <th className="text-right">Mostrador</th>
                      <th className="text-right">Mayoreo</th>
                      <th className="text-right">Online</th>
                      <th className="text-right">ML</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {products
                      .filter((p:any) => p.meatType === tipo)
                      .map((p:any) => (
                        <FilaPrecio key={p.id} product={p} color={color}
                          onSave={prices => pricesM.mutate({sku:p.sku, prices})}/>
                      ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}

        {/* ── RECETAS ──────────────────────────────────────── */}
        {tab === 'recetas' && (
          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-4 py-3">
              <p className="text-sm text-blue-400">
                Cada cambio en una receta crea una nueva versión.
                Los lotes de producción quedan vinculados a la versión exacta que se usó.
              </p>
            </div>

            {['RES','CER'].flatMap(tipo =>
              ['NAT','CHI','BBQ'].map(sabor => {
                const key    = `${tipo}-${sabor}`;
                const receta = recipes.find((r:any) => r.key === key);
                return (
                  <RecetaEditor key={key} recetaKey={key}
                    tipo={TIPO_LABELS[tipo]} sabor={SABOR_LABELS[sabor]}
                    receta={receta}
                    color={color}
                    onSave={data => recipeM.mutate({...data, key})}
                    saving={recipeM.isPending}/>
                );
              })
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

// ── Fila editable de precios ──────────────────────────────────
function FilaPrecio({ product: p, color, onSave }: any) {
  const [prices, setPrices] = useState({
    priceMostrador: p.priceMostrador || '',
    priceMayoreo:   p.priceMayoreo   || '',
    priceOnline:    p.priceOnline    || '',
    priceML:        p.priceML        || '',
  });
  const [saved, setSaved] = useState(false);
  const set = (k:string, v:any) => setPrices(prev => ({...prev,[k]:v}));

  const handleSave = () => {
    onSave({
      priceMostrador: Number(prices.priceMostrador)||null,
      priceMayoreo:   Number(prices.priceMayoreo)  ||null,
      priceOnline:    Number(prices.priceOnline)    ||null,
      priceML:        Number(prices.priceML)        ||null,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const SABOR_LABELS: Record<string,string> = { NAT:'Natural', CHI:'Chile rojo', BBQ:'BBQ' };
  const PRES_LABELS:  Record<string,string> = { '100G':'100g', '250G':'250g', '500G':'500g', '1KG':'1kg' };

  return (
    <tr>
      <td><code className="text-xs bg-bg-tertiary px-1.5 py-0.5 rounded">{p.sku}</code></td>
      <td>{SABOR_LABELS[p.flavor]||p.flavor}</td>
      <td>{PRES_LABELS[p.presentation]||p.presentation}</td>
      {CANALES.map(canal => (
        <td key={canal} className="text-right">
          <input type="number" min="0" step="0.5"
            className="w-20 bg-transparent text-right text-sm border border-transparent
                       hover:border-border focus:border-border-light focus:outline-none
                       rounded px-1 py-0.5 transition-colors"
            style={{ color }}
            value={(prices as any)[canal]}
            onChange={e => set(canal, e.target.value)}/>
        </td>
      ))}
      <td>
        <button className={`text-xs font-semibold ${saved?'text-green-400':'text-blue-400'} hover:underline`}
          onClick={handleSave}>
          {saved ? '✓' : 'Guardar'}
        </button>
      </td>
    </tr>
  );
}

// ── Editor de receta ──────────────────────────────────────────
function RecetaEditor({ recetaKey, tipo, sabor, receta, color, onSave, saving }: any) {
  const [open,  setOpen]  = useState(false);
  const [rend,  setRend]  = useState(receta?.theoreticalYield || 0.38);
  const [ings,  setIngs]  = useState<any[]>(receta?.ingredients || []);
  const [nota,  setNota]  = useState('');
  const [saved, setSaved] = useState(false);

  const setIng = (i:number, k:string, v:any) =>
    setIngs(list => list.map((x,j) => j===i ? {...x,[k]:v} : x));

  const guardar = async () => {
    await onSave({ theoreticalYield:rend, ingredients:ings, changeNote:nota });
    setSaved(true);
    setNota('');
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="card p-0 overflow-hidden">
      <div className="flex justify-between items-center px-5 py-3 cursor-pointer hover:bg-bg-tertiary/20"
        onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-3">
          <span className="font-semibold">{tipo} — {sabor}</span>
          <code className="text-xs bg-bg-tertiary px-1.5 py-0.5 rounded">{recetaKey}</code>
          {receta && (
            <span className="text-xs text-text-hint">
              v{receta.versionNumber} · Rendimiento: {(receta.theoreticalYield*100).toFixed(0)}%
            </span>
          )}
        </div>
        <span className="text-text-hint text-sm">{open?'▲':'▼'}</span>
      </div>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-border">
          <div className="flex items-center gap-4 mt-4">
            <label className="text-xs text-text-hint">Rendimiento teórico (0–1)</label>
            <input type="number" min="0.1" max="0.99" step="0.01"
              className="input-base w-24 text-right"
              value={rend} onChange={e=>setRend(+e.target.value)}/>
            <span className="text-sm text-text-hint">
              = {(rend*100).toFixed(0)}% · Por 1kg carne → {(rend*1000).toFixed(0)}g producto
            </span>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs text-text-hint uppercase tracking-wide">
                Ingredientes por 100g de producto terminado
              </label>
              <button className="text-xs text-blue-400 hover:underline"
                onClick={() => setIngs(i => [...i, {inputName:'',quantityPer100g:0,unit:'kg'}])}>
                + Agregar ingrediente
              </button>
            </div>
            {ings.map((ing:any, i:number) => (
              <div key={i} className="flex gap-2 items-center mb-2">
                <input className="input-base text-sm flex-1" placeholder="Nombre insumo (ej: CARNE_RES)"
                  value={ing.inputName} onChange={e=>setIng(i,'inputName',e.target.value)}/>
                <input type="number" min="0" step="0.001" className="input-base text-sm w-28 text-right"
                  value={ing.quantityPer100g||''} placeholder="Cantidad"
                  onChange={e=>setIng(i,'quantityPer100g',+e.target.value)}/>
                <select className="input-base text-sm w-20" value={ing.unit}
                  onChange={e=>setIng(i,'unit',e.target.value)}>
                  <option value="kg">kg</option>
                  <option value="lt">lt</option>
                  <option value="pza">pza</option>
                </select>
                <button className="text-red-400 hover:text-red-300 text-sm flex-shrink-0"
                  onClick={() => setIngs(list=>list.filter((_,j)=>j!==i))}>✕</button>
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs text-text-hint mb-1 block">Nota del cambio (opcional)</label>
            <input className="input-base text-sm" value={nota} onChange={e=>setNota(e.target.value)}
              placeholder="Ej: Ajuste de rendimiento por proveedor nuevo"/>
          </div>

          {saved && (
            <p className="text-green-400 text-sm">✓ Nueva versión guardada</p>
          )}

          <div className="flex justify-end">
            <button className="btn-primary text-white text-sm"
              style={{ background:color }} onClick={guardar} disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar nueva versión'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
