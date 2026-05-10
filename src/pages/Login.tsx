import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Microscope, ShieldCheck, Mail, Lock, User, GraduationCap, Instagram } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import enfLogo from '@/assets/enf.png';
import fsssLogo from '@/assets/fsss.png';

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
        
        // Criar perfil na tabela profiles
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
      {/* Background Animado */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 animate-bounce"><Microscope className="text-violet-500 w-12 h-12" /></div>
        <div className="absolute bottom-20 right-20 animate-pulse"><ShieldCheck className="text-emerald-500 w-16 h-16" /></div>
      </div>

      <div className="flex gap-8 mb-6 animate-in fade-in slide-in-from-top duration-700">
        <img src={fsssLogo} alt="FSSS" className="h-16 object-contain" />
        <img src={enfLogo} alt="Enfermagem" className="h-16 object-contain" />
      </div>

      <Card className="w-full max-w-md bg-slate-900/80 border-slate-800 backdrop-blur-xl shadow-2xl z-10">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-black text-white tracking-tight">
            IMUNO<span className="text-violet-500">BINGO</span>
          </CardTitle>
          <p className="text-slate-400 text-sm mt-2">
            {isRegister ? 'Crie sua conta acadêmica' : 'Acesse sua plataforma de estudos'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {isRegister && (
              <>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                  <Input 
                    placeholder="Nome Completo" 
                    className="pl-10 bg-slate-800 border-slate-700 text-white"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                  <Input 
                    placeholder="Curso da Faculdade" 
                    className="pl-10 bg-slate-800 border-slate-700 text-white"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
              <Input 
                type="email"
                placeholder="E-mail" 
                className="pl-10 bg-slate-800 border-slate-700 text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
              <Input 
                type="password"
                placeholder="Senha" 
                className="pl-10 bg-slate-800 border-slate-700 text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700 h-12 font-bold">
              {loading ? 'Processando...' : isRegister ? 'CADASTRAR' : 'ENTRAR'}
            </Button>
          </form>

          <button 
            onClick={() => setIsRegister(!isRegister)}
            className="w-full text-center text-sm text-slate-400 mt-4 hover:text-white transition-colors"
          >
            {isRegister ? 'Já tem conta? Entre aqui' : 'Não tem conta? Cadastre-se'}
          </button>
        </CardContent>
      </Card>

      {/* Créditos */}
      <div className="mt-8 text-center space-y-1 animate-in fade-in slide-in-from-bottom duration-1000">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Desenvolvido por Matheus Souza</p>
        <p className="text-violet-400 text-xs font-black">ENFERMAGEM - FSSS</p>
        <p className="text-slate-600 text-[10px]">TODOS OS DIREITOS RESERVADOS 2026</p>
        <a 
          href="https://www.instagram.com/theu_souz2?igsh=NXhiejZ0OTh1cHd5&utm_source=qr" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 text-slate-400 hover:text-pink-500 transition-colors text-sm mt-2"
        >
          <Instagram className="w-4 h-4" /> @theu_souz2
        </a>
      </div>
    </div>
  );
};

export default Login;