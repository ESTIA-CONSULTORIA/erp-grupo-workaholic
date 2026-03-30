import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CompanyAccess {
  companyId:   string;
  companyCode: string;
  companyName: string;
  color:       string;
  roleCode:    string;
  permissions: string[];
}

interface User {
  id:          string;
  email:       string;
  name:        string;
  companies:   CompanyAccess[];
  permissions: string[];
}

interface ERPStore {
  // Auth
  user:        User | null;
  token:       string | null;
  setAuth:     (user: User, token: string) => void;
  logout:      () => void;

  // Empresa activa
  activeCompany:   CompanyAccess | null;
  setActiveCompany:(company: CompanyAccess) => void;

  // Mes activo
  activePeriod:    string;
  setActivePeriod: (period: string) => void;

  // Sucursal activa (para Lonche)
  activeBranchId:  string | null;
  setActiveBranch: (id: string | null) => void;

  // Helpers
  hasPermission:   (perm: string) => boolean;
  isAdmin:         () => boolean;
}

export const useERPStore = create<ERPStore>()(
  persist(
    (set, get) => ({
      user:          null,
      token:         null,
      activeCompany: null,
      activeBranchId:null,
      activePeriod: (() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      })(),

      setAuth: (user, token) => {
        localStorage.setItem('erp_token', token);
        localStorage.setItem('erp_user',  JSON.stringify(user));
        set({
          user, token,
          activeCompany: user.companies[0] || null,
        });
      },

      logout: () => {
        localStorage.removeItem('erp_token');
        localStorage.removeItem('erp_user');
        set({ user: null, token: null, activeCompany: null });
        window.location.href = '/login';
      },

      setActiveCompany: (company) => set({ activeCompany: company }),
      setActivePeriod:  (period)  => set({ activePeriod:  period  }),
      setActiveBranch:  (id)      => set({ activeBranchId: id      }),

      hasPermission: (perm) => {
        const { activeCompany } = get();
        if (!activeCompany) return false;
        return activeCompany.permissions.includes(perm) ||
               activeCompany.roleCode === 'admin';
      },

      isAdmin: () => get().activeCompany?.roleCode === 'admin',
    }),
    {
      name:    'erp-store',
      partialize: (s) => ({
        user:          s.user,
        token:         s.token,
        activeCompany: s.activeCompany,
        activePeriod:  s.activePeriod,
        activeBranchId:s.activeBranchId,
      }),
    }
  )
);
