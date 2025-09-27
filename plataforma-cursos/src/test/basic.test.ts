/**
 * Basic Test Suite
 * 
 * Simple tests to verify the testing infrastructure is working correctly.
 */

import { describe, it, expect, vi } from 'vitest';

describe('Basic Test Suite', () => {
  it('should run basic assertions', () => {
    expect(1 + 1).toBe(2);
    expect('hello').toBe('hello');
    expect(true).toBeTruthy();
    expect(false).toBeFalsy();
  });

  it('should work with async functions', async () => {
    const asyncFunction = async () => {
      return new Promise(resolve => setTimeout(() => resolve('done'), 10));
    };

    const result = await asyncFunction();
    expect(result).toBe('done');
  });

  it('should work with mocks', () => {
    const mockFunction = vi.fn();
    mockFunction('test');
    
    expect(mockFunction).toHaveBeenCalledWith('test');
    expect(mockFunction).toHaveBeenCalledTimes(1);
  });

  it('should work with test utilities', () => {
    const mockUser = testUtils.createMockUser();
    
    expect(mockUser).toBeDefined();
    expect(mockUser.id).toBeDefined();
    expect(mockUser.email).toBeDefined();
    expect(mockUser.role).toBe('student');
  });

  it('should work with environment variables', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.JWT_SECRET).toBeDefined();
  });
});