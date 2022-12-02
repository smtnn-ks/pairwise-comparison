import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailerService {
  constructor(private mailerService: MailerService) {}

  sendValidationEmail(to: string, link: string): void {
    this.mailerService.sendMail({
      to,
      subject: 'Validate your email address',
      template: 'welcome',
      context: {
        link: process.env.MAIL_VALIDATION_ROUTE + link,
      },
    });
  }

  sendInterviewCompleteNotification(
    to: string,
    interviewTitle: string,
    interviewId: number,
  ): void {
    this.mailerService.sendMail({
      to,
      subject: 'Your interview is complete',
      template: 'done',
      context: {
        title: interviewTitle,
        link: process.env.MAIL_INTERVIEW_ROUTE + interviewId,
      },
    });
  }

  sendRestore(to: string, token: string): void {
    this.mailerService.sendMail({
      to,
      subject: 'Restore your password',
      template: 'reset',
      context: {
        link: process.env.MAIL_RESTORE_ROUTE,
        token,
      },
    });
  }
}
