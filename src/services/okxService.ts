import axios from 'axios';

export interface OKXFundingRateData {
  symbol: string;
  fundingRate: number;
  predictedFundingRate: number;
  markPrice: number;
  nextFundingTime: number;
  volume24h: number;
}

export interface OKXHistoricalFundingRate {
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
      
      if (response.data.code === '0' && Array.isArray(response.data.data)) {
        return response.data.data.map((item: any) => ({
          symbol: item.instId.replace('-SWAP', ''),
          fundingRate: parseFloat(item.fundingRate || '0') * 100,
          predictedFundingRate: parseFloat(item.nextFundingRate || '0') * 100,
          markPrice: parseFloat(item.markPrice || '0'),
          nextFundingTime: parseInt(item.nextFundingTime || '0'),
          volume24h: parseFloat(item.vol24h || '0')
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching OKX funding rates:', error);
      return [];
    }
  }

  async getHistoricalFundingRates(symbol: string, limit: number = 100): Promise<OKXHistoricalFundingRate[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/v5/public/funding-rate-history`, {
        params: {
          instId: `${symbol}-SWAP`,
          limit
        }
      });

      if (response.data.code === '0' && Array.isArray(response.data.data)) {
        return response.data.data.map((item: any) => ({
          symbol: item.instId.replace('-SWAP', ''),
          fundingRate: parseFloat(item.fundingRate || '0') * 100,
          fundingRateTimestamp: parseInt(item.fundingTime || '0'),
          predictedFundingRate: parseFloat(item.nextFundingRate || '0') * 100,
          markPrice: parseFloat(item.markPrice || '0'),
          nextFundingTime: parseInt(item.nextFundingTime || '0'),
          volume24h: parseFloat(item.vol24h || '0')
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching OKX historical funding rates:', error);
      return [];
    }
  }
}

export const okxService = new OKXService(); 