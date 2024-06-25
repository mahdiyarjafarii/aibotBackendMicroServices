import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from 'src/v1/auth/auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(
    context: ExecutionContext,
  ) {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeaders(request.headers);
    console.log(token)
    
    
    if (!token) {
      throw new UnauthorizedException('Token not found or not have Bearer');
    }

    const user = await this.authService.getUserWithToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    request.user = user;

    return true;
  }

  private extractTokenFromHeaders(headers: any): string | null {
    if (!headers || !headers.authorization) {
      return null;
    }
    const authHeader = headers.authorization;
    const bearerPrefix = 'Bearer ';
    if (authHeader.startsWith(bearerPrefix)) {
      return authHeader.slice(bearerPrefix.length);
    }
    return null
  }
}
