import React, { useState, useEffect } from 'react';
import { Table, Card, Alert, Row, Col, Statistic, Input, Slider, Select, Button, Tabs } from 'antd';
import { Line } from '@ant-design/charts';
import { binanceService } from '../../services/binanceService';
import { bybitService } from '../../services/bybitService';
import { okxService } from '../../services/okxService';
import { SearchOutlined } from '@ant-design/icons';
import './FundingRate.css';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface BaseFundingRate {
  symbol: string;
  fundingRate: number;
  predictedRate: number;
  currentPrice: number;
  nextFundingTime: number;
  volume24h: number;
}

interface FundingRate extends BaseFundingRate {
  exchange: string;
}

interface HistoricalRate {
  symbol: string;
  timestamp: number;
  rate: number;
  exchange: string;
}

interface ChartData {
  date: string;
  value: number;
  symbol: string;
  exchange: string;
}

interface FundingRateProps {
  className?: string;
}

const FundingRate: React.FC<FundingRateProps> = ({ className }) => {
  const [fundingRates, setFundingRates] = useState<FundingRate[]>([]);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [historicalRates, setHistoricalRates] = useState<HistoricalRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [fundingThreshold, setFundingThreshold] = useState(0.3);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [activeExchange, setActiveExchange] = useState<string>('binance');

  const fetchFundingRates = async () => {
    try {
      setLoading(true);
      setError(null);

      let rates: FundingRate[] = [];

      // Fetch rates from all exchanges
      const [binanceRates, bybitRates, okxRates] = await Promise.all([
        binanceService.getFundingRates().catch(() => []),
        bybitService.getFundingRates().catch(() => []),
        okxService.getFundingRates().catch(() => [])
      ]);

      // Combine rates from all exchanges
      rates = [
        ...binanceRates.map(rate => ({
          symbol: rate.symbol,
          fundingRate: rate.fundingRate,
          predictedRate: rate.predictedRate,
          currentPrice: rate.markPrice,
          nextFundingTime: rate.nextFundingTime,
          volume24h: rate.volume24h,
          exchange: 'Binance'
        })),
        ...bybitRates.map(rate => ({
          symbol: rate.symbol,
          fundingRate: rate.fundingRate,
          predictedRate: rate.predictedFundingRate,
          currentPrice: rate.markPrice,
          nextFundingTime: rate.nextFundingTime,
          volume24h: rate.volume24h,
          exchange: 'ByBit'
        })),
        ...okxRates.map(rate => ({
          symbol: rate.symbol,
          fundingRate: rate.fundingRate,
          predictedRate: rate.predictedFundingRate,
          currentPrice: rate.markPrice,
          nextFundingTime: rate.nextFundingTime,
          volume24h: rate.volume24h,
          exchange: 'OKX'
        }))
      ];

      setFundingRates(rates);
    } catch (err) {
      setError('Failed to fetch funding rates');
      console.error('Error fetching funding rates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSymbolSelect = async (symbol: string) => {
    if (selectedSymbols.includes(symbol)) {
      setSelectedSymbols(selectedSymbols.filter(s => s !== symbol));
      setHistoricalRates(historicalRates.filter(rate => rate.symbol !== symbol));
    } else {
      setSelectedSymbols([...selectedSymbols, symbol]);
      try {
        let historicalData: HistoricalRate[] = [];
        switch (activeExchange) {
          case 'binance': {
            const data = await binanceService.getHistoricalFundingRates(symbol);
            historicalData = data.map(rate => ({
              symbol,
              timestamp: rate.fundingTime,
              rate: rate.fundingRate,
              exchange: 'Binance'
            }));
            break;
          }
          case 'bybit': {
            const data = await bybitService.getHistoricalFundingRates(symbol);
            historicalData = data.map(rate => ({
              symbol,
              timestamp: rate.fundingRateTimestamp,
              rate: rate.fundingRate,
              exchange: 'ByBit'
            }));
            break;
          }
          case 'okx': {
            const data = await okxService.getHistoricalFundingRates(symbol);
            historicalData = data.map(rate => ({
              symbol,
              timestamp: rate.fundingRateTimestamp,
              rate: rate.fundingRate,
              exchange: 'OKX'
            }));
            break;
          }
        }
        
        setHistoricalRates([...historicalRates, ...historicalData]);
      } catch (err) {
        console.error('Error fetching historical rates:', err);
      }
    }
  };

  useEffect(() => {
    fetchFundingRates();
    const interval = setInterval(fetchFundingRates, 60000); // Обновляем каждую минуту
    return () => clearInterval(interval);
  }, []);

  const getHighestFundingRate = () => {
    const filteredRates = fundingRates
      .filter(rate => Math.abs(rate.fundingRate) >= fundingThreshold)
      .sort((a, b) => {
        const rateA = Math.abs(a.fundingRate);
        const rateB = Math.abs(b.fundingRate);
        return sortDirection === 'desc' ? rateB - rateA : rateA - rateB;
      });

    return filteredRates.length > 0 ? filteredRates[0] : null;
  };

  const columns = [
    {
      title: 'Биржа',
      dataIndex: 'exchange',
      key: 'exchange',
      width: 100,
    },
    {
      title: 'Пара',
      dataIndex: 'symbol',
      key: 'symbol',
      width: 120,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Поиск по паре"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={() => confirm()}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Поиск
          </Button>
          <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
            Сброс
          </Button>
        </div>
      ),
      filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value: any, record: FundingRate) =>
        record.symbol.toLowerCase().includes(String(value).toLowerCase()),
    },
    {
      title: 'Текущий фандинг',
      dataIndex: 'fundingRate',
      key: 'fundingRate',
      width: 150,
      sorter: (a: FundingRate, b: FundingRate) => a.fundingRate - b.fundingRate,
      render: (rate: number) => (
        <span style={{ color: rate >= 0 ? '#52c41a' : '#f5222d' }}>
          {rate.toFixed(4)}%
        </span>
      ),
    },
    {
      title: 'Предсказанный фандинг',
      dataIndex: 'predictedRate',
      key: 'predictedRate',
      width: 150,
      render: (rate: number) => (
        <span style={{ color: rate >= 0 ? '#52c41a' : '#f5222d' }}>
          {rate.toFixed(4)}%
        </span>
      ),
    },
    {
      title: 'Текущая цена',
      dataIndex: 'currentPrice',
      key: 'currentPrice',
      width: 150,
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: 'Объем 24ч',
      dataIndex: 'volume24h',
      key: 'volume24h',
      width: 150,
      render: (volume: number) => `$${(volume / 1000000).toFixed(2)}M`,
    },
    {
      title: 'Следующий фандинг',
      dataIndex: 'nextFundingTime',
      key: 'nextFundingTime',
      width: 200,
      render: (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
      },
    },
    {
      title: 'Действия',
      key: 'action',
      width: 100,
      render: (_: any, record: FundingRate) => (
        <a onClick={() => handleSymbolSelect(record.symbol)}>
          {selectedSymbols.includes(record.symbol) ? 'Скрыть' : 'Показать'} график
        </a>
      ),
    },
  ];

  const filteredRates = fundingRates.filter(rate => 
    rate.symbol.toLowerCase().includes(searchText.toLowerCase()) &&
    Math.abs(rate.fundingRate) >= fundingThreshold
  );

  const chartData: ChartData[] = historicalRates.map(rate => ({
    date: new Date(rate.timestamp).toLocaleString(),
    value: rate.rate,
    symbol: rate.symbol,
    exchange: rate.exchange
  }));

  return (
    <div className={`funding-rate ${className}`}>
      <h1>Анализ фандинг-рейтов</h1>
      
      <Alert
        message="Информация о фандинг-рейтах"
        description="Фандинг-рейт - это механизм, который помогает поддерживать цену фьючерсов близкой к цене спота. Положительный фандинг означает, что длинные позиции платят коротким, отрицательный - наоборот."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Tabs activeKey={activeExchange} onChange={setActiveExchange}>
        <TabPane tab="Binance" key="binance" />
        <TabPane tab="ByBit" key="bybit" />
        <TabPane tab="OKX" key="okx" />
      </Tabs>

      <Card className="funding-rate-filters">
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <div className="filter-section">
              <h4>Порог фандинга (%)</h4>
              <Slider
                min={0}
                max={1}
                step={0.01}
                value={fundingThreshold}
                onChange={setFundingThreshold}
                marks={{
                  0: '0%',
                  0.5: '0.5%',
                  1: '1%'
                }}
              />
              <div className="threshold-value">
                Текущий порог: {fundingThreshold}%
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div className="filter-section">
              <h4>Поиск по паре</h4>
              <Search
                placeholder="Введите пару (например, BTC)"
                allowClear
                onChange={e => setSearchText(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </Col>
          <Col span={8}>
            <div className="filter-section">
              <h4>Сортировка</h4>
              <Select
                value={sortDirection}
                onChange={setSortDirection}
                style={{ width: '100%' }}
              >
                <Option value="desc">По убыванию</Option>
                <Option value="asc">По возрастанию</Option>
              </Select>
            </div>
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={filteredRates}
        rowKey="symbol"
        loading={loading}
        pagination={{ pageSize: 10 }}
        className="funding-rate-table"
      />

      {selectedSymbols.length > 0 && (
        <Card title="Исторический график фандинг-рейтов" className="funding-rate-chart">
          <Line
            data={chartData}
            xField="date"
            yField="value"
            seriesField="symbol"
            yAxis={{
              label: {
                formatter: (v: number) => `${v}%`,
              },
            }}
            tooltip={{
              formatter: (datum: ChartData) => {
                return {
                  name: datum.symbol,
                  value: `${datum.value.toFixed(4)}%`,
                };
              },
            }}
          />
        </Card>
      )}

      <Row gutter={[16, 16]} className="funding-rate-strategies">
        <Col span={24}>
          <Card title="Торговые стратегии">
            <p>Монеты с высоким фандингом (выше {fundingThreshold}%):</p>
            <ul>
              {filteredRates.map(rate => (
                <li key={rate.symbol}>
                  <strong>{rate.symbol}</strong> ({rate.exchange}): {rate.fundingRate.toFixed(4)}% - 
                  {rate.fundingRate > 0 ? ' Рекомендуется шорт' : ' Рекомендуется лонг'}
                </li>
              ))}
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default FundingRate; 