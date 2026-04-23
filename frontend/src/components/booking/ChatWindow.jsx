import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, X, MessageSquare, User } from 'lucide-react';

const ChatWindow = ({ bookingId, currentUser, recipientName, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef();
  const socketRef = useRef();

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    socketRef.current = io(socketUrl);
    
    socketRef.current.emit('join_booking', bookingId);

    socketRef.current.on('new_chat_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => socketRef.current.disconnect();
  }, [bookingId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const msg = {
      bookingId,
      senderId: currentUser._id,
      senderName: currentUser.name,
      text: input,
      timestamp: new Date()
    };
    socketRef.current.emit('send_chat_message', msg);
    setMessages(prev => [...prev, msg]);
    setInput('');
  };

  return (
    <div className="card scale-in" style={{ 
      position:'fixed', bottom: 20, right: 20, width: 350, height: 450, 
      display:'flex', flexDirection:'column', zIndex: 1000,
      boxShadow: '0 20px 50px rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)'
    }}>
      {/* Header */}
      <div style={{ padding: '1rem', background: 'var(--grad-brand)', color: 'white', display:'flex', alignItems:'center', justifyContent:'space-between', borderTopLeftRadius:'1.5rem', borderTopRightRadius:'1.5rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
           <div className="avatar" style={{ width:32, height:32, fontSize:'0.8rem', background:'rgba(255,255,255,0.2)' }}>{recipientName?.charAt(0)}</div>
           <div>
              <p style={{ fontWeight:800, fontSize:'0.9rem' }}>{recipientName}</p>
              <p style={{ fontSize:'0.7rem', opacity:0.8 }}>Online</p>
           </div>
        </div>
        <button onClick={onClose} style={{ background:'none', border:'none', color:'white', cursor:'pointer' }}><X size={18} /></button>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'1rem', display:'flex', flexDirection:'column', gap:12 }} className="custom-scrollbar">
        {messages.length === 0 && (
           <div style={{ textAlign:'center', marginTop:'50%', color:'var(--text-muted)' }}>
              <MessageSquare size={32} style={{ opacity:0.2, marginBottom:8 }} />
              <p style={{ fontSize:'0.8rem' }}>Start a conversation...</p>
           </div>
        )}
        {messages.map((m, i) => {
          const isMe = m.senderId === currentUser._id;
          return (
            <div key={i} style={{ 
              alignSelf: isMe ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              padding: '0.75rem 1rem',
              borderRadius: isMe ? '1.25rem 1.25rem 0 1.25rem' : '1.25rem 1.25rem 1.25rem 0',
              background: isMe ? 'var(--brand-500)' : 'var(--bg-surface)',
              color: isMe ? 'white' : 'var(--text-primary)',
              border: isMe ? 'none' : '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              {m.text}
              <p style={{ fontSize:'0.6rem', opacity:0.6, marginTop:4, textAlign:'right' }}>
                {new Date(m.timestamp).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
              </p>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div style={{ padding:'1rem', borderTop:'1px solid var(--border-subtle)', display:'flex', gap:8 }}>
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..." 
          className="input-field" 
          style={{ marginBottom:0, height:42, borderRadius:999, fontSize:'0.85rem' }} 
        />
        <button onClick={handleSend} className="btn btn-primary" style={{ width:42, height:42, borderRadius:999, padding:0, flexShrink:0 }}>
           <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
