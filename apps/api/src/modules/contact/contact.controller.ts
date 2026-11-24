import { Body, Controller, Post } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './create-contact.dto';

@Controller('contacto')
export class ContactController {
  constructor(private readonly contact: ContactService) {}

  @Post()
  async crear(@Body() dto: CreateContactDto) {
    await this.contact.create(dto);
    return { ok: true, message: 'Solicitud registrada correctamente.' };
  }
}
