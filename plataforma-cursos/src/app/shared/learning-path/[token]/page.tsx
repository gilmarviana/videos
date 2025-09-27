import { SharedLearningPathViewer } from '../../../../components/learning-paths';

interface PageProps {
  params: {
    token: string;
  };
}

export default function SharedLearningPathPage({ params }: PageProps) {
  return <SharedLearningPathViewer shareToken={params.token} />;
}

export async function generateMetadata({ params }: PageProps) {
  // In a real implementation, you might want to fetch the learning path data
  // to generate proper meta tags for SEO and social sharing
  return {
    title: 'Shared Learning Path | Plataforma de Cursos',
    description: 'Explore this curated learning path and discover new courses.',
  };
}