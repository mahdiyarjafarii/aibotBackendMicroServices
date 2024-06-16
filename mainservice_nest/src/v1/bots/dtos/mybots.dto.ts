import { IsNotEmpty, IsString } from 'class-validator';

export class BotCreate {
  @IsString()
  name: string;

  @IsString()
  type: string;
}

export class CreateConversationDto {

  @IsString()
  @IsNotEmpty()
  widgetVersion: string;

  // Optionally include other fields like userIP, userLocation, etc.
}
