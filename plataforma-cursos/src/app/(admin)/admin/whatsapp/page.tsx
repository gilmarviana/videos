import { WhatsAppConfiguration } from '@/components/whatsapp';

export default function WhatsAppPage() {
  return (
    <div className="container mx-auto py-6">
      <WhatsAppConfiguration />
    </div>
  );
}

export const metadata = {
  title: 'Configuração WhatsApp - Admin',
  description: 'Configure o botão flutuante do WhatsApp e opções de menu',
};