import { Pool } from 'pg';
import { getDbConnection } from '../connection';

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
  responseStatus: number | null;
  responseBody: string | null;
  triggeredAt: Date;
}

export interface CreateWebhookData {
  name: string;
  url: string;
  eventType: Webhook['eventType'];
  headers?: Record<string, string>;
  isActive?: boolean;
}

export interface UpdateWebhookData {
  name?: string;
  url?: string;
  eventType?: Webhook['eventType'];
  headers?: Record<string, string>;
  isActive?: boolean;
}

export class WebhookRepository {
  private db: Pool;

  constructor() {
    this.db = getDbConnection();
  }

  async create(data: CreateWebhookData): Promise<Webhook> {
    const query = `
      INSERT INTO webhooks (name, url, event_type, headers, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, url, event_type as "eventType", headers, is_active as "isActive", 
                created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const values = [
      data.name,
      data.url,
      data.eventType,
      JSON.stringify(data.headers || {}),
      data.isActive ?? true
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async findAll(): Promise<Webhook[]> {
    const query = `
      SELECT id, name, url, event_type as "eventType", headers, is_active as "isActive",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM webhooks
      ORDER BY created_at DESC
    `;
    
    const result = await this.db.query(query);
    return result.rows;
  }

  async findById(id: string): Promise<Webhook | null> {
    const query = `
      SELECT id, name, url, event_type as "eventType", headers, is_active as "isActive",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM webhooks
      WHERE id = $1
    `;
    
    const result = await this.db.query(query, [id]);
    return result.rows[0] || null;
  }

  async findByEventType(eventType: Webhook['eventType']): Promise<Webhook[]> {
    const query = `
      SELECT id, name, url, event_type as "eventType", headers, is_active as "isActive",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM webhooks
      WHERE event_type = $1 AND is_active = true
      ORDER BY created_at DESC
    `;
    
    const result = await this.db.query(query, [eventType]);
    return result.rows;
  }

  async update(id: string, data: UpdateWebhookData): Promise<Webhook | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.url !== undefined) {
      fields.push(`url = $${paramCount++}`);
      values.push(data.url);
    }
    if (data.eventType !== undefined) {
      fields.push(`event_type = $${paramCount++}`);
      values.push(data.eventType);
    }
    if (data.headers !== undefined) {
      fields.push(`headers = $${paramCount++}`);
      values.push(JSON.stringify(data.headers));
    }
    if (data.isActive !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(data.isActive);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE webhooks 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, url, event_type as "eventType", headers, is_active as "isActive",
                created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await this.db.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM webhooks WHERE id = $1';
    const result = await this.db.query(query, [id]);
    return result.rowCount > 0;
  }

  async logWebhookCall(
    webhookId: string,
    payload: any,
    responseStatus?: number,
    responseBody?: string
  ): Promise<WebhookLog> {
    const query = `
      INSERT INTO webhook_logs (webhook_id, payload, response_status, response_body)
      VALUES ($1, $2, $3, $4)
      RETURNING id, webhook_id as "webhookId", payload, response_status as "responseStatus",
                response_body as "responseBody", triggered_at as "triggeredAt"
    `;
    
    const values = [
      webhookId,
      JSON.stringify(payload),
      responseStatus || null,
      responseBody || null
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async getWebhookLogs(webhookId: string, limit = 50): Promise<WebhookLog[]> {
    const query = `
      SELECT id, webhook_id as "webhookId", payload, response_status as "responseStatus",
             response_body as "responseBody", triggered_at as "triggeredAt"
      FROM webhook_logs
      WHERE webhook_id = $1
      ORDER BY triggered_at DESC
      LIMIT $2
    `;
    
    const result = await this.db.query(query, [webhookId, limit]);
    return result.rows;
  }

  async getAllWebhookLogs(limit = 100): Promise<WebhookLog[]> {
    const query = `
      SELECT wl.id, wl.webhook_id as "webhookId", wl.payload, 
             wl.response_status as "responseStatus", wl.response_body as "responseBody",
             wl.triggered_at as "triggeredAt", w.name as "webhookName"
      FROM webhook_logs wl
      JOIN webhooks w ON wl.webhook_id = w.id
      ORDER BY wl.triggered_at DESC
      LIMIT $1
    `;
    
    const result = await this.db.query(query, [limit]);
    return result.rows;
  }

  async deleteOldLogs(daysOld = 30): Promise<number> {
    const query = `
      DELETE FROM webhook_logs 
      WHERE triggered_at < NOW() - INTERVAL '${daysOld} days'
    `;
    
    const result = await this.db.query(query);
    return result.rowCount;
  }
}