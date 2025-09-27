import { Pool } from 'pg';
import { db } from '../connection';

export interface Subscription {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  paymentGatewayId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriptionData {
  userId: string;
  amount: number;
  currency: string;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  paymentGatewayId: string;
}

export interface UpdateSubscriptionData {
  amount?: number;
  currency?: string;
  status?: 'active' | 'inactive' | 'cancelled' | 'past_due';
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  paymentGatewayId?: string;
}

export class SubscriptionRepository {
  private db: Pool;

  constructor() {
    this.db = db;
  }

  async create(data: CreateSubscriptionData): Promise<Subscription> {
    const query = `
      INSERT INTO subscriptions (
        user_id, amount, currency, status, 
        current_period_start, current_period_end, payment_gateway_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      data.userId,
      data.amount,
      data.currency,
      data.status,
      data.currentPeriodStart,
      data.currentPeriodEnd,
      data.paymentGatewayId,
    ];

    const result = await this.db.query(query, values);
    return this.mapRowToSubscription(result.rows[0]);
  }

  async findById(id: string): Promise<Subscription | null> {
    const query = 'SELECT * FROM subscriptions WHERE id = $1';
    const result = await this.db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToSubscription(result.rows[0]);
  }

  async findByUserId(userId: string): Promise<Subscription | null> {
    const query = 'SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1';
    const result = await this.db.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToSubscription(result.rows[0]);
  }

  async findByPaymentGatewayId(paymentGatewayId: string): Promise<Subscription | null> {
    const query = 'SELECT * FROM subscriptions WHERE payment_gateway_id = $1';
    const result = await this.db.query(query, [paymentGatewayId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToSubscription(result.rows[0]);
  }

  async update(id: string, data: UpdateSubscriptionData): Promise<Subscription | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.amount !== undefined) {
      fields.push(`amount = $${paramCount++}`);
      values.push(data.amount);
    }

    if (data.currency !== undefined) {
      fields.push(`currency = $${paramCount++}`);
      values.push(data.currency);
    }

    if (data.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(data.status);
    }

    if (data.currentPeriodStart !== undefined) {
      fields.push(`current_period_start = $${paramCount++}`);
      values.push(data.currentPeriodStart);
    }

    if (data.currentPeriodEnd !== undefined) {
      fields.push(`current_period_end = $${paramCount++}`);
      values.push(data.currentPeriodEnd);
    }

    if (data.paymentGatewayId !== undefined) {
      fields.push(`payment_gateway_id = $${paramCount++}`);
      values.push(data.paymentGatewayId);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = $${paramCount++}`);
    values.push(new Date());

    values.push(id);

    const query = `
      UPDATE subscriptions 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await this.db.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToSubscription(result.rows[0]);
  }

  async updateByPaymentGatewayId(paymentGatewayId: string, data: UpdateSubscriptionData): Promise<Subscription | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.amount !== undefined) {
      fields.push(`amount = $${paramCount++}`);
      values.push(data.amount);
    }

    if (data.currency !== undefined) {
      fields.push(`currency = $${paramCount++}`);
      values.push(data.currency);
    }

    if (data.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(data.status);
    }

    if (data.currentPeriodStart !== undefined) {
      fields.push(`current_period_start = $${paramCount++}`);
      values.push(data.currentPeriodStart);
    }

    if (data.currentPeriodEnd !== undefined) {
      fields.push(`current_period_end = $${paramCount++}`);
      values.push(data.currentPeriodEnd);
    }

    if (fields.length === 0) {
      return this.findByPaymentGatewayId(paymentGatewayId);
    }

    fields.push(`updated_at = $${paramCount++}`);
    values.push(new Date());

    values.push(paymentGatewayId);

    const query = `
      UPDATE subscriptions 
      SET ${fields.join(', ')}
      WHERE payment_gateway_id = $${paramCount}
      RETURNING *
    `;

    const result = await this.db.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToSubscription(result.rows[0]);
  }

  async findAll(limit: number = 50, offset: number = 0): Promise<Subscription[]> {
    const query = `
      SELECT * FROM subscriptions 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    
    const result = await this.db.query(query, [limit, offset]);
    return result.rows.map(row => this.mapRowToSubscription(row));
  }

  async findActiveSubscriptions(): Promise<Subscription[]> {
    const query = `
      SELECT * FROM subscriptions 
      WHERE status = 'active' 
      ORDER BY created_at DESC
    `;
    
    const result = await this.db.query(query);
    return result.rows.map(row => this.mapRowToSubscription(row));
  }

  async getSubscriptionStats(): Promise<{
    total: number;
    active: number;
    cancelled: number;
    pastDue: number;
    totalRevenue: number;
  }> {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
        COUNT(CASE WHEN status = 'past_due' THEN 1 END) as past_due,
        COALESCE(SUM(CASE WHEN status = 'active' THEN amount ELSE 0 END), 0) as total_revenue
      FROM subscriptions
    `;
    
    const result = await this.db.query(query);
    const row = result.rows[0];
    
    return {
      total: parseInt(row.total),
      active: parseInt(row.active),
      cancelled: parseInt(row.cancelled),
      pastDue: parseInt(row.past_due),
      totalRevenue: parseFloat(row.total_revenue),
    };
  }

  private mapRowToSubscription(row: any): Subscription {
    return {
      id: row.id,
      userId: row.user_id,
      amount: parseFloat(row.amount),
      currency: row.currency,
      status: row.status,
      currentPeriodStart: new Date(row.current_period_start),
      currentPeriodEnd: new Date(row.current_period_end),
      paymentGatewayId: row.payment_gateway_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}