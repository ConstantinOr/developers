import React, { useEffect, useState } from 'react';
import { ExchangeRateTable } from './components/ExchangeRateTable';
import { ExchangeRate } from './types/exchange-rate';
import './App.css';

const GRAPHQL_ENDPOINT = 'http://localhost:4001/graphql';

function App() {
    const [rates, setRates] = useState<ExchangeRate[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                console.log('Fetching rates from:', GRAPHQL_ENDPOINT);
                const response = await fetch(GRAPHQL_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query: `
                            query {
                                exchangeRates {
                                    id
                                    currency
                                    rate
                                    amount
                                    country
                                    lastUpdated
                                }
                            }
                        `,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log('GraphQL response:', result);

                if (result.errors) {
                    throw new Error(result.errors[0].message);
                }

                setRates(result.data.exchangeRates);
            } catch (err) {
                console.error('Error fetching rates:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch exchange rates');
            }
        };

        fetchRates();
    }, []);

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="app">
            <h1>Exchange Rates</h1>
            <ExchangeRateTable rates={rates} />
        </div>
    );
}

export default App;
