import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import * as FormData from 'form-data';
import { catchError, firstValueFrom } from 'rxjs';
import { AppException } from 'src/common/exceptions/exceptions';

@Injectable()
export class FilerService {
  constructor(private httpService: HttpService) {}

  async uploadImage(image: Express.Multer.File): Promise<string> {
    const formData = new FormData();
    formData.append('image', image.buffer, { filename: image.originalname });

    const { data } = await firstValueFrom(
      this.httpService.post<string>(process.env.FILE_SERVER_URL, formData).pipe(
        catchError((error: AxiosError) => {
          throw AppException.fileServerException(error);
        }),
      ),
    );

    return data;
  }

  async deleteImage(imageName: string): Promise<string> {
    const { data } = await firstValueFrom(
      this.httpService
        .delete<string>(process.env.FILE_SERVER_URL + '/' + imageName)
        .pipe(
          catchError((error: AxiosError) => {
            throw AppException.fileServerException(error);
          }),
        ),
    );
    return data;
  }

  async updateImage(
    imageName: string,
    image: Express.Multer.File,
  ): Promise<string> {
    const formData = new FormData();
    formData.append('image', image.buffer, { filename: image.originalname });

    const { data } = await firstValueFrom(
      this.httpService
        .put<string>(process.env.FILE_SERVER_URL + '/' + imageName, formData)
        .pipe(
          catchError((error: AxiosError) => {
            throw AppException.fileServerException(error);
          }),
        ),
    );

    return data;
  }
}
