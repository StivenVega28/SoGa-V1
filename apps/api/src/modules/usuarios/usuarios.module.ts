import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { RolesService } from './roles.service';

@Module({
  controllers: [UsuariosController, RolesController],
  providers: [UsuariosService, RolesService],
})
export class UsuariosModule {}
