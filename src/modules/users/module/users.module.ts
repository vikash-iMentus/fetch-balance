import { Module } from '@nestjs/common';
import { UsersService } from '../service/users.service';
import { UsersController } from '../controller/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]) ],
  providers: [UsersService],
  controllers: [UsersController],
  exports:[UsersService]
})
export class UserModule {}