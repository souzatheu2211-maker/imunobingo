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
    <div className="flex flex-col h-[300px] bg-slate-900/50 rounded-xl border border-slate-700 overflow-hidden">
      <div className="p-3 bg-slate-800 border-b border-slate-700">
        <h3 className="text-sm font-semibold text-slate-200">Chat da Sala</h3>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className="flex flex-col">
              <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">
                {msg.player_name}
              </span>
              <p className="text-sm text-slate-300 bg-slate-800/50 p-2 rounded-lg mt-1">
                {msg.message}
              </p>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      <form onSubmit={sendMessage} className="p-3 bg-slate-800 border-t border-slate-700 flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="bg-slate-900 border-slate-700 text-slate-200 h-9"
        />
        <Button type="submit" size="icon" className="h-9 w-9 bg-violet-600 hover:bg-violet-700">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default Chat;