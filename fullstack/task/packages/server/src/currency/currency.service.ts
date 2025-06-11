import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { ExchangeRate } from './entities/exchange-rate.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CurrencyService {
    private readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

    constructor(
        @InjectRepository(ExchangeRate)
        private exchangeRateRepository: Repository<ExchangeRate>,
        private readonly httpService: HttpService,
    ) {}

    async getExchangeRates(): Promise<Record<string, number>> {
        // Try to get rates from cache first
        const cachedRates = await this.getCachedRates();
        if (cachedRates) {
            return cachedRates;
        }

        // If no cache or expired, fetch from bank
        const rates = await this.fetchRatesFromBank();
        
        // Cache the new rates
        await this.cacheRates(rates);
        
        return rates;
    }

    private async getCachedRates(): Promise<Record<string, number> | null> {
        const now = new Date();
        const cachedRates = await this.exchangeRateRepository.find({
            where: {
                expiresAt: MoreThan(now)
            }
        });

        if (cachedRates.length === 0) {
            return null;
        }

        return cachedRates.reduce((acc: Record<string, number>, rate: ExchangeRate) => {
            acc[rate.currency] = rate.rate;
            return acc;
        }, {});
    }

    private async cacheRates(rates: Record<string, number>): Promise<void> {
        const expiresAt = new Date(Date.now() + this.CACHE_DURATION_MS);

        const rateEntities = Object.entries(rates).map(([currency, rate]) => {
            const entity = new ExchangeRate();
            entity.currency = currency;
            entity.rate = rate;
            entity.expiresAt = expiresAt;
            return entity;
        });

        await this.exchangeRateRepository.save(rateEntities);
    }

    private async fetchRatesFromBank(): Promise<Record<string, number>> {
        const response = await firstValueFrom(
            this.httpService.get('https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5')
        );

        return response.data.reduce((acc: Record<string, number>, rate: { ccy: string; buy: string }) => {
            acc[rate.ccy] = parseFloat(rate.buy);
            return acc;
        }, {});
    }
} 