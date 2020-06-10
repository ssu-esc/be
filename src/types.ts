export interface ParsedToken {
  iss: string;
  sub: string;
  aud: string | string[];
  iat: number;
  exp: number;
  azp: string;
  scope: string;
}

export interface AuthRequest extends Express.Request {
  user?: ParsedToken;
}
