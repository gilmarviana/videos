import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '../../../../lib/db/connection';
import { QuizService } from '../../../../lib/services/quiz.service';
import { authMiddleware } from '../../../../lib/auth/middleware';
import { z } from 'zod';

const generateFromVideoSchema = z.object({
  lessonId: z.string().uuid(),
  videoTranscript: z.string().optional(),
  videoMetadata: z.object({
    title: z.string(),
    description: z.string().optional(),
    duration: z.number().optional(),
    topics: z.array(z.string()).optional(),
  }).optional(),
  overwriteExisting: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_001', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Admin only
    if (authResult.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_003', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { lessonId, videoTranscript, videoMetadata, overwriteExisting } = generateFromVideoSchema.parse(body);

    const db = await getConnection();
    const quizService = new QuizService(db);

    // Check if quiz already exists
    const existingQuiz = await quizService.getQuizByTarget(lessonId, 'lesson');
    if (existingQuiz && !overwriteExisting) {
      return NextResponse.json(
        { success: false, error: { code: 'QUIZ_003', message: 'Quiz already exists for this lesson. Set overwriteExisting to true to replace it.' } },
        { status: 409 }
      );
    }

    // Delete existing quiz if overwriting
    if (existingQuiz && overwriteExisting) {
      await quizService.deleteQuiz(existingQuiz.id);
    }

    // Generate enhanced content for AI
    let enhancedTranscript = videoTranscript;
    if (videoMetadata && !videoTranscript) {
      enhancedTranscript = `
Title: ${videoMetadata.title}
${videoMetadata.description ? `Description: ${videoMetadata.description}` : ''}
${videoMetadata.duration ? `Duration: ${Math.floor(videoMetadata.duration / 60)} minutes` : ''}
${videoMetadata.topics && videoMetadata.topics.length > 0 ? `Topics covered: ${videoMetadata.topics.join(', ')}` : ''}
`;
    }

    const quiz = await quizService.generateQuizFromVideoContent(lessonId, enhancedTranscript);

    return NextResponse.json({
      success: true,
      data: {
        quiz,
        message: 'Quiz generated successfully from video content',
        usedTranscript: !!videoTranscript,
        usedMetadata: !!videoMetadata,
      },
    });

  } catch (error) {
    console.error('Video-based quiz generation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: error.errors } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: 'QUIZ_001', message: 'Failed to generate quiz from video content' } },
      { status: 500 }
    );
  }
}