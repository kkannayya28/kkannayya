import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Loader2, User, Bot, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatProps {
  notes: string;
}

export default function Chat({ notes }: ChatProps) {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes,
          message: userMessage,
          history: messages.map(m => ({
            role: m.role,
            parts: [{ text: m.content }]
          }))
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'model', content: data.response }]);
    } catch (error) {
      console.error('Chat failed', error);
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-[70vh] flex flex-col neo-card bg-white overflow-hidden">
      <div className="bg-neo-blue p-4 border-b-4 border-neo-black flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <div className="bg-white p-1 border-2 border-neo-black">
            <Bot className="w-6 h-6 text-neo-black" />
          </div>
          <span className="font-bold uppercase tracking-wider">AI Study Buddy</span>
        </div>
        <div className="text-white/80 text-xs font-bold uppercase">
          Ask absolutely anything!
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-neo-background/50">
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <Sparkles className="w-12 h-12 mb-4" />
              <p className="font-bold uppercase">Ask me absolutely anything about your subjects & notes!</p>
            </div>
          )}
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`
                max-w-[80%] neo-card p-4
                ${m.role === 'user' ? 'bg-neo-yellow' : 'bg-white'}
              `}>
                <div className="flex items-center gap-2 mb-2 opacity-50">
                   {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                   <span className="text-xs font-black uppercase text-xs">{m.role === 'user' ? 'You' : 'Memora'}</span>
                </div>
                <div className="markdown-body text-sm font-medium leading-relaxed">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="neo-card p-4 bg-white">
                <Loader2 className="w-5 h-5 animate-spin text-neo-blue" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white border-t-4 border-neo-black flex gap-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 neo-input !p-2"
        />
        <button type="submit" className="neo-button bg-neo-black text-white !px-4">
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
