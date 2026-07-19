'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import styles from './ask.module.css';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  sources?: string[];
}

export default function AskPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: 'Bonjour ! Je suis l\'assistant IA d\'Optisafe. Posez-moi vos questions sur vos contrats (ex: "Suis-je couvert pour un dégât des eaux ?", "Quelle est ma franchise auto ?").'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsg.content })
      });
      
      if (res.ok) {
        const data = await res.json();
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: data.answer,
          sources: data.sources
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error('Erreur API');
      }
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: 'Désolé, une erreur est survenue lors de la recherche.'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Recherche IA</h1>
      </div>

      <div className={styles.chatArea} ref={chatAreaRef}>
        {messages.map(msg => (
          <div key={msg.id} className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.aiMessage}`}>
            <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
            {msg.sources && msg.sources.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                {msg.sources.map((src, idx) => (
                  <span key={idx} className={styles.sourceHighlight}>Source : {src}</span>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className={`${styles.message} ${styles.aiMessage} ${styles.loadingMessage}`}>
            <div className={styles.spinner}></div>
            Recherche dans vos contrats...
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className={styles.inputArea}>
        <input
          type="text"
          className={styles.input}
          placeholder="Posez votre question sur vos contrats..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <Button type="submit" variant="primary" className={styles.sendButton} disabled={!input.trim() || loading}>
          Envoyer
        </Button>
      </form>
    </div>
  );
}
