import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, GraduationCap, Camera, Save } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [course, setCourse] = useState('');

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

  if (loading) return <div className="text-white">Carregando...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <Card className="bg-slate-900 border-slate-800 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-violet-600 to-blue-600" />
        <CardContent className="relative pt-0">
          <div className="flex flex-col items-center -mt-16 space-y-4">
            <div className="relative group">
              <Avatar className="w-32 h-32 border-4 border-slate-900 shadow-2xl">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-slate-800 text-3xl text-violet-400">
                  {fullName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 bg-violet-600 p-2 rounded-full text-white hover:bg-violet-700 transition-colors">
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">{fullName}</h2>
              <p className="text-violet-400 font-medium">{course}</p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                <Input 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Curso</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                <Input 
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
            <Button onClick={updateProfile} disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700">
              <Save className="mr-2 h-4 w-4" /> SALVAR ALTERAÇÕES
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;