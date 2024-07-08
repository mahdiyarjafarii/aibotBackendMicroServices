import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';

export class BotCreate {
  @IsString()
  @IsOptional()
  text_input?: string;

  @IsArray()
  @IsOptional()
  qANDa_input?: string[];

  @IsArray()
  @IsOptional()
  urls?: string[];

  @IsArray()
  @IsOptional()
  files?: string[];
}

export class BotUpdateDataSource {
  @IsString()
  @IsOptional()
  text_input?: string;

  @IsArray()
  @IsOptional()
  qANDa_input?: [];

  @IsArray()
  @IsOptional()
  urls?: string[];

  @IsArray()
  @IsOptional()
  files?: string[];

  @IsArray()
  @IsOptional()
  uploadedFile?:any;
}
export class CreateConversationDto {
  @IsString()
  @IsNotEmpty()
  widgetVersion: string;

  // Optionally include other fields like userIP, userLocation, etc.
}
