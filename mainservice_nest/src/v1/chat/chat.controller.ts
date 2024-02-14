import { Controller, Post, Res } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Response } from 'express';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatServcie: ChatService) {}

  @Post('stream')
  async generateResponseAsync(@Res() res: Response) {
    this.chatServcie.callLCForStream('')
    // this.chatServcie.callLCForStream('').subscribe(
    //   (response) => response.data.pipe(res),
    this.chatServcie.callLCForStream('');
    // this.chatServcie.callLCForStream('').subscribe(
    //   (response) => response,
    //   (error) => {
    //     res.status(500).send('Internal Server Error');
    //   },
    // );
    return 123;
  }
}
