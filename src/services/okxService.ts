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

  private async getInstruments(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/v5/public/instruments`, {
        params: {
          instType: 'SWAP'
        }
      });
      
      if (response.data.code === '0' && Array.isArray(response.data.data)) {
        return response.data.data
          .filter((item: any) => item.state === 'live')
          .map((item: any) => item.instId);
      }
      return [];
    } catch (error) {
      console.error('Error fetching OKX instruments:', error);
      return [];
    }
  }

  async getFundingRates(): Promise<OKXFundingRateData[]> {
    try {
      const instruments = await this.getInstruments();
      const fundingRates: OKXFundingRateData[] = [];

      // Разбиваем запросы на группы по 20 инструментов
      const chunkSize = 20;
      for (let i = 0; i < instruments.length; i += chunkSize) {
        const chunk = instruments.slice(i, i + chunkSize);
        const requests = chunk.map(instId =>
          axios.get(`${this.baseUrl}/api/v5/public/funding-rate`, {
            params: { instId }
          })
        );

        const responses = await Promise.all(requests);
        
        responses.forEach((response, index) => {
          if (response.data.code === '0' && Array.isArray(response.data.data)) {
            const item = response.data.data[0];
            if (item) {
              fundingRates.push({
                symbol: item.instId.replace('-SWAP', ''),
                fundingRate: parseFloat(item.fundingRate || '0') * 100,
                predictedFundingRate: parseFloat(item.nextFundingRate || '0') * 100,
                markPrice: parseFloat(item.markPx || '0'),
                nextFundingTime: parseInt(item.nextFundingTime || '0'),
                volume24h: parseFloat(item.vol24h || '0')
              });
            }
          }
        });

        // Добавляем небольшую задержку между группами запросов
        if (i + chunkSize < instruments.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      return fundingRates;
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
          markPrice: parseFloat(item.markPx || '0'),
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