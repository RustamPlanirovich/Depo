import axios from 'axios';

export interface OKXFundingRateData {
  symbol: string;
  fundingRate: number;
  fundingRateTimestamp: number;
  predictedFundingRate: number;
  markPrice: number;
  nextFundingTime: number;
  volume24h: number;
}

class OKXService {
  private readonly baseUrl = 'https://www.okx.com';

  async getFundingRates(): Promise<OKXFundingRateData[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/v5/public/funding-rate`);
      
      if (response.data.code === '0') {
        return response.data.data.map((item: any) => ({
          symbol: item.instId,
          fundingRate: parseFloat(item.fundingRate) * 100, // Convert to percentage
          fundingRateTimestamp: parseInt(item.fundingTime),
          predictedFundingRate: parseFloat(item.nextFundingRate) * 100,
          markPrice: parseFloat(item.markPrice),
          nextFundingTime: parseInt(item.nextFundingTime),
          volume24h: parseFloat(item.vol24h)
        }));
      }
      throw new Error(response.data.msg);
    } catch (error) {
      console.error('Error fetching OKX funding rates:', error);
      throw error;
    }
  }

  async getHistoricalFundingRates(symbol: string, limit: number = 100): Promise<OKXFundingRateData[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/v5/public/funding-rate-history`, {
        params: {
          instId: symbol,
          limit
        }
      });

      if (response.data.code === '0') {
        return response.data.data.map((item: any) => ({
          symbol: item.instId,
          fundingRate: parseFloat(item.fundingRate) * 100,
          fundingRateTimestamp: parseInt(item.fundingTime),
          predictedFundingRate: parseFloat(item.nextFundingRate) * 100,
          markPrice: parseFloat(item.markPrice),
          nextFundingTime: parseInt(item.nextFundingTime),
          volume24h: parseFloat(item.vol24h)
        }));
      }
      throw new Error(response.data.msg);
    } catch (error) {
      console.error('Error fetching OKX historical funding rates:', error);
      throw error;
    }
  }
}

export const okxService = new OKXService(); 