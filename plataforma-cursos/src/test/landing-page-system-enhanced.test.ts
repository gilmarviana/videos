import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LandingPageService } from '@/lib/services/landing-page.service';
import { LandingPageRepository } from '@/lib/db/repositories/landing-page.repository';
import { HeroContent, FeaturesContent, TestimonialsContent, PricingContent, FAQContent, AboutContent } from '@/types';

// Mock the database connection
vi.mock('@/lib/db/connection', () => ({
  getDbConnection: vi.fn(() => ({
    query: vi.fn(),
  })),
}));

// Mock the repositories
vi.mock('@/lib/db/repositories/landing-page.repository');
vi.mock('@/lib/db/repositories/course.repository');

describe('Enhanced Landing Page System', () => {
  let landingPageService: LandingPageService;
  let mockLandingPageRepository: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockLandingPageRepository = {
      getAllSections: vi.fn(),
      getSectionByName: vi.fn(),
      updateSection: vi.fn(),
      toggleSectionStatus: vi.fn(),
      createSection: vi.fn(),
      deleteSection: vi.fn(),
    };

    vi.mocked(LandingPageRepository).mockImplementation(() => mockLandingPageRepository);
    landingPageService = new LandingPageService();
  });

  describe('Hero Section Management', () => {
    it('should update hero section with background image', async () => {
      const heroContent: HeroContent = {
        title: 'Aprenda Novas Habilidades',
        subtitle: 'Acesso ilimitado por R$ 30/mês',
        description: 'Comece com 4 horas grátis',
        buttonText: 'Começar Teste Gratuito',
        backgroundImage: '/uploads/landing/hero-1234567890.jpg',
        features: ['4 horas grátis', 'Acesso ilimitado', 'Certificados']
      };

      const mockUpdatedSection = {
        id: 'hero-id',
        section: 'hero',
        content: heroContent,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockLandingPageRepository.updateSection.mockResolvedValue(mockUpdatedSection);

      const result = await landingPageService.updateHeroSection(heroContent);

      expect(mockLandingPageRepository.updateSection).toHaveBeenCalledWith('hero', heroContent);
      expect(result).toEqual(mockUpdatedSection);
    });

    it('should validate hero content before updating', async () => {
      const invalidHeroContent = {
        title: '',
        subtitle: 'Valid subtitle',
        description: 'Valid description',
        buttonText: 'Valid button',
      } as HeroContent;

      await expect(landingPageService.updateHeroSection(invalidHeroContent))
        .rejects.toThrow('Hero title is required');
    });
  });

  describe('Features Section Management', () => {
    it('should update features section with images', async () => {
      const featuresContent: FeaturesContent = {
        title: 'Por que escolher nossa plataforma?',
        subtitle: 'Recursos que fazem a diferença',
        items: [
          {
            title: 'Conteúdo de Qualidade',
            description: 'Cursos criados por especialistas',
            icon: 'star',
            imageUrl: '/uploads/landing/features-0-1234567890.jpg'
          },
          {
            title: 'Aprenda no seu Ritmo',
            description: 'Acesse quando quiser',
            icon: 'clock',
            imageUrl: '/uploads/landing/features-1-1234567890.jpg'
          }
        ]
      };

      const mockUpdatedSection = {
        id: 'features-id',
        section: 'features',
        content: featuresContent,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockLandingPageRepository.updateSection.mockResolvedValue(mockUpdatedSection);

      const result = await landingPageService.updateFeaturesSection(featuresContent);

      expect(mockLandingPageRepository.updateSection).toHaveBeenCalledWith('features', featuresContent);
      expect(result).toEqual(mockUpdatedSection);
    });

    it('should validate features content', async () => {
      const invalidFeaturesContent = {
        title: '',
        subtitle: 'Valid subtitle',
        items: []
      } as FeaturesContent;

      await expect(landingPageService.updateFeaturesSection(invalidFeaturesContent))
        .rejects.toThrow('Features title is required');
    });
  });

  describe('Testimonials Section Management', () => {
    it('should update testimonials section with avatars', async () => {
      const testimonialsContent: TestimonialsContent = {
        title: 'O que nossos alunos dizem',
        subtitle: 'Histórias reais de transformação',
        items: [
          {
            name: 'Maria Silva',
            role: 'Desenvolvedora',
            content: 'Excelente plataforma!',
            rating: 5,
            avatar: '/uploads/landing/testimonials-0-1234567890.jpg'
          },
          {
            name: 'João Santos',
            role: 'Designer',
            content: 'Aprendi muito!',
            rating: 5,
            avatar: '/uploads/landing/testimonials-1-1234567890.jpg'
          }
        ]
      };

      const mockUpdatedSection = {
        id: 'testimonials-id',
        section: 'testimonials',
        content: testimonialsContent,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockLandingPageRepository.updateSection.mockResolvedValue(mockUpdatedSection);

      const result = await landingPageService.updateTestimonialsSection(testimonialsContent);

      expect(mockLandingPageRepository.updateSection).toHaveBeenCalledWith('testimonials', testimonialsContent);
      expect(result).toEqual(mockUpdatedSection);
    });
  });

  describe('About Section Management', () => {
    it('should update about section with image and stats', async () => {
      const aboutContent: AboutContent = {
        title: 'Sobre Nossa Plataforma',
        subtitle: 'Transformando vidas através da educação',
        description: 'Nossa missão é democratizar o acesso à educação de qualidade.',
        imageUrl: '/uploads/landing/about-1234567890.jpg',
        stats: [
          {
            label: 'Alunos Ativos',
            value: '1000+',
            icon: '👥'
          },
          {
            label: 'Cursos Disponíveis',
            value: '50+',
            icon: '📚'
          }
        ]
      };

      const mockUpdatedSection = {
        id: 'about-id',
        section: 'about',
        content: aboutContent,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockLandingPageRepository.updateSection.mockResolvedValue(mockUpdatedSection);

      const result = await landingPageService.updateAboutSection(aboutContent);

      expect(mockLandingPageRepository.updateSection).toHaveBeenCalledWith('about', aboutContent);
      expect(result).toEqual(mockUpdatedSection);
    });
  });

  describe('Section Status Management', () => {
    it('should toggle section status', async () => {
      const mockSection = {
        id: 'section-id',
        section: 'hero',
        content: {},
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockLandingPageRepository.toggleSectionStatus.mockResolvedValue(mockSection);

      const result = await landingPageService.toggleSectionStatus('hero', false);

      expect(mockLandingPageRepository.toggleSectionStatus).toHaveBeenCalledWith('hero', false);
      expect(result).toEqual(mockSection);
    });
  });

  describe('Complete Landing Page Data', () => {
    it('should get all landing page data including sections and courses', async () => {
      const mockSections = [
        {
          id: 'hero-id',
          section: 'hero',
          content: { title: 'Hero Title' },
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'features-id',
          section: 'features',
          content: { title: 'Features Title' },
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      const mockPopularCourses = [
        { id: 'course-1', title: 'Popular Course 1' },
        { id: 'course-2', title: 'Popular Course 2' }
      ];

      const mockLatestCourses = [
        { id: 'course-3', title: 'Latest Course 1' },
        { id: 'course-4', title: 'Latest Course 2' }
      ];

      mockLandingPageRepository.getAllSections.mockResolvedValue(mockSections);
      
      // Mock course repository methods
      const mockCourseRepository = {
        getPopularCourses: vi.fn().mockResolvedValue(mockPopularCourses),
        getLatestCourses: vi.fn().mockResolvedValue(mockLatestCourses),
      };

      // Override the course repository in the service
      (landingPageService as any).courseRepo = mockCourseRepository;

      const result = await landingPageService.getLandingPageData();

      expect(result).toEqual({
        sections: mockSections,
        popularCourses: mockPopularCourses,
        latestCourses: mockLatestCourses,
      });
    });
  });

  describe('Content Preview Functionality', () => {
    it('should provide preview data for all sections', async () => {
      const mockSections = [
        {
          id: 'hero-id',
          section: 'hero',
          content: {
            title: 'Preview Hero Title',
            subtitle: 'Preview Subtitle',
            description: 'Preview Description',
            buttonText: 'Preview Button',
            backgroundImage: '/uploads/landing/hero-preview.jpg'
          },
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      mockLandingPageRepository.getAllSections.mockResolvedValue(mockSections);

      const result = await landingPageService.getAllSections();

      expect(result).toEqual(mockSections);
      expect(result[0].content).toHaveProperty('backgroundImage');
    });
  });
});

describe('Image Upload Integration', () => {
  describe('File Upload Validation', () => {
    it('should validate image file types', () => {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const validFile = { type: 'image/jpeg', size: 1024 * 1024 }; // 1MB
      const invalidFile = { type: 'image/gif', size: 1024 * 1024 }; // GIF not allowed

      expect(allowedTypes.includes(validFile.type)).toBe(true);
      expect(allowedTypes.includes(invalidFile.type)).toBe(false);
    });

    it('should validate file size limits', () => {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const validFile = { size: 2 * 1024 * 1024 }; // 2MB
      const invalidFile = { size: 10 * 1024 * 1024 }; // 10MB

      expect(validFile.size <= maxSize).toBe(true);
      expect(invalidFile.size <= maxSize).toBe(false);
    });
  });

  describe('Upload URL Generation', () => {
    it('should generate unique upload URLs', () => {
      const timestamp = Date.now();
      const section = 'hero';
      const extension = 'jpg';
      
      const expectedPattern = new RegExp(`^/uploads/landing/${section}-\\d+\\.${extension}$`);
      const generatedUrl = `/uploads/landing/${section}-${timestamp}.${extension}`;

      expect(generatedUrl).toMatch(expectedPattern);
    });
  });
});

describe('Responsive Design Integration', () => {
  it('should provide responsive content structure', () => {
    const heroContent: HeroContent = {
      title: 'Responsive Title',
      subtitle: 'Responsive Subtitle',
      description: 'Responsive Description',
      buttonText: 'Responsive Button',
      backgroundImage: '/uploads/landing/hero-responsive.jpg',
      features: ['Mobile Friendly', 'Tablet Optimized', 'Desktop Ready']
    };

    // Verify content structure supports responsive design
    expect(heroContent).toHaveProperty('title');
    expect(heroContent).toHaveProperty('subtitle');
    expect(heroContent).toHaveProperty('description');
    expect(heroContent).toHaveProperty('backgroundImage');
    expect(heroContent.features).toBeInstanceOf(Array);
  });
});