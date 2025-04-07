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

interface FundingRateData {
  symbol: string;
  exchange: string;
  fundingRate: number;
  predictedFundingRate: number;
  markPrice: number;
  nextFundingTime: number;
  volume24h: number;
}

interface HistoricalRate extends FundingRateData {
  fundingRateTimestamp: number;
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
  const [fundingRates, setFundingRates] = useState<FundingRateData[]>([]);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [historicalRates, setHistoricalRates] = useState<HistoricalRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [fundingThreshold, setFundingThreshold] = useState(0.3);
  const [sortDirection, setSortDirection] = useState<'ascend' | 'descend'>('descend');
  const [activeExchange, setActiveExchange] = useState<string>('binance');

  const fetchFundingRates = async () => {
    try {
      setLoading(true);
      const [binanceRates, bybitRates, okxRates] = await Promise.all([
        binanceService.getFundingRates(),
        bybitService.getFundingRates(),
        okxService.getFundingRates()
      ]);

      const allRates: FundingRateData[] = [
        ...binanceRates.map(rate => ({
          symbol: rate.symbol,
          exchange: 'Binance',
          fundingRate: rate.fundingRate,
          predictedFundingRate: rate.predictedRate,
          markPrice: rate.markPrice,
          nextFundingTime: rate.nextFundingTime,
          volume24h: rate.volume24h
        })),
        ...bybitRates.map(rate => ({
          symbol: rate.symbol,
          exchange: 'ByBit',
          fundingRate: rate.fundingRate,
          predictedFundingRate: rate.predictedFundingRate,
          markPrice: rate.markPrice,
          nextFundingTime: rate.nextFundingTime,
          volume24h: rate.volume24h
        })),
        ...okxRates.map(rate => ({
          symbol: rate.symbol,
          exchange: 'OKX',
          fundingRate: rate.fundingRate,
          predictedFundingRate: rate.predictedFundingRate,
          markPrice: rate.markPrice,
          nextFundingTime: rate.nextFundingTime,
          volume24h: rate.volume24h
        }))
      ];

      setFundingRates(allRates);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке данных');
      console.error('Error fetching funding rates:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoricalRates = async (symbol: string, exchange: string) => {
    try {
      let rates: HistoricalRate[] = [];
      switch (exchange) {
        case 'Binance': {
          const data = await binanceService.getHistoricalFundingRates(symbol);
          rates = data.map(rate => ({
            symbol,
            exchange: 'Binance',
            fundingRate: rate.fundingRate,
            fundingRateTimestamp: rate.fundingTime,
            predictedFundingRate: rate.predictedRate,
            markPrice: rate.markPrice,
            nextFundingTime: rate.nextFundingTime,
            volume24h: rate.volume24h
          }));
          break;
        }
        case 'ByBit': {
          const data = await bybitService.getHistoricalFundingRates(symbol);
          rates = data.map(rate => ({
            symbol,
            exchange: 'ByBit',
            fundingRate: rate.fundingRate,
            fundingRateTimestamp: rate.fundingRateTimestamp,
            predictedFundingRate: rate.predictedFundingRate,
            markPrice: rate.markPrice,
            nextFundingTime: rate.nextFundingTime,
            volume24h: rate.volume24h
          }));
          break;
        }
        case 'OKX': {
          const data = await okxService.getHistoricalFundingRates(symbol);
          rates = data.map(rate => ({
            symbol,
            exchange: 'OKX',
            fundingRate: rate.fundingRate,
            fundingRateTimestamp: rate.fundingRateTimestamp,
            predictedFundingRate: rate.predictedFundingRate,
            markPrice: rate.markPrice,
            nextFundingTime: rate.nextFundingTime,
            volume24h: rate.volume24h
          }));
          break;
        }
      }
      setHistoricalRates(rates);
    } catch (error) {
      console.error('Error fetching historical rates:', error);
    }
  };

  useEffect(() => {
    fetchFundingRates();
    const interval = setInterval(fetchFundingRates, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedSymbols.length > 0) {
      const symbol = selectedSymbols[0];
      const rate = fundingRates.find(r => r.symbol === symbol);
      if (rate) {
        fetchHistoricalRates(symbol, rate.exchange);
      }
    }
  }, [selectedSymbols, fundingRates]);

  const formatFundingTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const mskTime = date.toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit' });
    const localTime = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    return `${mskTime}мск - ${localTime} местное`;
  };

  const getTimeUntilFunding = (nextFundingTime: number) => {
    const now = Date.now();
    const diff = nextFundingTime - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}ч ${minutes}м`;
  };

  const columns = [
    {
      title: 'Символ',
      dataIndex: 'symbol',
      key: 'symbol',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Поиск по символу"
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
          <Button onClick={() => clearFilters()} size="small">
            Сбросить
          </Button>
        </div>
      ),
      filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value: any, record: FundingRateData) =>
        record.symbol.toLowerCase().includes(String(value).toLowerCase()),
    },
    {
      title: 'Биржа',
      dataIndex: 'exchange',
      key: 'exchange',
    },
    {
      title: 'Текущий фандинг',
      dataIndex: 'fundingRate',
      key: 'fundingRate',
      render: (value: number) => `${value.toFixed(4)}%`,
      sorter: (a: FundingRateData, b: FundingRateData) => a.fundingRate - b.fundingRate,
    },
    {
      title: 'Предсказанный фандинг',
      dataIndex: 'predictedFundingRate',
      key: 'predictedFundingRate',
      render: (value: number) => `${isNaN(value) ? '0.00' : value.toFixed(4)}%`,
      sorter: (a: FundingRateData, b: FundingRateData) => a.predictedFundingRate - b.predictedFundingRate,
    },
    {
      title: 'Цена',
      dataIndex: 'markPrice',
      key: 'markPrice',
      render: (value: number) => value.toFixed(2),
      sorter: (a: FundingRateData, b: FundingRateData) => a.markPrice - b.markPrice,
    },
    {
      title: 'Объем 24ч',
      dataIndex: 'volume24h',
      key: 'volume24h',
      render: (value: number) => value.toLocaleString(),
      sorter: (a: FundingRateData, b: FundingRateData) => a.volume24h - b.volume24h,
    },
    {
      title: 'Следующий фандинг',
      dataIndex: 'nextFundingTime',
      key: 'nextFundingTime',
      render: (value: number) => formatFundingTime(value),
      sorter: (a: FundingRateData, b: FundingRateData) => a.nextFundingTime - b.nextFundingTime,
    },
  ];

  const filteredRates = fundingRates
    .filter(rate => 
      rate.symbol.toLowerCase().includes(searchText.toLowerCase()) &&
      Math.abs(rate.fundingRate) >= fundingThreshold
    )
    .sort((a, b) => {
      const multiplier = sortDirection === 'ascend' ? 1 : -1;
      return (a.fundingRate - b.fundingRate) * multiplier;
    });

  const renderStrategies = () => {
    const strategies = filteredRates.map(rate => {
      const isLong = rate.fundingRate < 0;
      const strategy = isLong ? 'Рекомендуется лонг' : 'Рекомендуется шорт';
      const timeUntilFunding = getTimeUntilFunding(rate.nextFundingTime);
      const fundingTime = formatFundingTime(rate.nextFundingTime);
      
      return (
        <li key={`${rate.symbol}-${rate.exchange}`}>
          <strong>{rate.symbol}</strong> ({rate.exchange}): {rate.fundingRate.toFixed(4)}% - {strategy} - {fundingTime} (через {timeUntilFunding})
        </li>
      );
    });

    return (
      <Card title="Торговые стратегии" className="funding-rate-strategies">
        <ul>{strategies}</ul>
      </Card>
    );
  };

  const renderChart = () => {
    if (!selectedSymbols.length || !historicalRates.length) {
      return null;
    }

    const data = historicalRates.map(rate => ({
      time: new Date(rate.fundingRateTimestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      value: rate.fundingRate,
      symbol: rate.symbol,
      exchange: rate.exchange
    }));

    const config = {
      data,
      xField: 'time',
      yField: 'value',
      seriesField: 'symbol',
      yAxis: {
        label: {
          formatter: (v: string) => `${v}%`,
        },
      },
      tooltip: {
        formatter: (datum: any) => {
          return {
            name: `${datum.symbol} (${datum.exchange})`,
            value: `${datum.value.toFixed(4)}%`,
          };
        },
      },
    };

    return (
      <Card title="Исторический график фандинг-рейтов" className="funding-rate-chart">
        <Line {...config} />
      </Card>
    );
  };

  return (
    <div className={`funding-rate ${className}`}>
      <h1>Анализ фандинг-рейтов</h1>
      
      <Alert
        message="Информация о фандинг-рейтах"
        description="Фандинг-рейт - это плата, которую трейдеры платят или получают за удержание позиций. Положительный фандинг означает, что лонги платят шортам, отрицательный - наоборот."
        type="info"
        showIcon
        className="funding-rate-alert"
      />

      <Tabs activeKey={activeExchange} onChange={setActiveExchange}>
        <TabPane tab="Binance" key="binance" />
        <TabPane tab="ByBit" key="bybit" />
        <TabPane tab="OKX" key="okx" />
      </Tabs>

      <Card className="funding-rate-filters">
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <h4>Порог фандинг-рейта (%)</h4>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={fundingThreshold}
              onChange={setFundingThreshold}
            />
            <div className="threshold-value">Текущее значение: {fundingThreshold}%</div>
          </Col>
          <Col span={12}>
            <h4>Сортировка</h4>
            <Select
              value={sortDirection}
              onChange={setSortDirection}
              style={{ width: '100%' }}
            >
              <Select.Option value="descend">По убыванию</Select.Option>
              <Select.Option value="ascend">По возрастанию</Select.Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Table
        dataSource={filteredRates}
        columns={columns}
        rowKey={record => `${record.symbol}-${record.exchange}`}
        loading={loading}
        className="funding-rate-table"
        onRow={(record) => ({
          onClick: () => {
            setSelectedSymbols([record.symbol]);
          },
        })}
      />

      {selectedSymbols.length > 0 && renderChart()}

      {renderStrategies()}
    </div>
  );
};

export default FundingRate; 