import { Controller, Post, Res, Sse } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Response } from 'express';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatServcie: ChatService) {}

  @Post('stream')
  async generateResponseAsync(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');

    const chatObservable = await this.chatServcie.callLCForStream('');

    chatObservable
      .pipe(
        map((value) => {
          // Do any processing or transformation here
          if (!value) return '';
          const originalStr = value?.toString();
          const secondLine = originalStr?.split('\n')?.[1];
          const onlyVal = secondLine?.replace('data:', '');
          return { data: { message: onlyVal } }; // For example, convert the value to a string
        }),
      )
      .subscribe({
        next: (value) => {
          console.log(1111);

          console.log('Received:', value);
          res.write(value);
        },
        error: (error) => {
          console.log(2222);

          console.error('Error:', error);
        },
        complete: () => {
          console.log(3333);

          console.log('Stream completed');
          res.end();
        },
      });

    return 123;
  }

  @Sse('sse')
  async sse(): Promise<Observable<any>> {
    const chatObservable = await this.chatServcie.callLCForStream('');
    //return interval(1000).pipe(map((_) => ({ data: { hello: 'world' } })));
    return chatObservable.pipe(
      map((value) => {
        // Do any processing or transformation here
        if (!value) return '';
        const originalStr = value?.toString();
        const secondLine = originalStr?.split('\n')?.[1];
        const onlyVal = secondLine?.replace('data:', '');
        return { data: onlyVal }; // For example, convert the value to a string
      }),
    );

    // # THIS CODE BLOCK IS USED FOR DEBUGGING

    // .subscribe({
    //   next: (value) => {
    //     console.log(1111);

    //     console.log('Received:', value);
    //   },
    //   error: (error) => {
    //     console.log(2222);

    //     console.error('Error:', error);
    //   },
    //   complete: () => {
    //     console.log(3333);

    //     console.log('Stream completed');
    //   },
    // });
  }
}
