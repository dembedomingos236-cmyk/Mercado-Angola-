import { collection, doc, getDocs, setDoc, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { ContactMessage } from '../types';
import { notificationService } from './notificationService';

export const OFFICIAL_ADMIN_CONTACTS = {
  unitelPhone: '932 536 856',
  unitelPhoneRaw: '+244932536856',
  africellPhone: '959 350 734',
  africellPhoneRaw: '+244959350734',
  email: 'dembedomingos@236gmail.com', // as requested by user
  supportHours: 'Segunda a Sábado, das 08h00 às 19h00 (WAT)',
  location: 'Luanda, Angola',
  whatsappNumber: '244932536856',
  welcomeMessage:
    'Olá! Obrigado por entrares em contacto com a administração da nossa plataforma. Estamos disponíveis para esclarecer dúvidas sobre parcerias, candidaturas, vendas, comissões e utilização do aplicativo. Escolhe um dos nossos contactos oficiais para receber assistência.',
  partnershipMessage:
    'Olá! Agradecemos o teu interesse em estabelecer uma parceria connosco. Para discutir oportunidades comerciais, divulgação de produtos, afiliação e outras formas de colaboração, entra em contacto com o administrador através dos contactos oficiais apresentados nesta página.'
};

export const contactService = {
  async submitContactMessage(params: {
    senderName: string;
    senderEmail: string;
    senderPhone?: string;
    userType: 'cliente' | 'empresa' | 'vendedor' | 'afiliado';
    subject: string;
    content: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const contactMsg: ContactMessage = {
        messageId,
        senderName: params.senderName,
        senderEmail: params.senderEmail,
        senderPhone: params.senderPhone || '',
        userType: params.userType,
        subject: params.subject,
        content: params.content,
        status: 'pendente',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'contactMessages', messageId), contactMsg);

      // Automated administrator notification
      await notificationService.createNotification({
        category: params.userType === 'empresa' ? 'candidaturas' : 'sistema',
        priority: params.userType === 'empresa' ? 'critico' : 'normal',
        title: `Novo Contacto da Administração: ${params.senderName}`,
        message: `Recebida nova mensagem de ${params.userType.toUpperCase()} (${params.senderName} - ${params.senderEmail}). Assunto: "${params.subject}".`,
        event: 'novo_contacto_admin',
        idempotencyKey: `contact-msg-${messageId}`,
        metadata: {
          candidateName: params.senderName,
          candidateEmail: params.senderEmail,
          candidatePhone: params.senderPhone,
          targetRoleOrCampaign: params.userType
        },
        actionType: 'manage_application'
      });

      return { success: true, messageId };
    } catch (err: any) {
      console.error('Error submitting contact message:', err);
      return { success: false, error: err.message || 'Erro ao enviar mensagem para a administração.' };
    }
  },

  async getAllMessages(): Promise<ContactMessage[]> {
    try {
      const snap = await getDocs(collection(db, 'contactMessages'));
      const messages = snap.docs.map(d => d.data() as ContactMessage);
      return messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.warn('Error reading contact messages from Firestore:', err);
      return [];
    }
  },

  async updateMessageStatus(
    messageId: string,
    status: 'pendente' | 'em_atendimento' | 'resolvido',
    operatorNotes?: string
  ): Promise<boolean> {
    try {
      const ref = doc(db, 'contactMessages', messageId);
      const updates: any = {
        status,
        updatedAt: new Date().toISOString()
      };
      if (operatorNotes !== undefined) {
        updates.operatorNotes = operatorNotes;
      }
      await updateDoc(ref, updates);
      return true;
    } catch (err) {
      console.error('Error updating contact message status:', err);
      return false;
    }
  }
};
