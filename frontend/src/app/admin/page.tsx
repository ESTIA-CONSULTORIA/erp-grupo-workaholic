'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useERPStore } from '@/store/erp.store';
import { api } from '@/lib/api';
import AppLayout from '@/components/layout/AppLayout';

const TABS = [
  { id:'usuarios', label:'Usuarios' },
  { id:'esquema',  label:'Esquema financiero' },
  { id:'cuentas',  label:'Cuentas de flujo' },
];

export default function AdminPage() {
  const { activeCompany, isAdmin } = useERPStore(s => ({ activeCompany:s.activeCompany, isAdmin:s.isAdmin }));
  const cid   = activeCompany?.companyId;
  const color = activeCompany?.color || '#3b82f6';
  const [tab, setTab] = useState('usuarios');

  if (!isAdmin()) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-text-hint">No tienes permisos para acceder a esta sección.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl space-y-5">
        <h1 className="text-2xl font-bold">Administración</h1>

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

        {tab === 'usuarios'  && <TabUsuarios cid={cid!} color={color}/>}
        {tab === 'esquema'   && <TabEsquema  cid={cid!} color={color}/>}
        {tab === 'cuentas'   && <TabCuentas  cid={cid!} color={color}/>}
      </div>
    </AppLayout>
  );
}

// ── Tab: Usuarios ─────────────────────────────────────────────
function TabUsuarios({ cid, color }: any) {
  const qc = useQueryClient();
  const { data: usuarios = [] } = useQuery({
    queryKey: ['company-users', cid],
    queryFn:  () => api.get(`/companies/${cid}/users`).then(r => r.data),
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn:  () => api.get('/roles').then(r => r.data).catch(() => []),
  });

  const removeM = useMutation({
    mutationFn: (userId: string) => api.delete(`/companies/${cid}/users/${userId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['company-users', cid] }),
  });

  return (
    <div className="space-y-4">
      <div className="card p-0 overflow-hidden">
        <table className="table-base">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u: any) => (
              <tr key={u.user.id}>
                <td className="font-medium">{u.user.name}</td>
                <td className="text-text-hint">{u.user.email}</td>
                <td>
                  <span className="badge-blue capitalize">{u.role.name}</span>
                </td>
                <td>
                  <span className={u.user.isActive?'badge-green':'badge-red'}>
                    {u.user.isActive?'Activo':'Inactivo'}
                  </span>
                </td>
                <td>
                  <button className="text-xs text-red-400 hover:underline"
                    onClick={() => { if(window.confirm('¿Quitar acceso?')) removeM.mutate(u.user.id); }}>
                    Quitar acceso
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3 className="text-sm font-semibold mb-3">Asignar acceso a usuario existente</h3>
        <InviteUserForm cid={cid} color={color} roles={roles}
          onSuccess={() => qc.invalidateQueries({ queryKey: ['company-users', cid] })}/>
      </div>
    </div>
  );
}

function InviteUserForm({ cid, color, roles, onSuccess }: any) {
  const [email,  setEmail]  = useState('');
  const [roleId, setRoleId] = useState('');
  const [msg,    setMsg]    = useState('');

  const assignM = useMutation({
    mutationFn: async (data: any) => {
      // Buscar usuario por email primero
      const user = await api.get(`/users/by-email?email=${data.email}`);
      return api.post(`/companies/${cid}/users`, { userId: user.data.id, roleId: data.roleId });
    },
    onSuccess: () => { setEmail(''); setRoleId(''); setMsg('✓ Usuario asignado'); onSuccess(); setTimeout(()=>setMsg(''),3000); },
    onError:   () => setMsg('Usuario no encontrado. Primero debe registrarse en el sistema.'),
  });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="text-xs text-text-hint mb-1 block">Email del usuario</label>
          <input className="input-base text-sm" type="email" value={email}
            onChange={e=>setEmail(e.target.value)} placeholder="usuario@email.com"/>
        </div>
        <div>
          <label className="text-xs text-text-hint mb-1 block">Rol</label>
          <select className="input-base text-sm" value={roleId} onChange={e=>setRoleId(e.target.value)}>
            <option value="">— Seleccionar —</option>
            {roles.map((r:any)=><option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
      </div>
      {msg && <p className={`text-sm ${msg.startsWith('✓')?'text-green-400':'text-red-400'}`}>{msg}</p>}
      <button className="btn-primary text-white text-sm" style={{background:color}}
        onClick={() => assignM.mutate({email,roleId})}
        disabled={!email||!roleId||assignM.isPending}>
        {assignM.isPending?'Buscando…':'Asignar acceso'}
      </button>
    </div>
  );
}

// ── Tab: Esquema financiero ───────────────────────────────────
function TabEsquema({ cid, color }: any) {
  const qc = useQueryClient();
  const { data: schema, isLoading } = useQuery({
    queryKey: ['schema', cid],
    queryFn:  () => api.get(`/companies/${cid}/schema`).then(r => r.data),
  });

  const renameM = useMutation({
    mutationFn: ({ id, name }:{ id:string; name:string }) =>
      api.put(`/companies/${cid}/schema/rubrics/${id}/name`, { name }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schema', cid] }),
  });

  const toggleM = useMutation({
    mutationFn: ({ id, isActive }:{ id:string; isActive:boolean }) =>
      api.put(`/companies/${cid}/schema/rubrics/${id}/toggle`, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schema', cid] }),
  });

  if (isLoading) return <p className="text-text-hint text-sm">Cargando esquema…</p>;

  return (
    <div className="space-y-4">
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-4 py-3">
        <p className="text-sm text-blue-400">
          Puedes renombrar cualquier rubro sin afectar la lógica del sistema.
          Los cálculos se basan en los atributos del rubro, no en su nombre.
        </p>
      </div>

      {(schema?.sections||[]).map((section: any) => (
        <div key={section.id} className="card p-0 overflow-hidden">
          <div className="px-5 py-3 border-b border-border" style={{ background:color+'11' }}>
            <p className="text-sm font-bold uppercase tracking-wide" style={{ color }}>
              {section.name}
            </p>
          </div>
          {(section.groups||[]).flatMap((group: any) =>
            (group.rubrics||[]).map((r: any) => (
              <RubroRow key={r.id} rubro={r} color={color}
                onRename={name => renameM.mutate({id:r.id, name})}
                onToggle={active => toggleM.mutate({id:r.id, isActive:active})}/>
            ))
          )}
        </div>
      ))}
    </div>
  );
}

function RubroRow({ rubro, color, onRename, onToggle }: any) {
  const [editing, setEditing] = useState(false);
  const [name,    setName]    = useState(rubro.name);

  return (
    <div className="flex items-center justify-between px-5 py-2 border-b border-border/30 hover:bg-bg-tertiary/20">
      <div className="flex-1">
        {editing ? (
          <input className="input-base text-sm py-1 max-w-xs"
            value={name} onChange={e=>setName(e.target.value)}
            onBlur={() => { onRename(name); setEditing(false); }}
            onKeyDown={e => e.key==='Enter' && (onRename(name),setEditing(false))}
            autoFocus/>
        ) : (
          <span className={`text-sm ${rubro.isActive?'text-text-muted':'text-text-hint line-through'}`}>
            {rubro.name}
          </span>
        )}
        <span className="ml-2 text-xs text-text-hint">{rubro.rubricType}</span>
      </div>
      <div className="flex items-center gap-3">
        <button className="text-xs text-blue-400 hover:underline"
          onClick={() => setEditing(!editing)}>
          {editing?'Guardar':'Renombrar'}
        </button>
        <button className={`text-xs ${rubro.isActive?'text-red-400':'text-green-400'} hover:underline`}
          onClick={() => onToggle(!rubro.isActive)}>
          {rubro.isActive?'Ocultar':'Activar'}
        </button>
      </div>
    </div>
  );
}

// ── Tab: Cuentas de flujo ─────────────────────────────────────
function TabCuentas({ cid, color }: any) {
  const { data: balances } = useQuery({
    queryKey: ['balances', cid],
    queryFn:  () => api.get(`/companies/${cid}/flow/balances`).then(r => r.data),
  });

  return (
    <div className="card p-0 overflow-hidden">
      <table className="table-base">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Moneda</th>
            <th>Banco</th>
            <th className="text-right">Saldo actual</th>
          </tr>
        </thead>
        <tbody>
          {(balances?.accounts||[]).map((a: any) => (
            <tr key={a.accountId}>
              <td><code className="text-xs bg-bg-tertiary px-1.5 py-0.5 rounded">{a.accountCode}</code></td>
              <td className="font-medium">{a.accountName}</td>
              <td><span className="badge-gray text-xs">{a.type}</span></td>
              <td>{a.currency}</td>
              <td>{a.bankName||'—'}</td>
              <td className="text-right font-bold" style={{color}}>
                {a.currency==='USD'?`$${a.balance.toFixed(2)} USD`:new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(a.balance)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
