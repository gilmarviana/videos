import { Pool, PoolClient } from 'pg';
import { config } from '../config';

class DatabaseConnection {
  private pool: Pool;
  private static instance: DatabaseConnection;

  private constructor() {
    this.pool = new Pool({
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
      user: config.database.user,
      password: config.database.password,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Handle pool errors
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  public async query(text: string, params?: any[]): Promise<any> {
    const client = await this.getClient();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  public async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async disconnect(): Promise<void> {
    await this.pool.end();
  }

  public async isConnected(): Promise<boolean> {
    try {
      const client = await this.getClient();
      await client.query('SELECT 1');
      client.release();
      return true;
    } catch {
      return false;
    }
  }
}

export const db = DatabaseConnection.getInstance();
export default db;