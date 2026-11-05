import React, { useState, useEffect } from 'react';
import { X, Send, Store, User, ShieldCheck } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';
import { marketplaceService } from '../services/marketplaceService';
import { ChatMessage } from '../types';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

export const ChatModal: React.FC = () => {
  const { activeChatSeller, setActiveChatSeller } = useMarket();
  const { profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const chatId = activeChatSeller
    ? `chat_${profile?.uid || 'buyer'}_${activeChatSeller.sellerId}`
    : '';

  useEffect(() => {
    if (!chatId) return;

    // Listen to messages for this chat
    const q = query(
      collection(db, 'chatMessages'),
      where('chatId', '==', chatId)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: ChatMessage[] = [];
        snap.forEach((d) => list.push(d.data() as ChatMessage));
        setMessages(
          list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        );
      },
      (err) => console.warn('Chat listener em modo seguro:', err.message)
    );

    return () => unsub();
  }, [chatId]);

  if (!activeChatSeller) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;
    setIsSending(true);

    const text = inputMessage;
    setInputMessage('');

    try {
      await marketplaceService.sendChatMessage({
        chatId,
        senderId: profile?.uid || 'buyer_guest',
        senderName: profile?.displayName || 'Comprador',
        receiverId: activeChatSeller.sellerId,
        productId: activeChatSeller.productId,
        productName: activeChatSeller.productName,
        text,
      });
    } catch (err) {
      console.error('Falha ao enviar mensagem:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full h-[520px] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white leading-tight">
                {activeChatSeller.storeName}
              </h3>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Canal Seguro Mercado Angola
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveChatSeller(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Reference Header if inquiring about specific product */}
        {activeChatSeller.productName && (
          <div className="bg-amber-50 px-3.5 py-1.5 border-b border-amber-200 text-xs text-amber-900 flex justify-between items-center">
            <span className="truncate">Sobre: <strong>{activeChatSeller.productName}</strong></span>
          </div>
        )}

        {/* Messages body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {messages.length === 0 ? (
            <div className="text-center py-12 space-y-2 text-slate-400">
              <Store className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs">
                Inicie uma conversa direta com <strong>{activeChatSeller.storeName}</strong> sobre disponibilidade, entregas ou dúvidas.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.senderId === (profile?.uid || 'buyer_guest');
              return (
                <div
                  key={m.messageId}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-xs ${
                      isMe
                        ? 'bg-slate-900 text-white rounded-br-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                    }`}
                  >
                    <p>{m.text}</p>
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Escreva a sua mensagem ao vendedor..."
            className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isSending}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 p-2 rounded-xl disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
