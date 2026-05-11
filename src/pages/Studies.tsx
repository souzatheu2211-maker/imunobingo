import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, ExternalLink, Search, Sparkles, Trash2, Edit2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { showError, showSuccess } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';

const Studies = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMaterials();
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Verifica se é o e-mail master ou se tem a flag no perfil
      if (user.email === 'theu@imuno.com') {
        setIsAdmin(true);
      } else {
        const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
        setIsAdmin(data?.is_admin || false);
      }
    }
  };

  const fetchMaterials = async () => {
    const { data } = await supabase.from('study_materials').select('*').order('created_at', { ascending: false });
    if (data) setMaterials(data);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Tem certeza que deseja excluir este material permanentemente?");
    if (!confirmed) return;
    
    try {
      const { error } = await supabase.from('study_materials').delete().eq('id', id);
      if (error) throw error;
      
      showSuccess("Material removido com sucesso!");
      fetchMaterials();
    } catch (error: any) {
      showError("Erro ao excluir: " + error.message);
    }
  };

  const filtered = materials.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase()) || 
    m.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full">
            <Sparkles className="w-3 h-3 text-violet-400" />
            <span className="text-violet-400 text-[10px] font-black uppercase tracking-widest">Biblioteca Digital</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">Materiais de Estudo</h1>
          <p className="text-slate-400 font-medium">Conteúdos selecionados para sua evolução acadêmica.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Pesquisar no acervo..." 
            className="pl-12 h-12 bg-white/5 border-white/10 text-white rounded-2xl focus:ring-violet-500 placeholder:text-slate-600 font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <Card key={item.id} className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 group rounded-[2rem] overflow-hidden border-t-white/20 relative">
            
            {/* Botões de Gestão (Sempre visíveis para Admins) */}
            {isAdmin && (
              <div className="absolute top-4 right-4 flex gap-2 z-30">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-9 w-9 bg-slate-900/80 hover:bg-violet-600 text-white rounded-xl border border-white/10 shadow-lg backdrop-blur-md"
                  onClick={() => navigate('/admin')}
                  title="Editar no Painel"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-9 w-9 bg-slate-900/80 hover:bg-red-600 text-white rounded-xl border border-white/10 shadow-lg backdrop-blur-md"
                  onClick={() => handleDelete(item.id)}
                  title="Excluir Material"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}

            <CardContent className="p-8 space-y-6">
              <div className="flex items-start justify-between">
                <div className="bg-violet-600/20 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-violet-500/20">
                  <FileText className="text-violet-400 w-7 h-7" />
                </div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">PDF</span>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-white text-xl font-black tracking-tight leading-tight group-hover:text-violet-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 font-medium">
                  {item.description || "Sem descrição disponível para este material."}
                </p>
              </div>

              <Button 
                className="w-full h-12 bg-white/5 hover:bg-violet-600 text-white hover:text-white border border-white/10 hover:border-violet-500 rounded-xl font-black text-xs tracking-widest transition-all duration-300 group/btn"
                asChild
              >
                <a href={item.file_url} target="_blank" rel="noopener noreferrer">
                  ACESSAR CONTEÚDO
                  <ExternalLink className="ml-2 h-3 w-3 opacity-50 group-hover/btn:opacity-100 transition-opacity" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
        
        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-32 space-y-4 opacity-30">
            <FileText className="w-16 h-16 text-slate-500" />
            <p className="text-xl font-black uppercase tracking-widest text-slate-500">Nenhum material encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Studies;