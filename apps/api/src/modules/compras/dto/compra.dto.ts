import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

const DINERO = /^\d{1,10}(\.\d{1,2})?$/;

export class LineaCompraDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productoId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  cantidad!: number;

  @Matches(DINERO, { message: 'El costo unitario debe ser un decimal con hasta 2 decimales.' })
  costoUnitario!: string;
}

export class CrearCompraDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  proveedorId!: number;

  @IsOptional()
  @IsDateString()
  compradoEn?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LineaCompraDto)
  items!: LineaCompraDto[];
}

export class ListarComprasQuery {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  buscar?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  proveedorId?: number;

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
