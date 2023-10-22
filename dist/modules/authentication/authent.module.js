"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticateModule = void 0;
const common_1 = require("@nestjs/common");
const users_module_1 = require("../users/users.module");
const auth_service_1 = require("./service/auth.service");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const auth_controller_1 = require("./controller/auth.controller");
const users_service_1 = require("../users/service/users.service");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const auth_guard_1 = require("./auth.guard");
const user_entity_1 = require("../users/entity/user.entity");
let AuthenticateModule = class AuthenticateModule {
};
AuthenticateModule = __decorate([
    (0, common_1.Module)({
        imports: [
            users_module_1.UserModule,
            passport_1.PassportModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET_PRIVATE'),
                    signOptions: { expiresIn: '6h' },
                }),
                inject: [config_1.ConfigService],
                global: true,
            }),
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.UserEntity]),
        ],
        providers: [auth_service_1.AuthService, users_service_1.UsersService, auth_guard_1.AuthGuard],
        controllers: [auth_controller_1.AuthController],
        exports: [auth_service_1.AuthService, auth_guard_1.AuthGuard]
    })
], AuthenticateModule);
exports.AuthenticateModule = AuthenticateModule;
//# sourceMappingURL=authent.module.js.map