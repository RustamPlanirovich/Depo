import axios from 'axios';

export interface BybitFundingRateData {
  symbol: string;
  fundingRate: number;
  fundingRateTimestamp: number;
  predictedFundingRate: number;
  markPrice: number;
  nextFundingTime: number;
  volume24h: number;
}

class BybitService {
  private readonly baseUrl = 'https://api.bybit.com';

  async getFundingRates(): Promise<BybitFundingRateData[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/v5/market/tickers`, {
        params: {
          category: 'linear'
        }
      });

      if (response.data.retCode === 0) {
        return response.data.result.list.map((item: any) => ({
          symbol: item.symbol,
          fundingRate: parseFloat(item.fundingRate) * 100, // Convert to percentage
          fundingRateTimestamp: item.fundingRateTimestamp,
          predictedFundingRate: parseFloat(item.predictedFundingRate) * 100,
          markPrice: parseFloat(item.markPrice),
          nextFundingTime: item.nextFundingTime,
          volume24h: parseFloat(item.volume24h)
        }));
      }
      throw new Error(response.data.retMsg);
    } catch (error) {
      console.error('Error fetching Bybit funding rates:', error);
      throw error;
    }
  }

  async getHistoricalFundingRates(symbol: string, limit: number = 100): Promise<BybitFundingRateData[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/v5/market/funding/history`, {
        params: {
          category: 'linear',
          symbol,
          limit
        }
      });

      if (response.data.retCode === 0) {
        return response.data.result.list.map((item: any) => ({
          symbol: item.symbol,
          fundingRate: parseFloat(item.fundingRate) * 100,
          fundingRateTimestamp: item.fundingRateTimestamp,
          predictedFundingRate: parseFloat(item.predictedFundingRate) * 100,
          markPrice: parseFloat(item.markPrice),
          nextFundingTime: item.nextFundingTime,
          volume24h: parseFloat(item.volume24h)
        }));
      }
      throw new Error(response.data.retMsg);
    } catch (error) {
      console.error('Error fetching Bybit historical funding rates:', error);
      throw error;
    }
  }
}

export const bybitService = new BybitService(); 