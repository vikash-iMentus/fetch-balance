import { Injectable, NotAcceptableException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/service/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private readonly usersService: UsersService,  private jwtService: JwtService) { }

    async signIn(username: string, pass: string): Promise<any> {
      console.log("Inside AuthService L11...", username);
      console.log("Inside AuthService L12...", pass);
      const user = await this.usersService.getUser(username);

        if (!user || !(await bcrypt.compare(pass, user.password))) {
            throw new UnauthorizedException();
          }
          const payload = { username: user.username, sub: user.id };
          return {
            access_token: await this.jwtService.signAsync(payload),
          };
      }

}
