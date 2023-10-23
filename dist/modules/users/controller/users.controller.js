"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../service/users.service");
const user_entity_1 = require("../entity/user.entity");
const bcrypt = require("bcrypt");
const axios_1 = require("axios");
const auth_guard_1 = require("../../authentication/auth.guard");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async createUser(password, username) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(username)) {
            throw new common_1.BadRequestException('Invalid email format. Please provide a valid email address.');
        }
        const existingUser = await this.usersService.getUser(username);
        if (existingUser) {
            throw new common_1.BadRequestException('User already registered. Please use a different email address.');
        }
        const saltOrRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltOrRounds);
        const users = new user_entity_1.UserEntity();
        users.username = username;
        users.password = hashedPassword;
        const result = await this.usersService.createUser(users);
        return result.id;
    }
    async getBalance(blockchainName, validatorAddress) {
        const apiKey = 'BQY9iuQV2O8y3v1Crf8EomLpfitYqcbg';
        let query;
        if (blockchainName === 'ethereum' || blockchainName === 'bsc') {
            query = `{
                ethereum(network: ${blockchainName}) {
                    address(address: {is: "${validatorAddress}"}) {
                        balances {
                            currency {
                                address
                                symbol
                            }
                            value
                        }
                    }
                }
            }`;
        }
        else if (blockchainName === 'stellar') {
            console.log("This is stellar blockchain....");
            query = `{
                stellar(network: ${blockchainName}) {
                    address(address: {is: "${validatorAddress}"}) {
                        tokenBalances {
                            assetCode
                            balance
                            assetIssuer
                        }
                    }
                }
            }`;
        }
        else {
            throw new common_1.HttpException('Invalid blockchain name', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const response = await axios_1.default.post('https://graphql.bitquery.io/', {
                query: query,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': apiKey,
                },
            });
            console.log("🚀 ~ file: users.controller.ts:84 ~ UsersController ~ response:", response.data);
            return response.data;
        }
        catch (error) {
            if (error.response) {
                throw new common_1.HttpException('Bitquery API Error', common_1.HttpStatus.SERVICE_UNAVAILABLE);
            }
            else if (error.request) {
                throw new common_1.HttpException('Request Error', common_1.HttpStatus.SERVICE_UNAVAILABLE);
            }
            else {
                throw new common_1.HttpException('Unknown Error', common_1.HttpStatus.SERVICE_UNAVAILABLE);
            }
        }
    }
};
__decorate([
    (0, common_1.Post)('/signup'),
    __param(0, (0, common_1.Body)('password')),
    __param(1, (0, common_1.Body)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createUser", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('/balance'),
    __param(0, (0, common_1.Query)('blockchainName')),
    __param(1, (0, common_1.Query)('validatorAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getBalance", null);
UsersController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
exports.UsersController = UsersController;
//# sourceMappingURL=users.controller.js.map