import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContactDto } from './create-contact.dto';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateContactDto): Promise<void> {
    await this.prisma.mensaje.create({
      data: {
        nombre: dto.nombre.trim(),
        apellido: dto.apellido?.trim() || null,
        correo: dto.correo.trim().toLowerCase(),
        telefono: dto.telefono?.trim() || null,
        asunto: dto.asunto.trim(),
        mensaje: dto.mensaje.trim(),
      },
    });
  }
}
