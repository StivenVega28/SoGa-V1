import { Transform, Type, type TransformFnParams } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const normalizarTexto = ({ value }: TransformFnParams) =>
  typeof value === 'string' ? value.trim() : value;

const normalizarTextoOpcional = ({ value }: TransformFnParams) => {
  if (typeof value !== 'string') return value;
  const limpio = value.trim();
  return limpio.length > 0 ? limpio : null;
};

const normalizarCorreo = ({ value }: TransformFnParams) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class CrearUsuarioDto {
  @Transform(normalizarTexto)
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  nombre!: string;

  @Transform(normalizarTextoOpcional)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  apellido?: string | null;

  @Transform(normalizarTextoOpcional)
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  documento?: string | null;

  @Transform(normalizarTextoOpcional)
  @IsOptional()
  @IsString()
  @MinLength(7)
  @MaxLength(20)
  telefono?: string | null;

  @Transform(normalizarCorreo)
  @IsEmail()
  @MaxLength(150)
  correo!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  rolId!: number;

  @IsString()
  @MinLength(10)
  @MaxLength(128)
  @Matches(/\S/, { message: 'La contraseña no puede contener solo espacios.' })
  contrasena!: string;
}

export class ActualizarUsuarioDto {
  @Transform(normalizarTexto)
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  nombre?: string;

  @Transform(normalizarTextoOpcional)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  apellido?: string | null;

  @Transform(normalizarTextoOpcional)
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  documento?: string | null;

  @Transform(normalizarTextoOpcional)
  @IsOptional()
  @IsString()
  @MinLength(7)
  @MaxLength(20)
  telefono?: string | null;

  @Transform(normalizarCorreo)
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  correo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  rolId?: number;
}

export class RestablecerContrasenaDto {
  @IsString()
  @MinLength(10)
  @MaxLength(128)
  @Matches(/\S/, { message: 'La contraseña no puede contener solo espacios.' })
  contrasena!: string;
}

export class ListarUsuariosQuery {
  @Transform(normalizarTexto)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  buscar?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  rolId?: number;

  @IsOptional()
  @IsIn(['activos', 'eliminados'])
  estado?: 'activos' | 'eliminados';

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
