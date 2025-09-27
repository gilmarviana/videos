import { LandingPage } from '@/components/landing';
import { LandingPageService } from '@/lib/services/landing-page.service';

export default async function HomePage() {
  const landingPageService = new LandingPageService();
  
  try {
    const data = await landingPageService.getLandingPageData();
    
    return <LandingPage initialData={data} />;
  } catch (error) {
    console.error('Error loading landing page data:', error);
    
    // Fallback to client-side loading
    return <LandingPage />;
  }
}

export const metadata = {
  title: 'Plataforma de Cursos Online - Aprenda Novas Habilidades',
  description: 'Acesso ilimitado a centenas de cursos por apenas R$ 30/mês. Comece agora com 4 horas grátis para testar nossa plataforma.',
  keywords: 'cursos online, educação, aprendizado, certificados, teste gratuito',
};