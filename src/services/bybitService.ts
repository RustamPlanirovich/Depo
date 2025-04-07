import axios from 'axios';

export interface BybitFundingRateData {
  symbol: string;
  fundingRate: number;
  predictedFundingRate: number;
  markPrice: number;
  nextFundingTime: number;
  volume24h: number;
}

export interface BybitHistoricalFundingRate {
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
      
      if (response.data.retCode === 0 && Array.isArray(response.data.result.list)) {
        return response.data.result.list.map((item: any) => ({
          symbol: item.symbol,
          fundingRate: parseFloat(item.fundingRate || '0') * 100,
          predictedFundingRate: parseFloat(item.nextFundingRate || '0') * 100,
          markPrice: parseFloat(item.markPrice || '0'),
          nextFundingTime: parseInt(item.nextFundingTime || '0'),
          volume24h: parseFloat(item.volume24h || '0')
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching ByBit funding rates:', error);
      return [];
    }
  }

  async getHistoricalFundingRates(symbol: string, limit: number = 100): Promise<BybitHistoricalFundingRate[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/v5/market/funding/history`, {
        params: {
          category: 'linear',
          symbol,
          limit
        }
      });

      if (response.data.retCode === 0 && Array.isArray(response.data.result.list)) {
        return response.data.result.list.map((item: any) => ({
          symbol: item.symbol,
          fundingRate: parseFloat(item.fundingRate || '0') * 100,
          fundingRateTimestamp: parseInt(item.fundingRateTimestamp || '0'),
          predictedFundingRate: parseFloat(item.nextFundingRate || '0') * 100,
          markPrice: parseFloat(item.markPrice || '0'),
          nextFundingTime: parseInt(item.nextFundingTime || '0'),
          volume24h: parseFloat(item.volume24h || '0')
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching ByBit historical funding rates:', error);
      return [];
    }
  }
}

export const bybitService = new BybitService(); 