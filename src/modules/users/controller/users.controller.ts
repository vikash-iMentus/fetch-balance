import { Body, Controller, Post, Get, Param, Headers, UnauthorizedException, Query, UseGuards, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { UsersService } from '../service/users.service';
import { AuthGuard } from '../../authentication/auth.guard';

@Controller('')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }
   
    @Post('/signup')
    async createUser(
        @Body('password') password: string,
        @Body('username') username: string,
    ) {
        return await this.usersService.createUser(username, password);
    }

    @UseGuards(AuthGuard)
    @Get('/balance')
    async getBalance(
        @Query('blockchainName') blockchainName: string,
        @Query('userAddress') userAddress: string,
    ) {
        return await this.usersService.getBalance(blockchainName, userAddress);
    }

    @UseGuards(AuthGuard)
    @Post('/multiChainBalances')
    async getBalances(@Body() queryData: { blockchain: string; address: string }[]) {
        return await this.usersService.getBalances(queryData);
    }

   // @UseGuards(AuthGuard)
    @Get('/balanceSameOutput')
    async getBalanceSameOp(
        @Query('blockchainName') blockchainName: string,
        @Query('userAddress') userAddress: string,
    ) {
        return await this.usersService.getBalanceSameOp(blockchainName, userAddress);
    }

    @Post('/multiChainBalancesSampOutput')
    async getBalancesSameOp(@Body() queryData: { blockchain: string; address: string }[]) {
        return await this.usersService.getMultiChainBalancesSameOp(queryData);
    }
}
