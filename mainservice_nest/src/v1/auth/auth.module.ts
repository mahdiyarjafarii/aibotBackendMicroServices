import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module'; 
// import { RedisModule } from 'src/infrastructure/redis/redis.module'; 
import { JwtModule } from '@nestjs/jwt';




@Module({
  imports: [PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' }, // Optional: Token expiration time
    }),
    // RedisModule
  ],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
