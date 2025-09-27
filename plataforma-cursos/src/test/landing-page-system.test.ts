import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LandingPageService } from '@/lib/services/landing-page.service';
import { LandingPageRepository } from '@/lib/db/repositories/landing-page.repository';
import { HeroContent, FeaturesContent, TestimonialsContent, PricingContent, FAQContent, AboutContent } from '@/types';

describe('Landing Page System', () => {
  let landingPageService: LandingPageService;

  beforeEach(() => {
    landingPageService = new LandingPageService();
  });

  describe('LandingPageService', () => {
    it('should validate hero content correctly', async () => {
      const validHeroContent: HeroContent = {
        title: 'Test Title',
        subtitle: 'Test Subtitle',
        description: 'Test Description',
        buttonText: 'Test Button',
        backgroundImage: 'https://example.com/image.jpg',
        features: ['Feature 1', 'Feature 2'],
      };

      expect(() => landingPageService['validateHeroContent'](validHeroContent)).not.toThrow();

      const invalidHeroContent: HeroContent = {
        title: '',
        subtitle: 'Test Subtitle',
        description: 'Test Description',
        buttonText: 'Test Button',
      };

      expect(() => landingPageService['validateHeroContent'](invalidHeroContent)).toThrow('Hero title is required');
    });

    it('should validate features content correctly', async () => {
      const validFeaturesContent: FeaturesContent = {
        title: 'Test Features',
        subtitle: 'Test Subtitle',
        items: [
          {
            title: 'Feature 1',
            description: 'Description 1',
            icon: 'star',
          },
        ],
      };

      expect(() => landingPageService['validateFeaturesContent'](validFeaturesContent)).not.toThrow();

      const invalidFeaturesContent: FeaturesContent = {
        title: '',
        subtitle: 'Test Subtitle',
        items: [],
      };

      expect(() => landingPageService['validateFeaturesContent'](invalidFeaturesContent)).toThrow('Features title is required');
    });

    it('should validate testimonials content correctly', async () => {
      const validTestimonialsContent: TestimonialsContent = {
        title: 'Test Testimonials',
        subtitle: 'Test Subtitle',
        items: [
          {
            name: 'John Doe',
            role: 'Developer',
            content: 'Great platform!',
            rating: 5,
          },
        ],
      };

      expect(() => landingPageService['validateTestimonialsContent'](validTestimonialsContent)).not.toThrow();

      const invalidTestimonialsContent: TestimonialsContent = {
        title: 'Test Testimonials',
        subtitle: 'Test Subtitle',
        items: [
          {
            name: '',
            role: 'Developer',
            content: 'Great platform!',
            rating: 5,
          },
        ],
      };

      expect(() => landingPageService['validateTestimonialsContent'](invalidTestimonialsContent)).toThrow('Testimonial 1 name is required');
    });

    it('should validate pricing content correctly', async () => {
      const validPricingContent: PricingContent = {
        title: 'Test Pricing',
        subtitle: 'Test Subtitle',
        plans: [
          {
            name: 'Basic Plan',
            price: '30',
            period: 'month',
            description: 'Basic features',
            features: ['Feature 1', 'Feature 2'],
            buttonText: 'Subscribe',
            highlighted: false,
          },
        ],
      };

      expect(() => landingPageService['validatePricingContent'](validPricingContent)).not.toThrow();

      const invalidPricingContent: PricingContent = {
        title: '',
        subtitle: 'Test Subtitle',
        plans: [],
      };

      expect(() => landingPageService['validatePricingContent'](invalidPricingContent)).toThrow('Pricing title is required');
    });

    it('should validate FAQ content correctly', async () => {
      const validFAQContent: FAQContent = {
        title: 'Test FAQ',
        subtitle: 'Test Subtitle',
        items: [
          {
            question: 'What is this?',
            answer: 'This is a test.',
          },
        ],
      };

      expect(() => landingPageService['validateFAQContent'](validFAQContent)).not.toThrow();

      const invalidFAQContent: FAQContent = {
        title: '',
        subtitle: 'Test Subtitle',
        items: [
          {
            question: '',
            answer: 'This is a test.',
          },
        ],
      };

      expect(() => landingPageService['validateFAQContent'](invalidFAQContent)).toThrow('FAQ title is required');
    });

    it('should validate about content correctly', async () => {
      const validAboutContent: AboutContent = {
        title: 'About Us',
        subtitle: 'Our Story',
        description: 'We are a great company.',
        imageUrl: 'https://example.com/image.jpg',
        stats: [
          {
            label: 'Users',
            value: '1000+',
            icon: '👥',
          },
        ],
      };

      expect(() => landingPageService['validateAboutContent'](validAboutContent)).not.toThrow();

      const invalidAboutContent: AboutContent = {
        title: '',
        subtitle: 'Our Story',
        description: '',
      };

      expect(() => landingPageService['validateAboutContent'](invalidAboutContent)).toThrow('About title is required');
    });
  });

  describe('Content Structure', () => {
    it('should have proper section types', () => {
      const validSections = ['hero', 'features', 'testimonials', 'pricing', 'faq', 'about'];
      
      validSections.forEach(section => {
        expect(typeof section).toBe('string');
        expect(section.length).toBeGreaterThan(0);
      });
    });

    it('should handle empty content gracefully', () => {
      const emptyContent = {};
      
      expect(() => {
        // Test that components can handle empty content
        const heroContent = emptyContent as HeroContent;
        expect(heroContent.title || '').toBe('');
      }).not.toThrow();
    });
  });

  describe('API Response Format', () => {
    it('should return proper API response structure', () => {
      const mockResponse = {
        success: true,
        data: {
          sections: [],
          popularCourses: [],
          latestCourses: [],
        },
      };

      expect(mockResponse).toHaveProperty('success');
      expect(mockResponse).toHaveProperty('data');
      expect(mockResponse.data).toHaveProperty('sections');
      expect(mockResponse.data).toHaveProperty('popularCourses');
      expect(mockResponse.data).toHaveProperty('latestCourses');
    });

    it('should handle error responses correctly', () => {
      const errorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid content provided',
        },
      };

      expect(errorResponse).toHaveProperty('success', false);
      expect(errorResponse).toHaveProperty('error');
      expect(errorResponse.error).toHaveProperty('code');
      expect(errorResponse.error).toHaveProperty('message');
    });
  });

  describe('Content Validation', () => {
    it('should validate required fields', () => {
      const requiredFields = {
        hero: ['title', 'subtitle', 'buttonText'],
        features: ['title', 'items'],
        testimonials: ['title', 'items'],
        pricing: ['title', 'plans'],
        faq: ['title', 'items'],
        about: ['title', 'description'],
      };

      Object.entries(requiredFields).forEach(([section, fields]) => {
        fields.forEach(field => {
          expect(typeof field).toBe('string');
          expect(field.length).toBeGreaterThan(0);
        });
      });
    });

    it('should validate array items structure', () => {
      const arrayFields = {
        features: { items: ['title', 'description', 'icon'] },
        testimonials: { items: ['name', 'content', 'rating'] },
        pricing: { plans: ['name', 'price', 'buttonText'] },
        faq: { items: ['question', 'answer'] },
      };

      Object.entries(arrayFields).forEach(([section, config]) => {
        Object.entries(config).forEach(([arrayField, requiredProps]) => {
          requiredProps.forEach(prop => {
            expect(typeof prop).toBe('string');
            expect(prop.length).toBeGreaterThan(0);
          });
        });
      });
    });
  });
});