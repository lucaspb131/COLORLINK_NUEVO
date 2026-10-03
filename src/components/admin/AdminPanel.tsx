import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Users, 
  Key, 
  Clock, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  FileText,
  Database,
  Cpu,
  UserPlus,
  Mail,
  Copy,
  Check,
  X,
  Send,
  Building2
} from 'lucide-react';
import { User, AuditLog, UserRole } from '../../types';
import { CURRENT_USER, INITIAL_AUDIT_LOGS } from '../../data/initialData';
import { apiService } from '../../services/apiService';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'roles' | 'audit' | 'config'>('roles');

  const defaultUsersList: User[] = [
    CURRENT_USER,
    {
      id: 'usr-002',
      name: 'Ing. Laura Pardo',
      email: 'laura.pardo@colorlink.tech',
      role: 'Auditor',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
      department: 'Auditoría Técnica NACE & Trazabilidad',
    },
    {
      id: 'usr-cli-001',
      name: 'Ing. Roberto Silva',
      email: 'rsilva@petrocaribe.com.co',
      role: 'Cliente',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250',
      department: 'Gerencia de Mantenimiento',
      companyName: 'Petroquímica del Caribe S.A.',
    },
  ];

  const [users, setUsers] = useState<User[]>(defaultUsersList);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Formulario de nuevo usuario
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: 'Auditor' as UserRole,
    companyName: '',
    department: '',
  });

  // Feedback de credenciales generadas
  const [createdFeedback, setCreatedFeedback] = useState<{
    user: User;
    tempPassword: string;
    emailSent: boolean;
    message: string;
  } | null>(null);

  const [copiedPassword, setCopiedPassword] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);

  // Carga de usuarios y logs desde Supabase
  useEffect(() => {
    async function loadData() {
      try {
        const loadedUsers = await apiService.getUsers();
        if (loadedUsers && loadedUsers.length > 0) {
          setUsers(loadedUsers);
        }
        const loadedLogs = await apiService.getAuditLogs();
        if (loadedLogs && loadedLogs.length > 0) {
          setAuditLogs(loadedLogs);
        }
      } catch (err) {
        console.warn('Error loading admin data:', err);
      }
    }
    loadData();
  }, []);

  const handleResendInvitation = async (user: User) => {
    try {
      setResendingId(user.id);
      const res = await apiService.resendUserInvitation(user);
      setCreatedFeedback({
        user,
        tempPassword: res.tempPassword,
        emailSent: res.success,
        message: res.message
      });
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error al reenviar invitación.');
    } finally {
      setResendingId(null);
    }
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await apiService.inviteOrRegisterUser({
        name: newUserForm.name,
        email: newUserForm.email,
        role: newUserForm.role,
        companyName: newUserForm.role === 'Cliente' ? newUserForm.companyName : undefined,
        department: newUserForm.department,
      });

      setUsers(prev => [res.user, ...prev]);
      setCreatedFeedback(res);
      setIsInviteModalOpen(false);
      setNewUserForm({
        name: '',
        email: '',
        role: 'Auditor',
        companyName: '',
        department: '',
      });

      // Recargar logs
      apiService.getAuditLogs().then(logs => {
        if (logs) setAuditLogs(logs);
      });
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error al aprovisionar el usuario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCredentials = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  const permissionsMatrix = [
    { module: 'Gestión Completa del Sistema y Configuración', admin: true, auditor: false, cliente: false },
    { module: 'Gestión y Alta de Clientes / Empresas', admin: true, auditor: true, cliente: false },
    { module: 'Creación y Edición de Proyectos (Wizard 9 Pasos)', admin: true, auditor: false, cliente: true },
    { module: 'Consulta de Trazabilidad y Especificaciones', admin: true, auditor: true, cliente: true },
    { module: 'Inspección de Evidencias Fotográficas (SHA-256)', admin: true, auditor: true, cliente: true },
    { module: 'Ejecución y Revisión de Clasificación IA Gemini', admin: true, auditor: true, cliente: true },
    { module: 'Gestión de Inventario de Recubrimientos', admin: true, auditor: true, cliente: false },
    { module: 'Generación de Reportes Técnicos y Certificación', admin: true, auditor: true, cliente: true },
    { module: 'Consulta de Logs de Auditoría y Seguridad', admin: true, auditor: true, cliente: false },
    { module: 'Eliminación y Descarte de Registros', admin: true, auditor: false, cliente: false },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" />
            <span>Gobernanza, Seguridad & Configuración</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Panel de Administración del Sistema
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestión de roles y permisos empresariales (RBAC), registro forense de auditoría y parámetros del modelo Gemini.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'roles' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Usuarios & Roles
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'audit' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Logs de Auditoría
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'config' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Configuración IA
          </button>
        </div>
      </div>

      {/* TAB 1: ROLES & USERS */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          {/* Users List */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Personal Autorizado en COLORLINK
                </h3>
                <p className="text-[11px] text-slate-500">
                  Usuarios activos con credenciales y privilegios auditados en Supabase Auth.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Invitar / Crear Usuario</span>
              </button>
            </div>

            {/* Banner de Feedback de Usuario Creado */}
            {createdFeedback && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Usuario Aprovisionado con Éxito</span>
                  </div>
                  <button 
                    onClick={() => setCreatedFeedback(null)}
                    className="text-slate-400 hover:text-slate-600 text-[11px]"
                  >
                    Cerrar
                  </button>
                </div>
                <p className="text-[11px] text-emerald-800">{createdFeedback.message}</p>
                <div className="bg-white p-3 rounded-lg border border-emerald-200 flex items-center justify-between font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400">Usuario: </span>
                    <strong>{createdFeedback.user.email}</strong>
                    <span className="mx-2 text-slate-300">|</span>
                    <span className="text-slate-400">Clave Temporal: </span>
                    <strong className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">{createdFeedback.tempPassword}</strong>
                  </div>
                  <button
                    onClick={() => handleCopyCredentials(`Usuario: ${createdFeedback.user.email} | Clave: ${createdFeedback.tempPassword}`)}
                    className="flex items-center space-x-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    {copiedPassword ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPassword ? 'Copiado' : 'Copiar Credenciales'}</span>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map(u => (
                <div key={u.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1E3A8A] to-[#3B82F6] text-white flex items-center justify-center font-bold text-xs ring-2 ring-blue-100 shrink-0">
                      {u.name.replace(/^(Ing\.|Arq\.|Lic\.)\s+/i, '').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <strong className="text-xs text-slate-900 block truncate">{u.name}</strong>
                      <span className="text-[10px] text-slate-400 block truncate">{u.email}</span>
                      {u.companyName && (
                        <span className="text-[9px] text-slate-500 font-medium truncate flex items-center mt-0.5">
                          <Building2 className="w-2.5 h-2.5 mr-0.5 inline text-slate-400" />
                          {u.companyName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {u.role}
                      </span>
                      <span className="text-slate-500 text-[10px] truncate max-w-[85px]">{u.department}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleResendInvitation(u)}
                      disabled={resendingId === u.id}
                      className="px-2 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded text-[10px] font-bold text-slate-600 transition-colors flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                      title="Reenviar correo corporativo con credenciales temporales"
                    >
                      <Send className="w-3 h-3 text-blue-600" />
                      <span>{resendingId === u.id ? 'Enviando...' : 'Reenviar'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Matrix Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50">
              <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                Matriz de Control de Acceso Basado en Roles (RBAC)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Módulo Funcional</th>
                    <th className="py-3 px-4 text-center">Administrador (Total)</th>
                    <th className="py-3 px-4 text-center">Auditor (Lectura & Trazabilidad)</th>
                    <th className="py-3 px-4 text-center">Cliente (Empresa Propia)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {permissionsMatrix.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-medium text-slate-800">{item.module}</td>
                      <td className="py-3 px-4 text-center">
                        {item.admin ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <Lock className="w-3.5 h-3.5 text-slate-300 mx-auto" />}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.auditor ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <Lock className="w-3.5 h-3.5 text-slate-300 mx-auto" />}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.cliente ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <Lock className="w-3.5 h-3.5 text-slate-300 mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
              Trazabilidad Pericial & Registro de Eventos
            </h3>
            <span className="text-[11px] font-mono text-slate-500">
              Inmutable • Retención 5 Años
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {INITIAL_AUDIT_LOGS.map(log => (
              <div key={log.id} className="p-4 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {log.targetType}: {log.targetId}
                    </span>
                  </div>
                  <p className="text-slate-600">{log.details}</p>
                </div>

                <div className="text-left sm:text-right text-[11px] text-slate-400 font-mono shrink-0">
                  <div>{log.user} ({log.role})</div>
                  <div>{log.timestamp} • IP: {log.ipAddress}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CONFIG */}
      {activeTab === 'config' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <h3 className="font-extrabold text-sm text-slate-900">
            Parámetros del Motor de Inteligencia y Estándares
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Modelo LLM Primario</span>
              <div className="flex items-center space-x-2 font-mono font-bold text-slate-900 text-sm">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span>gemini-3.8-flash</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Configurado con responseMimeType: "application/json" para inferencia determinista de sistemas multicapa.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Estándar de Corrosión</span>
              <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>ISO 12944:2018 (Partes 1 a 9)</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Clasificación de agresividad C1 a C5 y durabilidad requerida H (&gt; 15 años).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INVITAR / APROVISIONAR USUARIO (AUDITOR O CLIENTE) */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 ring-4 ring-blue-50/50">
              <UserPlus className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-1">
              Aprovisionar Usuario & Invitar
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Crea la cuenta en Supabase Auth, vincula la empresa, genera credenciales temporales y despacha la invitación corporativa con plantilla oficial.
            </p>

            {errorMessage && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  placeholder="Ej. Ing. Daniel Osorio"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Correo Electrónico Corporativo *
                </label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="usuario@empresa.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Rol en la Plataforma *
                  </label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as UserRole })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer"
                  >
                    <option value="Auditor">Auditor (Lectura & Trazabilidad)</option>
                    <option value="Cliente">Cliente (Empresa Asociada)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Departamento / Área
                  </label>
                  <input
                    type="text"
                    value={newUserForm.department}
                    onChange={(e) => setNewUserForm({ ...newUserForm, department: e.target.value })}
                    placeholder="Ej. Control de Calidad"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {newUserForm.role === 'Cliente' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Empresa u Organización Asociada *
                  </label>
                  <input
                    type="text"
                    required={newUserForm.role === 'Cliente'}
                    value={newUserForm.companyName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, companyName: e.target.value })}
                    placeholder="Ej. Petroquímica del Caribe S.A."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    El usuario Cliente tendrá aislamiento RLS estricto y solo verá registros de esta empresa.
                  </span>
                </div>
              )}

              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-[11px] text-blue-900 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>Automatización de Correo y Credenciales:</span>
                </div>
                <p className="text-[10px] text-blue-800 leading-snug">
                  Al enviar, el sistema generará una contraseña temporal cifrada, creará el registro en Supabase Auth y despachará la plantilla HTML oficial de bienvenida.
                </p>
              </div>

              <div className="flex items-center space-x-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-900/20 transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Aprovisionando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Crear e Invitar</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
