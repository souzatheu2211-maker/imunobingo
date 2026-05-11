import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  player_name: string;
  message: string;
  created_at: string;
}

interface ChatProps {
  roomId: string;
  playerName: string;
}

const Chat: React.FC<ChatProps> = ({ roomId, playerName }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };

    fetchMessages();

    const channel = supabase
      .channel(`chat:${roomId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `room_id=eq.${roomId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg = newMessage;
    setNewMessage('');

    await supabase.from('messages').insert({
      room_id: roomId,
      player_name: playerName,
      message: msg
    });
  };

  return (
    <div className="flex flex-col h-[400px] w-[320px] md:w-[380px] bg-slate-950/95 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10">
      <div className="p-4 bg-white/5 border-b border-white/10">
        <h3 className="text-xs font-black text-white uppercase tracking-widest">Comunicação do Lab</h3>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="flex flex-col">
              <span className="text-[9px] font-black text-violet-400 uppercase tracking-tighter">
                {msg.player_name}
              </span>
              <p className="text-sm text-slate-300 bg-white/5 p-3 rounded-2xl mt-1 border border-white/5">
                {msg.message}
              </p>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      <form onSubmit={sendMessage} className="p-4 bg-white/5 border-t border-white/10 flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Sinalizar equipe..."
          className="bg-slate-900 border-white/10 text-white h-11 rounded-xl focus:ring-violet-500"
        />
        <Button type="submit" size="icon" className="h-11 w-11 bg-violet-600 hover:bg-violet-500 rounded-xl shadow-lg shadow-violet-900/20">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default Chat;