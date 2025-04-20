import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { DecodedIdToken } from 'firebase-admin/auth';

@Controller('auth')
export class AuthController {

  @Get('profile')
  @UseGuards(AuthGuard)
  getProfile(@CurrentUser() user: DecodedIdToken) {
    console.log('Accessing protected profile route for user:', user.uid);
    return {
      message: 'This is a protected route',
      userId: user.uid,
      email: user.email,
    };
  }

  // You can add other auth-related routes here (e.g., potentially for custom token creation if needed)
}
