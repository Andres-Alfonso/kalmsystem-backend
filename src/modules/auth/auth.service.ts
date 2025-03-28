// auth.service.ts (NestJS)
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

export interface TokenUser {
  id: string;
  email: string;
  client: number;
  roles: string[];
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Método para validar el token externo de Laravel
  async validateExternalToken(token: string): Promise<{ valid: boolean; user?: TokenUser }> {
    try {
      // Decodifica el token
      const decoded = jwt.decode(token);
      
      if (!decoded || typeof decoded !== 'object') {
        return { valid: false };
      }
      
      // Verificar que el token tenga los campos necesarios
      if (!decoded.id || !decoded.email || !decoded.roles) {
        return { valid: false };
      }

      // Buscar el usuario en la base de datos de NestJS
      const user = await this.userRepository.findOne({ where: { email: decoded.email }, relations: ['roleUsers', 'roleUsers.role'] });


      if(!user){
        return { valid: false };
      }
      return {
        valid: true,
        user: {
          id: user.id.toString(),
          email: user.email,
          client: user.client_id,
          roles: user.roleUsers ? user.roleUsers.map(roleUser => roleUser.role.name) : [],
        }
      };
    } catch (error) {
      console.error('Error al validar token externo:', error);
      return { valid: false };
    }
  }

  // Obtener la información del usuario desde el token
  getUserFromToken(token: string): TokenUser {
    const decoded = jwt.decode(token) as any;
    
    return {
      id: decoded.id,
      email: decoded.email,
      client: decoded.client,
      roles: decoded.roles,
    };
  }

  // Generar nuevos tokens para el frontend
  async generateTokens(user: TokenUser) {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'your-secret-key',
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key',
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  // Refresca tokens usando el refreshToken
  async refreshTokens(refreshToken: string) {
    try {
      // Verificar el token de refresco
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key',
      });

      // Aquí podrías verificar si el refreshToken está en la base de datos
      // y no ha sido revocado

      const user: TokenUser = {
        id: payload.sub,
        email: payload.email,
        client: payload.client,
        roles: payload.roles,
      };

      // Generar nuevos tokens
      const tokens = await this.generateTokens(user);

      return {
        ...tokens,
        user,
      };
    } catch (error) {
      throw new Error('RefreshToken inválido');
    }
  }
}