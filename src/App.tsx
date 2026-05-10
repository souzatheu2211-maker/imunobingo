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
import NotFound from "./pages/NotFound";
import { Home as HomeIcon, Gamepad2, BookOpen, User, ShieldCheck, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const queryClient = new QueryClient();

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isRoom = location.pathname.startsWith('/room/');

  const navItems = [
    { path: '/home', icon: HomeIcon, label: 'Início' },
    { path: '/bingo', icon: Gamepad2, label: 'Bingo' },
    { path: '/studies', icon: BookOpen, label: 'Estudos' },
    { path: '/profile', icon: User, label: 'Perfil' },
    { path: '/admin', icon: ShieldCheck, label: 'Admin' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Se estiver em uma sala, renderiza apenas o conteúdo (tela cheia)
  if (isRoom) {
    return (
      <div className="min-h-screen bg-slate-950 overflow-x-hidden">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 flex-col p-6">
        <div className="mb-10">
          <h1 className="text-2xl font-black text-white tracking-tight">IMUNO<span className="text-violet-500">BINGO</span></h1>
        </div>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
                location.pathname === item.path 
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <button 
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" /> Sair
        </button>
      </aside>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-slate-900 border-t border-slate-800 flex justify-around p-4 z-50">
        {navItems.map((item) => (
          <Link key={item.path} to={item.path} className={cn(
            "p-2 rounded-lg",
            location.pathname === item.path ? "text-violet-500" : "text-slate-500"
          )}>
            <item.icon className="w-6 h-6" />
          </Link>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 pb-24 md:pb-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

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
            
            <Route path="/home" element={session ? <Layout><Home /></Layout> : <Navigate to="/login" />} />
            <Route path="/bingo" element={session ? <Layout><Index /></Layout> : <Navigate to="/login" />} />
            <Route path="/room/:id" element={session ? <Layout><Room /></Layout> : <Navigate to="/login" />} />
            <Route path="/studies" element={session ? <Layout><Studies /></Layout> : <Navigate to="/login" />} />
            <Route path="/profile" element={session ? <Layout><Profile /></Layout> : <Navigate to="/login" />} />
            <Route path="/admin" element={session ? <Layout><Admin /></Layout> : <Navigate to="/login" />} />

            <Route path="/" element={<Navigate to={session ? "/home" : "/welcome"} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;