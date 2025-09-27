import { Pool } from 'pg';
import { LandingPageContent } from '@/types';

export class LandingPageRepository {
  constructor(private db: Pool) {}

  async getAllSections(): Promise<LandingPageContent[]> {
    const query = `
      SELECT id, section, content, is_active, created_at, updated_at
      FROM landing_page_content
      WHERE is_active = true
      ORDER BY 
        CASE section
          WHEN 'hero' THEN 1
          WHEN 'features' THEN 2
          WHEN 'testimonials' THEN 3
          WHEN 'pricing' THEN 4
          WHEN 'faq' THEN 5
          WHEN 'about' THEN 6
          ELSE 7
        END
    `;

    const result = await this.db.query(query);
    return result.rows.map(this.mapRowToLandingPageContent);
  }

  async getSectionByName(section: string): Promise<LandingPageContent | null> {
    const query = `
      SELECT id, section, content, is_active, created_at, updated_at
      FROM landing_page_content
      WHERE section = $1 AND is_active = true
    `;

    const result = await this.db.query(query, [section]);
    return result.rows.length > 0 ? this.mapRowToLandingPageContent(result.rows[0]) : null;
  }

  async updateSection(section: string, content: any): Promise<LandingPageContent> {
    const query = `
      INSERT INTO landing_page_content (section, content, is_active, updated_at)
      VALUES ($1, $2, true, CURRENT_TIMESTAMP)
      ON CONFLICT (section) 
      DO UPDATE SET 
        content = $2,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, section, content, is_active, created_at, updated_at
    `;

    const result = await this.db.query(query, [section, JSON.stringify(content)]);
    return this.mapRowToLandingPageContent(result.rows[0]);
  }

  async toggleSectionStatus(section: string, isActive: boolean): Promise<LandingPageContent | null> {
    const query = `
      UPDATE landing_page_content
      SET is_active = $2, updated_at = CURRENT_TIMESTAMP
      WHERE section = $1
      RETURNING id, section, content, is_active, created_at, updated_at
    `;

    const result = await this.db.query(query, [section, isActive]);
    return result.rows.length > 0 ? this.mapRowToLandingPageContent(result.rows[0]) : null;
  }

  async createSection(section: string, content: any): Promise<LandingPageContent> {
    const query = `
      INSERT INTO landing_page_content (section, content, is_active)
      VALUES ($1, $2, true)
      RETURNING id, section, content, is_active, created_at, updated_at
    `;

    const result = await this.db.query(query, [section, JSON.stringify(content)]);
    return this.mapRowToLandingPageContent(result.rows[0]);
  }

  async deleteSection(section: string): Promise<boolean> {
    const query = `
      DELETE FROM landing_page_content
      WHERE section = $1
    `;

    const result = await this.db.query(query, [section]);
    return result.rowCount > 0;
  }

  private mapRowToLandingPageContent(row: any): LandingPageContent {
    return {
      id: row.id,
      section: row.section,
      content: typeof row.content === 'string' ? JSON.parse(row.content) : row.content,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}