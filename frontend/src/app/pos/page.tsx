'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useERPStore } from '@/store/erp.store';
import { api, fmt } from '@/lib/api';
import AppLayout from '@/components/layout/AppLayout';

const CANALES = [
  { id:'MOSTRADOR', label:'Mostrador', color:'#3b82f6',  priceKey:'priceMostrador' },
  { id:'MAYOREO',   label:'Mayoreo',   color:'#f59e0b',  priceKey:'priceMayoreo'   },
  { id:'ONLINE',    label:'Online',    color:'#10b981',  priceKey:'priceOnline'    },
  { id:'ML',        label:'Mercado Libre', color:'#ef4444', priceKey:'priceML'     },
];

const METODOS = [
  { id:'efectivo', label:'Efectivo' },
  { id:'tarjeta',  label:'Tarjeta'  },
];

export default function POSPage() {
  const { activeCompany } = useERPStore();
  const cid   = activeCompany?.companyId;
  const color = activeCompany?.color || '#B5451B';

  // Solo visible para Machete
  if (activeCompany?.companyCode !== 'machete') {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-text-hint">El POS solo está disponible para Machete.</p>
        </div>
      </AppLayout>
    );
  }

  const [canal,   setCanal]   = useState('MOSTRADOR');
  const [carrito, setCarrito] = useState<any[]>([]);
  const [metodo,  setMetodo]  = useState('efectivo');
  const [cliente, setCliente] = useState('');
  const [exito,   setExito]   = useState(false);
  const [error,   setError]   = useState('');
  const [filtroTipo,  setFiltroTipo]  = useState('');
  const [filtroSabor, setFiltroSabor] = useState('');

  const { data: inventory = [] } = useQuery({
    queryKey: ['pt-inventory', cid],
    queryFn:  () => api.get(`/companies/${cid}/machete/inventory/pt`).then(r => r.data),
    enabled:  !!cid,
    refetchInterval: 15000,
  });

  const canalConfig = CANALES.find(c => c.id === canal)!;
  const canalColor  = canalConfig.color;
  const priceKey    = canalConfig.priceKey as keyof typeof inventory[0];

  // Filtros
  const tipos  = [...new Set(inventory.map((p:any) => p.meatType))];
  const sabores= [...new Set(inventory.map((p:any) => p.flavor))];
  const filtered = inventory.filter((p:any) =>
    (!filtroTipo  || p.meatType === filtroTipo) &&
    (!filtroSabor || p.flavor   === filtroSabor)
  );

  const agregarAlCarrito = (producto: any) => {
    const precio = Number(producto[priceKey] || 0);
    const stock  = producto.stock || 0;
    if (stock <= 0) return;
    setCarrito(c => {
      const idx = c.findIndex(i => i.id === producto.id);
      if (idx >= 0) {
        if (c[idx].cantidad >= stock) return c;
        return c.map((i, j) => j === idx ? { ...i, cantidad: i.cantidad+1 } : i);
      }
      return [...c, { id:producto.id, nombre:producto.name, precio, cantidad:1, stock, sku:producto.sku }];
    });
  };

  const cambiarCantidad = (id: string, delta: number) => {
    setCarrito(c => c
      .map(i => i.id===id ? {...i, cantidad: Math.max(0, Math.min(i.cantidad+delta, i.stock))} : i)
      .filter(i => i.cantidad > 0)
    );
  };

  const total = carrito.reduce((t, i) => t + i.precio * i.cantidad, 0);

  const saleM = useMutation({
    mutationFn: () => api.post(`/companies/${cid}/machete/sales`, {
      date:          new Date().toISOString().slice(0,10),
      channel:       canal,
      clientName:    cliente || undefined,
      paymentMethod: metodo,
      lines: carrito.map(i => ({
        productId: i.id,
        quantity:  i.cantidad,
        unitPrice: i.precio,
      })),
    }),
    onSuccess: () => {
      setCarrito([]);
      setCliente('');
      setExito(true);
      setTimeout(() => setExito(false), 3000);
    },
    onError: (e: any) => setError(e.response?.data?.message || 'Error al procesar la venta'),
  });

  const TIPO_LABELS: Record<string,string>  = { RES:'Res', CER:'Cerdo' };
  const SABOR_LABELS: Record<string,string> = { NAT:'Natural', CHI:'Chile rojo', BBQ:'BBQ' };

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-120px)] gap-4">

        {/* ── CATÁLOGO ────────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-3 overflow-hidden">
          {/* Selector de canal */}
          <div className="flex gap-2 flex-wrap">
            {CANALES.map(c => (
              <button key={c.id}
                className="px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all"
                style={{
                  borderColor: c.color,
                  background:  canal===c.id ? c.color+'22' : 'transparent',
                  color:       canal===c.id ? c.color : '#64748b',
                }}
                onClick={() => setCanal(c.id)}>
                {c.label}
              </button>
            ))}
          </div>

          {/* Filtros tipo/sabor */}
          <div className="flex gap-2 flex-wrap">
            <button className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!filtroTipo?'border-current text-white':' border-border text-text-hint'}`}
              style={!filtroTipo?{background:canalColor,borderColor:canalColor}:{}}
              onClick={() => setFiltroTipo('')}>Todos los tipos</button>
            {tipos.map((t:any) => (
              <button key={t}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filtroTipo===t?'border-current text-white':'border-border text-text-hint'}`}
                style={filtroTipo===t?{background:canalColor,borderColor:canalColor}:{}}
                onClick={() => setFiltroTipo(filtroTipo===t?'':t)}>
                {TIPO_LABELS[t]||t}
              </button>
            ))}
            {sabores.map((s:any) => (
              <button key={s}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filtroSabor===s?'border-current text-white':'border-border text-text-hint'}`}
                style={filtroSabor===s?{background:canalColor+'88',borderColor:canalColor}:{}}
                onClick={() => setFiltroSabor(filtroSabor===s?'':s)}>
                {SABOR_LABELS[s]||s}
              </button>
            ))}
          </div>

          {/* Grid de productos */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map((p: any) => {
                const precio    = Number(p[priceKey] || 0);
                const stock     = p.stock || 0;
                const sinStock  = stock <= 0;
                const enCarrito = carrito.find(i => i.id === p.id);
                return (
                  <button key={p.id}
                    onClick={() => !sinStock && agregarAlCarrito(p)}
                    disabled={sinStock}
                    className="relative p-3 rounded-xl border-2 transition-all text-left"
                    style={{
                      borderColor: enCarrito ? canalColor : '#334155',
                      background:  enCarrito ? canalColor+'11' : '#1e293b',
                      opacity:     sinStock   ? 0.4 : 1,
                      cursor:      sinStock   ? 'not-allowed' : 'pointer',
                    }}>
                    {enCarrito && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold"
                        style={{ background: canalColor }}>
                        {enCarrito.cantidad}
                      </div>
                    )}
                    <div className="flex gap-1 mb-2">
                      <span className="text-xs px-1.5 py-0.5 rounded font-medium"
                        style={{ background:canalColor+'22', color:canalColor }}>
                        {TIPO_LABELS[p.meatType]||p.meatType}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-bg-tertiary text-text-hint">
                        {SABOR_LABELS[p.flavor]||p.flavor}
                      </span>
                    </div>
                    <p className="text-base font-bold">{p.gramsWeight}g</p>
                    <p className="text-lg font-bold mt-1" style={{ color:precio>0?canalColor:'#64748b' }}>
                      {precio>0 ? fmt(precio) : 'Sin precio'}
                    </p>
                    <p className={`text-xs mt-0.5 ${stock<=3?'text-red-400':'text-text-hint'}`}>
                      {sinStock ? 'Sin stock' : `${stock} piezas`}
                    </p>
                  </button>
                );
              })}
            </div>
            {filtered.length === 0 && (
              <div className="flex items-center justify-center h-48 text-text-hint text-sm">
                Sin productos con este filtro
              </div>
            )}
          </div>
        </div>

        {/* ── CARRITO ─────────────────────────────────────── */}
        <div className="w-80 flex flex-col bg-bg-secondary rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">Orden de venta</h3>
          </div>

          {/* Cliente */}
          <div className="px-4 py-3 border-b border-border">
            <input className="input-base text-sm" value={cliente}
              onChange={e => setCliente(e.target.value)}
              placeholder="Cliente / Referencia (opcional)"/>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {carrito.length === 0 ? (
              <p className="text-text-hint text-sm text-center py-8">
                Selecciona productos del catálogo
              </p>
            ) : carrito.map(item => (
              <div key={item.id} className="bg-bg rounded-lg p-3">
                <p className="text-sm font-medium mb-2">{item.nombre}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => cambiarCantidad(item.id, -1)}
                    className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-sm hover:border-border-light">
                    −
                  </button>
                  <span className="font-bold min-w-[1.5rem] text-center">{item.cantidad}</span>
                  <button onClick={() => cambiarCantidad(item.id, +1)}
                    className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-sm hover:border-border-light">
                    +
                  </button>
                  <span className="flex-1 text-right font-semibold text-sm"
                    style={{ color: canalColor }}>
                    {fmt(item.precio * item.cantidad)}
                  </span>
                  <button onClick={() => setCarrito(c => c.filter(i => i.id !== item.id))}
                    className="text-text-hint hover:text-red-400 text-sm">✕</button>
                </div>
              </div>
            ))}
          </div>

          {/* Total + pago */}
          {carrito.length > 0 && (
            <div className="p-4 border-t border-border space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-hint uppercase tracking-wide">Total</span>
                <span className="text-2xl font-bold" style={{ color: canalColor }}>{fmt(total)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {METODOS.map(m => (
                  <button key={m.id}
                    className="py-2.5 rounded-lg text-sm font-medium border-2 transition-all"
                    style={{
                      borderColor: metodo===m.id ? canalColor : '#334155',
                      background:  metodo===m.id ? canalColor+'22' : 'transparent',
                      color:       metodo===m.id ? canalColor : '#64748b',
                    }}
                    onClick={() => setMetodo(m.id)}>
                    {m.label}
                  </button>
                ))}
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <button
                className="w-full py-3 rounded-xl font-bold text-white text-base"
                style={{ background: canalColor }}
                onClick={() => { setError(''); saleM.mutate(); }}
                disabled={saleM.isPending}>
                {saleM.isPending ? 'Procesando…' : `Cobrar ${fmt(total)}`}
              </button>

              <button className="w-full text-xs text-text-hint hover:text-text transition-colors"
                onClick={() => setCarrito([])}>
                Limpiar orden
              </button>
            </div>
          )}

          {/* Éxito */}
          {exito && (
            <div className="p-6 text-center bg-green-500/10 border-t border-green-500/30">
              <div className="text-3xl mb-2">✓</div>
              <p className="font-bold text-green-400">¡Venta registrada!</p>
              <p className="text-xs text-text-hint mt-1">Stock actualizado automáticamente</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
