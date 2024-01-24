
import { IsArray, IsString } from 'class-validator';

export class UserUrlsReqDTO {
  @IsArray()
  @IsString({ each: true })
  url: string[];
}