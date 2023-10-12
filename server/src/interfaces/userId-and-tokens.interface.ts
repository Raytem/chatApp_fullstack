import { Tokens } from 'src/auth/interfaces/tokens.interface';

export interface UserIdAndTokens {
  userId: number;
  tokens: Tokens;
}
