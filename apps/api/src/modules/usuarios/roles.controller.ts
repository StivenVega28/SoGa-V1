import { Controller, Get } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuariosService } from './usuarios.service';

@Controller('roles')
@Roles('Administrador')
export class RolesController {
  constructor(private readonly usuarios: UsuariosService) {}

  @Get()
  async listar() {
    const data = await this.usuarios.listarRoles();
    return { ok: true, data };
  }
}
