import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  readonly auth: ReturnType<typeof betterAuth>;

  private readonly logger = new Logger(AuthService.name);

  constructor(config: ConfigService, prisma: PrismaService) {
    const secret = config.get<string>('BETTER_AUTH_SECRET');
    if (!secret || secret.length < 32) {
      throw new Error('BETTER_AUTH_SECRET debe existir y tener al menos 32 caracteres.');
    }

    const baseURL = config.get<string>('BETTER_AUTH_URL') ?? 'http://localhost:3001';
    const trustedOrigins = (config.get<string>('CORS_ORIGIN') ?? 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);

    this.auth = betterAuth({
      appName: 'SoGa',      baseURL,
      basePath: '/api/auth',
      secret,
      trustedOrigins,
      advanced: {
        ipAddress: {
          ipAddressHeaders: ['x-forwarded-for'],
        },
      },
      database: prismaAdapter(prisma, { provider: 'mysql' }),
      emailAndPassword: {
        enabled: true,
        disableSignUp: true,
        minPasswordLength: 10,
        maxPasswordLength: 128,
      },
      session: {
        modelName: 'sesion',
        expiresIn: 60 * 60 * 8,
        updateAge: 60 * 30,
        fields: {
          userId: 'usuarioId',
          expiresAt: 'expiraEn',
          ipAddress: 'ip',
          userAgent: 'agenteUsuario',
          createdAt: 'creadoEn',
          updatedAt: 'actualizadoEn',
        },
      },
      user: {
        modelName: 'usuario',
        fields: {
          name: 'nombre',
          email: 'correo',
          emailVerified: 'correoVerificado',
          image: 'imagen',
          createdAt: 'creadoEn',
          updatedAt: 'actualizadoEn',
        },
      },
      account: {
        modelName: 'cuenta',
        fields: {
          accountId: 'cuentaId',
          providerId: 'proveedorId',
          userId: 'usuarioId',
          accessToken: 'tokenAcceso',
          refreshToken: 'tokenRefresco',
          idToken: 'tokenId',
          accessTokenExpiresAt: 'expiraAccesoEn',
          refreshTokenExpiresAt: 'expiraRefrescoEn',
          scope: 'alcance',
          password: 'contrasena',
          createdAt: 'creadoEn',
          updatedAt: 'actualizadoEn',
        },
      },
      verification: {
        modelName: 'verificacion',
        fields: {
          identifier: 'identificador',
          value: 'valor',
          expiresAt: 'expiraEn',
          createdAt: 'creadoEn',
          updatedAt: 'actualizadoEn',
        },
      },
      rateLimit: {
        enabled: true,
        window: 60,
        max: 100,
        customRules: {
          '/sign-in/email': { window: 60, max: 5 },
        },
      },
    }) as unknown as ReturnType<typeof betterAuth>;

    this.logger.log(`Better Auth configurado (${baseURL}/api/auth)`);
  }
}
