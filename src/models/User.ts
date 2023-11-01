import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { List } from './List';
import { ListPermission } from './ListPermission';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  email: string;

  @Column()
  name: string;

  @Column()
  encryptedPassword: string;

  @Column({ type: String, default: UserRole.USER })
  role: UserRole;

  @OneToMany(() => List, (list) => list.owner)
  lists: Promise<List[]>;

  @OneToMany(() => ListPermission, (permission) => permission.user)
  permissions: Promise<ListPermission[]>;
}
