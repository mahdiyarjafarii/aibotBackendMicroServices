import { IsArray, IsOptional, IsString } from "class-validator";

export class BotCreate{
    @IsString()
    @IsOptional()
    text_input?: string;

    @IsArray()
    @IsOptional()
    qANDa_input?:string[]

    @IsArray()
    @IsOptional()
    urls?:string[]


    @IsArray()
    @IsOptional()
    files?: string[];

}