import { Body, Controller, Post, Res, Sse } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Response } from 'express';
import { map, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { ChatCredentials } from './dtos/chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatServcie: ChatService) {}

  @Post('stream')
  async generateResponseAsync(
    @Body() chatCredentials: ChatCredentials,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');

    const chatObservable = await this.chatServcie.callLCForStream('');

    chatObservable
      .pipe(
        map((value) => {
          // Do any processing or transformation here
          if (!value) return '';
          const originalStr = value?.toString();
          const secondLine = originalStr?.split('\n')?.[1];
          const onlyVal = secondLine?.replace(/^data:"?|"$/g, '');
          return { data: { message: onlyVal } }; // For example, convert the value to a string
        }),
      )
      .subscribe({
        next: (value) => {
          
          console.log('Received:', value);
          res.write(value);
        },
        error: (error) => {

          console.error('Error:', error);
        },
        complete: () => {

          console.log('Stream completed');
          res.end();
        },
      });

    return 123;
  }

  @Sse('ss')
  async ss(): Promise<Observable<any>> {
    const chatObservable = await this.chatServcie.callLCForStream('');
    //return interval(1000).pipe(map((_) => ({ data: { hello: 'world' } })));
    // return chatObservable.pipe(
    //   map((value) => {
    //     // Do any processing or transformation here
    //     if (!value) return '';
    //     const originalStr = value?.toString();
    //     const secondLine = originalStr?.split('\n')?.[1];
    //     const onlyVal = secondLine?.replace('data:', '');
    //     return { data: onlyVal }; // For example, convert the value to a string
    //   }),
    // );

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

    // # this approach will close sse connection at end
    const endSignal$ = new Subject();

    // Merge the chatObservable with the completion signal
    const mergedObservable$ = chatObservable.pipe(
      map((value) => {
        // Do any processing or transformation here
        if (!value) return '';
        const originalStr = value?.toString();
        const secondLine = originalStr?.split('\n')?.[1];
        const onlyVal = secondLine?.replace('data:', '');
        return { data: onlyVal }; // For example, convert the value to a string
      }),
      // Complete the stream when the endSignal$ emits
      takeUntil(endSignal$),
    );
    return mergedObservable$;
  }
}
