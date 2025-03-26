import { Jwt } from './../../../node_modules/@types/jsonwebtoken/index.d';
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpException, UseGuards, Req, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';


interface RequestWithUser extends ExpressRequest {
  user: {
    id: string;
    email: string;
    roles: string[];
  };
}


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  private readonly logger = new Logger(AuthController.name);

  @Post('validate')
  async validateExternalToken(@Body() body: { token: string }){
    try{
      const result = await this.authService.validateExternalToken(body.token);

      if(!result.valid || !result.user){
        this.logger.error(`Error en la validación del token: ${body.token}`);
        throw new HttpException('Token is not valid', HttpStatus.UNAUTHORIZED)
      }

      // const user = this.authService.getUserFromToken(body.token);
      const{ accessToken, refreshToken } = await this.authService.generateTokens(result.user);

      return {
        user: result.user,
        accessToken,
        refreshToken
      };
    }catch(error){
      throw new HttpException('Error al validar el token', error.status || HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Post('refresh')
  async refreshToken(@Body() body: {refreshToken: string}){
    try{
      const result = await this.authService.refreshTokens(body.refreshToken);
      
      return result;
    }catch(error){
      throw new HttpException('Token de refresco no válido', HttpStatus.UNAUTHORIZED)
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: RequestWithUser){
    const user = req.user;
    return user;
  }

  // @Post()
  // create(@Body() createAuthDto: CreateAuthDto) {
  //   return this.authService.create(createAuthDto);
  // }

  // @Get()
  // findAll() {
  //   return this.authService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.authService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.authService.remove(+id);
  // }
}
