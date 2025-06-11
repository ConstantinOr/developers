import { Query, Resolver } from '@nestjs/graphql';
import { ExchangeRateService } from './exchange-rate.service';
import { ExchangeRate } from './exchange-rate.types';
import { Logger } from '@nestjs/common';

@Resolver(() => ExchangeRate)
export class ExchangeRateResolver {
    private readonly logger = new Logger(ExchangeRateResolver.name);

    constructor(private readonly exchangeRateService: ExchangeRateService) {}

    @Query(() => [ExchangeRate])
    async exchangeRates(): Promise<ExchangeRate[]> {
        this.logger.log('Fetching exchange rates');
        const rates = await this.exchangeRateService.getExchangeRates();
        this.logger.log(`Retrieved ${rates.length} exchange rates`);
        this.logger.debug('First rate:', rates[0]);
        return rates;
    }
}
