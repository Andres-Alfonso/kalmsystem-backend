import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { RoleUser } from './role-user.entity'; // Assuming you have the RoleUser entity from previous example

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 191 })
  name: string;

  @Column({ type: 'varchar', length: 191, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 191, nullable: true })
  description?: string;

  @Column({ type: 'int', default: 1 })
  level: number;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  created_at?: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at?: Date;

  @OneToMany(() => RoleUser, roleUser => roleUser.role)
  roleUsers: RoleUser[];
}