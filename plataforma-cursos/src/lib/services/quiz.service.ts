import { Pool } from 'pg';
import { Quiz, QuizQuestion, QuizAttempt } from '../../types';
import { aiService } from './ai.service';
import { QuizRepository } from '../db/repositories/quiz.repository';

export class QuizService {
  private quizRepository: QuizRepository;

  constructor(private db: Pool) {
    this.quizRepository = new QuizRepository(db);
  }

  async createQuiz(data: {
    lessonId?: string;
    moduleId?: string;
    courseId?: string;
    type: 'lesson' | 'module' | 'course';
    questions: QuizQuestion[];
  }): Promise<Quiz> {
    return this.quizRepository.create(data);
  }

  async getQuizByTarget(targetId: string, type: 'lesson' | 'module' | 'course'): Promise<Quiz | null> {
    return this.quizRepository.findByTarget(targetId, type);
  }

  async generateAndSaveQuizForLesson(lessonId: string): Promise<Quiz> {
    // Check if quiz already exists
    const existingQuiz = await this.getQuizByTarget(lessonId, 'lesson');
    if (existingQuiz) {
      throw new Error('Quiz already exists for this lesson');
    }

    // Get lesson details using repository
    const lessonDetails = await this.quizRepository.getLessonDetails(lessonId);
    
    if (!lessonDetails) {
      throw new Error('Lesson not found');
    }

    const materials = lessonDetails.materials ? lessonDetails.materials.map((m: any) => m.name) : [];

    try {
      // Enhanced content for AI generation including video context
      const enhancedContent = `
Video Title: ${lessonDetails.title}
Description: ${lessonDetails.description}
Module: ${lessonDetails.moduleTitle}
Course: ${lessonDetails.courseTitle}
${materials.length > 0 ? `Additional Materials: ${materials.join(', ')}` : ''}

Context: This is a lesson within the "${lessonDetails.moduleTitle}" module of the "${lessonDetails.courseTitle}" course. 
Generate questions that test understanding of the specific concepts covered in this lesson.
`;

      // Generate quiz using AI with fallback
      const questions = await aiService.generateQuizWithFallback({
        content: enhancedContent,
        type: 'lesson',
        title: lessonDetails.title,
        questionCount: 3,
      });

      // Save quiz to database
      return this.createQuiz({
        lessonId,
        type: 'lesson',
        questions,
      });
    } catch (error) {
      console.error('Error generating lesson quiz:', error);
      throw new Error('Failed to generate quiz for lesson');
    }
  }

  async generateAndSaveQuizForModule(moduleId: string): Promise<Quiz> {
    // Check if quiz already exists
    const existingQuiz = await this.getQuizByTarget(moduleId, 'module');
    if (existingQuiz) {
      throw new Error('Quiz already exists for this module');
    }

    // Get module details using repository
    const moduleDetails = await this.quizRepository.getModuleDetails(moduleId);
    
    if (!moduleDetails) {
      throw new Error('Module not found');
    }

    try {
      // Generate quiz using AI with fallback
      const questions = await aiService.generateQuizWithFallback({
        content: `
Module Title: ${moduleDetails.title}
Description: ${moduleDetails.description}
Lessons covered: ${moduleDetails.lessonTitles.join(', ')}
`,
        type: 'module',
        title: moduleDetails.title,
        questionCount: 5,
      });

      // Save quiz to database
      return this.createQuiz({
        moduleId,
        type: 'module',
        questions,
      });
    } catch (error) {
      console.error('Error generating module quiz:', error);
      throw new Error('Failed to generate quiz for module');
    }
  }

  async generateAndSaveQuizForCourse(courseId: string): Promise<Quiz> {
    // Check if quiz already exists
    const existingQuiz = await this.getQuizByTarget(courseId, 'course');
    if (existingQuiz) {
      throw new Error('Quiz already exists for this course');
    }

    // Get course details using repository
    const courseDetails = await this.quizRepository.getCourseDetails(courseId);
    
    if (!courseDetails) {
      throw new Error('Course not found');
    }

    try {
      // Generate quiz using AI with fallback
      const questions = await aiService.generateQuizWithFallback({
        content: `
Course Title: ${courseDetails.title}
Description: ${courseDetails.description}
Modules and Lessons:
${courseDetails.modulesData.map(module => `- ${module.title}: ${module.lessons.join(', ')}`).join('\n')}
`,
        type: 'course',
        title: courseDetails.title,
        questionCount: 10,
      });

      // Save quiz to database
      return this.createQuiz({
        courseId,
        type: 'course',
        questions,
      });
    } catch (error) {
      console.error('Error generating course quiz:', error);
      throw new Error('Failed to generate quiz for course');
    }
  }

  async submitQuizAttempt(data: {
    userId: string;
    quizId: string;
    answers: number[];
  }): Promise<QuizAttempt> {
    // Get quiz questions to calculate score
    const quizQuery = `
      SELECT questions FROM quizzes WHERE id = $1
    `;

    const quizResult = await this.db.query(quizQuery, [data.quizId]);
    
    if (quizResult.rows.length === 0) {
      throw new Error('Quiz not found');
    }

    const questions: QuizQuestion[] = quizResult.rows[0].questions;
    
    // Calculate score
    let correctAnswers = 0;
    data.answers.forEach((answer, index) => {
      if (questions[index] && questions[index].correctAnswer === answer) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / questions.length) * 100;

    // Save attempt
    const attemptQuery = `
      INSERT INTO quiz_attempts (user_id, quiz_id, answers, score)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, quiz_id, answers, score, completed_at
    `;

    const attemptResult = await this.db.query(attemptQuery, [
      data.userId,
      data.quizId,
      JSON.stringify(data.answers),
      score
    ]);

    const row = attemptResult.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      quizId: row.quiz_id,
      answers: row.answers,
      score: row.score,
      completedAt: row.completed_at,
    };
  }

  async getUserQuizAttempts(userId: string, quizId: string): Promise<QuizAttempt[]> {
    const query = `
      SELECT id, user_id, quiz_id, answers, score, completed_at
      FROM quiz_attempts
      WHERE user_id = $1 AND quiz_id = $2
      ORDER BY completed_at DESC
    `;

    const result = await this.db.query(query, [userId, quizId]);

    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      quizId: row.quiz_id,
      answers: row.answers,
      score: row.score,
      completedAt: row.completed_at,
    }));
  }

  async getUserAverageQuizScore(userId: string, courseId: string): Promise<number> {
    const query = `
      SELECT AVG(qa.score) as average_score
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE qa.user_id = $1 AND q.course_id = $2
    `;

    const result = await this.db.query(query, [userId, courseId]);
    return result.rows[0]?.average_score || 0;
  }

  async deleteQuiz(quizId: string): Promise<void> {
    const query = `
      UPDATE quizzes SET is_active = false WHERE id = $1
    `;

    await this.db.query(query, [quizId]);
  }

  async updateQuiz(quizId: string, questions: QuizQuestion[]): Promise<Quiz> {
    const query = `
      UPDATE quizzes 
      SET questions = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, lesson_id, module_id, course_id, quiz_type as type, questions, is_active, created_at
    `;

    const result = await this.db.query(query, [JSON.stringify(questions), quizId]);
    
    if (result.rows.length === 0) {
      throw new Error('Quiz not found');
    }

    const row = result.rows[0];
    return {
      id: row.id,
      lessonId: row.lesson_id,
      moduleId: row.module_id,
      courseId: row.course_id,
      type: row.type,
      questions: row.questions,
      isActive: row.is_active,
      createdAt: row.created_at,
    };
  }

  async getQuizConfiguration(targetId: string, type: 'lesson' | 'module' | 'course'): Promise<{ hasQuiz: boolean; isEnabled: boolean; quiz?: Quiz }> {
    const quiz = await this.getQuizByTarget(targetId, type);
    
    return {
      hasQuiz: quiz !== null,
      isEnabled: quiz?.isActive || false,
      quiz: quiz || undefined,
    };
  }

  async regenerateQuiz(targetId: string, type: 'lesson' | 'module' | 'course'): Promise<Quiz> {
    // First, deactivate existing quiz
    const existingQuiz = await this.getQuizByTarget(targetId, type);
    if (existingQuiz) {
      await this.deleteQuiz(existingQuiz.id);
    }

    // Generate new quiz
    switch (type) {
      case 'lesson':
        return this.generateAndSaveQuizForLesson(targetId);
      case 'module':
        return this.generateAndSaveQuizForModule(targetId);
      case 'course':
        return this.generateAndSaveQuizForCourse(targetId);
      default:
        throw new Error('Invalid quiz type');
    }
  }

  async toggleQuizStatus(quizId: string): Promise<Quiz> {
    const query = `
      UPDATE quizzes 
      SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, lesson_id, module_id, course_id, quiz_type as type, questions, is_active, created_at
    `;

    const result = await this.db.query(query, [quizId]);
    
    if (result.rows.length === 0) {
      throw new Error('Quiz not found');
    }

    const row = result.rows[0];
    return {
      id: row.id,
      lessonId: row.lesson_id,
      moduleId: row.module_id,
      courseId: row.course_id,
      type: row.type,
      questions: row.questions,
      isActive: row.is_active,
      createdAt: row.created_at,
    };
  }

  async getQuizPerformanceAnalytics(quizId: string): Promise<{
    totalAttempts: number;
    averageScore: number;
    passRate: number;
    questionAnalytics: Array<{
      questionIndex: number;
      correctAnswers: number;
      totalAnswers: number;
      successRate: number;
    }>;
  }> {
    // Get quiz details
    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    // Get basic stats
    const statsQuery = `
      SELECT 
        COUNT(*) as total_attempts,
        AVG(score) as average_score,
        COUNT(CASE WHEN score >= 70 THEN 1 END) as passed_attempts
      FROM quiz_attempts
      WHERE quiz_id = $1
    `;

    const statsResult = await this.db.query(statsQuery, [quizId]);
    const stats = statsResult.rows[0];

    // Get question-level analytics
    const questionAnalytics = [];
    const questions = quiz.questions;

    for (let i = 0; i < questions.length; i++) {
      const correctAnswer = questions[i].correctAnswer;
      
      const questionStatsQuery = `
        SELECT 
          COUNT(*) as total_answers,
          COUNT(CASE WHEN (answers->$1)::int = $2 THEN 1 END) as correct_answers
        FROM quiz_attempts
        WHERE quiz_id = $3 AND jsonb_array_length(answers) > $1
      `;

      const questionResult = await this.db.query(questionStatsQuery, [i, correctAnswer, quizId]);
      const questionStats = questionResult.rows[0];

      questionAnalytics.push({
        questionIndex: i,
        correctAnswers: parseInt(questionStats.correct_answers) || 0,
        totalAnswers: parseInt(questionStats.total_answers) || 0,
        successRate: questionStats.total_answers > 0 
          ? (parseInt(questionStats.correct_answers) / parseInt(questionStats.total_answers)) * 100 
          : 0,
      });
    }

    return {
      totalAttempts: parseInt(stats.total_attempts) || 0,
      averageScore: parseFloat(stats.average_score) || 0,
      passRate: stats.total_attempts > 0 
        ? (parseInt(stats.passed_attempts) / parseInt(stats.total_attempts)) * 100 
        : 0,
      questionAnalytics,
    };
  }

  async generateQuizFromVideoContent(lessonId: string, videoTranscript?: string): Promise<Quiz> {
    // Get lesson details
    const lessonDetails = await this.quizRepository.getLessonDetails(lessonId);
    
    if (!lessonDetails) {
      throw new Error('Lesson not found');
    }

    const materials = lessonDetails.materials ? lessonDetails.materials.map((m: any) => m.name) : [];

    // Enhanced content with video transcript if available
    let content = `
Video Title: ${lessonDetails.title}
Description: ${lessonDetails.description}
Module: ${lessonDetails.moduleTitle}
Course: ${lessonDetails.courseTitle}
${materials.length > 0 ? `Additional Materials: ${materials.join(', ')}` : ''}
`;

    if (videoTranscript) {
      content += `\nVideo Transcript/Content:\n${videoTranscript}`;
    }

    try {
      const questions = await aiService.generateQuizWithFallback({
        content,
        type: 'lesson',
        title: lessonDetails.title,
        questionCount: videoTranscript ? 5 : 3, // More questions if we have transcript
      });

      return this.createQuiz({
        lessonId,
        type: 'lesson',
        questions,
      });
    } catch (error) {
      console.error('Error generating quiz from video content:', error);
      throw new Error('Failed to generate quiz from video content');
    }
  }

  async bulkGenerateQuizzesForCourse(courseId: string, options: {
    generateForLessons?: boolean;
    generateForModules?: boolean;
    generateForCourse?: boolean;
    overwriteExisting?: boolean;
  }): Promise<{
    lessonQuizzes: Quiz[];
    moduleQuizzes: Quiz[];
    courseQuiz: Quiz | null;
    errors: string[];
  }> {
    const results = {
      lessonQuizzes: [] as Quiz[],
      moduleQuizzes: [] as Quiz[],
      courseQuiz: null as Quiz | null,
      errors: [] as string[],
    };

    // Generate lesson quizzes
    if (options.generateForLessons) {
      const lessonsQuery = `
        SELECT l.id 
        FROM lessons l
        JOIN modules m ON l.module_id = m.id
        WHERE m.course_id = $1
        ORDER BY m.order_index, l.order_index
      `;
      
      const lessonsResult = await this.db.query(lessonsQuery, [courseId]);
      
      for (const lesson of lessonsResult.rows) {
        try {
          const existingQuiz = await this.getQuizByTarget(lesson.id, 'lesson');
          
          if (existingQuiz && !options.overwriteExisting) {
            continue; // Skip if quiz exists and we're not overwriting
          }

          if (existingQuiz && options.overwriteExisting) {
            await this.deleteQuiz(existingQuiz.id);
          }

          const quiz = await this.generateAndSaveQuizForLesson(lesson.id);
          results.lessonQuizzes.push(quiz);
        } catch (error) {
          results.errors.push(`Failed to generate quiz for lesson ${lesson.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    // Generate module quizzes
    if (options.generateForModules) {
      const modulesQuery = `
        SELECT id FROM modules WHERE course_id = $1 ORDER BY order_index
      `;
      
      const modulesResult = await this.db.query(modulesQuery, [courseId]);
      
      for (const module of modulesResult.rows) {
        try {
          const existingQuiz = await this.getQuizByTarget(module.id, 'module');
          
          if (existingQuiz && !options.overwriteExisting) {
            continue;
          }

          if (existingQuiz && options.overwriteExisting) {
            await this.deleteQuiz(existingQuiz.id);
          }

          const quiz = await this.generateAndSaveQuizForModule(module.id);
          results.moduleQuizzes.push(quiz);
        } catch (error) {
          results.errors.push(`Failed to generate quiz for module ${module.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    // Generate course quiz
    if (options.generateForCourse) {
      try {
        const existingQuiz = await this.getQuizByTarget(courseId, 'course');
        
        if (!existingQuiz || options.overwriteExisting) {
          if (existingQuiz && options.overwriteExisting) {
            await this.deleteQuiz(existingQuiz.id);
          }

          results.courseQuiz = await this.generateAndSaveQuizForCourse(courseId);
        }
      } catch (error) {
        results.errors.push(`Failed to generate quiz for course ${courseId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return results;
  }
}