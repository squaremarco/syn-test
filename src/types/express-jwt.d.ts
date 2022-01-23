// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Request } from 'express';

declare module 'express' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface ScopedInfo {
    id: string;
    email: string;
    roles: string[];
    iat: number;
    exp: number;
  }

  interface Request {
    scopedInfo?: ScopedInfo | undefined;
  }
}
