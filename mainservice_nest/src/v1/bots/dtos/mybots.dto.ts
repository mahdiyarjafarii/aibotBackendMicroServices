import { IsArray, IsOptional, IsString } from "class-validator";

export class BotCreate{
    @IsString()
    @IsOptional()
    text_input?: string;

    @IsArray()
    @IsOptional()
    qaList?:string[]

    @IsArray()
    @IsOptional()
    urlList?:string[]


    // @IsArray()
    // @IsOptional()
    // files?: string[];

}