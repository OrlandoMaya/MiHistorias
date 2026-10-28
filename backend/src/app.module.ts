import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { HistoriasModule } from './historias/historias.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL ?? 'postgres://mihistorias:mihistorias@localhost:5433/mihistorias',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    HistoriasModule,
    AiModule,
    UploadsModule,
  ],
})
export class AppModule {}
