import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, ExternalLink, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Studies = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    const { data } = await supabase.from('study_materials').select('*').order('created_at', { ascending: false });
    if (data) setMaterials(data);
  };

  const filtered = materials.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase()) || 
    m.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Materiais de Estudo</h1>
          <p className="text-slate-400">Acesse PDFs e conteúdos exclusivos da disciplina.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Buscar material..." 
            className="pl-10 bg-slate-900 border-slate-800 text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <Card key={item.id} className="bg-slate-900 border-slate-800 hover:border-violet-500/50 transition-all group">
            <CardHeader className="pb-2">
              <div className="bg-violet-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="text-violet-400 w-6 h-6" />
              </div>
              <CardTitle className="text-white text-lg">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm mb-6 line-clamp-2">{item.description}</p>
              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1 bg-slate-800 hover:bg-slate-700 text-white" asChild>
                  <a href={item.file_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" /> VER
                  </a>
                </Button>
                <Button variant="outline" size="icon" className="border-slate-800 hover:bg-slate-800" asChild>
                  <a href={item.file_url} download>
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-20 text-slate-500">
            Nenhum material encontrado.
          </div>
        )}
      </div>
    </div>
  );
};

export default Studies;