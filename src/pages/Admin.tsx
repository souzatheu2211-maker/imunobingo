import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ShieldAlert, Trash2, Edit2, Save, X, FileText } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState<any[]>([]);
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  
  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editFileUrl, setEditFileUrl] = useState('');

  useEffect(() => {
    checkAdmin();
    fetchMaterials();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      if (user.email === 'theu@imuno.com') {
        setIsAdmin(true);
      } else {
        const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
        setIsAdmin(data?.is_admin || false);
      }
    }
    setLoading(false);
  };

  const fetchMaterials = async () => {
    const { data } = await supabase.from('study_materials').select('*').order('created_at', { ascending: false });
    if (data) setMaterials(data);
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
      fetchMaterials();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este material?")) return;
    
    const { error } = await supabase.from('study_materials').delete().eq('id', id);
    if (error) showError(error.message);
    else {
      showSuccess("Material excluído!");
      fetchMaterials();
    }
  };

  const startEdit = (material: any) => {
    setEditingId(material.id);
    setEditTitle(material.title);
    setEditDescription(material.description || '');
    setEditFileUrl(material.file_url);
  };

  const handleUpdate = async () => {
    const { error } = await supabase.from('study_materials').update({
      title: editTitle,
      description: editDescription,
      file_url: editFileUrl
    }).eq('id', editingId);

    if (error) showError(error.message);
    else {
      showSuccess("Material atualizado!");
      setEditingId(null);
      fetchMaterials();
    }
  };

  if (loading) return <div className="text-white text-center py-20">Verificando permissões...</div>;

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
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500">
      <h1 className="text-4xl font-black text-white tracking-tighter">Painel Administrativo</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário de Cadastro */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-900/60 border-white/10 backdrop-blur-xl sticky top-8">
            <CardHeader>
              <CardTitle className="text-violet-400 flex items-center gap-2 text-sm font-black uppercase tracking-widest">
                <Plus className="w-4 h-4" /> Novo Material
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMaterial} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Título</label>
                  <Input 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-white/5 border-white/10 text-white rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Descrição</label>
                  <Textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-white/5 border-white/10 text-white rounded-xl min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">URL do PDF</label>
                  <Input 
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://..."
                    className="bg-white/5 border-white/10 text-white rounded-xl"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-500 font-black rounded-xl h-12 shadow-lg shadow-violet-900/20">
                  PUBLICAR
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Materiais para Gestão */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <FileText className="text-violet-500" /> Materiais Publicados
          </h2>
          
          <div className="space-y-4">
            {materials.map((item) => (
              <Card key={item.id} className="bg-white/5 border-white/10 backdrop-blur-xl overflow-hidden">
                <CardContent className="p-6">
                  {editingId === item.id ? (
                    <div className="space-y-4">
                      <Input 
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="bg-slate-800 border-white/10 text-white"
                      />
                      <Textarea 
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="bg-slate-800 border-white/10 text-white"
                      />
                      <Input 
                        value={editFileUrl}
                        onChange={(e) => setEditFileUrl(e.target.value)}
                        className="bg-slate-800 border-white/10 text-white"
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleUpdate} className="bg-emerald-600 hover:bg-emerald-500 flex-1 font-bold">
                          <Save className="w-4 h-4 mr-2" /> SALVAR
                        </Button>
                        <Button onClick={() => setEditingId(null)} variant="outline" className="border-white/10 hover:bg-white/5">
                          <X className="w-4 h-4 mr-2" /> CANCELAR
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <h3 className="text-white font-black text-lg">{item.title}</h3>
                        <p className="text-slate-400 text-sm line-clamp-1">{item.description}</p>
                        <p className="text-[10px] text-violet-400 font-mono truncate max-w-[300px]">{item.file_url}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="text-slate-400 hover:text-white hover:bg-white/5"
                          onClick={() => startEdit(item)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="text-slate-400 hover:text-red-500 hover:bg-red-500/10"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {materials.length === 0 && (
              <div className="text-center py-12 text-slate-500 font-bold italic">
                Nenhum material cadastrado ainda.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;