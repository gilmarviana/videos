// Core types for the platform

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'student';
  passwordHash: string;
  trialStartTime: Date | null;
  trialMinutesUsed: number;
  isActive: boolean;
  subscription?: Subscription;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  paymentGatewayId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  coverImageUrl: string;
  price?: number;
  isActive: boolean;
  modules: Module[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  orderIndex: number;
  lessons: Lesson[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  videoUrl: string;
  videoSource: 'google_drive' | 'onedrive' | 'direct';
  videoFormat: 'mp4' | 'avi' | 'mov' | 'mkv' | 'ts' | 'webm';
  durationSeconds: number;
  orderIndex: number;
  materials: LessonMaterial[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LessonMaterial {
  id: string;
  name: string;
  type: 'pdf' | 'audio' | 'document';
  url: string;
  size: number;
}

export interface UserProgress {
  id: string;
  userId: string;
  lessonId: string;
  watchedSeconds: number;
  completed: boolean;
  lastWatchedAt: Date;
  completedAt?: Date;
}

export interface UserFavorite {
  id: string;
  userId: string;
  courseId: string;
  createdAt: Date;
}

export interface CourseCompletion {
  id: string;
  userId: string;
  courseId: string;
  completedAt: Date;
  completionPercentage: number;
}

export interface CourseProgress {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  lessons: UserProgress[];
  isFavorite: boolean;
  isCompleted: boolean;
}

export interface Quiz {
  id: string;
  lessonId?: string;
  moduleId?: string;
  courseId?: string;
  type: 'lesson' | 'module' | 'course';
  questions: QuizQuestion[];
  isActive: boolean;
  createdAt: Date;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  answers: number[];
  score: number;
  completedAt: Date;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  certificateUrl: string;
  averageQuizScore?: number;
  issuedAt: Date;
}

export interface LearningPath {
  id: string;
  userId: string;
  title: string;
  description: string;
  coverImageUrl?: string;
  shareToken: string;
  isPublic: boolean;
  courses: LearningPathCourse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LearningPathCourse {
  id: string;
  learningPathId: string;
  courseId: string;
  orderIndex: number;
  course?: Course;
}

export interface LandingPageContent {
  id: string;
  section: 'hero' | 'features' | 'testimonials' | 'pricing' | 'faq' | 'about';
  content: HeroContent | FeaturesContent | TestimonialsContent | PricingContent | FAQContent | AboutContent;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  backgroundImage?: string;
  features?: string[];
}

export interface FeaturesContent {
  title: string;
  subtitle: string;
  items: FeatureItem[];
}

export interface FeatureItem {
  title: string;
  description: string;
  icon: string;
  imageUrl?: string;
}

export interface TestimonialsContent {
  title: string;
  subtitle: string;
  items: TestimonialItem[];
}

export interface TestimonialItem {
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar?: string;
}

export interface PricingContent {
  title: string;
  subtitle: string;
  plans: PricingPlan[];
}

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  highlighted: boolean;
}

export interface FAQContent {
  title: string;
  subtitle: string;
  items: FAQItem[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface AboutContent {
  title: string;
  subtitle: string;
  description: string;
  imageUrl?: string;
  stats?: StatItem[];
}

export interface StatItem {
  label: string;
  value: string;
  icon?: string;
}

export interface WhatsAppConfig {
  id: string;
  phoneNumber: string;
  welcomeMessage: string;
  menuOptions: WhatsAppMenuOption[];
  isActive: boolean;
  updatedAt: Date;
}

export interface WhatsAppMenuOption {
  id: string;
  title: string;
  message: string;
  icon?: string;
  order: number;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  eventType: 'site_visit' | 'trial_generated' | 'module_completed' | 'certificate_generated';
  headers: Record<string, string>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookLog {
  id: string;
  webhookId: string;
  payload: any;
  responseStatus: number;
  responseBody: string;
  triggeredAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Authentication types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'student';
  trialMinutesUsed: number;
  trialStartTime: Date | null;
  subscription?: {
    status: string;
    currentPeriodEnd: Date;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// Trial system types
export interface TrialStatus {
  isActive: boolean;
  minutesUsed: number;
  minutesRemaining: number;
  startTime: Date | null;
  expiresAt: Date | null;
}

// Video system types
export interface Video {
  id: string;
  lessonId: string;
  url: string;
  source: 'google_drive' | 'onedrive' | 'direct';
  format: 'mp4' | 'avi' | 'mov' | 'mkv' | 'ts' | 'webm' | 'm4v' | 'flv' | 'wmv';
  durationSeconds: number;
  metadata: VideoMetadata;
  isProcessed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoMetadata {
  format: string;
  durationSeconds: number;
  size: number;
  resolution: string;
  bitrate?: number;
}

export interface VideoValidationResult {
  isValid: boolean;
  metadata?: VideoMetadata;
  streamUrl?: string;
  error?: string;
}

export interface VideoPlayerState {
  currentTime: number;
  duration: number;
  playbackRate: number;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  isFullscreen: boolean;
}