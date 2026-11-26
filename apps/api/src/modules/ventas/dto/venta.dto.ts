import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsIn,
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

export class LineaVentaDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productoId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  cantidad!: number;

  @IsOptional()
  @Matches(DINERO, { message: 'El precio unitario debe ser un decimal con hasta 2 decimales.' })
  precioUnitario?: string;
}

export class CrearVentaDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  clienteId!: number;

  @IsOptional()
  @IsDateString()
  emitidaEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notas?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LineaVentaDto)
  items!: LineaVentaDto[];
}

export class ListarVentasQuery {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  buscar?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  clienteId?: number;

  @IsOptional()
  @IsIn(['BORRADOR', 'CONFIRMADA', 'ANULADA'])
  estado?: 'BORRADOR' | 'CONFIRMADA' | 'ANULADA';

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
