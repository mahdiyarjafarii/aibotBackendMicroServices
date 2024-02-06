import { Provider } from '@nestjs/common';
import { Redis } from 'ioredis';

export const redisProvider: Provider<Redis> = {
    provide: 'REDIS_CLIENT',
    useFactory: (): Redis => {
      return new Redis({
        port: 6379, // Redis port
        host: process.env.HOST, // Redis host
        password: process.env.REDIS_PASS,
      });
    },
  };