import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { from } from 'rxjs';
import axios from 'axios';

@Injectable()
export class ChatService {
  constructor(private readonly httpService: HttpService) {}

  async callLCForStream(prompt: string): Promise<Observable<string>> {

    //USE THIS:

    // const response = await fetchEventSource("http://localhost:8000/plotset/stream", {
    //                 method: "POST",
    //                 headers: {
    //                   "Content-Type": "text/event-stream",
    //                 },
    //                 body: JSON.stringify({
    //                   input: input,
    //                 }),
    //                 onmessage (msg) {
    //                   if (msg.event === "data") {
    //                     let messageData = JSON.parse(msg.data)
    //                     chat.streamChunkToLastMessage(messageData);
    //                   }
    //                 },
    //                 onerror(err){
    //                   console.error("Error fetching data:",err);
    //                 },
    //               });

    const response = await fetch('http://localhost:8000/plotset/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/event-stream',
      },
      body: JSON.stringify({
        input: 'what is plotset?',
      }),
    });



    const reader = response.body
      .pipeThrough(new TextDecoderStream())
      .getReader();

    return new Observable((observer) => {
      (async function readStream() {
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) {
              observer.complete();
              break;
            }
            console.log('Fetch Received:', value);
            observer.next(value);
          }
        } catch (error) {
          observer.error(error);
          console.error('Fetch stream error: ', error);
        }
      })();
    });
  }
}
