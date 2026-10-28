import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistoriaDto, NotaDto } from './historias.dto';
import { Historia } from './historia.entity';
import { Nota } from './nota.entity';

@Injectable()
export class HistoriasService {
  constructor(
    @InjectRepository(Historia) private readonly historias: Repository<Historia>,
    @InjectRepository(Nota) private readonly notas: Repository<Nota>,
  ) {}

  async list(ownerId: string) {
    const rows = await this.historias.find({ where: { ownerId }, order: { updatedAt: 'DESC' } });
    const counts: { historiaId: string; count: string }[] = await this.notas
      .createQueryBuilder('n')
      .select('n.historiaId', 'historiaId')
      .addSelect('COUNT(*)', 'count')
      .innerJoin('n.historia', 'h')
      .where('h.ownerId = :ownerId', { ownerId })
      .groupBy('n.historiaId')
      .getRawMany();
    const byId = new Map(counts.map((c) => [c.historiaId, Number(c.count)]));
    return rows.map((h) => ({ ...h, notasCount: byId.get(h.id) ?? 0 }));
  }

  async get(ownerId: string, id: string) {
    const historia = await this.historias.findOneBy({ id, ownerId });
    if (!historia) throw new NotFoundException('Historia no encontrada');
    return historia;
  }

  create(ownerId: string, dto: HistoriaDto) {
    const historia = this.historias.create({ ownerId, status: dto.status ?? 'activa', data: dto.data ?? {} });
    this.syncIndexFields(historia);
    return this.historias.save(historia);
  }

  async update(ownerId: string, id: string, dto: HistoriaDto) {
    const historia = await this.get(ownerId, id);
    if (dto.data) historia.data = dto.data;
    if (dto.status) historia.status = dto.status;
    this.syncIndexFields(historia);
    return this.historias.save(historia);
  }

  async remove(ownerId: string, id: string) {
    await this.historias.remove(await this.get(ownerId, id));
    return { ok: true };
  }

  async listNotas(ownerId: string, historiaId: string) {
    await this.get(ownerId, historiaId);
    return this.notas.find({ where: { historiaId }, order: { updatedAt: 'DESC' } });
  }

  async createNota(ownerId: string, historiaId: string, dto: NotaDto) {
    await this.get(ownerId, historiaId);
    return this.notas.save(this.notas.create({ historiaId, ...dto }));
  }

  async updateNota(ownerId: string, id: string, dto: NotaDto) {
    const nota = await this.getNota(ownerId, id);
    Object.assign(nota, dto);
    const { historia: _, ...saved } = await this.notas.save(nota);
    return saved;
  }

  async removeNota(ownerId: string, id: string) {
    await this.notas.remove(await this.getNota(ownerId, id));
    return { ok: true };
  }

  private async getNota(ownerId: string, id: string) {
    const nota = await this.notas.findOne({ where: { id }, relations: { historia: true } });
    if (!nota || nota.historia.ownerId !== ownerId) throw new NotFoundException('Página no encontrada');
    return nota;
  }

  /** Copia nombre y documento del JSON a columnas propias para listar y buscar rápido. */
  private syncIndexFields(historia: Historia) {
    const id = historia.data?.identificacion ?? {};
    historia.patientName = String(id.nombre ?? '').trim();
    historia.documento = String(id.documento ?? '').trim();
  }
}
