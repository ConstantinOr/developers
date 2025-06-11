import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestApplication, NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create<NestApplication>(AppModule);

    app.useGlobalPipes(new ValidationPipe({ whitelist: false, transform: false }));

    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    const configService = app.get(ConfigService);
    const port = configService.get('PORT') || 4001;

    const host = '0.0.0.0';

    // Enable CORS
    app.enableCors({
        origin: true, // Allow all origins in development
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });

    await app.listen(port, host);
    console.log(`Application is running on: http://${host}:${port}`);
}

bootstrap();
