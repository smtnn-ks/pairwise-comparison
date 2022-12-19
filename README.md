# Pairwise comparison service. Backend

Backend app to realize pairwise comparison service. Created using **Nest.js** for studying purpose. Realizes authorization, manipulating interviews, its' options and experts, and passing interviews.

## Table of content

- [Technologies](#technologies)
- [Setup](#setup)
- [Usage](#usage)
  - [Authorization](#authorization)
  - [User side](#user-side)
  - [Expert side](#expert-side)
  - [Error codes](#error-codes)
  - [Environment variables](#environment-variables)

## Technologies

Project is created with:

- Nest.js v9.1.4
- Node.js v16.18.1

## Setup

To run this project, install it locally using npm:

```
$ npm install
```
Migrate database with prisma
```
$ npx prisma migrate deploy
```

Start the project
```
$ npm start
```

## Usage

Usage is logically split in three parts: **authorization**, **user-side** and **expert-side** expiriences.

### Authorization

To signup new user it requires an email and password. After registration user needs to be activated. Activation link is send to email, mentioned in registration. Not activated user cannot create interviews.

Every user-side action requires access token. To get it user needs to signin. Access and refresh tokens will be sent. Refresh token is used to update set of tokens so user don't need to signin manually every 10 minutes.

Logout will detach refresh token from user. Since then it's set of tokens cannot be refreshed. Use signin to get tokens.

User can restore it's password with email. If such user exists, then link to restore password will be sent to mentioned email. Notice that this link has restore token in it's body.

### User-side

User can do basic CRUD funcitons with it's interviews. Same functions are avalible for interview's options and experts.

If interview has less than two options and two experts it can't be passed.

If user updates interview it's progress will be lost.

When interview is done user will receive email notification.

### Expert-side

Experts can pass interviews if it has it's id.

Expert cannot pass interview if it's incomplete (has less than two options and two experts). Expert cannot pass interview more than one time (except interview were updated).

Make sure that expert's results is valid. Here's a requirements:

- option ids are valid for current interview;
- for interview with _n_ options sum of scores has to be equal to _(n-1)!_

### Error codes

Http errors goes along with project-scope error codes. Table of errors provided below.

| SIDE              | DESCRIPTION                                         | CODE | HTTP CODE |
| ----------------- | --------------------------------------------------- | ---- | --------- |
| AUTH              | such user exists alredy                             | 100  | 405       |
|                   | wrong activation link                               | 101  | 400       |
|                   | wrong credentials                                   | 102  | 400       |
|                   | passed refresh token is not the refresh token in db | 103  | 400       |
|                   | no such user                                        | 104  | 404       |
|                   | user token refers to does not exist                 | 105  | 405       |
| INTERVIEW         | interview does not exist                            | 200  | 404       |
|                   | interview does not belong to user                   | 201  | 403       |
|                   | user is not activated                               | 202  | 403       |
|                   | no such interview                                   | 203  | 404       |
| EXPERTSIDE        | interview is not complete                           | 300  | 403       |
|                   | no such expert                                      | 301  | 404       |
|                   | this expert has passed the interview already        | 302  | 403       |
|                   | set of ids is not valid                             | 303  | 400       |
|                   | scores are not valid                                | 304  | 400       |
| SUPPORT SERVICES  | mailer service error                                | 400  | 500       |
|                   | file server error                                   | 401  | 500       |
| DATABASE TRIGGERS | interview limit for user                            | 500  | 500       |
|                   | option limit for interview                          | 501  | 500       |
|                   | expert limit for interview                          | 502  | 500       |

### Environment variables

Environment variables required for project:

| NAME                  | DESCRIPTION                       |
| --------------------- | --------------------------------- |
| DATABASE_URL          | URL to your database              |
| PORT                  | port for app                      |
| AT_SECRET             | secret for access jwt token       |
| RT_SECRET             | secret for refresh jwt token      |
| PT_SECRET             | secret for restore jwt token      |
| SALT                  | salt for bcrypt                   |
| MAIL_TRANSPORT        | URL to your SMTP server           |
| MAIL_FROM             | How to sign your mails            |
| MAIL_VALIDATION_ROUTE | route for user activation         |
| MAIL_INTERVIEW_ROUTE  | route to get details on interview |
| MAIL_RESTORE_ROUTE    | route to restore password         |
| FILE_SERVER_URL       | URL to file server                |
