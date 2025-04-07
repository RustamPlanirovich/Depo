import axios from 'axios';

const BINANCE_API_BASE = 'https://fapi.binance.com/fapi/v1';

export interface FundingRateData {
  symbol: string;
  fundingRate: number;
  fundingTime: number;
  nextFundingTime: number;
  price: number;
  predictedRate: number;
  volume24h: number;
  openInterest: number;
}

export interface HistoricalFundingRate {
  symbol: string;
  fundingRate: number;
  fundingTime: number;
}

interface TickerData {
  symbol: string;
  volume: string;
  openPrice: string;
  [key: string]: string | number;
}

class BinanceService {
  async getFundingRates(): Promise<FundingRateData[]> {
    try {
      const [premiumIndex, ticker24h] = await Promise.all([
        axios.get(`${BINANCE_API_BASE}/premiumIndex`),
        axios.get(`${BINANCE_API_BASE}/ticker/24hr`)
      ]);

      const tickerMap = new Map(
        ticker24h.data.map((item: TickerData) => [item.symbol, item])
      );

      return premiumIndex.data.map((item: any) => {
        const ticker = tickerMap.get(item.symbol) as TickerData | undefined;
        return {
          symbol: item.symbol,
          fundingRate: parseFloat(item.lastFundingRate),
          fundingTime: item.time,
          nextFundingTime: item.nextFundingTime,
          price: parseFloat(item.markPrice),
          predictedRate: parseFloat(item.lastFundingRate),
          volume24h: ticker ? parseFloat(ticker.volume) : 0,
          openInterest: ticker ? parseFloat(ticker.openPrice) : 0
        };
      });
    } catch (error) {
      console.error('Error fetching funding rates:', error);
      throw error;
    }
  }

  async getHistoricalFundingRates(symbol: string, limit: number = 100): Promise<HistoricalFundingRate[]> {
    try {
      const response = await axios.get(`${BINANCE_API_BASE}/fundingRate`, {
        params: {
          symbol,
          limit
        }
      });

      return response.data.map((item: any) => ({
        symbol: item.symbol,
        fundingRate: parseFloat(item.fundingRate),
        fundingTime: item.fundingTime
      }));
    } catch (error) {
      console.error('Error fetching historical funding rates:', error);
      throw error;
    }
  }

  async getPredictedFundingRate(symbol: string): Promise<number> {
    try {
      const response = await axios.get(`${BINANCE_API_BASE}/premiumIndex`, {
        params: { symbol }
      });
      return parseFloat(response.data.lastFundingRate);
    } catch (error) {
      console.error('Error fetching predicted funding rate:', error);
      throw error;
    }
  }

  calculateOptimalEntryPrice(currentPrice: number, fundingRate: number): {
    longEntry: number;
    shortEntry: number;
  } {
    // This is a simplified calculation. In reality, you'd want to consider
    // more factors like volatility, volume, and market sentiment
    const adjustment = currentPrice * (fundingRate / 2);
    return {
      longEntry: currentPrice - adjustment,
      shortEntry: currentPrice + adjustment
    };
  }
}

export const binanceService = new BinanceService(); 