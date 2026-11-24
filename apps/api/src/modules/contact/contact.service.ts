import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContactDto } from './create-contact.dto';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateContactDto): Promise<void> {
    await this.prisma.message.create({
      data: {
        firstName: dto.nombre.trim(),
        lastName: dto.apellido?.trim() || null,
        email: dto.correo.trim().toLowerCase(),
        phone: dto.telefono?.trim() || null,
        subject: dto.asunto.trim(),
        message: dto.mensaje.trim(),
      },
    });
  }
}
