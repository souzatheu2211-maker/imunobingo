import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Mail, 
  Lock, 
  User, 
  GraduationCap, 
  Bug, 
  Dna, 
  Activity,
  Zap,
  Wind,
  Shield,
  Crosshair,
  Target,
  Microscope,
  Briefcase
} from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import Credits from '@/components/Credits';
import enfLogo from '@/assets/enf.png';
import fsssLogo from '@/assets/fsss.png';
import loginBg from '@/assets/login-bg.png';
import { cn } from '@/lib/utils';

const FloatingIcon = ({ children, className, delay = "0s" }: { children: React.ReactNode, className?: string, delay?: string }) => (
  <div 
    className={`absolute animate-pulse pointer-events-none opacity-10 ${className}`}
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
  const [role, setRole] = useState<'student' | 'professor'>('student');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { 
              full_name: fullName, 
              course: role === 'student' ? course : 'Professor',
              role: role 
            }
          }
        });
        if (error) throw error;
        
        if (data.user) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            full_name: fullName,
            course: role === 'student' ? course : 'Professor',
            is_admin: role === 'professor' || email === 'theu@imuno.com'
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
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-slate-950"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(2, 6, 23, 0.7), rgba(2, 6, 23, 0.8)), url(${loginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Elementos de Imunologia Animados */}
      <FloatingIcon className="top-10 left-10 text-violet-500" delay="0s"><Bug size={48} /></FloatingIcon>
      <FloatingIcon className="top-20 right-20 text-blue-500" delay="1s"><Dna size={64} /></FloatingIcon>
      <FloatingIcon className="bottom-20 left-20 text-emerald-500" delay="2s"><Activity size={40} /></FloatingIcon>
      <FloatingIcon className="top-1/2 left-1/4 text-yellow-500" delay="1.5s"><Zap size={32} /></FloatingIcon>
      <FloatingIcon className="bottom-1/3 right-1/4 text-cyan-500" delay="2.5s"><Wind size={44} /></FloatingIcon>
      <FloatingIcon className="top-1/4 right-1/3 text-blue-400" delay="3s"><Shield size={38} /></FloatingIcon>
      <FloatingIcon className="bottom-1/4 left-1/3 text-red-400" delay="1.2s"><Crosshair size={30} /></FloatingIcon>
      <FloatingIcon className="top-10 right-1/2 text-emerald-400" delay="0.8s"><Target size={24} /></FloatingIcon>
      <FloatingIcon className="bottom-10 left-1/2 text-violet-400" delay="2.2s"><Microscope size={34} /></FloatingIcon>

      {/* Logos Reduzidas para Mobile */}
      <div className="flex gap-6 mb-4 items-center">
        <img src={fsssLogo} alt="FSSS" className="h-14 md:h-20 object-contain animate-pulse" style={{ animationDuration: '2s' }} />
        <img src={enfLogo} alt="Enfermagem" className="h-14 md:h-20 object-contain animate-pulse" style={{ animationDuration: '2.5s' }} />
      </div>

      {/* Card de Login */}
      <div className="relative group w-full max-w-[300px]">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
        
        <Card className="w-full bg-slate-900/60 border-white/10 backdrop-blur-2xl shadow-2xl z-10 overflow-hidden border-t-white/20 rounded-[2.5rem]">
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500" />
          <CardHeader className="text-center pb-2 pt-4">
            <CardTitle className="text-xl font-black text-white tracking-tight">
              IMUNO<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">BINGO</span>
            </CardTitle>
            <p className="text-slate-400 text-[9px] mt-0.5 uppercase tracking-widest font-bold">
              {isRegister ? 'Nova Conta' : 'Acesso Restrito'}
            </p>
          </CardHeader>
          <CardContent className="pt-2 px-6 pb-6">
            {isRegister && (
              <div className="flex gap-2 mb-3">
                <button 
                  type="button"
                  onClick={() => setRole('student')}
                  className={cn(
                    "flex-1 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all border",
                    role === 'student' ? "bg-violet-600 border-violet-500 text-white" : "bg-white/5 border-white/10 text-slate-500"
                  )}
                >
                  Estudante
                </button>
                <button 
                  type="button"
                  onClick={() => setRole('professor')}
                  className={cn(
                    "flex-1 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all border",
                    role === 'professor' ? "bg-violet-600 border-violet-500 text-white" : "bg-white/5 border-white/10 text-slate-500"
                  )}
                >
                  Professor
                </button>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-3">
              {isRegister && (
                <>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    <Input 
                      placeholder="Nome Completo" 
                      className="pl-9 h-9 bg-white/5 border-white/10 text-white text-xs focus:ring-violet-500 placeholder:text-slate-600 rounded-xl"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  {role === 'student' && (
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                      <Input 
                        placeholder="Curso" 
                        className="pl-9 h-9 bg-white/5 border-white/10 text-white text-xs focus:ring-violet-500 placeholder:text-slate-600 rounded-xl"
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        required
                      />
                    </div>
                  )}
                </>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <Input 
                  type="email"
                  placeholder="E-mail" 
                  className="pl-9 h-9 bg-white/5 border-white/10 text-white text-xs focus:ring-violet-500 placeholder:text-slate-600 rounded-xl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <Input 
                  type="password"
                  placeholder="Senha" 
                  className="pl-9 h-9 bg-white/5 border-white/10 text-white text-xs focus:ring-violet-500 placeholder:text-slate-600 rounded-xl"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-violet-600 hover:bg-violet-500 text-white h-10 font-black text-xs shadow-lg shadow-violet-900/40 transition-all active:scale-95 rounded-xl"
              >
                {loading ? '...' : isRegister ? 'CADASTRAR' : 'ENTRAR'}
              </Button>
            </form>

            <button 
              onClick={() => setIsRegister(!isRegister)}
              className="w-full text-center text-[9px] text-slate-500 mt-4 hover:text-white transition-colors uppercase tracking-wider font-bold"
            >
              {isRegister ? 'Voltar para Login' : 'Criar nova conta'}
            </button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Credits />
      </div>
    </div>
  );
};

export default Login;