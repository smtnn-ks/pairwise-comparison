import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailerService {
  constructor(private mailerService: MailerService) {}

  sendValidationEmail(to, link): void {
    this.mailerService.sendMail({
      to,
      subject: 'Validate your email address',
      html: `
        <h1>Welcome to decision making service</h1>
        <p>Click the link below to validate your e-mail address</p>
        <a href="${
          process.env.MAIL_VALIDATION_ROUTE + link
        }">I'm the link to activate your accout</a>
      `,
    });
  }
}
