import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

   // Set a global route prefix here
   app.setGlobalPrefix('bal'); // This will add "/api" to all routes
  await app.listen(3003);
  console.log("DB Connected...");
}
bootstrap();
