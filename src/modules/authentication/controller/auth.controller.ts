import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from '../service/auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async signIn(@Body() signInDto: { username: string; password: string }) {
        console.log("Inside auth service L13..", signInDto);
        console.log("type of username:", typeof signInDto.username);
        return this.authService.signIn(signInDto.username, signInDto.password);
    }
}
