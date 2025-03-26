import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    // Importar y configurar ConfigModule
    ConfigModule.forRoot({
      isGlobal: true, // Disponible en toda la aplicación
      envFilePath: '.env', // Ruta al archivo .env
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3307,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: false,
    }),
    TypeOrmModule.forFeature([ ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
