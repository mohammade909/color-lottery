// src/modules/game/game.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { Game } from './entities/coin-game.entity';
import { User } from 'src/users/entities/user.entity';
import { Transaction } from 'src/users/entities/transaction.entity';
import { GameController } from './coin.controller';
import { GameService } from './coin.service';
import { CoinGameGateway } from './coin.gateway';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Game, User, Transaction]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '24h' },
      }),
    }),
    AuthModule,
  ],
  controllers: [GameController],
  providers: [GameService, CoinGameGateway],
  exports: [GameService],
})
export class CoinModule {}