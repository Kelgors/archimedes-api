import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { List } from './List';
import { ListPermission } from './ListPermission';

export enum UserRole {
  USER = 100,
  ADMIN = 1000,
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

  @Column({ type: Number, default: 100 })
  role: UserRole;

  @OneToMany(() => List, (list) => list.owner)
  lists: Promise<List[]>;

  @OneToMany(() => ListPermission, (permission) => permission.user)
  permissions: Promise<ListPermission[]>;
}