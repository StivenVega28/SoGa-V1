import { Transform, type TransformFnParams } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PERMISOS_DISPONIBLES, PERMISO_TODOS } from '../../auth/permisos.constants';

const normalizarTexto = ({ value }: TransformFnParams) =>
  typeof value === 'string' ? value.trim() : value;

const PERMISOS_VALIDOS: string[] = [...PERMISOS_DISPONIBLES, PERMISO_TODOS];

export class CrearRolDto {
  @Transform(normalizarTexto)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre!: string;

  @Transform(normalizarTexto)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsIn(PERMISOS_VALIDOS, { each: true })
  permisos!: string[];
}

export class ActualizarRolDto {
  @Transform(normalizarTexto)
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre?: string;

  @Transform(normalizarTexto)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsIn(PERMISOS_VALIDOS, { each: true })
  permisos?: string[];
}
