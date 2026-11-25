import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PerfilController } from './perfil.controller';

@Global()
@Module({
  controllers: [PerfilController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
