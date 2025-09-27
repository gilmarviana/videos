import { LandingPageRepository } from '@/lib/db/repositories/landing-page.repository';
import { CourseRepository } from '@/lib/db/repositories/course.repository';
import { 
  LandingPageContent, 
  HeroContent, 
  FeaturesContent, 
  TestimonialsContent, 
  PricingContent, 
  FAQContent,
  AboutContent,
  Course
} from '@/types';
import { getDbConnection } from '@/lib/db/connection';

export class LandingPageService {
  private landingPageRepo: LandingPageRepository;
  private courseRepo: CourseRepository;

  constructor() {
    const db = getDbConnection();
    this.landingPageRepo = new LandingPageRepository(db);
    this.courseRepo = new CourseRepository();
  }

  async getAllSections(): Promise<LandingPageContent[]> {
    return await this.landingPageRepo.getAllSections();
  }

  async getSectionByName(section: string): Promise<LandingPageContent | null> {
    return await this.landingPageRepo.getSectionByName(section);
  }

  async updateHeroSection(content: HeroContent): Promise<LandingPageContent> {
    this.validateHeroContent(content);
    return await this.landingPageRepo.updateSection('hero', content);
  }

  async updateFeaturesSection(content: FeaturesContent): Promise<LandingPageContent> {
    this.validateFeaturesContent(content);
    return await this.landingPageRepo.updateSection('features', content);
  }

  async updateTestimonialsSection(content: TestimonialsContent): Promise<LandingPageContent> {
    this.validateTestimonialsContent(content);
    return await this.landingPageRepo.updateSection('testimonials', content);
  }

  async updatePricingSection(content: PricingContent): Promise<LandingPageContent> {
    this.validatePricingContent(content);
    return await this.landingPageRepo.updateSection('pricing', content);
  }

  async updateFAQSection(content: FAQContent): Promise<LandingPageContent> {
    this.validateFAQContent(content);
    return await this.landingPageRepo.updateSection('faq', content);
  }

  async updateAboutSection(content: AboutContent): Promise<LandingPageContent> {
    this.validateAboutContent(content);
    return await this.landingPageRepo.updateSection('about', content);
  }

  async toggleSectionStatus(section: string, isActive: boolean): Promise<LandingPageContent | null> {
    return await this.landingPageRepo.toggleSectionStatus(section, isActive);
  }

  async getPopularCourses(limit: number = 6): Promise<Course[]> {
    return await this.courseRepo.getPopularCourses(limit);
  }

  async getLatestCourses(limit: number = 6): Promise<Course[]> {
    return await this.courseRepo.getLatestCourses(limit);
  }

  async getLandingPageData(): Promise<{
    sections: LandingPageContent[];
    popularCourses: Course[];
    latestCourses: Course[];
  }> {
    const [sections, popularCourses, latestCourses] = await Promise.all([
      this.getAllSections(),
      this.getPopularCourses(),
      this.getLatestCourses()
    ]);

    return {
      sections,
      popularCourses,
      latestCourses
    };
  }

  private validateHeroContent(content: HeroContent): void {
    if (!content.title || content.title.trim().length === 0) {
      throw new Error('Hero title is required');
    }
    if (!content.subtitle || content.subtitle.trim().length === 0) {
      throw new Error('Hero subtitle is required');
    }
    if (!content.buttonText || content.buttonText.trim().length === 0) {
      throw new Error('Hero button text is required');
    }
  }

  private validateFeaturesContent(content: FeaturesContent): void {
    if (!content.title || content.title.trim().length === 0) {
      throw new Error('Features title is required');
    }
    if (!content.items || content.items.length === 0) {
      throw new Error('At least one feature item is required');
    }
    content.items.forEach((item, index) => {
      if (!item.title || item.title.trim().length === 0) {
        throw new Error(`Feature item ${index + 1} title is required`);
      }
      if (!item.description || item.description.trim().length === 0) {
        throw new Error(`Feature item ${index + 1} description is required`);
      }
    });
  }

  private validateTestimonialsContent(content: TestimonialsContent): void {
    if (!content.title || content.title.trim().length === 0) {
      throw new Error('Testimonials title is required');
    }
    if (!content.items || content.items.length === 0) {
      throw new Error('At least one testimonial is required');
    }
    content.items.forEach((item, index) => {
      if (!item.name || item.name.trim().length === 0) {
        throw new Error(`Testimonial ${index + 1} name is required`);
      }
      if (!item.content || item.content.trim().length === 0) {
        throw new Error(`Testimonial ${index + 1} content is required`);
      }
      if (item.rating < 1 || item.rating > 5) {
        throw new Error(`Testimonial ${index + 1} rating must be between 1 and 5`);
      }
    });
  }

  private validatePricingContent(content: PricingContent): void {
    if (!content.title || content.title.trim().length === 0) {
      throw new Error('Pricing title is required');
    }
    if (!content.plans || content.plans.length === 0) {
      throw new Error('At least one pricing plan is required');
    }
    content.plans.forEach((plan, index) => {
      if (!plan.name || plan.name.trim().length === 0) {
        throw new Error(`Plan ${index + 1} name is required`);
      }
      if (!plan.price) {
        throw new Error(`Plan ${index + 1} price is required`);
      }
      if (!plan.buttonText || plan.buttonText.trim().length === 0) {
        throw new Error(`Plan ${index + 1} button text is required`);
      }
    });
  }

  private validateFAQContent(content: FAQContent): void {
    if (!content.title || content.title.trim().length === 0) {
      throw new Error('FAQ title is required');
    }
    if (!content.items || content.items.length === 0) {
      throw new Error('At least one FAQ item is required');
    }
    content.items.forEach((item, index) => {
      if (!item.question || item.question.trim().length === 0) {
        throw new Error(`FAQ ${index + 1} question is required`);
      }
      if (!item.answer || item.answer.trim().length === 0) {
        throw new Error(`FAQ ${index + 1} answer is required`);
      }
    });
  }

  private validateAboutContent(content: AboutContent): void {
    if (!content.title || content.title.trim().length === 0) {
      throw new Error('About title is required');
    }
    if (!content.description || content.description.trim().length === 0) {
      throw new Error('About description is required');
    }
  }
}