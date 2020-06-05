interface ParsedToken {
  iss: string;
  sub: string;
  aud: string | string[];
  iat: number;
  exp: number;
  azp: string;
  scope: string;
}

interface AuthRequest extends Express.Request {
  user?: ParsedToken;
}
