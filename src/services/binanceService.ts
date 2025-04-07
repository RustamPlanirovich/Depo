import axios from 'axios';

const BINANCE_API_BASE = 'https://fapi.binance.com/fapi/v1';

export interface FundingRateData {
  symbol: string;
  fundingRate: number;
  fundingTime: number;
  nextFundingTime: number;
  markPrice: number;
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
  private readonly baseUrl = 'https://fapi.binance.com';

  async getFundingRates(): Promise<FundingRateData[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/fapi/v1/premiumIndex`);
      return response.data.map((item: any) => ({
        symbol: item.symbol,
        fundingRate: parseFloat(item.lastFundingRate) * 100, // Convert to percentage
        fundingTime: item.time,
        nextFundingTime: item.nextFundingTime,
        markPrice: parseFloat(item.markPrice),
        predictedRate: parseFloat(item.predictedFundingRate) * 100,
        volume24h: parseFloat(item.volume),
        openInterest: parseFloat(item.openInterest)
      }));
    } catch (error) {
      console.error('Error fetching funding rates:', error);
      throw error;
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