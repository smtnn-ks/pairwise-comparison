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

  sendInterviewCompleteNotification(to, interviewTitle, interviewId): void {
    this.mailerService.sendMail({
      to,
      subject: 'Your interview is complete',
      html: `
        <h1>Interview "${interviewTitle}" is completed.</h1>
        <p>Click the link below to see details.</p>
        <a href="${
          process.env.MAIN_INTERVIEW_ROUTE + interviewId
        }">I'm the link to see your interview details</a>
      `,
    });
  }
}
