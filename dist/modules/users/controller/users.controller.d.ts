import { UsersService } from '../service/users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    createUser(password: string, username: string): Promise<number>;
    getBalance(blockchainName: string, validatorAddress: string): Promise<any>;
}
