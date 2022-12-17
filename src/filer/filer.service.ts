import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import * as FormData from 'form-data';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class FilerService {
  constructor(private httpService: HttpService) {}

  async uploadImage(image: Express.Multer.File): Promise<string> {
    const formData = new FormData();
    formData.append('image', image.buffer, { filename: image.originalname });

    const { data } = await firstValueFrom(
      this.httpService.post<string>(process.env.FILE_SERVER_URL, formData).pipe(
        catchError((error: AxiosError) => {
          throw new HttpException(error.response.data, error.response.status);
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
            throw new HttpException(error.response.data, error.response.status);
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
            console.log(error);
            throw new InternalServerErrorException(error.message);
          }),
        ),
    );

    return data;
  }
}
