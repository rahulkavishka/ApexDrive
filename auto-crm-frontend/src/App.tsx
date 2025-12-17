import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Car, Wrench, FileText, Settings, LogOut, Users, Calendar, User, DollarSign, Shield, Menu, X } from 'lucide-react';

// Context
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Login } from '@/features/auth/Login';

// Components
import { Dashboard } from '@/features/dashboard/components/Dashboard';
import { VINDecoderForm } from '@/features/inventory/components/VINDecoderForm';
import { LicensePlateScanner } from '@/features/service/components/LicensePlateScanner';
import { DeskingCalculator } from '@/features/sales/components/DeskingCalculator';
import { LeadsList } from '@/features/sales/components/LeadsList';
import { ActivityLog } from '@/features/dashboard/components/ActivityLog';
import { ServiceCalendar } from '@/features/service/components/ServiceCalendar';
import { CustomerList } from '@/features/customers/components/CustomerList';
import { Financials } from '@/features/financials/Financials';
import { TeamManagement } from '@/features/users/TeamManagement';

// --- NAV ITEM COMPONENT (With Active State) ---
const NavItem = ({ to, icon, label, onClick }: any) => {
  const location = useLocation();
  // Check if current path matches the link
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border 
        ${isActive 
          ? 'bg-apex-red text-white border-apex-red shadow-lg shadow-apex-red/20 font-bold' 
          : 'text-apex-muted hover:bg-apex-gray hover:text-white border-transparent hover:border-apex-border/50'
        }
      `}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
};

// --- 1. THE PROTECTED LAYOUT (Sidebar + Main) ---
const ProtectedLayout = () => {
  const { logout, isManager } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Helper to close menu when an item is clicked (for mobile)
  const closeMenu = () => setMobileMenuOpen(false);

  // Sidebar Content (Reused for Mobile & Desktop)
  const SidebarContent = () => (
    <>
      {/* BRAND HEADER */}
      <div className="p-6 border-b border-apex-border flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black italic tracking-wider text-white">
            APEX<span className="text-apex-red">DRIVE</span>
          </h2>
          <p className="text-xs text-apex-muted mt-1 uppercase tracking-widest font-medium">
            Dealer Management
          </p>
        </div>
        {/* Close Button (Mobile Only) */}
        <button onClick={closeMenu} className="md:hidden text-apex-muted hover:text-white">
          <X size={24} />
        </button>
      </div>
      
      {/* NAVIGATION */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-dark">
        <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={closeMenu} />
        <NavItem to="/inventory" icon={<Car size={20} />} label="Inventory" onClick={closeMenu} />
        <NavItem to="/sales" icon={<FileText size={20} />} label="Sales & Desking" onClick={closeMenu} />
        <NavItem to="/leads" icon={<Users size={20} />} label="Leads" onClick={closeMenu} />
        <NavItem to="/service" icon={<Wrench size={20} />} label="Service Lane" onClick={closeMenu} />
        <NavItem to="/calendar" icon={<Calendar size={20} />} label="Schedule" onClick={closeMenu} />
        <NavItem to="/customers" icon={<User size={20} />} label="Customers" onClick={closeMenu} />
        
        {/* MANAGER ONLY LINKS */}
        {isManager && (
            <>
              <div className="pt-4 pb-2 px-4 text-xs font-bold text-apex-muted/50 uppercase tracking-widest">
                Management
              </div>
              <NavItem to="/financials" icon={<DollarSign size={20} className={isManager ? "text-apex-success" : ""} />} label="Financials" onClick={closeMenu} />
              <NavItem to="/team" icon={<Shield size={20} className={isManager ? "text-apex-info" : ""} />} label="Team" onClick={closeMenu} />
            </>
        )}

        <div className="pt-4 pb-2 px-4 text-xs font-bold text-apex-muted/50 uppercase tracking-widest">
            System
        </div>
        <NavItem to="/activity" icon={<Settings size={20} />} label="Activity Log" onClick={closeMenu} />
      </nav>

      {/* LOGOUT */}
      <div className="p-4 border-t border-apex-border bg-apex-blue/50">
          <button 
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 text-apex-muted hover:bg-apex-red hover:text-white rounded-lg w-full transition-all duration-300 group"
          >
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Sign Out</span>
          </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-apex-black text-apex-text font-sans selection:bg-apex-red selection:text-white">
      
      {/* --- MOBILE HEADER (Visible only on small screens) --- */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-apex-blue border-b border-apex-border px-4 py-3 flex items-center justify-between shadow-lg">
         <div className="flex items-center gap-2">
            <h2 className="text-xl font-black italic tracking-wider text-white">
                APEX<span className="text-apex-red">DRIVE</span>
            </h2>
         </div>
         <button onClick={() => setMobileMenuOpen(true)} className="text-white p-2">
            <Menu size={24} />
         </button>
      </div>

      {/* --- DESKTOP SIDEBAR (Hidden on mobile) --- */}
      <aside className="w-64 bg-apex-blue border-r border-apex-border hidden md:flex flex-col fixed h-full z-20 shadow-2xl">
         <SidebarContent />
      </aside>

      {/* --- MOBILE SIDEBAR DRAWER (Slide-in) --- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={closeMenu}></div>
          
          {/* Sidebar Panel */}
          <aside className="relative w-64 bg-apex-blue h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
             <SidebarContent />
          </aside>
        </div>
      )}

      {/* --- MAIN CONTENT AREA --- */}
      {/* Added pt-20 on mobile to account for the fixed header */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 bg-apex-black min-h-screen pt-20 md:pt-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<VINDecoderForm />} />
          <Route path="/service" element={<LicensePlateScanner />} />
          <Route path="/sales" element={<DeskingCalculator />} />
          <Route path="/leads" element={<LeadsList />} />
          <Route path="/activity" element={<ActivityLog />} />
          <Route path="/calendar" element={<ServiceCalendar />} />
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/financials" element={<Financials />} />
          <Route path="/team" element={<TeamManagement />} />
        </Routes>
      </main>
    </div>
  );
};

// --- 2. THE MAIN WRAPPER ---
const AppContent = () => {
    const { token } = useAuth();
    return token ? <ProtectedLayout /> : <Login />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}