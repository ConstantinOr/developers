import { Args, Query, Resolver } from '@nestjs/graphql';
import { CurrencyService } from './currency.service';

@Resolver()
export class CurrencyResolver {
    constructor(private readonly currencyService: CurrencyService) {}

    @Query(() => [String])
    async getCurrencies(): Promise<string[]> {
        const rates = await this.currencyService.getExchangeRates();
        return Object.keys(rates);
    }

    @Query(() => Number)
    async getExchangeRate(@Args('currency') currency: string): Promise<number> {
        const rates = await this.currencyService.getExchangeRates();
        return rates[currency];
    }
} 