import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('transaction')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  type: string;

  @Column()
  amount: number;

  @CreateDateColumn()
  timestamp: Date;

  @Column()
  description: string;
  
  @Column()
  status: string;
}
