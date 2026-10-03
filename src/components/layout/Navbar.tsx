import React from 'react';
import { 
  Search, 
  Bell, 
  PlusCircle, 
  ShieldCheck, 
  Layers, 
  Sparkles,
  AlertTriangle,
  Building2
} from 'lucide-react';
import { User, UserRole } from '../../types';

interface NavbarProps {
  currentUser: User;
  onRoleChange: (role: UserRole) => void;
  onOpenNewProjectWizard: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  pendingCount: number;
  alertsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onRoleChange,
  onOpenNewProjectWizard,
  searchQuery,
  onSearchChange,
  pendingCount,
  alertsCount,
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

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'Administrador':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Auditor':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cliente':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };
  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between shadow-xs">
      {/* Brand logo & tagline */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1E3A8A] to-[#3B82F6] flex items-center justify-center text-white shadow-md shadow-blue-900/20">
          <Layers className="w-5 h-5 text-white" />
        </div>
        <div className="hidden sm:block">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] bg-clip-text text-transparent">
              COLORLINK
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-blue-50 text-blue-700 border border-blue-200">
              SaaS v2.4
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium -mt-0.5">
            Transformación Digital Inteligente en Pintura y Recubrimientos
          </p>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por cliente, proyecto, sustrato, código COL-2026..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Actions, Role Switcher & User */}
      <div className="flex items-center space-x-3">
        {/* Quick create wizard button */}
        <button
          onClick={onOpenNewProjectWizard}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-lg text-xs font-semibold shadow-sm transition-all hover:shadow active:scale-95 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-blue-300" />
          <span>Nueva Solicitud</span>
          <span className="hidden xl:inline text-[10px] bg-blue-800/80 px-1.5 py-0.5 rounded text-blue-200 ml-1">
            9 Pasos
          </span>
        </button>

        {/* Dynamic Alerts Badge */}
        {alertsCount > 0 && (
          <div className="hidden md:flex items-center space-x-1 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>{alertsCount} Alertas</span>
          </div>
        )}

        {/* Role Switcher for Testing Enterprise RBAC */}
        <div className="hidden sm:flex items-center space-x-1.5 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <select
            value={currentUser.role}
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
            className="text-xs bg-transparent border-0 font-bold text-slate-700 focus:ring-0 cursor-pointer pr-1"
            title="Rol activo de la sesión"
          >
            <option value="Administrador">Administrador (Control Total)</option>
            <option value="Auditor">Auditor (Lectura & Trazabilidad)</option>
            <option value="Cliente">Cliente Corporativo</option>
          </select>
        </div>

        {/* User avatar & info */}
        <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200">
          {/* Avatar con Iniciales Corporativo */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1E3A8A] to-[#3B82F6] text-white flex items-center justify-center font-bold text-xs ring-2 ring-blue-100 shadow-xs shrink-0 select-none">
            {getInitials(currentUser.name)}
          </div>
          
          <div className="hidden lg:block text-left">
            <div className="flex items-center space-x-1.5">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {currentUser.name}
              </p>
              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase tracking-wider ${getRoleBadgeColor(currentUser.role)}`}>
                {currentUser.role}
              </span>
            </div>
            {currentUser.companyName ? (
              <p className="text-[10px] text-slate-500 font-medium flex items-center space-x-1 truncate max-w-[160px]">
                <Building2 className="w-3 h-3 text-slate-400 shrink-0 inline mr-0.5" />
                <span className="truncate">{currentUser.companyName}</span>
              </p>
            ) : (
              <p className="text-[10px] text-slate-400 font-medium">
                {currentUser.department || 'COLORLINK Enterprise'}
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
