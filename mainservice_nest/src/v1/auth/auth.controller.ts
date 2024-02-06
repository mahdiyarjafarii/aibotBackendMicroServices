import { Controller, Get, HttpException, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserCreateReq, UserForgetPassReq, UserLoginReq, UserResetPassReq } from './dtos/auth.dto';
import { Body, Req } from '@nestjs/common/decorators';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authServices: AuthService) {}

  //for login api
  @Post('login')
  async loginUser(@Body() userLoginDto: UserLoginReq) {
    const existingUser = await this.authServices.findeByEmail(
      userLoginDto.email,
    );
    if (!existingUser) {
      throw new HttpException('user is notfound', 401);
    }

    const resultComapre = await bcrypt.compare(
      userLoginDto.password,
      existingUser.passwordHash,
    );
    if (resultComapre) {
      const cachedToken = await this.authServices.getTokenRedis(
        userLoginDto.email,
      );
      if (cachedToken) {
        console.log('use cached token');
        return { access_token: cachedToken };
      } else {
        const token = await this.authServices.generateToken(
          existingUser.user_id,
        );
        await this.authServices.setTokenRedis(userLoginDto.email, token,84600);
        console.log('use fresh token');

        return { access_token: token };
      }
    } else {
      throw new HttpException('Password is not match', 401);
      // return { message: 'password is not match' };
    }
  }

  //for signup api
  @Post('signup')
  async signUpUser(@Body() userCreatDTO: UserCreateReq) {
    const existingUser = await this.authServices.findeByEmail(
      userCreatDTO.email,
    );

    if (existingUser) {
      throw new HttpException('Email already registered', 401);
    }

    const userCreated = await this.authServices.creatUser(userCreatDTO);
    const token = await this.authServices.generateToken(userCreated.user_id);
    await this.authServices.setTokenRedis(userCreatDTO.email, token,84600);
    return { access_token: token };
  }


//   @Post('forgetPassword')
//   async forgetPassword(@Body() UserForgetPassReqDto:UserForgetPassReq ){

//     return this.authServices.forgetPasswordService(UserForgetPassReqDto)
//   }

//   @Post('resetPassword')
//   async resetPassword(@Body() UserResetPassReqDto:UserResetPassReq){
//     return this.authServices.resetPasswordServices(UserResetPassReqDto)
//   }
}
