import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { GameService } from './game.service';
import { WebSocketController } from './game.controller';
import { GameGateway } from './game.gateway';
import { ColorGame } from './entities/color-game.entity';
import { UserBet } from './entities/user-bet.entity';
import { GameResult } from './entities/game-result.entity';
import { forwardRef } from '@nestjs/common';
import { Transaction } from 'src/users/entities/transaction.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([ColorGame, UserBet, GameResult,Transaction ]),
    ScheduleModule.forRoot(),
  ],
  controllers: [WebSocketController],
  providers: [GameService, GameGateway],
  exports: [GameService, GameGateway], // Make sure both are exported
})
export class GameModule {}