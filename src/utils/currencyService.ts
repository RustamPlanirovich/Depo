import axios from 'axios';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

export interface CurrencyRate {
  usd: number;
  usdt: number;
}

export const getCurrencyRates = async (): Promise<CurrencyRate> => {
  try {
    const response = await axios.get(`${COINGECKO_API_URL}/simple/price`, {
      params: {
        ids: 'tether',
        vs_currencies: 'usd'
      }
    });

    return {
      usd: 1,
      usdt: response.data.tether.usd
    };
  } catch (error) {
    console.error('Error fetching currency rates:', error);
    return {
      usd: 1,
      usdt: 1 // Fallback to 1:1 rate in case of error
    };
  }
};

export const convertAmount = (amount: number, fromCurrency: 'USD' | 'USDT', toCurrency: 'USD' | 'USDT', rates: CurrencyRate): number => {
  if (fromCurrency === toCurrency) return amount;
  
  if (fromCurrency === 'USD' && toCurrency === 'USDT') {
    return amount / rates.usdt;
  } else {
    return amount * rates.usdt;
  }
}; 