import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { AppException } from 'src/common/exceptions/exceptions';

@Injectable()
export class EmailerService {
  constructor(private mailerService: MailerService) {}

  sendValidationEmail(to: string, link: string): void {
    try {
      this.mailerService.sendMail({
        to,
        subject: 'Validate your email address',
        template: 'welcome',
        context: {
          link: process.env.MAIL_VALIDATION_ROUTE + link,
        },
      });
    } catch (e) {
      throw AppException.emailerException(e);
    }
  }

  sendInterviewCompleteNotification(
    to: string,
    interviewTitle: string,
    interviewId: number,
  ): void {
    try {
      this.mailerService.sendMail({
        to,
        subject: 'Your interview is complete',
        template: 'done',
        context: {
          title: interviewTitle,
          link: process.env.MAIL_INTERVIEW_ROUTE + interviewId,
        },
      });
    } catch (e) {
      throw AppException.emailerException(e);
    }
  }

  sendRestore(to: string, token: string): void {
    try {
      this.mailerService.sendMail({
        to,
        subject: 'Restore your password',
        template: 'reset',
        context: {
          link: process.env.MAIL_RESTORE_ROUTE,
          token,
        },
      });
    } catch (e) {
      throw AppException.emailerException(e);
    }
  }
}
