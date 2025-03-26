// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuración de CORS para permitir solicitudes desde React
  app.enableCors({
    origin: 'http://127.0.0.1:5173', // URL de tu aplicación React
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  // Prefijo para la API
  // app.setGlobalPrefix('api');
  
  await app.listen(3000);
}
bootstrap();