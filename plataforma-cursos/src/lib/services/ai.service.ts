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
    const difficultyDistribution = this.getDifficultyDistribution(questionCount);
    
    return `
Create ${questionCount} multiple-choice quiz questions based on the following ${type} content:

Title: ${title}
Content: ${content}

Requirements:
1. Create exactly ${questionCount} questions
2. Each question should have 4 multiple-choice options (A, B, C, D)
3. Questions should test understanding, application, and analysis - not just memorization
4. Include difficulty distribution: ${difficultyDistribution.easy} easy, ${difficultyDistribution.medium} medium, ${difficultyDistribution.hard} hard questions
5. Provide a brief explanation for the correct answer
6. Questions should be directly relevant to the content provided
7. Use clear, concise language appropriate for online learners
8. Avoid trick questions or ambiguous wording
9. Make incorrect options plausible but clearly wrong
10. Focus on key concepts, practical applications, and important details

Question Types to Include:
- Conceptual understanding questions
- Application/scenario-based questions
- Analysis and comparison questions
- Definition and terminology questions (sparingly)

Return the response in the following JSON format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this is correct and why other options are incorrect",
      "difficulty": "easy|medium|hard"
    }
  ]
}

Make sure the JSON is valid and properly formatted. Each question should be unique and test different aspects of the content.
`;
  }

  private getDifficultyDistribution(questionCount: number): { easy: number; medium: number; hard: number } {
    if (questionCount <= 3) {
      return { easy: 1, medium: 1, hard: 1 };
    } else if (questionCount <= 5) {
      return { easy: 2, medium: 2, hard: 1 };
    } else if (questionCount <= 10) {
      return { easy: 3, medium: 4, hard: 3 };
    } else {
      // For larger quizzes, maintain roughly 30% easy, 50% medium, 20% hard
      const easy = Math.ceil(questionCount * 0.3);
      const hard = Math.ceil(questionCount * 0.2);
      const medium = questionCount - easy - hard;
      return { easy, medium, hard };
    }
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

      // Validate that options are not empty or too similar
      const trimmedOptions = q.options.map((opt: string) => opt.trim());
      if (trimmedOptions.some((opt: string) => !opt)) {
        throw new Error(`Empty option found in question at index ${index}`);
      }

      // Check for duplicate options
      const uniqueOptions = new Set(trimmedOptions.map((opt: string) => opt.toLowerCase()));
      if (uniqueOptions.size !== 4) {
        console.warn(`Duplicate or very similar options found in question at index ${index}`);
      }

      return {
        id: `q_${Date.now()}_${index}`,
        question: q.question.trim(),
        options: trimmedOptions,
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

  async generateCustomQuiz(request: QuizGenerationRequest & {
    difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
    focusAreas?: string[];
    questionTypes?: ('conceptual' | 'application' | 'analysis' | 'definition')[];
  }): Promise<QuizQuestion[]> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const { content, type, title, questionCount = 5, difficulty = 'mixed', focusAreas = [], questionTypes = [] } = request;
      
      const prompt = this.buildCustomQuizPrompt(content, type, title, questionCount, difficulty, focusAreas, questionTypes);
      
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
              content: 'You are an expert educational content creator specializing in creating high-quality, pedagogically sound quiz questions for online courses. Always respond with valid JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 3000,
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

      let quizData;
      try {
        quizData = JSON.parse(content_response);
      } catch (parseError) {
        console.error('Failed to parse AI response:', content_response);
        throw new Error('Invalid JSON response from AI service');
      }
      
      return this.validateAndFormatQuestions(quizData.questions);
      
    } catch (error) {
      console.error('Error generating custom quiz with AI:', error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Failed to generate custom quiz questions');
    }
  }

  private buildCustomQuizPrompt(
    content: string, 
    type: string, 
    title: string, 
    questionCount: number,
    difficulty: string,
    focusAreas: string[],
    questionTypes: string[]
  ): string {
    let difficultyInstruction = '';
    if (difficulty === 'easy') {
      difficultyInstruction = 'Focus on basic understanding and recall questions.';
    } else if (difficulty === 'medium') {
      difficultyInstruction = 'Focus on application and comprehension questions.';
    } else if (difficulty === 'hard') {
      difficultyInstruction = 'Focus on analysis, synthesis, and evaluation questions.';
    } else {
      difficultyInstruction = 'Include a mix of difficulty levels as appropriate.';
    }

    let focusInstruction = '';
    if (focusAreas.length > 0) {
      focusInstruction = `Pay special attention to these focus areas: ${focusAreas.join(', ')}.`;
    }

    let typeInstruction = '';
    if (questionTypes.length > 0) {
      typeInstruction = `Prioritize these question types: ${questionTypes.join(', ')}.`;
    }

    return `
Create ${questionCount} multiple-choice quiz questions based on the following ${type} content:

Title: ${title}
Content: ${content}

Special Instructions:
${difficultyInstruction}
${focusInstruction}
${typeInstruction}

Requirements:
1. Create exactly ${questionCount} questions
2. Each question should have 4 multiple-choice options (A, B, C, D)
3. Questions should test deep understanding and practical application
4. Provide detailed explanations for correct answers
5. Make incorrect options plausible but clearly distinguishable from correct answers
6. Use clear, professional language appropriate for online learners
7. Ensure questions are directly relevant to the provided content
8. Avoid ambiguous wording or trick questions

Return the response in the following JSON format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of why this is correct and why other options are incorrect",
      "difficulty": "easy|medium|hard"
    }
  ]
}

Make sure the JSON is valid and properly formatted.
`;
  }
}

export const aiService = new AIService();