import { BadRequestException, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, resolve } from 'path';
import { AuthGuard } from '../auth/auth.guard';

export const UPLOAD_DIR = resolve(process.env.UPLOAD_DIR ?? './uploads');
mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED = /^(image\/(png|jpe?g|gif|webp)|application\/pdf)$/;

@Controller('uploads')
@UseGuards(AuthGuard)
export class UploadsController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 15 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => cb(null, ALLOWED.test(file.mimetype)),
      storage: diskStorage({
        destination: UPLOAD_DIR,
        // Nombres aleatorios: los archivos se sirven sin sesión, así que la URL no debe ser adivinable.
        filename: (_req, file, cb) => cb(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`),
      }),
    }),
  )
  upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Solo se permiten imágenes (png, jpg, gif, webp) o PDF');
    return { url: `/api/files/${file.filename}`, name: file.originalname, mimetype: file.mimetype };
  }
}
