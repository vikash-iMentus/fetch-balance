import { UserEntity } from '../entity/user.entity';
import { Repository } from 'typeorm';
export declare class UsersService {
    private userRepository;
    constructor(userRepository: Repository<UserEntity>);
    createUser(users: UserEntity): Promise<UserEntity>;
    getUser(username: string): Promise<UserEntity>;
}
