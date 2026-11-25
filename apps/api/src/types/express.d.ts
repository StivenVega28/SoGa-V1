import type { Rol, Usuario } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      usuario?: Usuario & { rol: Rol | null };
      sesion?: {
        id: string;
        token: string;
        userId: string;
        expiresAt: Date;
        ipAddress?: string | null;
        userAgent?: string | null;
        createdAt: Date;
        updatedAt: Date;
      };
    }
  }
}

export {};
