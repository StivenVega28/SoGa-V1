import { Type } from 'class-transformer';
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

export class CrearProveedorDto {
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  nit!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(150)
  nombre!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  ciudad!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(150)
  direccion!: string;

  @IsString()
  @MinLength(7)
  @MaxLength(20)
  telefono!: string;

  @IsEmail()
  @MaxLength(150)
  correo!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;
}

export class ActualizarProveedorDto {
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  nit?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  ciudad?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(150)
  direccion?: string;

  @IsOptional()
  @IsString()
  @MinLength(7)
  @MaxLength(20)
  telefono?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  correo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;
}

export class ListarProveedoresQuery {
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
