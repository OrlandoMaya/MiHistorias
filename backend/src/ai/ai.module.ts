import { Module } from '@nestjs/common';
import { HistoriasModule } from '../historias/historias.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [HistoriasModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
