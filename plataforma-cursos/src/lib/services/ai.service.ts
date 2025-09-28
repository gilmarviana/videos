import { config } from '../config';
import { QuizQuestion } from '../../types';

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

interface QuizGenerationRequest {
  content: string;
  type: 'lesson' | 'module' | 'course';
  title: string;
  questionCount?: number;
}

export class AIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';
  private model = 'gpt-3.5-turbo';

  constructor() {
    this.apiKey = config.openai.apiKey;
    
    if (!this.apiKey) {
      console.warn('OpenAI API key not configured. Quiz generation will not work.');
    }
  }

  async generateQuiz(request: QuizGenerationRequest): Promise<QuizQuestion[]> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const { content, type, title, questionCount = 5 } = request;
      
      const prompt = this.buildQuizPrompt(content, type, title, questionCount);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert educational content creator specializing in creating high-quality quiz questions for online courses. Always respond with valid JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data: OpenAIResponse = await response.json();
      const content_response = data.choices[0]?.message?.content;

      if (!content_response) {
        throw new Error('No content received from OpenAI API');
      }

      // Parse the JSON response
      let quizData;
      try {
        quizData = JSON.parse(content_response);
      } catch (parseError) {
        console.error('Failed to parse AI response:', content_response);
        throw new Error('Invalid JSON response from AI service');
      }
      
      // Validate and format the questions
      return this.validateAndFormatQuestions(quizData.questions);
      
    } catch (error) {
      console.error('Error generating quiz with AI:', error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Failed to generate quiz questions');
    }
  }

  private buildQuizPrompt(content: string, type: string, title: string, questionCount: number): string {
    return `
Create ${questionCount} multiple-choice quiz questions based on the following ${type} content:

Title: ${title}
Content: ${content}

Requirements:
1. Create exactly ${questionCount} questions
2. Each question should have 4 multiple-choice options (A, B, C, D)
3. Questions should test understanding, not just memorization
4. Include a mix of difficulty levels (easy, medium, hard)
5. Provide a brief explanation for the correct answer
6. Questions should be relevant to the content provided
7. Use clear, concise language appropriate for online learners

Return the response in the following JSON format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

Make sure the JSON is valid and properly formatted.
`;
  }

  private validateAndFormatQuestions(questions: any[]): QuizQuestion[] {
    if (!Array.isArray(questions)) {
      throw new Error('Invalid questions format received from AI');
    }

    return questions.map((q, index) => {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Invalid question format at index ${index}`);
      }

      if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
        throw new Error(`Invalid correct answer at index ${index}`);
      }

      return {
        id: `q_${Date.now()}_${index}`,
        question: q.question.trim(),
        options: q.options.map((opt: string) => opt.trim()),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation?.trim() || '',
      };
    });
  }

  async generateQuizFromVideoContent(videoTitle: string, videoDescription: string, lessonMaterials?: string[]): Promise<QuizQuestion[]> {
    const content = `
Video Title: ${videoTitle}
Description: ${videoDescription}
${lessonMaterials && lessonMaterials.length > 0 ? `Additional Materials: ${lessonMaterials.join(', ')}` : ''}
`;

    return this.generateQuiz({
      content,
      type: 'lesson',
      title: videoTitle,
      questionCount: 3, // Fewer questions for individual lessons
    });
  }

  async generateModuleQuiz(moduleTitle: string, moduleDescription: string, lessonTitles: string[]): Promise<QuizQuestion[]> {
    const content = `
Module Title: ${moduleTitle}
Description: ${moduleDescription}
Lessons covered: ${lessonTitles.join(', ')}
`;

    return this.generateQuiz({
      content,
      type: 'module',
      title: moduleTitle,
      questionCount: 5,
    });
  }

  async generateCourseQuiz(courseTitle: string, courseDescription: string, moduleData: { title: string; lessons: string[] }[]): Promise<QuizQuestion[]> {
    const content = `
Course Title: ${courseTitle}
Description: ${courseDescription}
Modules and Lessons:
${moduleData.map(module => `- ${module.title}: ${module.lessons.join(', ')}`).join('\n')}
`;

    return this.generateQuiz({
      content,
      type: 'course',
      title: courseTitle,
      questionCount: 10, // More comprehensive quiz for full course
    });
  }

  // Fallback method for when AI is not available
  generateFallbackQuiz(title: string, type: 'lesson' | 'module' | 'course'): QuizQuestion[] {
    const questionCount = type === 'lesson' ? 3 : type === 'module' ? 5 : 10;
    const questions: QuizQuestion[] = [];

    for (let i = 0; i < questionCount; i++) {
      questions.push({
        id: `fallback_${Date.now()}_${i}`,
        question: `Sample question ${i + 1} for ${title}`,
        options: [
          'Option A - This is a sample option',
          'Option B - This is another sample option',
          'Option C - This is a third sample option',
          'Option D - This is the fourth sample option'
        ],
        correctAnswer: 0,
        explanation: 'This is a sample quiz question generated as a fallback when AI service is not available.',
      });
    }

    return questions;
  }

  async generateQuizWithFallback(request: QuizGenerationRequest): Promise<QuizQuestion[]> {
    try {
      return await this.generateQuiz(request);
    } catch (error) {
      console.warn('AI quiz generation failed, using fallback:', error);
      return this.generateFallbackQuiz(request.title, request.type);
    }
  }
}

export const aiService = new AIService();