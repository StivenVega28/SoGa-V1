import { Transform, Type, type TransformFnParams } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

const normalizarTexto = ({ value }: TransformFnParams) =>
  typeof value === 'string' ? value.trim() : value;

export class ListarInventarioQuery {
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

export class AjustarInventarioDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productoId!: number;

  // Cantidad con signo: positiva suma stock, negativa lo resta. No puede ser 0.
  @Type(() => Number)
  @IsInt()
  cantidad!: number;

  @Transform(normalizarTexto)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nota?: string;
}
