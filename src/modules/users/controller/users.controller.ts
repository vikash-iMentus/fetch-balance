import { Body, Controller, Post, Get, Param, Headers, UnauthorizedException, Query, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from '../service/users.service';
// import { User } from './users.model';
import { UserEntity } from '../entity/user.entity';
import * as bcrypt from 'bcrypt';
import axios from 'axios';
import { AuthGuard } from '../../authentication/auth.guard';
//import { Sep30Service } from '../sep30/services/sep30.service';


@Controller('auth')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post('/signup')
    async createUser(
        @Body('password') password: string,
        @Body('username') username: string,
    ) {
        console.log("🚀 ~ file: users.controller.ts:18 ~ UsersController ~ apiKey:")

        const saltOrRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltOrRounds);
        console.log("🚀 ~ file: users.controller.ts:20 ~ UsersController ~ hashedPassword:", hashedPassword)

        const users = new UserEntity();
        users.username = username;
        users.password = hashedPassword;
        //users.api_key = apiKey;

        const result = await this.usersService.createUser(users);
        console.log("🚀 ~ file: users.controller.ts:22 ~ UsersController ~ result:", result)
        return result.id;
    }

    @UseGuards(AuthGuard)
    @Get('/balance')
    async getBalance(
        @Query('blockchainName') blockchainName: string,
        @Query('validatorAddress') validatorAddress: string,
    ) {
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
        } else if (blockchainName === 'stellar') {
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
        } else {
            throw new HttpException('Invalid blockchain name', HttpStatus.BAD_REQUEST);
        }

        try {
            const response = await axios.post('https://graphql.bitquery.io/', {
                query: query,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': apiKey,
                },
            });
            console.log("🚀 ~ file: users.controller.ts:84 ~ UsersController ~ response:", response.data)

            return response.data;
        } catch (error) {
            // Handle specific error cases or return a generic error message
            if (error.response) {
                throw new HttpException('Bitquery API Error', HttpStatus.SERVICE_UNAVAILABLE);
            } else if (error.request) {
                throw new HttpException('Request Error', HttpStatus.SERVICE_UNAVAILABLE);
            } else {
                throw new HttpException('Unknown Error', HttpStatus.SERVICE_UNAVAILABLE);
            }
        }
    }
   
   
    // @Get('/balance')
    // async getBalance(
    //     @Query('blockchainName') blockchainName: string,
    //     @Query('validatorAddress') validatorAddress: string,
    // ) {
    //     const apiKey = 'BQY9iuQV2O8y3v1Crf8EomLpfitYqcbg';
    //     const query = `{
    //       ethereum(network: ${blockchainName}) {
    //         address(address: {is: "${validatorAddress}"}) {
    //           balances {
    //             currency {
    //               address
    //               symbol
    //             }
    //             value
    //           }
    //         }
    //       }
    //     }`;

    //     try {
    //         const response = await axios.post('https://graphql.bitquery.io/', {
    //             query: query,
    //         }, {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'X-API-KEY': apiKey,
    //             },
    //         });

    //         return response.data;
    //     } catch (error) {
    //         // Handle specific error cases or return a generic error message
    //         if (error.response) {
    //             throw new HttpException('Bitquery API Error', HttpStatus.SERVICE_UNAVAILABLE);
    //         } else if (error.request) {
    //             throw new HttpException('Request Error', HttpStatus.SERVICE_UNAVAILABLE);
    //         } else {
    //             throw new HttpException('Unknown Error', HttpStatus.SERVICE_UNAVAILABLE);
    //         }
    //     }
    // }
}
