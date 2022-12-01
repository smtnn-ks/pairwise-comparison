import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import * as FormData from 'form-data';

@Injectable()
export class FilerService {
  constructor(private httpService: HttpService) {}

  async createFile(file: Express.Multer.File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file.buffer, { filename: file.originalname });
    const response: AxiosResponse<string> =
      await this.httpService.axiosRef.post(
        process.env.FILE_SERVER_URL,
        formData,
      );

    if (response.status == 400) throw new BadRequestException(response.data);
    if (response.status == 500)
      throw new InternalServerErrorException(response.data);

    return response.data;
  }
}
