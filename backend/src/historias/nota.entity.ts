import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Historia } from './historia.entity';

export type NotaTipo = 'revision' | 'pregunta' | 'nota';

@Entity('notas')
export class Nota {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  historiaId: string;

  @ManyToOne(() => Historia, (h) => h.notas, { onDelete: 'CASCADE' })
  historia: Historia;

  @Column({ default: 'Nueva página' })
  title: string;

  @Column({ default: 'nota' })
  tipo: NotaTipo;

  @Column({ type: 'text', default: '' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
