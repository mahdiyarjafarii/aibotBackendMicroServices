import { Controller, Get, HttpException, Post,Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserCreateReq, UserForgetPassReq, UserLoginReq, UserResetPassReq } from './dtos/auth.dto';
import { Body, Req, UseGuards } from '@nestjs/common/decorators';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { LocalGuard } from './guards/local.guard';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt.guard';
import { RefreshTokenGuard } from './guards/refresh.guard';


@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authServices: AuthService) {}



  @Post('login')
  @UseGuards(LocalGuard)
  async login(@Req() req: Request) {
    return await this.authServices.login(req.user);
  }



  @Post('register')
  async signUpUser(@Body() userCreatDTO: UserCreateReq) {
    const existingUser = await this.authServices.findeByEmail(
      userCreatDTO.email,
    );

    if (existingUser) {
      throw new HttpException('Email already registered', 401);
    }

    const userCreated = await this.authServices.creatUser(userCreatDTO);
  
    return userCreated;
  }



  @Get('auth-check')
  @UseGuards(JwtAuthGuard)
  async status(@Req() req: Request){
    return req.user
  };

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  async refresh(@Req() req: any) {
    const user = req.user;
    const newAccessToken = await this.authServices.generateNewAccessToken(user);
    return { accessToken: newAccessToken };
  }




}
