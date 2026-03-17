import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, User as UserIcon, Search, LayoutDashboard, BookOpen, BarChart3, Users, Menu, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Button, Input } from './ui';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: `/dashboard/${user.role}` },
    { label: 'Exams', icon: BookOpen, path: `/dashboard/${user.role}/exams` },
    { label: 'Results', icon: BarChart3, path: `/dashboard/${user.role}/results` },
  ];

  if (user.role === 'principal') {
    navItems.push({ label: 'Users', icon: Users, path: `/dashboard/${user.role}/users` });
  }

  return (
    <div className="min-h-screen bg-primary-bg flex text-text-primary overflow-x-hidden">
      {/* Sidebar - Desktop */}
      <aside className="w-64 border-r border-white/5 flex flex-col p-6 hidden lg:flex bg-primary-bg/80 backdrop-blur-xl sticky top-0 h-screen">
        <div className="mb-10">
          <h1 className="text-2xl font-bold tracking-tighter">
            ezy<span className="text-accent-blue">Quiz</span>
          </h1>
          <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold mt-1 opacity-50">
            Academic System
          </p>
        </div>

        <nav className="flex-grow space-y-2">
          {navItems.map((item) => (
            <SidebarLink 
              key={item.path}
              icon={item.icon} 
              label={item.label} 
              active={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            />
          ))}
        </nav>

        <div className="pt-6 border-t border-white/5">
          <Button variant="ghost" className="w-full justify-start px-4 text-text-secondary hover:text-accent-red hover:bg-accent-red/5" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-secondary-bg border-r border-white/10 z-50 p-6 flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h1 className="text-2xl font-bold tracking-tighter">
                    ezy<span className="text-accent-blue">Quiz</span>
                  </h1>
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold mt-1 opacity-50">
                    Academic System
                  </p>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-text-secondary" />
                </button>
              </div>

              <nav className="flex-grow space-y-2">
                {navItems.map((item) => (
                  <SidebarLink 
                    key={item.path}
                    icon={item.icon} 
                    label={item.label} 
                    active={location.pathname === item.path}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                  />
                ))}
              </nav>

              <div className="pt-6 border-t border-white/5">
                <Button variant="ghost" className="w-full justify-start px-4 text-text-secondary hover:text-accent-red hover:bg-accent-red/5" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-h-screen w-full">
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-primary-bg/50 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-white/5 rounded-lg lg:hidden transition-colors"
            >
              <Menu className="w-6 h-6 text-text-secondary" />
            </button>
            <h2 className="text-base md:text-lg font-semibold truncate max-w-[150px] sm:max-w-none">{title}</h2>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
            <div className="relative w-64 hidden xl:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <Input className="pl-10 py-1.5 text-sm bg-white/5 border-white/10" placeholder="Search..." />
            </div>
            
            <div className="flex items-center gap-2 md:gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{user.name}</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter bg-accent-blue/10 text-accent-blue border border-accent-blue/20">
                  {user.role}
                </span>
              </div>
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-text-secondary" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-8 overflow-y-auto flex-grow">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

const SidebarLink: React.FC<{ icon: any, label: string, active?: boolean, onClick: () => void | Promise<void> }> = ({ icon: Icon, label, active = false, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active ? 'bg-accent-blue text-white shadow-lg shadow-accent-blue/20' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
};
