# ERP Grupo Workaholic

Sistema de gestión financiera multiempresa para Machete, Workaholic, Palestra y Lonche.

---

## ¿Qué necesitas antes de empezar?

1. Una computadora con internet
2. Una cuenta de correo electrónico
3. Un desarrollador que ejecute los comandos (o seguir esta guía paso a paso)

---

## Paso 1 — Crear cuentas gratuitas (tú puedes hacer esto)

### 1.1 Supabase (base de datos gratuita)
1. Ve a https://supabase.com y haz clic en **Start for free**
2. Regístrate con tu correo de Google
3. Haz clic en **New project**
4. Nombre: `erp-grupo-workaholic`
5. Database Password: escribe una contraseña segura y **guárdala**
6. Region: `us-east-1`
7. Haz clic en **Create new project** y espera ~2 minutos
8. Ve a **Settings → Database**
9. Copia los valores de **Connection string** (URI) y **Direct connection**
   - Estos son tus `DATABASE_URL` y `DIRECT_URL`

### 1.2 Vercel (hosting del frontend, gratis)
1. Ve a https://vercel.com y crea cuenta con GitHub
2. Más adelante conectarás tu repositorio aquí

### 1.3 Railway (hosting del backend, ~$5/mes o gratis con límites)
1. Ve a https://railway.app y crea cuenta
2. Más adelante desplegarás el backend aquí

---

## Paso 2 — Configurar variables de entorno

### Backend (`apps/backend/.env`)
```
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
JWT_SECRET="cambia-esto-por-una-clave-muy-larga-y-segura-2026"
FRONTEND_URL="http://localhost:3000"
```

### Frontend (`apps/frontend/.env.local`)
```
NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
```

---

## Paso 3 — Instalar y ejecutar (desarrollador)

```bash
# 1. Instalar dependencias del backend
cd apps/backend
npm install

# 2. Crear tablas en la base de datos
npx prisma db push

# 3. Cargar datos iniciales (empresas, roles, esquemas financieros)
npm run db:seed

# 4. Iniciar el backend
npm run start:dev
# → Corre en http://localhost:4000/api/v1
# → Documentación: http://localhost:4000/api/docs

# 5. En otra terminal, instalar y correr el frontend
cd apps/frontend
npm install
npm run dev
# → Corre en http://localhost:3000
```

---

## Paso 4 — Primer acceso

- URL: http://localhost:3000
- Email: `admin@grupoworkaholic.com`
- Password: `Admin2026!`

**Cambia la contraseña inmediatamente después del primer acceso.**

---

## Estructura del sistema

```
erp-grupo-workaholic/
├── apps/
│   ├── frontend/          ← Next.js (interfaz de usuario)
│   │   └── src/
│   │       ├── app/       ← Páginas (login, dashboard, cortes, etc.)
│   │       ├── components/← Componentes reutilizables
│   │       └── lib/       ← Lógica de llamadas al API
│   └── backend/           ← NestJS (servidor y lógica de negocio)
│       ├── prisma/
│       │   ├── schema.prisma  ← Modelo completo de base de datos
│       │   └── seed.ts        ← Datos iniciales
│       └── src/
│           └── modules/   ← Un módulo por funcionalidad
└── docs/                  ← Documentación adicional
```

---

## Módulos del sistema

| Módulo | Descripción |
|--------|-------------|
| Auth | Login, sesión, roles y permisos |
| Companies | Gestión de empresas (Machete, Workaholic, etc.) |
| Branches | Sucursales (especialmente Lonche: 4 sucursales) |
| Financial Schema | Configuración del Estado de Resultados por empresa |
| Cuts | Cortes diarios de venta (encabezado + líneas) |
| Flow | Flujo de efectivo y arqueos de caja |
| CxC | Cuentas por cobrar con abonos parciales |
| CxP | Cuentas por pagar con pagos parciales |
| Expenses | Gastos con separación de operaciones externas |
| Purchases | Compras de insumos/mercancía |
| Reports | Estado de resultados dinámico + consolidado |
| Documents | Escaneo de tickets y facturas con IA |

---

## Principios del sistema

1. **Datos separados por empresa** — nunca se mezclan
2. **Lógica por metadatos** — los títulos son editables sin romper nada
3. **Venta ≠ Cobranza** — un abono de CxC no infla la venta del mes
4. **Traspasos ≠ Ingresos** — mover dinero entre cuentas no afecta el ER
5. **Operaciones externas separadas** — gastos personales/socios no distorsionan el resultado operativo
6. **Validación humana** — ningún ticket escaneado se guarda sin que tú lo revises y confirmes

---

## Empresas configuradas inicialmente

| Empresa | Sucursales | A&B | Producción |
|---------|-----------|-----|-----------|
| Machete | 1 (única) | No | Sí (carne seca) |
| Workaholic | 1 (única) | Sí | No |
| Palestra | 1 (única) | Sí | No |
| Lonche | 4 (Vizcaya, Colegio, Xochimilco, Compuertas) | Sí | No |

---

## Fases de desarrollo

- [x] **Fase 1** — Base: auth, empresas, esquemas financieros, permisos
- [ ] **Fase 2** — Cortes, flujo, arqueos
- [ ] **Fase 3** — CxC, CxP, gastos, compras
- [ ] **Fase 4** — Estados financieros dinámicos, dashboard consolidado
- [ ] **Fase 5** — Bandeja documental (escaneo de tickets con IA)
- [ ] **Fase 6** — Módulo Machete: POS, inventarios, producción

---

## Contacto y soporte

Para dudas sobre configuración financiera y operativa: **tú**
Para dudas técnicas de código: **Claude** (claude.ai)
