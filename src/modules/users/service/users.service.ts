import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserEntity } from '../entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { response } from 'express';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(UserEntity)
      private userRepository: Repository<UserEntity>) { }

    async createUser(username: string, password: string): Promise<number> {
      try {
          // Validate the email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(username)) {
              throw new BadRequestException('Invalid email format. Please provide a valid email address.');
          }

          const existingUser = await this.getUser(username);
          // Check if the user already exists
          if (existingUser) {
              throw new BadRequestException('User already registered. Please use a different email address.');
          }

          const saltOrRounds = 10;
          const hashedPassword = await bcrypt.hash(password, saltOrRounds);

          const user = new UserEntity();
          user.username = username;
          user.password = hashedPassword;

          const addedUser = await this.userRepository.save(user);
          return addedUser.id;

      } catch (error) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
  }

    async getUser(username: string): Promise<UserEntity> {
      return this.userRepository.findOne({ where: { username } });
  }
  
  async getBalance(blockchainName: string, userAddress: string) {
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
        throw new Error('Invalid blockchain name');
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

        return response.data;
    } catch (error) {
        if (error.response) {
            throw new HttpException('Bitquery API Error', HttpStatus.SERVICE_UNAVAILABLE);
        } else if (error.request) {
            throw new HttpException('Request Error', HttpStatus.SERVICE_UNAVAILABLE);
        } else {
            throw new HttpException('Unknown Error', HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
}


async getBalanceSameOp(blockchainName: string, userAddress: string) {
    const apiKey = 'BQY9iuQV2O8y3v1Crf8EomLpfitYqcbg';
    let query;
    if (blockchainName === 'ethereum' || blockchainName === 'bsc') {
        console.log("Inside the getBalance L50...",blockchainName)
        query = `{
            ethereum(network: ${blockchainName}) {
                address(address: {is: "${userAddress}"}) {
                    tokenBalances: balances {
                        assetCode: currency {
                            symbol
                        }
                        balance: value
                        assetIssuer: currency {
                            address
                        }
                    }
                }
            }
        }`;
        console.log("🚀 ~ file: users.service.ts:66 ~ UsersService ~ getBalance ~ query:", query)
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
        throw new Error('Invalid blockchain name');
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
       // console.log("🚀 ~ file: users.service.ts:92 ~ UsersService ~ getBalance ~ response:", JSON.stringify(response.data.data))

        if (blockchainName === 'ethereum' || blockchainName === 'bsc') {
            const transformedResponse = {
                [blockchainName]: {
                    address: response.data.data["ethereum"].address.map(item => {
                        return {
                            tokenBalances: item.tokenBalances.map(balanceItem => {
                                return {
                                    assetCode: balanceItem.assetCode.symbol,
                                    balance: balanceItem.balance,
                                    assetIssuer: balanceItem.assetIssuer.address
                                };
                            })
                        };
                    })
                }
            };
            console.log("Line 168 transformedResponse:", transformedResponse.error);
            return transformedResponse;
        
        
        } else if (blockchainName === 'stellar') {
            // Add transformation logic for Stellar if needed
            return response.data;
        }
    } catch (error) {
        if (error.response) {
            console.error('Bitquery API Error:', error.response.data);
            return { error: 'Bitquery API Error' };
        } else if (error.request) {
            console.error('Request Error:', error.request);
            return { error: 'Request Error' };
        } else {
            console.error('Unknown Error:', error.message);
            return { error: 'Unknown Error' };
        }
    }
}



async getMultiChainBalancesSameOp(queryData: { blockchain: string; address: string }[]) {
    const apiKey = 'BQY9iuQV2O8y3v1Crf8EomLpfitYqcbg';
    const responses = [];

    for (const queryItem of queryData) {
        let query;
        const { blockchain, address } = queryItem;

        if (blockchain === 'ethereum') {
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
        } else if (blockchain === 'bsc') {
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
                ${blockchain}(network: ${blockchain}) {
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
            throw new Error('Invalid blockchain name');
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

            if (response.data.data[blockchain] || response.data.data["ethereum"] ) {
                if (blockchain === 'ethereum' || blockchain === 'bsc') {
                    const network = blockchain === 'ethereum' ? 'ethereum' : 'bsc';
                    console.log("🚀 ~ file: users.service.ts:254 ~ UsersService ~ getMultiChainBalancesSameOp ~ network:", network)
                    const transformedResponse = {
                        [blockchain]: {
                            address: response.data.data["ethereum"].address.map(item => {
                                return {
                                    tokenBalances: item.balances.map(balanceItem => {
                                        return {
                                            assetCode: balanceItem.currency.symbol,
                                            balance: balanceItem.value,
                                            assetIssuer: balanceItem.currency.address
                                        };
                                    })
                                };
                            })
                        }
                    };
                    responses.push(transformedResponse);
                } else if (blockchain === 'stellar') {
                    const transformedResponse = {
                        [blockchain]: {
                            address: response.data.data[blockchain].address.map(item => {
                                return {
                                    tokenBalances: item.tokenBalances.map(balanceItem => {
                                        return {
                                            assetCode: balanceItem.assetCode,
                                            balance: balanceItem.balance,
                                            assetIssuer: balanceItem.assetIssuer
                                        };
                                    })
                                };
                            })
                        }
                    };
                    responses.push(transformedResponse);
                }
            } else {
                responses.push({ error: `No data found for ${blockchain}` });
            }
        } catch (error) {
            responses.push({ error: `Error fetching data for ${blockchain}` });
        }
    }

    return responses;
}





async getBalances(queryData: { blockchain: string; address: string }[]) {
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
            throw new Error('Invalid blockchain name');
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
  
}