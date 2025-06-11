export interface ExchangeRate {
    id: number;
    currency: string;
    rate: number | null;
    amount: number | null;
    country: string;
    lastUpdated: Date;
} 