import axios from 'axios';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

export interface CurrencyRate {
  usd: number;
  usdt: number;
  rub: number;
}

const STORAGE_KEY = 'lastKnownCurrencyRates';

// Default/fallback rates
const DEFAULT_RATES: CurrencyRate = {
  usd: 1,
  usdt: 1,
  rub: 90 // примерный курс рубля как запасной вариант
};

export const getCurrencyRates = async (): Promise<CurrencyRate> => {
  try {
    // Try to get rates from API
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,tether&vs_currencies=usd,rub'
    );

    const rates: CurrencyRate = {
      usd: 1,
      usdt: 1, // USDT to USD rate is always close to 1
      rub: response.data.tether.rub || DEFAULT_RATES.rub
    };

    // Save successful response to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rates));
    
    return rates;
  } catch (error) {
    console.error('Error fetching currency rates:', error);
    
    // Try to get last known rates from localStorage
    const savedRates = localStorage.getItem(STORAGE_KEY);
    if (savedRates) {
      return JSON.parse(savedRates);
    }
    
    // If no saved rates, return default rates
    return DEFAULT_RATES;
  }
};

export const convertAmount = (
  amount: number,
  fromCurrency: 'USD' | 'USDT',
  toCurrency: 'USD' | 'USDT',
  rates: CurrencyRate
): number => {
  // Since USD and USDT are approximately equal
  return amount;
}; 