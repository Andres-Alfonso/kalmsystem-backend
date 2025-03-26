import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { RoleUser } from './role-user.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  identification: string;

  @Column()
  name: string;

  @Column()
  last_name: string;

  @Column()
  email: string;

  @Column({ name: 'client_id' })
  client_id: number;

  @OneToMany(() => RoleUser, roleUser => roleUser.user)
  roleUsers: RoleUser[];
}