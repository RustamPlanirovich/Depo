import axios from 'axios';

const BINANCE_API_BASE = 'https://fapi.binance.com/fapi/v1';

export interface FundingRateData {
  symbol: string;
  fundingRate: number;
  predictedRate: number;
  markPrice: number;
  nextFundingTime: number;
  volume24h: number;
}

export interface HistoricalFundingRate {
  symbol: string;
  fundingRate: number;
  fundingTime: number;
  predictedRate: number;
  markPrice: number;
  nextFundingTime: number;
  volume24h: number;
}

interface TickerData {
  symbol: string;
  volume: string;
  openPrice: string;
  [key: string]: string | number;
}

class BinanceService {
  private readonly baseUrl = 'https://fapi.binance.com';

  async getFundingRates(): Promise<FundingRateData[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/fapi/v1/premiumIndex`);
      return response.data.map((item: any) => ({
        symbol: item.symbol,
        fundingRate: parseFloat(item.lastFundingRate) * 100,
        predictedRate: parseFloat(item.nextFundingRate) * 100,
        markPrice: parseFloat(item.markPrice),
        nextFundingTime: item.nextFundingTime,
        volume24h: parseFloat(item.volume || '0')
      }));
    } catch (error) {
      console.error('Error fetching Binance funding rates:', error);
      return [];
    }
  }

  async getHistoricalFundingRates(symbol: string, limit: number = 100): Promise<HistoricalFundingRate[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/fapi/v1/fundingRate`, {
        params: {
          symbol,
          limit
        }
      });
      return response.data.map((item: any) => ({
        symbol: item.symbol,
        fundingRate: parseFloat(item.fundingRate) * 100,
        fundingTime: item.fundingTime,
        predictedRate: parseFloat(item.nextFundingRate) * 100,
        markPrice: parseFloat(item.markPrice),
        nextFundingTime: item.nextFundingTime,
        volume24h: parseFloat(item.volume || '0')
      }));
    } catch (error) {
      console.error('Error fetching Binance historical funding rates:', error);
      return [];
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