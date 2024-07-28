import { Controller, Get, HttpException, Post,Headers, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthPayloadDto, UserCreateReq, UserForgetPassReq, UserLoginReq, UserResetPassReq } from './dtos/auth.dto';
import { Body, Req, Res, UseGuards } from '@nestjs/common/decorators';
import { Response } from 'express';
import { Request } from 'express';
import { LocalGuard } from './guards/local.guard';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt.guard';
import { RefreshTokenGuard } from './guards/refresh.guard';
import { GoogleOauthGuard } from './guards/google-oauth.guard';


@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authServices: AuthService) {}



  @Post('login')
  async login(@Body() authPayloadDto: AuthPayloadDto) {
    try {
      const user = await this.authServices.validateUser(authPayloadDto);
      return await this.authServices.login(user);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }



  @Post('register')
  async signUpUser(@Body() userCreatDTO: UserCreateReq) {
    try {
      const existingUser = await this.authServices.findeByEmail(userCreatDTO.email);

      if (existingUser) {
        throw new HttpException('Email already registered', 401);
      }

      const userCreated = await this.authServices.creatUser(userCreatDTO);
    
      return userCreated;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Re-throw the original HttpException
      }
      throw new HttpException('Internal Server Error', 500); // Throw a generic internal server error for other cases
    }
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

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // Initiates the Google OAuth2 login flow
  }

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(@Req() req:any, @Res() res: Response) {
    const FRONTEND_URL ="http://localhost:3000"
    try {
      const token = await this.authServices.oAuthLogin(req.user);
      res.redirect(`${FRONTEND_URL}/oauth?token=${token.jwt}`);
    
    } catch (err) {
      res.status(500).send({ success: false, message: err.message });
    }
  }


}
