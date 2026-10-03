import React from 'react';
import { 
  Home, 
  Users, 
  FolderKanban, 
  Camera, 
  BrainCircuit, 
  Package, 
  BarChart3, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Code2,
  Database,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { User, UserRole } from '../../types';

export type ActiveTab = 
  | 'dashboard' 
  | 'clients' 
  | 'projects' 
  | 'evidences' 
  | 'ai-classifications' 
  | 'inventory' 
  | 'analytics' 
  | 'admin'
  | 'architecture';

interface SidebarProps {
  currentUser: User;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
  counts: {
    clients: number;
    projects: number;
    evidences: number;
    classifications: number;
    inventory: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  onLogout,
  counts,
}) => {
  const getInitials = (name: string) => {
    if (!name) return 'CL';
    const clean = name.replace(/^(Ing\.|Arq\.|Cap\.|Dr\.|Lic\.)\s+/i, '').trim();
    const parts = clean.split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'Administrador':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Auditor':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cliente':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const allNavItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: currentUser.role === 'Cliente' ? 'Mi Resumen' : 'Dashboard',
      icon: Home,
      badge: null,
      allowedRoles: ['Administrador', 'Auditor', 'Cliente'],
    },
    {
      id: 'clients' as ActiveTab,
      label: 'Clientes',
      icon: Users,
      badge: counts.clients,
      allowedRoles: ['Administrador', 'Auditor'],
    },
    {
      id: 'projects' as ActiveTab,
      label: currentUser.role === 'Cliente' ? 'Mis Proyectos' : 'Proyectos',
      icon: FolderKanban,
      badge: counts.projects,
      allowedRoles: ['Administrador', 'Auditor', 'Cliente'],
    },
    {
      id: 'evidences' as ActiveTab,
      label: currentUser.role === 'Cliente' ? 'Mis Evidencias' : 'Evidencias',
      icon: Camera,
      badge: counts.evidences,
      allowedRoles: ['Administrador', 'Auditor', 'Cliente'],
    },
    {
      id: 'ai-classifications' as ActiveTab,
      label: 'Clasificaciones IA',
      icon: BrainCircuit,
      badge: counts.classifications,
      highlight: true,
      allowedRoles: ['Administrador', 'Auditor', 'Cliente'],
    },
    {
      id: 'inventory' as ActiveTab,
      label: 'Inventario',
      icon: Package,
      badge: counts.inventory,
      allowedRoles: ['Administrador', 'Auditor'],
    },
    {
      id: 'analytics' as ActiveTab,
      label: currentUser.role === 'Cliente' ? 'Mis Reportes' : 'Analítica & Reportes',
      icon: BarChart3,
      badge: null,
      allowedRoles: ['Administrador', 'Auditor', 'Cliente'],
    },
    {
      id: 'admin' as ActiveTab,
      label: currentUser.role === 'Auditor' ? 'Auditoría Forense' : 'Administración',
      icon: Settings,
      badge: null,
      allowedRoles: ['Administrador', 'Auditor'],
    },
    {
      id: 'architecture' as ActiveTab,
      label: 'Arquitectura & Código',
      icon: Code2,
      badge: 'FastAPI/MySQL',
      customBadgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      allowedRoles: ['Administrador'],
    }
  ];

  const navItems = allNavItems.filter(item => item.allowedRoles.includes(currentUser.role));

  return (
    <aside 
      className={`bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-300 z-20 shrink-0 ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      <div className="p-3">
        {/* Collapse toggle button */}
        <div className={`flex items-center mb-4 ${isCollapsed ? 'justify-center' : 'justify-end'}`}>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title={isCollapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative group cursor-pointer ${
                  isActive
                    ? 'bg-[#1E3A8A] text-white shadow-sm shadow-blue-900/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'}`}>
                  <Icon className="w-4 h-4" />
                </div>

                {!isCollapsed && (
                  <span className="ml-3 truncate tracking-tight text-[13px]">
                    {item.label}
                  </span>
                )}

                {/* Badge indicator */}
                {!isCollapsed && item.badge !== null && (
                  <span 
                    className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      item.customBadgeColor || (
                        isActive 
                          ? 'bg-blue-800 text-blue-100 border-blue-700' 
                          : item.highlight 
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                      )
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Active indicator bar */}
                {isActive && isCollapsed && (
                  <span className="absolute right-1 w-1.5 h-6 bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile & Session */}
      <div className="p-3 border-t border-slate-100 space-y-2">
        {!isCollapsed ? (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1E3A8A] to-[#3B82F6] text-white flex items-center justify-center font-bold text-xs ring-2 ring-blue-100 shrink-0 select-none">
                {getInitials(currentUser.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                  {currentUser.name}
                </p>
                <div className="flex items-center space-x-1 mt-0.5">
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${getRoleBadgeStyle(currentUser.role)}`}>
                    {currentUser.role}
                  </span>
                </div>
              </div>
            </div>
            {currentUser.companyName && (
              <div className="mt-2 pt-2 border-t border-slate-200/50 flex items-center text-[10px] text-slate-500 truncate">
                <Building2 className="w-3 h-3 text-slate-400 mr-1 shrink-0" />
                <span className="truncate font-medium">{currentUser.companyName}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center mb-1" title={`${currentUser.name} (${currentUser.role})`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1E3A8A] to-[#3B82F6] text-white flex items-center justify-center font-bold text-xs ring-2 ring-blue-100 shrink-0 select-none">
              {getInitials(currentUser.name)}
            </div>
          </div>
        )}

        <button
          onClick={() => {
            if (confirm('¿Desea cerrar la sesión actual de COLORLINK?')) {
              onLogout();
            }
          }}
          className={`w-full flex items-center py-2 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer ${
            isCollapsed ? 'justify-center' : 'space-x-3'
          }`}
          title="Cerrar sesión de COLORLINK"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
};
