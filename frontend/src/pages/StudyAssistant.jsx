import React, { useState, useEffect, useRef } from 'react';
import useAxios from '../hooks/useAxios';
import Card from '../components/common/Card';
import { 
  Sparkles, 
  Send, 
  MessageSquare, 
  Plus, 
  User, 
  AlertCircle,
  Loader2
} from 'lucide-react';

const StudyAssistant = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const axios = useAxios();
  const chatEndRef = useRef(null);

  // Fetch all chat sessions
  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      const { data } = await axios.get('/ai/sessions');
      setSessions(data);
      if (data.length > 0 && !currentSessionId) {
        // Load the most recent session by default
        loadSession(data[0]._id);
      }
    } catch (err) {
      console.error('Failed to load chat sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Scroll to bottom helper
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSession = async (sessionId) => {
    setCurrentSessionId(sessionId);
    setLoadingMessages(true);
    try {
      const { data } = await axios.get(`/ai/sessions/${sessionId}`);
      setMessages(data.messages);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleStartNewSession = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setNewMessage('');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const userMsgText = newMessage;
    setNewMessage('');
    setSending(true);

    // Optimistically push student's message to view
    const tempStudentMsg = { sender: 'student', message: userMsgText, timestamp: new Date() };
    setMessages((prev) => [...prev, tempStudentMsg]);

    try {
      const { data } = await axios.post('/ai/chat', {
        message: userMsgText,
        sessionId: currentSessionId
      });

      // Update state with AI replies
      setMessages(data.messages);
      
      // If it was a new session, update ID and refresh sessions list
      if (!currentSessionId) {
        setCurrentSessionId(data.sessionId);
        fetchSessions();
      }
    } catch (err) {
      console.error('Failed to send message to AI:', err);
      // Push error warning message
      setMessages((prev) => [...prev, { 
        sender: 'ai', 
        message: 'Sorry, I encountered an error while processing that message. Make sure backend is running and Gemini API key is verified.', 
        timestamp: new Date() 
      }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] grid grid-cols-1 md:grid-cols-4 bg-[#020617] animate-in fade-in duration-300">
      
      {/* Session selector sidebar */}
      <div className="md:col-span-1 border-r border-slate-800/80 bg-[#070b19]/60 p-4 flex flex-col justify-between text-left">
        <div className="space-y-4">
          <button
            onClick={handleStartNewSession}
            className="w-full btn-primary text-xs py-2.5 flex items-center justify-center space-x-1.5 cursor-pointer bg-gradient-to-r from-indigo-600 to-violet-650"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat Session</span>
          </button>

          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2">
              Recent Consultations
            </p>
            
            {loadingSessions ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
              </div>
            ) : (
              <div className="space-y-1 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                {sessions.map((s) => {
                  const isActive = currentSessionId === s._id;
                  return (
                    <button
                      key={s._id}
                      onClick={() => loadSession(s._id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer truncate ${
                        isActive 
                          ? 'bg-indigo-600/15 border-l-2 border-indigo-500 text-indigo-300' 
                          : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-350'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{s.sessionName}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat pane */}
      <div className="md:col-span-3 flex flex-col justify-between h-[calc(100vh-73px)] text-left bg-slate-950/20">
        
        {/* Messages Body */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">
          {loadingMessages ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
              <p className="text-sm text-slate-400 mt-2">Loading logs...</p>
            </div>
          ) : messages.length > 0 ? (
            messages.map((m, idx) => {
              const isAi = m.sender === 'ai';
              return (
                <div 
                  key={idx} 
                  className={`flex items-start space-x-3 max-w-3xl ${
                    isAi ? 'mr-auto text-left' : 'ml-auto flex-row-reverse space-x-reverse text-right'
                  }`}
                >
                  <div className={`p-2 rounded-xl flex-shrink-0 border ${
                    isAi ? 'bg-indigo-500/10 border-indigo-500/35 text-indigo-400' : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}>
                    {isAi ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed whitespace-pre-wrap ${
                      isAi 
                        ? 'bg-slate-900/60 border border-slate-800 text-slate-305' 
                        : 'bg-indigo-600 text-white rounded-tr-none'
                    }`}>
                      {m.message}
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1 block">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-550 max-w-md mx-auto text-center space-y-4">
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl">
                <Sparkles className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-200">Personal AI Study Buddy</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Consult on any topic, ask for custom study plans, clear complex doubts, or request syllabus recommendations. Let's start learning!
              </p>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input box */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="relative flex items-center max-w-4xl mx-auto">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ask me anything about your studies..."
              className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500 rounded-2xl pl-4 pr-12 py-3.5 text-slate-200 placeholder:text-slate-500 outline-none transition-all text-sm"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="absolute right-2 p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default StudyAssistant;
