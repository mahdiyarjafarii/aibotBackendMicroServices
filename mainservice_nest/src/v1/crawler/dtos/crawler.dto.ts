
import { IsArray, IsString } from 'class-validator';

export class UserUrlsReqDTO {
  @IsArray()
  @IsString({ each: true })
  urls: string[];

  @IsString()
  botId: string;
}
