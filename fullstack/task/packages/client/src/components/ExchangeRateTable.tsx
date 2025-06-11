import React from 'react';
import { ExchangeRate } from '../types/exchange-rate';
import { formatDistanceToNow } from 'date-fns';

interface ExchangeRateTableProps {
    rates: ExchangeRate[];
}

export const ExchangeRateTable: React.FC<ExchangeRateTableProps> = ({ rates }) => {
    if (!rates.length) {
        return <div>No exchange rates available</div>;
    }

    const lastUpdated = rates[0].lastUpdated;

    return (
        <div className="exchange-rates">
            <div className="last-updated">
                Last updated: {formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })}
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Country</th>
                        <th>Currency</th>
                        <th>Amount</th>
                        <th>Rate</th>
                    </tr>
                </thead>
                <tbody>
                    {rates.map((rate) => (
                        <tr key={rate.id}>
                            <td>{rate.country}</td>
                            <td>{rate.currency}</td>
                            <td>{rate.amount}</td>
                            <td>{rate.rate?.toFixed(4) ?? 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}; 