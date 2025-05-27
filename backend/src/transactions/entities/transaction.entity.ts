import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'user_id' })
  user_id: string;

  @Column()
  type: string; // 'deposit' or 'withdrawal'

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ nullable: true })
  description: string;
  
  @Column({ default: 'pending' })
  status: string;
}
