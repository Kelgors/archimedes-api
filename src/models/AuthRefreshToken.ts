import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class AuthRefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  createdAt: Date;

  @Column()
  expireAt: Date;

  @ManyToOne(() => User, (user) => user.refreshTokens)
  @JoinColumn()
  user: Promise<User>;

  @Column()
  userId: User['id'];

  async generateToken() {
    return {
      jti: this.id,
      iat: Math.floor(this.createdAt.getTime() / 1000),
      exp: Math.floor(this.expireAt.getTime() / 1000),
      sub: this.userId,
    };
  }
}
