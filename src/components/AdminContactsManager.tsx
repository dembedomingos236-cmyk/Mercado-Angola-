import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Building2,
  Clock,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  User,
  ExternalLink
} from 'lucide-react';
import { ContactMessage } from '../types';
import { contactService } from '../services/contactService';

export const AdminContactsManager: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const all = await contactService.getAllMessages();
      setMessages(all);
    } catch (err) {
      console.error('Error loading contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    messageId: string,
    status: 'pendente' | 'em_atendimento' | 'resolvido'
  ) => {
    const success = await contactService.updateMessageStatus(messageId, status);
    if (success) {
      setMessages(prev =>
        prev.map(m => (m.messageId === messageId ? { ...m, status } : m))
      );
      if (selectedMessage?.messageId === messageId) {
        setSelectedMessage(prev => (prev ? { ...prev, status } : null));
      }
    }
  };

  const filteredMessages = messages.filter(msg => {
    const matchesStatus = filterStatus === 'todos' || msg.status === filterStatus;
    const matchesSearch =
      msg.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.senderEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-red-600" />
            Mensagens e Pedidos de Contacto
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Atendimento a empresas parceiras, vendedores, afiliados e compradores em tempo real.
          </p>
        </div>

        <button
          onClick={loadMessages}
          className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
        >
          Atualizar Mensagens
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {['todos', 'pendente', 'em_atendimento', 'resolvido'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition capitalize ${
                filterStatus === st
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st === 'todos' ? 'Todas' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Pesquisar mensagens..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Split view: List on left, preview on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3 max-h-[75vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-xs text-gray-400">A carregar mensagens...</div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-500">
              Nenhuma mensagem encontrada.
            </div>
          ) : (
            filteredMessages.map(msg => (
              <div
                key={msg.messageId}
                onClick={() => setSelectedMessage(msg)}
                className={`p-4 rounded-2xl border transition cursor-pointer ${
                  selectedMessage?.messageId === msg.messageId
                    ? 'border-red-500 bg-red-50/50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      msg.userType === 'empresa'
                        ? 'bg-purple-100 text-purple-800'
                        : msg.userType === 'vendedor'
                        ? 'bg-blue-100 text-blue-800'
                        : msg.userType === 'afiliado'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {msg.userType}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      msg.status === 'pendente'
                        ? 'bg-red-100 text-red-700'
                        : msg.status === 'em_atendimento'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {msg.status.replace('_', ' ')}
                  </span>
                </div>

                <h4 className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-1">{msg.subject}</h4>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">{msg.senderName}</p>
                <p className="text-xs text-gray-600 line-clamp-2 mt-1">{msg.content}</p>

                <div className="mt-2 text-[10px] text-gray-400">
                  {new Date(msg.createdAt).toLocaleString('pt-AO')}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Detail & Response Panel */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400">
                    Detalhes do Contacto #{selectedMessage.messageId.slice(-6)}
                  </span>
                  <h3 className="text-lg font-black text-gray-900 mt-0.5">
                    {selectedMessage.subject}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Recebido a {new Date(selectedMessage.createdAt).toLocaleString('pt-AO')}
                  </p>
                </div>

                {/* Status Switcher */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500 font-semibold">Estado:</span>
                  <select
                    value={selectedMessage.status}
                    onChange={e => handleUpdateStatus(selectedMessage.messageId, e.target.value as any)}
                    className="text-xs font-bold border border-gray-300 rounded-xl px-2.5 py-1.5 bg-white outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="em_atendimento">Em Atendimento</option>
                    <option value="resolvido">Resolvido</option>
                  </select>
                </div>
              </div>

              {/* Sender Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl text-xs">
                <div>
                  <span className="text-gray-400 block font-semibold">Remetente:</span>
                  <strong className="text-gray-900">{selectedMessage.senderName}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block font-semibold">E-mail:</span>
                  <a
                    href={`mailto:${selectedMessage.senderEmail}`}
                    className="text-blue-600 hover:underline font-bold break-all"
                  >
                    {selectedMessage.senderEmail}
                  </a>
                </div>
                <div>
                  <span className="text-gray-400 block font-semibold">Telemóvel / WhatsApp:</span>
                  <span className="text-gray-900 font-bold">
                    {selectedMessage.senderPhone || 'Não informado'}
                  </span>
                </div>
              </div>

              {/* Message Content */}
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Mensagem Transmitida:
                </h4>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                  {selectedMessage.content}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-3">
                <a
                  href={`mailto:${selectedMessage.senderEmail}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  <Mail className="w-3.5 h-3.5" /> Responder por E-mail
                </a>

                {selectedMessage.senderPhone && (
                  <a
                    href={`https://wa.me/244${selectedMessage.senderPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Olá ${selectedMessage.senderName}! Aqui é o Domingos Dembe da administração do Mercado Angola, em resposta ao seu contacto.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Responder no WhatsApp
                  </a>
                )}

                {selectedMessage.status !== 'resolvido' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedMessage.messageId, 'resolvido')}
                    className="px-4 py-2 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ml-auto"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Marcar como Resolvido
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-gray-200 text-gray-400 p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mb-2" />
              <p className="text-xs sm:text-sm font-semibold">
                Selecione uma mensagem na lista ao lado para ver os detalhes completos e responder.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
