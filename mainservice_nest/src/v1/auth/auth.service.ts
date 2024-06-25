import { Injectable, Inject, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import {
  AuthPayloadDto,
  UserCreateReq,
  UserEntity,
  UserForgetPassReq,
  UserResetPassReq,
} from './dtos/auth.dto';
// import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { Redis } from 'ioredis';
import { JwtService } from '@nestjs/jwt';
// import { userType } from '@prisma/client';

interface payloadJWT {
  username: string;
  user_type: any;
  iat: number;
  exp: number;
};



@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    private jwtService: JwtService,

  ) {}

  async creatUser({
    name,
    lastName,
    email,
    password,
  }: UserCreateReq): Promise<UserEntity> {
    try {
      const passwordHash = await bcrypt.hash(password, process.env.SALT_BCRYPT);
      const createduser = await this.prismaService.users.create({
        data: {
          name,
          lastName,
          email,
          passwordHash,
        },
      });
      return new UserEntity(createduser);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async findeByEmail(email: string): Promise<UserEntity | undefined> {
    return this.prismaService.users.findFirst({
      where: {
        email: email,
      },
    });
  };


  async validateUser({ email, password }: AuthPayloadDto) {
    const user = await this.prismaService.users.findFirst({
      where: {
        email: email,
      },
    });
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;

 
  };

  async login(user: any) {
    const payload = {
      username: user.email,
      sub: {
        name: user.name,
      },
    };
    console.log(
      {
        ...user,
        accessToken: this.jwtService.sign(payload),
        refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
      }
    )

    return {
      ...user,
      accessToken: this.jwtService.sign(payload,{ expiresIn: '1d' }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async oAuthLogin(user:any) {
    if (!user) {
      throw new Error('User not found!!!');
    }

    const payload = {
      username: user.email,
      sub: {
        name: user.name,
      },
    };

    const jwt = this.jwtService.sign(payload);

    return { jwt };
  }


  async generateNewAccessToken(user: any): Promise<string> {
    const payload = {
      username: user.email,
      sub: {
        name: user.name,
      },
    };

    return this.jwtService.sign(payload);
  }

  async generateToken(userId: string): Promise<string> {
    const payload = { userId };

    const token = await jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: 81000,
    });
    return token;
  }

  async setTokenRedis(
    key: string,
    token: string,
    timeExpire: number,
  ): Promise<string> {
    try {
      const cachedData = await this.redisClient.set(key, token);
      await this.redisClient.expire(key, timeExpire);

      return cachedData;
    } catch (e) {
      console.error(e);
    }
  }

  async getTokenRedis(key: string): Promise<string> {
    try {
      const cachedData = await this.redisClient.get(key);

      return cachedData;
    } catch (e) {
      console.error(e);
    }
  }

  //   async deleteTokenRedis(key: string){
  //     try {
  //        await this.redisClient.del(key);

  //     } catch (e) {
  //       console.error(e);
  //     }
  //   }

  async getUserWithToken(token: string): Promise<UserEntity | undefined> {
    console.log(token)
    try {
      const payload = (await this.jwtService.verify(
        token
      )) as payloadJWT;
      if (!payload) {
        return null;
      };

      const user = await this.prismaService.users.findUnique({
        where: {
          email: payload.username,
        },
      });

      if (!user) return null;

      return {
        ...user,
        isAuthenticated: true,
      };
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  //   async forgetPasswordService({email}:UserForgetPassReq){
  //     //step 1 (check teh user is exist):
  //     const existingUser = await this.findeByEmail(email);

  //     if (!existingUser) {
  //       throw new HttpException('user is notfound', 401);
  //     }
  //     //

  //     //step2 (generate token and stored fresh token in redis):
  //     const token=await this.generateToken(existingUser.user_id);
  //     const existToken= this.getTokenRedis(existingUser.user_id);

  //     if(existToken){
  //       await this.deleteTokenRedis(existingUser.user_id);
  //     };
  //     //for 15 min stored in redis
  //     await this.setTokenRedis(existingUser.user_id,token,900);
  //     //todo: add push notficarion email services
  //     return {token}

  //   }

  //   async resetPasswordServices({token,newPassword}:UserResetPassReq){
  //     let userId: string;
  //     //step 1 (check validate and expire time for token):
  //     try{
  //       const payload = (await jwt.verify(
  //         token,
  //         process.env.JWT_SECRET,
  //       )) as payloadJWT;
  //       userId = payload.userId; // Assign the userId from the payload

  //       const storedToken=await this.getTokenRedis(payload.userId);
  //       if(!storedToken){
  //         throw new HttpException('the expire time is for this link is end', 401);
  //       }

  //     }catch (error){
  //       if (error instanceof jwt.TokenExpiredError) {
  //         console.error('Token expired:', error.message);

  //       } else if (error instanceof jwt.JsonWebTokenError) {
  //         console.error('Invalid token:', error.message);

  //       } else {

  //         console.error('Token verification failed:', error);
  //       }
  //     }
  //     //

  //     //step 2 (updated password):
  //     const passwordHash = await bcrypt.hash(newPassword, process.env.SALT_BCRYPT);

  //      const updatedUser= await this.prismaService.users.update({
  //       where:{
  //         user_id:userId
  //       },
  //       data:{
  //         passwordHash
  //       }
  //      });

  //      console.log("password changed..");

  //      return updatedUser

  //     //
  //   }
}
