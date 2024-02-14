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

  callLCForStream(prompt: string): Observable<AxiosResponse<any, any>> {
    //https://www.npmjs.com/package/axios-observable
    // Create an observable from the axios GET request
    const dataObservable = from(
      axios.post('http://localhost:8000/plotset/stream', {
        input: 'how to create barchart?',
      }),
    );

    // Subscribe to the observable to handle the response or error
    dataObservable.subscribe({
      next(response) {
        console.log(123, response.data); // Handle the response data
      },
      error(err) {
        console.error(err); // Handle the error
      },
      complete: () => {
        console.log('Stream completed.');
      },
    });
    // const observable = this.httpService.post(
    //   'http://localhost:8000/plotset/stream',
    //   {
    //     input: 'how to create barchart?',
    //   },
    //   { responseType: 'stream' },
    // );

    // observable.pipe(
    //   map((response) => {
    //     // Assuming the response is a text stream
    //     console.log(response.data.toString());
    //     return response.data.toString();
    console.log(123, observable);

    observable.subscribe({
      //sum: '',
      next(value) {
        console.log('Adding: ' + value);
        //this.sum = this.sum + value;
      },
      error() {
        // We actually could just remove this method,
        // since we do not really care about errors right now.
      },
      complete() {
        console.log('Sum equals: ');
      },
    });

    // return observable.pipe(
    //   map((axiosResponse: AxiosResponse) => {
    //     console.log(axiosResponse.data);
    //     return axiosResponse.data;
    //   }),
    // );
    // observable.subscribe({
    //   next: (data) => {
    //     console.log('Received data:', data.data);
    //   },
    // //   error: (error) => {
    // //     console.error('Error:', error);
    // //   },
    //   complete: () => {
    //     console.log('Stream completed.');
    //   },
    // });
    return dataObservable;

    // observable.forEach((value) => {
    //   console.log(value);
    //   console.log(123);
    //   return value;
    // });

    // observable.pipe(
    //   map((res) => {
    //     console.log(res.data);
    //     return res.data;
    //   }),
    // );

    // observable
    //   .pipe(
    //     map((value) => {
    //       console.log({ value });

    //       return value;
    //     }),
    //   )
    //   .subscribe((result) => {
    //     console.log(result);
    //   });

    // observable.subscribe((x) => {
    //   console.log(666, x);
    // });
  }
}
