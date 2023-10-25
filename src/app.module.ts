import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticateModule } from './modules/authentication/module/authentication.module';
import { UserEntity } from './modules/users/entity/user.entity';
import { UserModule } from './modules/users/module/users.module';

@Module({
  imports: [ 
    
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forRoot({
        isGlobal: true,
        envFilePath : ".local.env",
       // envFilePath : ".prod.env",
      })],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        synchronize: configService.get<boolean>('DB_SYNC'), //We cant use this in production as true
        //entities : [__dirname + '/**/*.entity{.ts,.js}'], 
         entities: [UserEntity],
        //entities: [ __dirname+'/modules/**///*.entity{.ts,.js}'],
        logging : true,
      }),
      inject: [ConfigService],
    }), UserModule,
    AuthenticateModule,

  ],
  controllers: [],
  providers: [],
})
export class AppModule {

  
}
