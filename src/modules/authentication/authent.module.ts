import { Module } from "@nestjs/common";
import { UserModule } from "../users/users.module";
import { AuthService } from "./service/auth.service";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controller/auth.controller';
import { UsersService } from "../users/service/users.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config"; // Import ConfigModule and ConfigService
import { AuthGuard } from "./auth.guard";
import { UserEntity } from "../users/entity/user.entity";

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule], // Import ConfigModule here
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_PRIVATE'), // Use ConfigService to get the JWT secret key
        signOptions: { expiresIn: '6h' },
      }),
      inject: [ConfigService], // Inject ConfigService
      global: true,
    }),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  providers: [AuthService, UsersService, AuthGuard],
  controllers: [AuthController],
  exports: [AuthService, AuthGuard]
})
export class AuthenticateModule {}
