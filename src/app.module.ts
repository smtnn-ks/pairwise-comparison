import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserSideModule } from './user-side/user-side.module';
import { ExpertSideModule } from './expert-side/expert-side.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { FilerModule } from './filer/filer.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserSideModule,
    ExpertSideModule,
    EventEmitterModule.forRoot(),

    MailerModule.forRoot({
      transport: process.env.MAIL_TRANSPORT,
      defaults: {
        from: process.env.MAIL_FROM,
      },
      template: {
        dir: __dirname + '/emailer/templates',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),

    FilerModule,
  ],
})
export class AppModule {}
