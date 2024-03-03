import { IsString } from 'class-validator';

export class ChatCredentials {
  @IsString()
  botId: string;

  @IsString()
  userId: string;
}
