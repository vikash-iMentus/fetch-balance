import { AuthService } from '../service/auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signIn(signInDto: {
        username: string;
        password: string;
    }): Promise<any>;
}
