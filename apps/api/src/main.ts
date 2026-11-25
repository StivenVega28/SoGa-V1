import 'reflect-metadata';
import fs from 'node:fs';
import path from 'node:path';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import express, { type NextFunction, type Request, type Response } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { AppModule } from './app.module';
import { AuthService } from './modules/auth/auth.service';

async function bootstrap() {
  // El parser de body de Nest se desactiva: Better Auth necesita la petición cruda.
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:5173'],
    credentials: true,
  });

  const auth = app.get(AuthService).auth;
  const authHandler = toNodeHandler(auth);
  const expressApp = app.getHttpAdapter().getInstance();

  // IP del cliente para el rate limit de Better Auth (el proxy puede sobrescribirla).
  expressApp.use((req: Request, _res: Response, next: NextFunction) => {
    if (!req.headers['x-forwarded-for'] && req.socket.remoteAddress) {
      req.headers['x-forwarded-for'] = req.socket.remoteAddress;
    }
    next();
  });

  expressApp.use((req: Request, res: Response, next: NextFunction) => {
    if (req.url?.startsWith('/api/auth')) {
      void authHandler(req, res);
      return;
    }
    next();
  });

  expressApp.use(express.json({ limit: '1mb' }));
  expressApp.use(express.urlencoded({ extended: true }));

  // Modo producción (`npm run start:prod`): la API también sirve la web compilada.
  const servirWeb = process.argv.includes('--web');
  if (servirWeb) {
    const webDist = path.resolve(__dirname, '../../web/dist');
    const indexHtml = path.join(webDist, 'index.html');

    if (!fs.existsSync(indexHtml)) {
      throw new Error(`No se encontró la web compilada en ${webDist}. Ejecuta "npm run build" primero.`);
    }

    expressApp.use(express.static(webDist));
    expressApp.get(/^(?!\/api(\/|$)).*/, (_req: Request, res: Response) => {
      res.sendFile(indexHtml);
    });
  }

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = Number(process.env.API_PORT) || 3001;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(
    servirWeb
      ? `[SoGa] Producción en http://localhost:${port}`
      : `[SoGa API] http://localhost:${port}/api`,
  );
}

void bootstrap();

