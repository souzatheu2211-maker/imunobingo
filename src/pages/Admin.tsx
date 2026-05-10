import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, ShieldAlert } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
      setIsAdmin(data?.is_admin || false);
    }
    setLoading(false);
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('study_materials').insert({
      title,
      description,
      file_url: fileUrl
    });

    if (error) showError(error.message);
    else {
      showSuccess("Material adicionado!");
      setTitle('');
      setDescription('');
      setFileUrl('');
    }
  };

  if (loading) return <div className="text-white">Verificando permissões...</div>;

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <ShieldAlert className="w-20 h-20 text-red-500 animate-pulse" />
        <h1 className="text-2xl font-bold text-white">Acesso Negado</h1>
        <p className="text-slate-400">Apenas administradores podem acessar esta área.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-black text-white">Painel Administrativo</h1>
      
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-violet-400 flex items-center gap-2">
            <Plus className="w-5 h-5" /> Cadastrar Novo Material
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddMaterial} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Título do PDF</label>
              <Input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Descrição Curta</label>
              <Textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Link do Arquivo (URL)</label>
              <Input 
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://..."
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
              PUBLICAR MATERIAL
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;