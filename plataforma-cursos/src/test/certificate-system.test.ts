import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CertificateService } from '@/lib/services/certificate.service';
import { CertificateRepository } from '@/lib/db/repositories/certificate.repository';
import { generateCertificatePDF } from '@/lib/utils/pdf-generator';
import { uploadFile } from '@/lib/services/file-upload.service';

// Mock dependencies
vi.mock('@/lib/db/repositories/certificate.repository');
vi.mock('@/lib/utils/pdf-generator');
vi.mock('@/lib/services/file-upload.service');
vi.mock('@/lib/db/connection');

const mockCertificateRepository = vi.mocked(CertificateRepository);
const mockGenerateCertificatePDF = vi.mocked(generateCertificatePDF);
const mockUploadFile = vi.mocked(uploadFile);

describe('Certificate System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('CertificateService', () => {
    const mockUser = {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'student' as const,
      passwordHash: 'hash',
      trialStartTime: null,
      trialMinutesUsed: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const mockCourse = {
      id: 'course-1',
      title: 'Test Course',
      description: 'Test Description',
      coverImageUrl: 'test.jpg',
      isActive: true,
      modules: [],
      createdBy: 'admin-1',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const mockCertificate = {
      id: 'cert-1',
      userId: 'user-1',
      courseId: 'course-1',
      certificateUrl: 'https://example.com/cert.pdf',
      averageQuizScore: 85.5,
      issuedAt: new Date()
    };

    describe('generateCertificate', () => {
      it('should generate a new certificate successfully', async () => {
        // Mock existing certificate check
        mockCertificateRepository.findByUserAndCourse.mockResolvedValue(null);
        
        // Mock user and course data
        vi.spyOn(CertificateService as any, 'getUserById').mockResolvedValue(mockUser);
        vi.spyOn(CertificateService as any, 'getCourseById').mockResolvedValue(mockCourse);
        vi.spyOn(CertificateService as any, 'calculateAverageQuizScore').mockResolvedValue(85.5);
        
        // Mock PDF generation and upload
        const mockPDFBuffer = Buffer.from('mock pdf content');
        mockGenerateCertificatePDF.mockResolvedValue(mockPDFBuffer);
        mockUploadFile.mockResolvedValue('https://example.com/cert.pdf');
        
        // Mock certificate creation
        mockCertificateRepository.create.mockResolvedValue(mockCertificate);

        const result = await CertificateService.generateCertificate('user-1', 'course-1');

        expect(result).toEqual(mockCertificate);
        expect(mockGenerateCertificatePDF).toHaveBeenCalledWith({
          userName: 'John Doe',
          courseName: 'Test Course',
          completionDate: expect.any(Date),
          averageScore: 85.5,
          certificateId: expect.stringMatching(/^CERT-\d+-user-1/)
        });
        expect(mockUploadFile).toHaveBeenCalledWith(
          mockPDFBuffer,
          'certificates/user-1/course-1.pdf',
          'application/pdf'
        );
        expect(mockCertificateRepository.create).toHaveBeenCalledWith({
          userId: 'user-1',
          courseId: 'course-1',
          certificateUrl: 'https://example.com/cert.pdf',
          averageQuizScore: 85.5
        });
      });

      it('should return existing certificate if already exists', async () => {
        mockCertificateRepository.findByUserAndCourse.mockResolvedValue(mockCertificate);

        const result = await CertificateService.generateCertificate('user-1', 'course-1');

        expect(result).toEqual(mockCertificate);
        expect(mockGenerateCertificatePDF).not.toHaveBeenCalled();
        expect(mockUploadFile).not.toHaveBeenCalled();
      });

      it('should throw error if user not found', async () => {
        mockCertificateRepository.findByUserAndCourse.mockResolvedValue(null);
        vi.spyOn(CertificateService as any, 'getUserById').mockResolvedValue(null);

        await expect(CertificateService.generateCertificate('user-1', 'course-1'))
          .rejects.toThrow('Failed to generate certificate');
      });

      it('should throw error if course not found', async () => {
        mockCertificateRepository.findByUserAndCourse.mockResolvedValue(null);
        vi.spyOn(CertificateService as any, 'getUserById').mockResolvedValue(mockUser);
        vi.spyOn(CertificateService as any, 'getCourseById').mockResolvedValue(null);

        await expect(CertificateService.generateCertificate('user-1', 'course-1'))
          .rejects.toThrow('Failed to generate certificate');
      });
    });

    describe('getCertificate', () => {
      it('should return certificate if exists', async () => {
        mockCertificateRepository.findByUserAndCourse.mockResolvedValue(mockCertificate);

        const result = await CertificateService.getCertificate('user-1', 'course-1');

        expect(result).toEqual(mockCertificate);
        expect(mockCertificateRepository.findByUserAndCourse).toHaveBeenCalledWith('user-1', 'course-1');
      });

      it('should return null if certificate does not exist', async () => {
        mockCertificateRepository.findByUserAndCourse.mockResolvedValue(null);

        const result = await CertificateService.getCertificate('user-1', 'course-1');

        expect(result).toBeNull();
      });
    });

    describe('getUserCertificates', () => {
      it('should return all user certificates', async () => {
        const mockCertificates = [mockCertificate];
        mockCertificateRepository.findByUserId.mockResolvedValue(mockCertificates);

        const result = await CertificateService.getUserCertificates('user-1');

        expect(result).toEqual(mockCertificates);
        expect(mockCertificateRepository.findByUserId).toHaveBeenCalledWith('user-1');
      });

      it('should return empty array if no certificates', async () => {
        mockCertificateRepository.findByUserId.mockResolvedValue([]);

        const result = await CertificateService.getUserCertificates('user-1');

        expect(result).toEqual([]);
      });
    });

    describe('verifyCertificate', () => {
      it('should return valid certificate with details', async () => {
        const mockResult = {
          certificate: mockCertificate,
          userName: 'John Doe',
          courseName: 'Test Course'
        };
        mockCertificateRepository.findByIdWithDetails.mockResolvedValue(mockResult);

        const result = await CertificateService.verifyCertificate('cert-1');

        expect(result.isValid).toBe(true);
        expect(result.certificate).toEqual({
          ...mockCertificate,
          userName: 'John Doe',
          courseName: 'Test Course'
        });
      });

      it('should return invalid for non-existent certificate', async () => {
        mockCertificateRepository.findByIdWithDetails.mockResolvedValue(null);

        const result = await CertificateService.verifyCertificate('invalid-cert');

        expect(result.isValid).toBe(false);
        expect(result.certificate).toBeUndefined();
      });
    });

    describe('isEligibleForCertificate', () => {
      it('should return true if course is completed', async () => {
        // Mock database query for course completion
        const mockDb = {
          query: vi.fn().mockResolvedValue({ rows: [{ id: 'completion-1' }] })
        };
        vi.doMock('@/lib/db/connection', () => ({ db: mockDb }));

        const result = await CertificateService.isEligibleForCertificate('user-1', 'course-1');

        expect(result).toBe(true);
      });

      it('should return false if course is not completed', async () => {
        // Mock database query for no completion
        const mockDb = {
          query: vi.fn().mockResolvedValue({ rows: [] })
        };
        vi.doMock('@/lib/db/connection', () => ({ db: mockDb }));

        const result = await CertificateService.isEligibleForCertificate('user-1', 'course-1');

        expect(result).toBe(false);
      });
    });
  });

  describe('PDF Generation', () => {
    it('should generate PDF with correct data', async () => {
      const certificateData = {
        userName: 'John Doe',
        courseName: 'Test Course',
        completionDate: new Date(),
        averageScore: 85.5,
        certificateId: 'CERT-123'
      };

      // Mock PDFKit
      const mockPDFBuffer = Buffer.from('mock pdf content');
      mockGenerateCertificatePDF.mockResolvedValue(mockPDFBuffer);

      const result = await generateCertificatePDF(certificateData);

      expect(result).toEqual(mockPDFBuffer);
      expect(mockGenerateCertificatePDF).toHaveBeenCalledWith(certificateData);
    });
  });

  describe('Certificate Repository', () => {
    describe('create', () => {
      it('should create certificate successfully', async () => {
        const certificateData = {
          userId: 'user-1',
          courseId: 'course-1',
          certificateUrl: 'https://example.com/cert.pdf',
          averageQuizScore: 85.5
        };

        mockCertificateRepository.create.mockResolvedValue(mockCertificate);

        const result = await CertificateRepository.create(certificateData);

        expect(result).toEqual(mockCertificate);
        expect(mockCertificateRepository.create).toHaveBeenCalledWith(certificateData);
      });
    });

    describe('findByUserAndCourse', () => {
      it('should find certificate by user and course', async () => {
        mockCertificateRepository.findByUserAndCourse.mockResolvedValue(mockCertificate);

        const result = await CertificateRepository.findByUserAndCourse('user-1', 'course-1');

        expect(result).toEqual(mockCertificate);
      });

      it('should return null if not found', async () => {
        mockCertificateRepository.findByUserAndCourse.mockResolvedValue(null);

        const result = await CertificateRepository.findByUserAndCourse('user-1', 'course-1');

        expect(result).toBeNull();
      });
    });

    describe('findByUserId', () => {
      it('should find all certificates for user', async () => {
        const certificates = [mockCertificate];
        mockCertificateRepository.findByUserId.mockResolvedValue(certificates);

        const result = await CertificateRepository.findByUserId('user-1');

        expect(result).toEqual(certificates);
      });
    });

    describe('findByIdWithDetails', () => {
      it('should find certificate with user and course details', async () => {
        const mockResult = {
          certificate: mockCertificate,
          userName: 'John Doe',
          courseName: 'Test Course'
        };
        mockCertificateRepository.findByIdWithDetails.mockResolvedValue(mockResult);

        const result = await CertificateRepository.findByIdWithDetails('cert-1');

        expect(result).toEqual(mockResult);
      });
    });
  });
});