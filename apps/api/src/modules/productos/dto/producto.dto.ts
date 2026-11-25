import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

const DINERO = /^\d{1,10}(\.\d{1,2})?$/;

export class VarianteDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  nombre!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(60)
  sku!: string;

  @IsOptional()
  @Matches(DINERO, { message: 'El precio de la variante debe ser un decimal con hasta 2 decimales.' })
  precio?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class CrearProductoDto {
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  sku!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  nombre!: string;

  @IsString()
  @MinLength(5)
  descripcion!: string;

  @Matches(DINERO, { message: 'El precio debe ser un decimal con hasta 2 decimales.' })
  precio!: string;

  @IsOptional()
  @Matches(DINERO, { message: 'El costo debe ser un decimal con hasta 2 decimales.' })
  costo?: string;

  @IsInt()
  @Min(1)
  categoriaId!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  proveedorId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  unidad?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  stockMinimo?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  imagen?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imagenes?: string[];

  @IsOptional()
  @IsBoolean()
  destacado?: boolean;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VarianteDto)
  variantes?: VarianteDto[];
}

export class ActualizarProductoDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  sku?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  descripcion?: string;

  @IsOptional()
  @Matches(DINERO, { message: 'El precio debe ser un decimal con hasta 2 decimales.' })
  precio?: string;

  @IsOptional()
  @Matches(DINERO, { message: 'El costo debe ser un decimal con hasta 2 decimales.' })
  costo?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  categoriaId?: number;

  @IsOptional()
  @ValidateIf((o: ActualizarProductoDto) => o.proveedorId !== null && o.proveedorId !== undefined)
  @IsInt()
  @Min(1)
  proveedorId?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  unidad?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  stockMinimo?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  imagen?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imagenes?: string[];

  @IsOptional()
  @IsBoolean()
  destacado?: boolean;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VarianteDto)
  variantes?: VarianteDto[];
}

export class ListarProductosQuery {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  buscar?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoriaId?: number;

  @IsOptional()
  @IsString()
  @Matches(/^(true|false)$/)
  activo?: 'true' | 'false';

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

export class CambiarEstadoDto {
  @IsBoolean()
  activo!: boolean;
}

export class CrearCategoriaDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion?: string;
}
