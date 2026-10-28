import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard, AuthUser, CurrentUser } from '../auth/auth.guard';
import { HistoriaDto, NotaDto } from './historias.dto';
import { HistoriasService } from './historias.service';

@Controller()
@UseGuards(AuthGuard)
export class HistoriasController {
  constructor(private readonly service: HistoriasService) {}

  @Get('historias')
  list(@CurrentUser() user: AuthUser) {
    return this.service.list(user.id);
  }

  @Post('historias')
  create(@CurrentUser() user: AuthUser, @Body() dto: HistoriaDto) {
    return this.service.create(user.id, dto);
  }

  @Get('historias/:id')
  get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.get(user.id, id);
  }

  @Patch('historias/:id')
  update(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: HistoriaDto) {
    return this.service.update(user.id, id, dto);
  }

  @Delete('historias/:id')
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(user.id, id);
  }

  @Get('historias/:id/notas')
  listNotas(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.listNotas(user.id, id);
  }

  @Post('historias/:id/notas')
  createNota(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: NotaDto) {
    return this.service.createNota(user.id, id, dto);
  }

  @Patch('notas/:id')
  updateNota(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: NotaDto) {
    return this.service.updateNota(user.id, id, dto);
  }

  @Delete('notas/:id')
  removeNota(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.removeNota(user.id, id);
  }
}
