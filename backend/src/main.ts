import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS (allows frontend to connect)
  app.enableCors();

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Authentication API')
    .setDescription('Login, Signup & 2FA API with Google Authenticator')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log('\n🚀 Server is running!');
  console.log(`📡 API: http://localhost:${port}`);
  console.log(`📚 Swagger Docs: http://localhost:${port}/api`);
  console.log(`🗄️  Database: SQLite (prisma/dev.db)`);
  console.log('\n✨ Ready to accept requests!\n');
}
bootstrap();
