import { query } from '../config/database';
import { CreateResellerDTO, Reseller } from '../models/reseller.model';

export class ResellerRepository {
  async findByTokenHash(tokenHash: string): Promise<Reseller | null> {
    const result = await query(
      'SELECT id, name, api_token_hash, created_at FROM resellers WHERE api_token_hash = $1',
      [tokenHash]
    );
    
    return result.rows.length > 0 ? this.mapRowToReseller(result.rows[0]) : null;
  }

  async findByToken(token: string): Promise<Reseller | null> {
    // This will be used with bcrypt compare in the service layer
    const result = await query(
      'SELECT id, name, api_token_hash, created_at FROM resellers'
    );
    
    return result.rows.length > 0 ? this.mapRowToReseller(result.rows[0]) : null;
  }

  async getAllResellers(): Promise<Reseller[]> {
    const result = await query(
      'SELECT id, name, api_token_hash, created_at FROM resellers ORDER BY created_at DESC'
    );
    
    return result.rows.map(row => this.mapRowToReseller(row));
  }

  async createReseller(dto: CreateResellerDTO): Promise<Reseller> {
    const res = await query(
      'INSERT INTO resellers (name, api_token_hash) VALUES ($1, $2) RETURNING id, name, api_token_hash, created_at',
      [dto.name, dto.api_token_hash]
    );
    return this.mapRowToReseller(res.rows[0]);
  }

  private mapRowToReseller(row: any): Reseller {
    return {
      id: row.id,
      name: row.name,
      api_token_hash: row.api_token_hash,
      created_at: row.created_at,
    };
  }
}
