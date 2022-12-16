import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MyExceptionFilter } from './common/filters/my-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new MyExceptionFilter());
  await app.listen(process.env.PORT, () =>
    console.log(`Server is running on port ${process.env.PORT}`),
  );
}
bootstrap();
