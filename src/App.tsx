import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Index from "./pages/Index";
import Room from "./pages/Room";
import Profile from "./pages/Profile";
import Studies from "./pages/Studies";
import Admin from "./pages/Admin";
import GameModes from "./pages/GameModes";
import BattleLobby from "./pages/BattleLobby";
import BattleArena from "./pages/BattleArena";
import Diagnosis from "./pages/Diagnosis";
import MillionaireLobby from "./pages/MillionaireLobby";
import MillionaireGame from "./pages/MillionaireGame";
import NotFound from "./pages/NotFound";
import Credits from "./components/Credits";
import { Home as HomeIcon, Gamepad2, BookOpen, User, ShieldCheck, LogOut, Sparkles, LayoutGrid, ShieldAlert, Microscope } from "lucide-react";
import { cn } from "@/lib/utils";
import loginBg from "@/assets/login-bg.png";

const queryClient = new QueryClient();

const Layout = ({ children, isAdmin }: { children: React.ReactNode, isAdmin: boolean }) => {
  const location = useLocation();
  const isGame = location.pathname.startsWith('/room/') || 
                 location.pathname.startsWith('/battle/') || 
                 location.pathname.startsWith('/millionaire/');

  const navItems = [
    { path: '/home', icon: HomeIcon, label: 'Início' },
    { path: '/modes', icon: LayoutGrid, label: 'Modos' },
    { path: '/studies', icon: BookOpen, label: 'Estudos' },
    { path: '/profile', icon: User, label: 'Perfil' },
    ...(isAdmin ? [{ path: '/admin', icon: ShieldCheck, label: 'Admin' }] : []),
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (isGame && location.pathname.split('/').length > 2) {
    return (
      <div className="min-h-screen bg-slate-950 overflow-x-hidden">
        {children}
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-slate-950 flex flex-col md:flex-row relative overflow-hidden font-sans"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(2, 6, 23, 0.85), rgba(2, 6, 23, 0.95)), url(${loginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-72 bg-white/5 border-r border-white/10 backdrop-blur-2xl flex-col p-8 z-40">
        <div className="mb-12 mt-10">
          <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-2">
            <Sparkles className="text-violet-500 animate-pulse" />
            IMUNO<span className="text-violet-500">BINGO</span>
          </h1>
        </div>
        <nav className="flex-1 space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 group",
                location.pathname === item.path 
                  ? "bg-violet-600 text-white shadow-[0_0_20px_rgba(124,58,237,0.4)] scale-105" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-125", location.pathname === item.path && "animate-bounce")} />
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className="mt-auto pt-8 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-4 text-slate-500 hover:text-red-400 hover:bg-red-400/5 rounded-2xl transition-all font-bold"
          >
            <LogOut className="w-5 h-5" /> Sair da Conta
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-slate-950/40 border-t border-white/10 backdrop-blur-3xl flex justify-around p-4 z-50">
        {navItems.map((item) => (
          <Link key={item.path} to={item.path} className={cn(
            "p-3 rounded-2xl transition-all duration-500",
            location.pathname === item.path 
              ? "bg-violet-600/20 backdrop-blur-xl border border-white/20 text-white shadow-[0_0_15px_rgba(124,58,237,0.3)] scale-110" 
              : "text-slate-500 hover:text-slate-300"
          )}>
            <item.icon className={cn("w-6 h-6", location.pathname === item.path && "animate-pulse")} />
          </Link>
        ))}
        <button onClick={handleLogout} className="p-3 text-slate-500">
          <LogOut className="w-6 h-6" />
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 pb-32 md:pb-12 overflow-y-auto relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col min-h-full">
          <div className="flex-1">
            {children}
          </div>
          <div className="mt-12 pt-8 border-t border-white/5">
            <Credits />
          </div>
        </div>
      </main>
    </div>
  );
};

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
        localStorage.setItem('imuno_user_id', session.user.id);
        await checkAdminStatus(session.user);
      }
      setLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        localStorage.setItem('imuno_user_id', session.user.id);
        await checkAdminStatus(session.user);
      } else {
        setIsAdmin(false);
        localStorage.removeItem('imuno_user_id');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (user: any) => {
    if (user.email === 'theu@imuno.com') {
      setIsAdmin(true);
      return;
    }
    const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
    setIsAdmin(data?.is_admin || false);
  };

  if (loading) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <Routes>
            <Route path="/welcome" element={!session ? <Welcome /> : <Navigate to="/home" />} />
            <Route path="/login" element={!session ? <Login /> : <Navigate to="/home" />} />
            
            <Route path="/home" element={session ? <Layout isAdmin={isAdmin}><Home /></Layout> : <Navigate to="/login" />} />
            <Route path="/modes" element={session ? <Layout isAdmin={isAdmin}><GameModes /></Layout> : <Navigate to="/login" />} />
            <Route path="/bingo" element={session ? <Layout isAdmin={isAdmin}><Index /></Layout> : <Navigate to="/login" />} />
            <Route path="/room/:id" element={session ? <Layout isAdmin={isAdmin}><Room /></Layout> : <Navigate to="/login" />} />
            
            <Route path="/battle" element={session ? <Layout isAdmin={isAdmin}><BattleLobby /></Layout> : <Navigate to="/login" />} />
            <Route path="/battle/:id" element={session ? <Layout isAdmin={isAdmin}><BattleArena /></Layout> : <Navigate to="/login" />} />
            
            <Route path="/millionaire" element={session ? <Layout isAdmin={isAdmin}><MillionaireLobby /></Layout> : <Navigate to="/login" />} />
            <Route path="/millionaire/:id" element={session ? <Layout isAdmin={isAdmin}><MillionaireGame /></Layout> : <Navigate to="/login" />} />
            
            <Route path="/diagnosis" element={session ? <Layout isAdmin={isAdmin}><Diagnosis /></Layout> : <Navigate to="/login" />} />
            
            <Route path="/studies" element={session ? <Layout isAdmin={isAdmin}><Studies /></Layout> : <Navigate to="/login" />} />
            <Route path="/profile" element={session ? <Layout isAdmin={isAdmin}><Profile /></Layout> : <Navigate to="/login" />} />
            <Route path="/admin" element={session ? <Layout isAdmin={isAdmin}><Admin /></Layout> : <Navigate to="/login" />} />

            <Route path="/" element={<Navigate to={session ? "/home" : "/welcome"} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;