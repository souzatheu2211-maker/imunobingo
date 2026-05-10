import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Microscope, 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  GraduationCap, 
  Instagram, 
  Bug, 
  Dna, 
  Activity,
  Zap
} from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import enfLogo from '@/assets/enf.png';
import fsssLogo from '@/assets/fsss.png';

const FloatingIcon = ({ children<dyad-write path="src/pages/Login.tsx" description="Tela de login ultra-estilizada com elementos de imunologia animados">
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Microscope, 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  GraduationCap, 
  Instagram, 
  Bug, 
  Dna, 
  Activity,
  Zap,
  Wind
} from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import enfLogo from '@/assets/enf.png';
import fsssLogo from '@/assets/fsss.png';

const FloatingIcon = ({ children, className, delay = "0s" }: { children: React.ReactNode, className?: string, delay?: string }) => (
  <div 
    className={`absolute animate-pulse pointer-events-none opacity-20 ${className}`}
    style={{ animationDelay: delay, animationDuration: '4s' }}
  >
    {children}
  </div>
);

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [course, setCourse] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, course: course }
          }
        });
        if (error) throw error;
        
        if (data.user) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            full_name: fullName,
            course: course
          });
        }
        showSuccess("Cadastro realizado! Verifique seu e-mail.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        showSuccess("Bem-vindo de volta!");
      }
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Elementos de Imunologia Animados no Fundo */}
      <FloatingIcon className="top-10 left-10 text-violet-500" delay="0s"><Bug size={48} /></FloatingIcon>
      <FloatingIcon className="top-20 right-20 text-blue-500" delay="1s"><Dna size={64} /></FloatingIcon>
      <FloatingIcon className="bottom-20 left-20 text-emerald-500" delay="2s"><ShieldCheck size={56} /></FloatingIcon>
      <FloatingIcon className="bottom-10 right-10 text-pink-500" delay="0.5s"><Activity size={40} /></FloatingIcon>
      <FloatingIcon className="top-1/2 left-1/4 text-yellow-500" delay="1.5s"><Zap size={32} /></FloatingIcon>
      <FloatingIcon className="bottom-1/3 right-1/4 text-cyan-500" delay="2.5s"><Wind size={44} /></FloatingIcon>

      {/* Logos Animadas */}
      <div className="flex gap-12 mb-8 items-center">
        <img 
          src={fsssLogo} 
          alt="FSSS" 
          className="h-20 object-contain animate-bounce hover:scale-110 transition-transform duration-500" 
          style={{ animationDuration: '3s' }}
        />
        <img 
          src={enfLogo} 
          alt="Enfermagem" 
          className="h-20 object-contain animate-pulse hover:rotate-12 transition-transform duration-500"
          style={{ animationDuration: '2s' }}
        />
      </div>

      {/* Card de Login Compacto com Gradiente FSSS */}
      <Card className="w-full max-w-sm bg-slate-900/90 border-slate-800 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(124,58,237,0.3)] z-10 overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600" />
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-black text-white tracking-tight">
            IMUNO<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">BINGO</span>
          </CardTitle>
          <p className="text-slate-400 text-xs mt-1">
            {isRegister ? 'Crie sua conta acadêmica' : 'Acesse sua plataforma'}
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleAuth} className="space-y-3">
            {isRegister && (
              <>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input 
                    placeholder="Nome Completo" 
                    className="pl-9 h-10 bg-slate-800/50 border-slate-700 text-white text-sm focus:ring-violet-500"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input 
                    placeholder="Curso da Faculdade" 
                    className="pl-9 h-10 bg-slate-800/50 border-slate-700 text-white text-sm focus:ring-violet-500"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <Input 
                type="email"
                placeholder="E-mail" 
                className="pl-9 h-10 bg-slate-800/50 border-slate-700 text-white text-sm focus:ring-violet-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <Input 
                type="password"
                placeholder="Senha" 
                className="pl-9 h-10 bg-slate-800/50 border-slate-700 text-white text-sm focus:ring-violet-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 h-10 font-bold text-sm shadow-lg shadow-violet-900/20"
            >
              {loading ? 'Processando...' : isRegister ? 'CADASTRAR' : 'ENTRAR'}
            </Button>
          </form>

          <button 
            onClick={() => setIsRegister(!isRegister)}
            className="w-full text-center text-[11px] text-slate-500 mt-4 hover:text-white transition-colors uppercase tracking-wider font-bold"
          >
            {isRegister ? 'Já tem conta? Entre aqui' : 'Não tem conta? Cadastre-se'}
          </button>
        </CardContent>
      </Card>

      {/* Créditos Estilizados */}
      <div className="mt-10 text-center space-y-1 animate-in fade-in slide-in-from-bottom duration-1000">
        <div className="flex flex-col items-center gap-0.5">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Desenvolvido por</p>
          <p className="text-white text-sm font-black tracking-tight">Matheus Souza</p>
        </div>
        <div className="flex items-center justify-center gap-2 py-1">
          <span className="h-px w-8 bg-slate-800" />
          <p className="text-violet-400 text-[10px] font-black uppercase tracking-widest">ENFERMAGEM - FSSS</p>
          <span className="h-px w-8 bg-slate-800" />
        </div>
        <p className="text-slate-600 text-[9px] font-medium">TODOS OS DIREITOS RESERVADOS 2026</p>
        <a 
          href="https://www.instagram.com/theu_souz2?igsh=NXhiejZ0OTh1cHd5&utm_source=qr" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-slate-400 hover:text-pink-500 transition-all text-xs mt-3 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800 hover:border-pink-500/30"
        >
          <Instagram className="w-3.5 h-3.5" /> 
          <span className="font-bold">@theu_souz2</span>
        </a>
      </div>
    </div>
  );
};

export default Login;