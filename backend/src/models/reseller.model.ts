export interface Reseller {
  id: string;
  name: string;
  api_token_hash: string;
  created_at: Date;
}

export interface CreateResellerDTO {
  name: string;
  api_token_hash: string;
}
