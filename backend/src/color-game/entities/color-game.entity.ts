import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { UserBet } from './user-bet.entity';
import { GameResult } from './game-result.entity';

@Entity('color_games')
export class ColorGame {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_bet_amount: number;

  @Column({ default: 0 })
  total_bets: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @Column()
  period: string;

  @Column()
  duration: string; // '30s', '1m', '3m', '5m'

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'datetime' })
  end_time: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @OneToMany(() => UserBet, (userBet) => userBet.game)
  user_bets: UserBet[];

  @OneToMany(() => GameResult, (gameResult) => gameResult.game)
  game_results: GameResult[];
}