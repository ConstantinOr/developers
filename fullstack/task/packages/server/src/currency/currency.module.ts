import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrencyService } from './currency.service';
import { CurrencyResolver } from './currency.resolver';
import { ExchangeRate } from './entities/exchange-rate.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [
        TypeOrmModule.forFeature([ExchangeRate]),
        HttpModule
    ],
    providers: [CurrencyService, CurrencyResolver],
})
export class CurrencyModule {} 