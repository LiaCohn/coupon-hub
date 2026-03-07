import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { ResellerRepository } from '../repositories/reseller.repository';
import { Reseller, CreateResellerDTO } from '../models/reseller.model';

export class AuthService {
  private resellerRepository: ResellerRepository;

  constructor() {
    this.resellerRepository = new ResellerRepository();
  }

  /**
   * Validate a Bearer token against stored reseller tokens
   * 
   * @param token - The Bearer token to validate
   * @returns The authenticated reseller or null if invalid
   */
  async validateBearerToken(token: string): Promise<Reseller | null> {
    // Get all resellers and check token against each hash
    const resellers = await this.resellerRepository.getAllResellers();
    
    for (const reseller of resellers) {
      const isValid = await bcrypt.compare(token, reseller.api_token_hash);
      if (isValid) {
        return reseller;
      }
    }
    
    return null;
  }

  /**
   * Hash a token for storage
   * 
   * @param token - The plaintext token
   * @returns The hashed token
   */
  async hashToken(token: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(token, saltRounds);
  }

  /**
   * Create a new reseller with a generated token
   * 
   * @param name - The reseller's name
   * @returns The created reseller and the plain token (shown once)
   */
  async createReseller(name: string): Promise<{ reseller: Reseller; token: string }> {
    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Hash the token for storage
    const tokenHash = await this.hashToken(token);
    
    // Create the reseller in the database
    const dto: CreateResellerDTO = {
      name: name,
      api_token_hash: tokenHash
    };
    
    const reseller = await this.resellerRepository.createReseller(dto);
    
    // Return both the reseller and the plain token
    // Token is only shown once!
    return {
      reseller,
      token
    };
  }
}
