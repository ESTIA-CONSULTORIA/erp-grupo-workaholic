'use client';
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useERPStore } from '@/store/erp.store';
import { api, fmt, fmtDate } from '@/lib/api';
import AppLayout from '@/components/layout/AppLayout';

const STATUS_BADGE: Record<string, string> = {
  CARGADO:               'badge-gray',
  PROCESANDO:            'badge-blue',
  PENDIENTE_VALIDACION:  'badge-amber',
  VALIDADO:              'badge-green',
  RECHAZADO:             'badge-red',
  ARCHIVADO:             'badge-gray',
};

const STATUS_LABEL: Record<string, string> = {
  CARGADO:               'Cargado',
  PROCESANDO:            'Procesando…',
  PENDIENTE_VALIDACION:  'Pendiente revisión',
  VALIDADO:              'Validado',
  RECHAZADO:             'Rechazado',
  ARCHIVADO:             'Archivado',
};

export default function DocumentosPage() {
  const { activeCompany } = useERPStore();
  const cid   = activeCompany?.companyId;
  const color = activeCompany?.color || '#3b82f6';
  const qc    = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('');

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['documents', cid, filterStatus],
    queryFn:  () => api.get(`/companies/${cid}/documents${filterStatus?`?status=${filterStatus}`:''}`).then(r => r.data),
    enabled:  !!cid,
    refetchInterval: 5000, // refresca cada 5s para ver cambios de estado
  });

  // Subir archivo
  const uploadM = useMutation({
    mutationFn: async (file: File) => {
      // Convertir a base64
      const base64 = await new Promise<string>((res, rej) => {
        const reader = new FileReader();
        reader.onload = e => res((e.target?.result as string).split(',')[1]);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
      // Por ahora guardamos base64 como fileUrl (en producción se sube a R2 primero)
      return api.post(`/companies/${cid}/documents`, {
        type:     'TICKET',
        fileUrl:  `data:${file.type};base64,${base64}`,
        fileName: file.name,
        mimeType: file.type,
      });
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['documents', cid] });
      // Auto-lanzar extracción IA
      extractM.mutate(res.data.id);
    },
  });

  // Extraer con IA
  const extractM = useMutation({
    mutationFn: (docId: string) => api.post(`/companies/${cid}/documents/${docId}/extract`),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['documents', cid] }),
  });

  // Validar
  const validateM = useMutation({
    mutationFn: ({ docId, data }: { docId: string; data: any }) =>
      api.put(`/companies/${cid}/documents/${docId}/validate`, { validatedData: data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents', cid] });
      setSelected(null);
    },
  });

  // Rechazar
  const rejectM = useMutation({
    mutationFn: (docId: string) => api.put(`/companies/${cid}/documents/${docId}/reject`),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['documents', cid] });
      setSelected(null);
    },
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadM.mutate(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  const pending = docs.filter((d: any) => d.status === 'PENDIENTE_VALIDACION').length;

  return (
    <AppLayout>
      <div className="max-w-4xl space-y-5">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Bandeja documental</h1>
            {pending > 0 && (
              <p className="text-sm text-amber-400 mt-0.5">
                ⚠ {pending} documento{pending>1?'s':''} pendiente{pending>1?'s':''} de revisión
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <input ref={fileRef} type="file" accept="image/*,.pdf"
              className="hidden" onChange={handleFile}/>
            <button
              className="btn-primary text-white"
              style={{ background: color }}
              onClick={() => fileRef.current?.click()}
              disabled={uploadM.isPending}
            >
              {uploadM.isPending ? 'Subiendo…' : '📷 Subir ticket / factura'}
            </button>
          </div>
        </div>

        {/* Filtros por estado */}
        <div className="flex gap-2 flex-wrap">
          {['', 'PENDIENTE_VALIDACION', 'VALIDADO', 'RECHAZADO', 'CARGADO'].map(st => (
            <button key={st}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filterStatus === st
                  ? 'border-current text-white'
                  : 'border-border text-text-hint hover:border-border-light'
              }`}
              style={filterStatus === st ? { background: color, borderColor: color } : {}}
              onClick={() => setFilterStatus(st)}
            >
              {st === '' ? 'Todos' : STATUS_LABEL[st]}
              {st === 'PENDIENTE_VALIDACION' && pending > 0 && (
                <span className="ml-1 bg-amber-500 text-white rounded-full w-4 h-4 inline-flex items-center justify-center text-[10px]">
                  {pending}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Lista de documentos */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="text-center py-12 text-text-hint">Cargando…</div>
          ) : docs.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-4xl mb-3">📄</p>
              <p className="text-text-muted font-medium">Sin documentos</p>
              <p className="text-text-hint text-sm mt-1">
                Sube una foto de ticket o factura para comenzar
              </p>
            </div>
          ) : docs.map((doc: any) => (
            <div key={doc.id}
              className="card flex items-center gap-4 cursor-pointer hover:border-border-light transition-colors"
              onClick={() => doc.status === 'PENDIENTE_VALIDACION' && setSelected(doc)}>
              {/* Preview */}
              <div className="w-14 h-14 rounded-lg bg-bg-tertiary flex items-center justify-center flex-shrink-0 overflow-hidden">
                {doc.fileUrl?.startsWith('data:image') ? (
                  <img src={doc.fileUrl} alt="" className="w-full h-full object-cover"/>
                ) : (
                  <span className="text-2xl">📄</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium truncate">{doc.fileName}</span>
                  <span className={STATUS_BADGE[doc.status]}>{STATUS_LABEL[doc.status]}</span>
                </div>
                <p className="text-xs text-text-hint">
                  {fmtDate(doc.createdAt)} · Subido por {doc.user?.name}
                </p>
                {doc.extractedJson?.proveedor && (
                  <p className="text-xs text-text-muted mt-0.5">
                    {doc.extractedJson.proveedor}
                    {doc.extractedJson.total && ` · ${fmt(doc.extractedJson.total)}`}
                    {doc.extractedJson.fecha  && ` · ${doc.extractedJson.fecha}`}
                  </p>
                )}
              </div>

              {/* Acciones */}
              <div className="flex gap-2 flex-shrink-0">
                {doc.status === 'CARGADO' && (
                  <button
                    className="text-xs text-blue-400 hover:underline"
                    onClick={e => { e.stopPropagation(); extractM.mutate(doc.id); }}
                    disabled={extractM.isPending}
                  >
                    Extraer IA
                  </button>
                )}
                {doc.status === 'PENDIENTE_VALIDACION' && (
                  <span className="text-xs text-amber-400 font-medium">Clic para revisar →</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal de validación */}
        {selected && (
          <ValidacionModal
            doc={selected}
            color={color}
            onValidate={data => validateM.mutate({ docId: selected.id, data })}
            onReject={() => rejectM.mutate(selected.id)}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </AppLayout>
  );
}

// ── Modal de validación (el usuario revisa y confirma los datos) ─
function ValidacionModal({ doc, color, onValidate, onReject, onClose }: any) {
  const extracted = doc.extractedJson || {};
  const [form, setForm] = useState({
    proveedor:  extracted.proveedor  || '',
    fecha:      extracted.fecha      || new Date().toISOString().slice(0,10),
    total:      extracted.total      || '',
    moneda:     extracted.moneda     || 'MXN',
    metodoPago: extracted.metodo_pago|| 'efectivo',
    folio:      extracted.folio      || '',
    notas:      extracted.notas      || '',
  });

  const set = (k: string, v: any) => setForm(f => ({...f,[k]:v}));

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-secondary rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-border flex justify-between">
          <div>
            <h2 className="font-bold">Revisar documento extraído</h2>
            <p className="text-xs text-text-hint mt-0.5">
              Verifica o corrige los datos antes de confirmar
            </p>
          </div>
          <button onClick={onClose} className="text-text-hint hover:text-text">✕</button>
        </div>

        <div className="p-5 grid grid-cols-2 gap-4">
          {/* Vista previa */}
          <div>
            <p className="text-xs font-semibold text-text-hint uppercase mb-2">Documento</p>
            {doc.fileUrl?.startsWith('data:image') ? (
              <img src={doc.fileUrl} alt="" className="w-full rounded-lg object-contain max-h-64"/>
            ) : (
              <div className="w-full h-48 bg-bg-tertiary rounded-lg flex items-center justify-center">
                <span className="text-4xl">📄</span>
              </div>
            )}
            {extracted.conceptos?.length > 0 && (
              <div className="mt-3 bg-bg-tertiary rounded-lg p-3">
                <p className="text-xs font-semibold text-text-hint mb-1">Conceptos detectados:</p>
                {extracted.conceptos.map((c: string, i: number) => (
                  <p key={i} className="text-xs text-text-muted">• {c}</p>
                ))}
              </div>
            )}
          </div>

          {/* Formulario editable */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-text-hint uppercase">Datos extraídos (edita si hay errores)</p>

            <Campo label="Proveedor">
              <input className="input-base text-sm" value={form.proveedor}
                onChange={e => set('proveedor',e.target.value)}/>
            </Campo>
            <Campo label="Fecha">
              <input type="date" className="input-base text-sm" value={form.fecha}
                onChange={e => set('fecha',e.target.value)}/>
            </Campo>
            <Campo label="Total *">
              <input type="number" min="0" step="0.01"
                className="input-base text-sm font-bold text-right"
                style={{ color }}
                value={form.total} onChange={e => set('total',e.target.value)}/>
            </Campo>
            <div className="grid grid-cols-2 gap-2">
              <Campo label="Moneda">
                <select className="input-base text-sm" value={form.moneda}
                  onChange={e => set('moneda',e.target.value)}>
                  <option value="MXN">MXN</option>
                  <option value="USD">USD</option>
                </select>
              </Campo>
              <Campo label="Método de pago">
                <select className="input-base text-sm" value={form.metodoPago}
                  onChange={e => set('metodoPago',e.target.value)}>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </Campo>
            </div>
            <Campo label="No. Folio / Factura">
              <input className="input-base text-sm" value={form.folio}
                onChange={e => set('folio',e.target.value)} placeholder="Opcional"/>
            </Campo>
            <Campo label="Notas">
              <input className="input-base text-sm" value={form.notas}
                onChange={e => set('notas',e.target.value)} placeholder="Opcional"/>
            </Campo>
          </div>
        </div>

        <div className="p-5 border-t border-border flex justify-between">
          <button onClick={onReject}
            className="text-red-400 text-sm hover:underline">
            Rechazar documento
          </button>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary text-sm">Cancelar</button>
            <button
              className="btn-primary text-white text-sm"
              style={{ background: color }}
              onClick={() => onValidate(form)}
              disabled={!form.total}
            >
              ✓ Confirmar y guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Campo({ label, children }: any) {
  return (
    <div>
      <label className="text-xs text-text-hint mb-1 block">{label}</label>
      {children}
    </div>
  );
}
