// src/entities/game.entity.ts
import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';


export enum BetChoice {
  HEADS = 'heads',
  TAILS = 'tails'
}

export enum GameResult {
  HEADS = 'heads',
  TAILS = 'tails'
}

export enum GameStatus {
  PENDING = 'pending',
  COMPLETED = 'completed'
}

@Entity('coin_flip')
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  bet_amount: number;

  @Column({
    type: 'enum',
    enum: BetChoice
  })
  bet_choice: BetChoice;

  @Column({
    type: 'enum',
    enum: GameResult,
    nullable: true
  })
  result: GameResult;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  won_amount: number;

  @Column({
    type: 'enum',
    enum: GameStatus,
    default: GameStatus.PENDING
  })
  status: GameStatus;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}