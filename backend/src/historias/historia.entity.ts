import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Nota } from './nota.entity';

export type HistoriaStatus = 'activa' | 'alta' | 'archivada';

@Entity('historias')
export class Historia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  ownerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  owner: User;

  @Column({ default: '' })
  patientName: string;

  @Column({ default: '' })
  documento: string;

  @Column({ default: 'activa' })
  status: HistoriaStatus;

  @Column({ type: 'jsonb', default: {} })
  data: Record<string, any>;

  @OneToMany(() => Nota, (n) => n.historia)
  notas: Nota[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
