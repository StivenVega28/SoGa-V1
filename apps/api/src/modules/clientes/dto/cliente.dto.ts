import { Transform, Type, type TransformFnParams } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const normalizarTexto = ({ value }: TransformFnParams) =>
  typeof value === 'string' ? value.trim() : value;

const normalizarCorreo = ({ value }: TransformFnParams) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class CrearClienteDto {
  @Transform(normalizarTexto)
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  nit!: string;

  @Transform(normalizarTexto)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre!: string;

  @Transform(normalizarTexto)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  apellido?: string;

  @Transform(normalizarTexto)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  ciudad!: string;

  @Transform(normalizarTexto)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sucursal?: string;

  @Transform(normalizarTexto)
  @IsString()
  @MinLength(5)
  @MaxLength(150)
  direccion!: string;

  @Transform(normalizarTexto)
  @IsString()
  @MinLength(7)
  @MaxLength(20)
  telefono!: string;

  @Transform(normalizarCorreo)
  @IsEmail()
  @MaxLength(150)
  correo!: string;
}

export class ActualizarClienteDto {
  @Transform(normalizarTexto)
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  nit?: string;

  @Transform(normalizarTexto)
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre?: string;

  @Transform(normalizarTexto)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  apellido?: string;

  @Transform(normalizarTexto)
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  ciudad?: string;

  @Transform(normalizarTexto)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sucursal?: string;

  @Transform(normalizarTexto)
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(150)
  direccion?: string;

  @Transform(normalizarTexto)
  @IsOptional()
  @IsString()
  @MinLength(7)
  @MaxLength(20)
  telefono?: string;

  @Transform(normalizarCorreo)
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  correo?: string;
}

export class ListarClientesQuery {
  @Transform(normalizarTexto)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  buscar?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  porPagina?: number;
}
