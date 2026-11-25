import { Controller, Get } from '@nestjs/common';
import { Publico } from '../auth/decorators/publico.decorator';
import { CatalogService } from './catalog.service';

@Publico()
@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('catalogo')
  async catalogo() {
    const data = await this.catalog.findAll();
    return { ok: true, data };
  }

  @Get('destacado')
  async destacado() {
    const data = await this.catalog.findFeatured();
    return { ok: true, data };
  }
}
