import { IsIn, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class HistoriaDto {
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @IsOptional()
  @IsIn(['activa', 'alta', 'archivada'])
  status?: 'activa' | 'alta' | 'archivada';
}

export class NotaDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsIn(['revision', 'pregunta', 'nota'])
  tipo?: 'revision' | 'pregunta' | 'nota';

  @IsOptional()
  @IsString()
  content?: string;
}
