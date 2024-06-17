import { IsString, IsNotEmpty } from 'class-validator';

export class GenerateWidgetTokenDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  botId: string;
}

export class GetCollectionNameDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class GetBotConfigDto {
  @IsString()
  @IsNotEmpty()
  botId: string;
}
