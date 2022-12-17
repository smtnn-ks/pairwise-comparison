import { HttpException } from '@nestjs/common';

export class AppError {
  static suchUserExistsException = (): HttpException =>
    new HttpException(
      { status: 405, message: 'such user exists already', error: 100 },
      405,
    );

  static wrongActivationLinkException = (): HttpException =>
    new HttpException(
      { status: 400, message: 'wrong activation link', error: 101 },
      400,
    );

  static wrongCredentialsException = (): HttpException =>
    new HttpException(
      { status: 400, message: 'wrong credentials', error: 102 },
      400,
    );

  static refreshTokenDoesNotMatchException = (): HttpException =>
    new HttpException(
      {
        status: 400,
        message: 'passed refresh token is not the refresh token in database',
        error: 103,
      },
      400,
    );

  static noSuchUserException = (): HttpException =>
    new HttpException(
      {
        status: 404,
        message: 'no such user',
        error: 104,
      },
      404,
    );

  static tokenRefersToNonExistingUserExcetption = (): HttpException =>
    new HttpException(
      {
        status: 400,
        message: 'user, token refers to, does not exists',
        error: 105,
      },
      400,
    );

  static invalidTokenException = (): HttpException =>
    new HttpException(
      {
        status: 401,
        message: 'invalid token',
        error: 106,
      },
      401,
    );

  // user-side exceptions exceptions

  static interviewDoesNotExistException = (): HttpException =>
    new HttpException(
      {
        status: 404,
        message: 'interview does not exist',
        error: 200,
      },
      404,
    );

  static interviewDoesNotBelongToUserException = (): HttpException =>
    new HttpException(
      {
        status: 403,
        message: 'interview does not belong to user',
        error: 201,
      },
      403,
    );

  static userIsNotActivatedException = (): HttpException =>
    new HttpException(
      {
        status: 403,
        message: 'user is not activated',
        error: 202,
      },
      403,
    );

  static noInterviewException = (): HttpException =>
    new HttpException(
      {
        status: 404,
        message: 'no such interview',
        error: 203,
      },
      404,
    );

  // expert-side exceptions

  static interviewIsNotCompleteException = (): HttpException =>
    new HttpException(
      {
        status: 403,
        message: 'interview is not complete',
        error: 300,
      },
      403,
    );

  static noSuchExpertException = (): HttpException =>
    new HttpException(
      {
        status: 404,
        message: 'no such expert',
        error: 301,
      },
      404,
    );

  static expertPassedInterviewAlreadyException = (): HttpException =>
    new HttpException(
      {
        status: 403,
        message: 'this expert has passed the interview already',
        error: 302,
      },
      403,
    );

  static invalidSetOfIdsException = (): HttpException =>
    new HttpException(
      {
        status: 400,
        message: 'set of ids is not valid',
        error: 303,
      },
      400,
    );

  static invalidScoresException = (): HttpException =>
    new HttpException(
      {
        status: 400,
        message: 'scores are not valid',
        error: 304,
      },
      400,
    );

  static emailerException = (e: any): HttpException =>
    new HttpException(
      { status: 500, message: 'emailer error', error: 400, errorCause: e },
      500,
    );

  static fileServerException = (e: any): HttpException =>
    new HttpException(
      { status: 500, message: 'file server error', error: 401, errorCause: e },
      500,
    );
}
