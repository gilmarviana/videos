import { PoolClient } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../connection';
import { User, Subscription } from '../../../types';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  name: string;
  role?: 'admin' | 'student';
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  passwordHash?: string;
  trialStartTime?: Date | null;
  trialMinutesUsed?: number;
  isActive?: boolean;
}

export class UserRepository {
  static async create(userData: CreateUserData): Promise<User> {
    const id = uuidv4();
    const now = new Date();

    const query = `
      INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      id,
      userData.email.toLowerCase(),
      userData.passwordHash,
      userData.name,
      userData.role || 'student',
      now,
      now,
    ];

    const result = await db.query(query, values);
    return this.mapRowToUser(result.rows[0]);
  }

  static async findById(id: string): Promise<User | null> {
    const query = `
      SELECT u.*, s.id as subscription_id, s.amount, s.currency, s.status as subscription_status,
             s.current_period_start, s.current_period_end, s.payment_gateway_id,
             s.created_at as subscription_created_at, s.updated_at as subscription_updated_at
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
      WHERE u.id = $1
    `;

    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToUser(result.rows[0]);
  }

  static async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT u.*, s.id as subscription_id, s.amount, s.currency, s.status as subscription_status,
             s.current_period_start, s.current_period_end, s.payment_gateway_id,
             s.created_at as subscription_created_at, s.updated_at as subscription_updated_at
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
      WHERE u.email = $1
    `;

    const result = await db.query(query, [email.toLowerCase()]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToUser(result.rows[0]);
  }

  static async update(id: string, updateData: UpdateUserData): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updateData.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updateData.name);
    }

    if (updateData.email !== undefined) {
      fields.push(`email = $${paramCount++}`);
      values.push(updateData.email.toLowerCase());
    }

    if (updateData.passwordHash !== undefined) {
      fields.push(`password_hash = $${paramCount++}`);
      values.push(updateData.passwordHash);
    }

    if (updateData.trialStartTime !== undefined) {
      fields.push(`trial_start_time = $${paramCount++}`);
      values.push(updateData.trialStartTime);
    }

    if (updateData.trialMinutesUsed !== undefined) {
      fields.push(`trial_minutes_used = $${paramCount++}`);
      values.push(updateData.trialMinutesUsed);
    }

    if (updateData.isActive !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(updateData.isActive);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = $${paramCount++}`);
    values.push(new Date());
    values.push(id);

    const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToUser(result.rows[0]);
  }

  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
  }

  static async emailExists(email: string, excludeId?: string): Promise<boolean> {
    let query = 'SELECT 1 FROM users WHERE email = $1';
    const values: any[] = [email.toLowerCase()];

    if (excludeId) {
      query += ' AND id != $2';
      values.push(excludeId);
    }

    const result = await db.query(query, values);
    return result.rows.length > 0;
  }

  static async startTrial(userId: string): Promise<User | null> {
    const trialStartTime = new Date();
    return this.update(userId, { 
      trialStartTime,
      trialMinutesUsed: 0 
    });
  }

  static async updateTrialUsage(userId: string, minutesUsed: number): Promise<User | null> {
    return this.update(userId, { trialMinutesUsed: minutesUsed });
  }

  static async findUsersNearTrialExpiration(minutesThreshold: number): Promise<User[]> {
    const query = `
      SELECT u.*, s.id as subscription_id, s.amount, s.currency, s.status as subscription_status,
             s.current_period_start, s.current_period_end, s.payment_gateway_id,
             s.created_at as subscription_created_at, s.updated_at as subscription_updated_at
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
      WHERE u.trial_start_time IS NOT NULL 
        AND s.id IS NULL 
        AND u.is_active = true
        AND u.trial_minutes_used >= (240 - $1)
        AND u.trial_minutes_used < 240
    `;

    const result = await db.query(query, [minutesThreshold]);
    return result.rows.map(row => this.mapRowToUser(row));
  }

  static async findAllUsers(limit?: number, offset?: number): Promise<{ users: User[]; total: number }> {
    const countQuery = 'SELECT COUNT(*) FROM users';
    const countResult = await db.query(countQuery);
    const total = parseInt(countResult.rows[0].count);

    let query = `
      SELECT u.*, s.id as subscription_id, s.amount, s.currency, s.status as subscription_status,
             s.current_period_start, s.current_period_end, s.payment_gateway_id,
             s.created_at as subscription_created_at, s.updated_at as subscription_updated_at
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
      ORDER BY u.created_at DESC
    `;

    const values: any[] = [];
    if (limit) {
      query += ` LIMIT $${values.length + 1}`;
      values.push(limit);
    }
    if (offset) {
      query += ` OFFSET $${values.length + 1}`;
      values.push(offset);
    }

    const result = await db.query(query, values);
    const users = result.rows.map(row => this.mapRowToUser(row));

    return { users, total };
  }

  private static mapRowToUser(row: any): User {
    const user: User = {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      passwordHash: row.password_hash,
      trialStartTime: row.trial_start_time,
      trialMinutesUsed: row.trial_minutes_used || 0,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    // Add subscription if exists
    if (row.subscription_id) {
      user.subscription = {
        id: row.subscription_id,
        userId: row.id,
        amount: parseFloat(row.amount),
        currency: row.currency,
        status: row.subscription_status,
        currentPeriodStart: row.current_period_start,
        currentPeriodEnd: row.current_period_end,
        paymentGatewayId: row.payment_gateway_id,
        createdAt: row.subscription_created_at,
        updatedAt: row.subscription_updated_at,
      };
    }

    return user;
  }
}