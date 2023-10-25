import { Injectable } from '@nestjs/common';
import { UserEntity } from '../entity/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(UserEntity)
      private userRepository: Repository<UserEntity>) { }

      
    async createUser(users : UserEntity): Promise<UserEntity> {
        try {

            const addedUser = await this.userRepository.save(users);
            console.log("🚀 ~ file: users.service.ts:16 ~ UsersService ~ createUser ~ addedUser:", addedUser)
            return addedUser
      
          } catch (error) {
      
            return error
      
          }
    }

    async getUser(username: string): Promise<UserEntity> {
      return this.userRepository.findOne({ where: { username } });
  }
  
}