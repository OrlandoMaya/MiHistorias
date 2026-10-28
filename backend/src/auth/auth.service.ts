import { ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { LoginDto, RegisterDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  /** El registro está abierto salvo ALLOW_REGISTRATION=false; aun así, el primer usuario siempre puede registrarse. */
  async registrationOpen() {
    if (process.env.ALLOW_REGISTRATION !== 'false') return true;
    return (await this.users.count()) === 0;
  }

  async register(dto: RegisterDto) {
    if (!(await this.registrationOpen())) {
      throw new ForbiddenException('El registro de cuentas nuevas está cerrado');
    }
    const email = dto.email.toLowerCase().trim();
    if (await this.users.findOneBy({ email })) {
      throw new ConflictException('Ya existe una cuenta con ese correo');
    }
    const user = await this.users.save(
      this.users.create({ name: dto.name.trim(), email, passwordHash: await bcrypt.hash(dto.password, 10) }),
    );
    return this.session(user);
  }

  async login(dto: LoginDto) {
    const user = await this.users
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.email = :email', { email: dto.email.toLowerCase().trim() })
      .getOne();
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }
    return this.session(user);
  }

  /** Confirma que la cuenta del token sigue existiendo (pudo haberse eliminado). */
  async me(id: string) {
    const user = await this.users.findOneBy({ id });
    if (!user) throw new UnauthorizedException();
    return { id: user.id, name: user.name, email: user.email };
  }

  private async session(user: User) {
    const token = await this.jwt.signAsync({ sub: user.id, email: user.email, name: user.name });
    return { token, user: { id: user.id, name: user.name, email: user.email } };
  }
}
