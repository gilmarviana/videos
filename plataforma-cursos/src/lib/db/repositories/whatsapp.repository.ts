import { Pool } from 'pg';
import { WhatsAppConfig, WhatsAppMenuOption } from '@/types';

export class WhatsAppRepository {
  constructor(private db: Pool) {}

  async getActiveConfig(): Promise<WhatsAppConfig | null> {
    const query = `
      SELECT id, phone_number, welcome_message, menu_options, is_active, created_at, updated_at
      FROM whatsapp_config 
      WHERE is_active = true 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    const result = await this.db.query(query);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      phoneNumber: row.phone_number,
      welcomeMessage: row.welcome_message,
      menuOptions: row.menu_options || [],
      isActive: row.is_active,
      updatedAt: row.updated_at
    };
  }

  async getConfig(id: string): Promise<WhatsAppConfig | null> {
    const query = `
      SELECT id, phone_number, welcome_message, menu_options, is_active, created_at, updated_at
      FROM whatsapp_config 
      WHERE id = $1
    `;
    
    const result = await this.db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      phoneNumber: row.phone_number,
      welcomeMessage: row.welcome_message,
      menuOptions: row.menu_options || [],
      isActive: row.is_active,
      updatedAt: row.updated_at
    };
  }

  async createConfig(config: Omit<WhatsAppConfig, 'id' | 'updatedAt'>): Promise<WhatsAppConfig> {
    // First deactivate any existing active config
    await this.db.query('UPDATE whatsapp_config SET is_active = false WHERE is_active = true');

    const query = `
      INSERT INTO whatsapp_config (phone_number, welcome_message, menu_options, is_active)
      VALUES ($1, $2, $3, $4)
      RETURNING id, phone_number, welcome_message, menu_options, is_active, created_at, updated_at
    `;
    
    const result = await this.db.query(query, [
      config.phoneNumber,
      config.welcomeMessage,
      JSON.stringify(config.menuOptions),
      config.isActive
    ]);

    const row = result.rows[0];
    return {
      id: row.id,
      phoneNumber: row.phone_number,
      welcomeMessage: row.welcome_message,
      menuOptions: row.menu_options || [],
      isActive: row.is_active,
      updatedAt: row.updated_at
    };
  }

  async updateConfig(id: string, updates: Partial<Omit<WhatsAppConfig, 'id' | 'updatedAt'>>): Promise<WhatsAppConfig | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.phoneNumber !== undefined) {
      fields.push(`phone_number = $${paramCount++}`);
      values.push(updates.phoneNumber);
    }

    if (updates.welcomeMessage !== undefined) {
      fields.push(`welcome_message = $${paramCount++}`);
      values.push(updates.welcomeMessage);
    }

    if (updates.menuOptions !== undefined) {
      fields.push(`menu_options = $${paramCount++}`);
      values.push(JSON.stringify(updates.menuOptions));
    }

    if (updates.isActive !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(updates.isActive);
      
      // If activating this config, deactivate others
      if (updates.isActive) {
        await this.db.query('UPDATE whatsapp_config SET is_active = false WHERE id != $1', [id]);
      }
    }

    if (fields.length === 0) {
      return this.getConfig(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE whatsapp_config 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, phone_number, welcome_message, menu_options, is_active, created_at, updated_at
    `;

    const result = await this.db.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      phoneNumber: row.phone_number,
      welcomeMessage: row.welcome_message,
      menuOptions: row.menu_options || [],
      isActive: row.is_active,
      updatedAt: row.updated_at
    };
  }

  async deleteConfig(id: string): Promise<boolean> {
    const query = 'DELETE FROM whatsapp_config WHERE id = $1';
    const result = await this.db.query(query, [id]);
    return result.rowCount > 0;
  }

  async getAllConfigs(): Promise<WhatsAppConfig[]> {
    const query = `
      SELECT id, phone_number, welcome_message, menu_options, is_active, created_at, updated_at
      FROM whatsapp_config 
      ORDER BY created_at DESC
    `;
    
    const result = await this.db.query(query);
    
    return result.rows.map(row => ({
      id: row.id,
      phoneNumber: row.phone_number,
      welcomeMessage: row.welcome_message,
      menuOptions: row.menu_options || [],
      isActive: row.is_active,
      updatedAt: row.updated_at
    }));
  }
}