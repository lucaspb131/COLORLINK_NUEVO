import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { ProjectWizard } from './components/wizard/ProjectWizard';
import { ProjectDetailModal } from './components/projects/ProjectDetailModal';
import { ProjectsList } from './components/projects/ProjectsList';
import { ClientsManager } from './components/clients/ClientsManager';
import { EvidenceManager } from './components/evidences/EvidenceManager';
import { ClassificationsView } from './components/classifications/ClassificationsView';
import { InventoryManager } from './components/inventory/InventoryManager';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AdminPanel } from './components/admin/AdminPanel';
import { ArchitectureViewer } from './components/architecture/ArchitectureViewer';
import { LoginScreen } from './components/auth/LoginScreen';
import { SetNewPasswordModal } from './components/auth/SetNewPasswordModal';

import { 
  Project, 
  Client, 
  User, 
  UserRole, 
  InventoryItem 
} from './types';
import { CURRENT_USER } from './data/initialData';
import { apiService } from './services/apiService';

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Estado de usuario autenticado
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const isLoggedOut = localStorage.getItem('colorlink_logged_out');
      if (isLoggedOut === 'true') {
        return null;
      }
      const saved = localStorage.getItem('colorlink_auth_user');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // storage error
    }
    return CURRENT_USER;
  });

  // Modal de recuperación de contraseña activado por enlace de correo o evento PASSWORD_RECOVERY
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      return hash.includes('type=recovery') || (hash.includes('access_token=') && hash.includes('recovery'));
    }
    return false;
  });

  // 1. Recuperar sesión activa con Supabase getSession y suscribirse con onAuthStateChange
  useEffect(() => {
    // Detectar hash de recuperación al cargar
    if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
      setIsRecoveryModalOpen(true);
    }

    async function syncSession() {
      if (localStorage.getItem('colorlink_logged_out') === 'true') {
        return;
      }
      try {
        const sessionUser = await apiService.getSession();
        if (sessionUser) {
          setCurrentUser(sessionUser);
        }
      } catch (err) {
        console.warn('Error sincronizando sesión Supabase Auth:', err);
      }
    }
    syncSession();

    const { unsubscribe } = apiService.onAuthStateChange((user, event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryModalOpen(true);
      }
      if (user) {
        setCurrentUser(user);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Prevenir que el usuario regrese con el botón Atrás del navegador tras cerrar sesión
  useEffect(() => {
    if (!currentUser) {
      window.history.pushState(null, '', window.location.href);
      const handlePopState = () => {
        window.history.pushState(null, '', window.location.href);
      };
      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [currentUser]);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Si el usuario autenticado es Cliente, asegurar que solo acceda a sus pestañas permitidas
  useEffect(() => {
    if (currentUser?.role === 'Cliente') {
      const forbiddenForClient: ActiveTab[] = ['clients', 'inventory', 'admin', 'architecture'];
      if (forbiddenForClient.includes(activeTab)) {
        setActiveTab('dashboard');
      }
    }
  }, [currentUser, activeTab]);

  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Search query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Initial HTTP Data Fetching from Supabase / REST API
  useEffect(() => {
    async function loadInitialData() {
      try {
        setIsLoading(true);
        const [loadedProjects, loadedClients, loadedInventory] = await Promise.all([
          apiService.getProjects().catch(() => []),
          apiService.getClients().catch(() => []),
          apiService.getInventory().catch(() => [])
        ]);

        if (loadedProjects && loadedProjects.length > 0) {
          setProjects(loadedProjects);
        }
        if (loadedClients && loadedClients.length > 0) {
          setClients(loadedClients);
        }
        if (loadedInventory && loadedInventory.length > 0) {
          setInventory(loadedInventory);
        }
      } catch (err) {
        console.error('Error fetching data from API:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // SEGURIDAD & AISLAMIENTO DE DATOS POR ROL (Row Level Isolation)
  // El Cliente visualiza ÚNICAMENTE sus proyectos, evidencias, reportes e información corporativa.
  const visibleProjects = useMemo(() => {
    if (currentUser?.role === 'Cliente') {
      return projects.filter(p => 
        (currentUser.clientId && p.clientId === currentUser.clientId) || 
        (currentUser.companyId && p.clientId === currentUser.companyId) ||
        (currentUser.companyName && p.clientName && p.clientName.toLowerCase().includes(currentUser.companyName.toLowerCase()))
      );
    }
    return projects;
  }, [projects, currentUser]);

  const visibleClients = useMemo(() => {
    if (currentUser?.role === 'Cliente') {
      return clients.filter(c => 
        (currentUser.clientId && c.id === currentUser.clientId) || 
        (currentUser.companyId && c.id === currentUser.companyId) ||
        (currentUser.companyName && c.companyName.toLowerCase().includes(currentUser.companyName.toLowerCase()))
      );
    }
    return clients;
  }, [clients, currentUser]);

  // Counts for sidebar badges
  const totalEvidences = visibleProjects.reduce((acc, p) => acc + (p.evidences?.length || 0), 0);
  const totalClassifications = visibleProjects.filter(p => p.classification !== undefined).length;
  const pendingCount = visibleProjects.filter(p => p.status === 'Borrador' || p.status === 'En Validación').length;
  const alertsCount = visibleProjects.reduce((acc, p) => acc + (p.activeAlerts?.length || 0), 0);

  // Handle new project creation from Wizard with HTTP POST to API
  const handleProjectCreated = async (newProject: Project) => {
    try {
      const persisted = await apiService.createProject(newProject);
      setProjects(prev => [persisted || newProject, ...prev]);
    } catch {
      setProjects(prev => [newProject, ...prev]);
    }

    // Also update client project count
    setClients(prev => prev.map(c => {
      if (c.id === newProject.clientId || c.companyName === newProject.clientName) {
        return { ...c, totalProjects: (c.totalProjects || 0) + 1 };
      }
      return c;
    }));
    // Open project detail modal to inspect
    setSelectedProject(newProject);
  };

  // Handle project update (e.g. from timeline) with HTTP PUT/PATCH
  const handleUpdateProject = async (updated: Project) => {
    try {
      await apiService.updateProject(updated.id, updated);
    } catch (err) {
      console.warn('Could not persist project update via HTTP:', err);
    }
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    setSelectedProject(updated);
  };

  // Handle new client creation with HTTP POST
  const handleAddClient = async (newClient: Client) => {
    try {
      const created = await apiService.createClient(newClient);
      setClients(prev => [created || newClient, ...prev]);
    } catch {
      setClients(prev => [newClient, ...prev]);
    }
  };

  // Change active role
  const handleRoleChange = (role: UserRole) => {
    if (!currentUser) return;
    const updated = { ...currentUser, role };
    setCurrentUser(updated);
    try {
      localStorage.setItem('colorlink_auth_user', JSON.stringify(updated));
    } catch {
      // storage
    }
  };

  // Manejador de cierre de sesión completo
  const handleLogout = async () => {
    await apiService.logout(currentUser);
    setCurrentUser(null);
    window.history.replaceState(null, '', window.location.pathname);
  };

  // Manejador de inicio de sesión exitoso
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('colorlink_auth_user', JSON.stringify(user));
      localStorage.removeItem('colorlink_logged_out');
    } catch {
      // storage
    }
    window.history.replaceState(null, '', window.location.pathname);
  };

  // Si no hay sesión activa, renderizar la pantalla de Login corporativo
  if (!currentUser) {
    return (
      <>
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          availableClients={clients}
        />
        <SetNewPasswordModal
          isOpen={isRecoveryModalOpen}
          onClose={() => {
            setIsRecoveryModalOpen(false);
            if (window.location.hash) {
              window.history.replaceState(null, '', window.location.pathname);
            }
          }}
          onSuccess={() => {
            setIsRecoveryModalOpen(false);
            if (window.location.hash) {
              window.history.replaceState(null, '', window.location.pathname);
            }
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onRoleChange={handleRoleChange}
        onOpenNewProjectWizard={() => setIsWizardOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        pendingCount={pendingCount}
        alertsCount={alertsCount}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Sidebar */}
        <Sidebar
          currentUser={currentUser}
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onLogout={handleLogout}
          counts={{
            clients: visibleClients.length,
            projects: visibleProjects.length,
            evidences: totalEvidences,
            classifications: totalClassifications,
            inventory: inventory.length,
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* View router */}
            {activeTab === 'dashboard' && (
              <ExecutiveDashboard
                projects={visibleProjects}
                clients={visibleClients}
                onSelectProject={(p) => setSelectedProject(p)}
                onOpenWizard={() => setIsWizardOpen(true)}
              />
            )}

            {activeTab === 'clients' && (
              <ClientsManager
                clients={visibleClients}
                projects={visibleProjects}
                onAddClient={handleAddClient}
                onSelectClientProjects={(clientName) => {
                  setActiveTab('projects');
                }}
              />
            )}

            {activeTab === 'projects' && (
              <ProjectsList
                projects={visibleProjects}
                onSelectProject={(p) => setSelectedProject(p)}
                onOpenWizard={() => setIsWizardOpen(true)}
              />
            )}

            {activeTab === 'evidences' && (
              <EvidenceManager
                projects={visibleProjects}
              />
            )}

            {activeTab === 'ai-classifications' && (
              <ClassificationsView
                projects={visibleProjects}
                onSelectProject={(p) => setSelectedProject(p)}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryManager
                inventory={inventory}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView
                projects={visibleProjects}
                clients={visibleClients}
              />
            )}

            {activeTab === 'admin' && (
              <AdminPanel />
            )}

            {activeTab === 'architecture' && (
              <ArchitectureViewer />
            )}
          </div>
        </main>
      </div>

      {/* 9-Step Guided Wizard Modal */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className="w-full max-w-5xl my-auto">
            <ProjectWizard
              clients={visibleClients}
              existingProjects={visibleProjects}
              onComplete={(newProj) => {
                handleProjectCreated(newProj);
                setIsWizardOpen(false);
              }}
              onCancel={() => setIsWizardOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onUpdateProject={handleUpdateProject}
        />
      )}

      {/* Modal de Restablecimiento de Contraseña */}
      <SetNewPasswordModal
        isOpen={isRecoveryModalOpen}
        onClose={() => {
          setIsRecoveryModalOpen(false);
          if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        }}
        onSuccess={() => {
          setIsRecoveryModalOpen(false);
          if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        }}
      />
    </div>
  );
}
