import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoriasController } from './historias.controller';
import { HistoriasService } from './historias.service';
import { Historia } from './historia.entity';
import { Nota } from './nota.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Historia, Nota])],
  controllers: [HistoriasController],
  providers: [HistoriasService],
  exports: [HistoriasService],
})
export class HistoriasModule {}
