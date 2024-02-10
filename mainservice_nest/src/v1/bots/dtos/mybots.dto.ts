import { IsString } from "class-validator";

export class BotCreate{
    @IsString()
    name: string;

    @IsString()
    type : string;

}