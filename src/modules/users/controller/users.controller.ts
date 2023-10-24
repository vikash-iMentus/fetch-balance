import { Body, Controller, Post, Get, Param, Headers, UnauthorizedException, Query, UseGuards, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
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
        // Validate the email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(username)) {
            throw new BadRequestException('Invalid email format. Please provide a valid email address.');
        }

        const existingUser = await this.usersService.getUser(username);
        // Check if the user already exists
        //const existingUser = await this.usersService.getUser({ username });
        if (existingUser) {
            throw new BadRequestException('User already registered. Please use a different email address.');
        }

        const saltOrRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltOrRounds);

        const users = new UserEntity();
        users.username = username;
        users.password = hashedPassword;

        const result = await this.usersService.createUser(users);
        return result.id;
    }

    @UseGuards(AuthGuard)
    @Get('/balance')
    async getBalance(
        @Query('blockchainName') blockchainName: string,
        @Query('userAddress') userAddress: string,
    ) {
        const apiKey = 'BQY9iuQV2O8y3v1Crf8EomLpfitYqcbg';
        let query;
        if (blockchainName === 'ethereum' || blockchainName === 'bsc') {
            query = `{
                ethereum(network: ${blockchainName}) {
                    address(address: {is: "${userAddress}"}) {
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
                    address(address: {is: "${userAddress}"}) {
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

    @UseGuards(AuthGuard)
    @Post('/blockchain/data')
    async getBalances(@Body() queryData: { blockchain: string; address: string }[]) {
        const apiKey = 'BQY9iuQV2O8y3v1Crf8EomLpfitYqcbg';
        const responses = [];

        for (const queryItem of queryData) {
            let query;
            const { blockchain, address } = queryItem;

            if (blockchain === 'ethereum' || blockchain === 'bsc') {
                query = `{
                    ethereum(network: ${blockchain}) {
                        address(address: {is: "${address}"}) {
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
            } else if (blockchain === 'stellar') {
                query = `{
                    stellar(network: stellar) {
                        address(address: {is: "${address}"}) {
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

                responses.push(response.data);
            } catch (error) {
                responses.push({ error: `Error fetching data for ${blockchain}` });
            }
        }

        return responses;
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
