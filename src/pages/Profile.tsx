import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, GraduationCap, Camera, Save, Loader2 } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [course, setCourse] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
      setFullName(data?.full_name || '');
      setCourse(data?.course || '');
    }
    setLoading(false);
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você deve selecionar uma imagem para fazer o upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Usuário não autenticado.");

      // Organizando por pasta com o ID do usuário para segurança
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: publicUrl });
      showSuccess("Foto de perfil atualizada!");
    } catch (error: any) {
      showError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('profiles').update({
      full_name: fullName,
      course: course,
      updated_at: new Date()
    }).eq('id', user?.id);

    if (error) showError(error.message);
    else showSuccess("Perfil atualizado!");
    setLoading(false);
  };

  if (loading) return <div className="text-white text-center py-20">Carregando perfil...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <Card className="bg-slate-900 border-slate-800 overflow-hidden rounded-[2.5rem] shadow-2xl">
        <div className="h-32 bg-gradient-to-r from-violet-600 to-blue-600" />
        <CardContent className="relative pt-0">
          <div className="flex flex-col items-center -mt-16 space-y-4">
            <div className="relative group">
              <Avatar className="w-32 h-32 border-4 border-slate-900 shadow-2xl">
                <AvatarImage src={profile?.avatar_url} className="object-cover" />
                <AvatarFallback className="bg-slate-800 text-3xl text-violet-400 font-black">
                  {fullName[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={uploadAvatar} 
                accept="image/*" 
                className="hidden" 
              />
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 bg-violet-600 p-2.5 rounded-full text-white hover:bg-violet-700 transition-all shadow-lg hover:scale-110 active:scale-95 disabled:opacity-50"
              >
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
              </button>
            </div>
            
            <div className="text-center">
              <h2 className="text-2xl font-black text-white tracking-tight">{fullName || 'Usuário'}</h2>
              <p className="text-violet-400 font-bold uppercase text-[10px] tracking-widest">{course || 'Estudante'}</p>
            </div>
          </div>

          <div className="mt-10 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                <Input 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-12 h-12 bg-slate-800/50 border-slate-700 text-white rounded-2xl focus:ring-violet-500 font-bold"
                  placeholder="Seu nome completo"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Curso / Especialidade</label>
              <div className="relative">
                <GraduationCap className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                <Input 
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="pl-12 h-12 bg-slate-800/50 border-slate-700 text-white rounded-2xl focus:ring-violet-500 font-bold"
                  placeholder="Ex: Enfermagem"
                />
              </div>
            </div>

            <Button 
              onClick={updateProfile} 
              disabled={loading} 
              className="w-full h-14 bg-violet-600 hover:bg-violet-500 text-white font-black rounded-2xl shadow-xl shadow-violet-900/20 transition-all active:scale-95"
            >
              <Save className="mr-2 h-5 w-5" /> SALVAR ALTERAÇÕES
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;