// user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: "user_signup" })
export class UserEntity {
    
    @PrimaryGeneratedColumn()
    id : number;

    @Column({
        nullable: true,
        type: "text"
    })
    username: string;

    @Column({
        nullable: true,
        type: "text"
    })
    password: string;


}
