import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { ExchangeRateEntity } from './exchange-rate.entity';
import { ExchangeRate } from './exchange-rate.types';

@Injectable()
export class ExchangeRateService {
    private readonly logger = new Logger(ExchangeRateService.name);
    private readonly CNB_API_URL = 'https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu/denni_kurz.txt';

    constructor(
        @InjectRepository(ExchangeRateEntity)
        private readonly exchangeRateRepository: Repository<ExchangeRateEntity>,
    ) {}

    async getExchangeRates(): Promise<ExchangeRate[]> {
        try {
            // Check if we have recent data in the database
            const recentRates = await this.exchangeRateRepository.find({
                order: { lastUpdated: 'DESC' },
            });

            const now = new Date();
            const isRecent = recentRates.length > 0 && 
                (now.getTime() - recentRates[0].lastUpdated.getTime()) < 24 * 60 * 60 * 1000;

            if (isRecent) {
                this.logger.log('Using cached exchange rates');
                return recentRates.map((rate) => ({
                    id: rate.id,
                    currency: rate.currency,
                    rate: rate.rate,
                    amount: rate.amount,
                    country: rate.country,
                    lastUpdated: rate.lastUpdated,
                }));
            }

            // Fetch new data from CNB
            this.logger.log('Fetching new exchange rates from CNB');
            const response = await axios.get(this.CNB_API_URL, {
                headers: {
                    Accept: 'text/plain',
                    'Accept-Language': 'cs-CZ,cs;q=0.9',
                },
            });
            
            const data = response.data;
            this.logger.debug('CNB Response:', data);

            // Parse the response
            const lines = data.split('\n');
            this.logger.debug('Response lines:', lines);

            if (lines.length < 2) {
                throw new Error('Invalid CNB response format: not enough lines');
            }

            const dateLine = lines[0];
            this.logger.debug('Date line:', dateLine);

            // Try different date formats
            const dateFormats = [
                /(\d{2}\.\d{2}\.\d{4})/, // DD.MM.YYYY
                /(\d{2}\/\d{2}\/\d{4})/, // DD/MM/YYYY
                /(\d{4}-\d{2}-\d{2})/,   // YYYY-MM-DD
            ];

            let dateMatch = null;
            for (const format of dateFormats) {
                dateMatch = dateLine.match(format);
                if (dateMatch) break;
            }

            if (!dateMatch) {
                this.logger.error('Could not parse date from line:', dateLine);
                throw new Error('Could not parse date from CNB response');
            }

            const date = dateMatch[1];
            this.logger.log(`Parsed date from CNB: ${date}`);

            // Skip header lines and parse rates
            const rateLines = lines.slice(2).filter((line: string) => line.trim());
            this.logger.log(`Found ${rateLines.length} rate lines to parse`);

            const entities = rateLines.map((line: string) => {
                const [country, currency, amount, code, rate] = line.split('|').map((s: string) => s.trim());
                this.logger.debug(`Parsing line: ${line}`);
                this.logger.debug(`Split values: country=${country}, currency=${currency}, amount=${amount}, code=${code}, rate=${rate}`);

                const parsedAmount = parseFloat(amount.replace(',', '.'));
                const parsedRate = parseFloat(rate.replace(',', '.'));

                this.logger.debug(`Parsed values: amount=${parsedAmount}, rate=${parsedRate}`);

                return {
                    id: 0, // Will be set by the database
                    currency: code,
                    rate: Number.isNaN(parsedRate) ? null : parsedRate,
                    amount: Number.isNaN(parsedAmount) ? null : parsedAmount,
                    country,
                    lastUpdated: new Date(),
                };
            });

            this.logger.log(`Parsed ${entities.length} exchange rates`);
            this.logger.debug('First entity:', entities[0]);

            // Save to database
            const savedEntities = await this.exchangeRateRepository.save(entities);
            this.logger.log(`Saved ${savedEntities.length} exchange rates to database`);
            this.logger.debug('First saved entity:', savedEntities[0]);

            return savedEntities;
        } catch (error) {
            this.logger.error('Error fetching exchange rates:', error);
            if (error.response) {
                this.logger.error('Response data:', error.response.data);
                this.logger.error('Response status:', error.response.status);
                this.logger.error('Response headers:', error.response.headers);
            }
            throw error;
        }
    }
}
