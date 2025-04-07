import React, { useEffect, useState } from 'react';
import { Card, Table, Typography, Space, Tag, Tooltip, Alert, Row, Col, Statistic, Input, Slider, Select, Button } from 'antd';
import { InfoCircleOutlined, ArrowUpOutlined, ArrowDownOutlined, SearchOutlined } from '@ant-design/icons';
import { binanceService, FundingRateData, HistoricalFundingRate } from '../../services/binanceService';
import { Line } from '@ant-design/charts';
import './FundingRate.css';

const { Title, Text } = Typography;
const { Option } = Select;

interface FundingRateProps {
  className?: string;
}

const FundingRate: React.FC<FundingRateProps> = ({ className }) => {
  const [fundingRates, setFundingRates] = useState<FundingRateData[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [historicalRates, setHistoricalRates] = useState<HistoricalFundingRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [fundingThreshold, setFundingThreshold] = useState(0.3);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const getHighestFundingRate = (rates: FundingRateData[]): FundingRateData[] => {
    if (!rates || rates.length === 0) return [];
    return rates
      .filter(rate => Math.abs(rate.fundingRate) >= fundingThreshold)
      .sort((a, b) => {
        const rateA = Math.abs(a.fundingRate);
        const rateB = Math.abs(b.fundingRate);
        return sortDirection === 'desc' ? rateB - rateA : rateA - rateB;
      });
  };

  const handleSymbolSelect = async (symbol: string) => {
    try {
      setSelectedSymbol(symbol);
      const historical = await binanceService.getHistoricalFundingRates(symbol);
      setHistoricalRates(historical);
    } catch (err) {
      setError('Ошибка при загрузке исторических данных');
      console.error('Error fetching historical data:', err);
    }
  };

  useEffect(() => {
    const fetchFundingRates = async () => {
      try {
        setLoading(true);
        const rates = await binanceService.getFundingRates();
        setFundingRates(rates);
        setError(null);
      } catch (err) {
        setError('Ошибка при загрузке данных о фандинге');
        console.error('Error fetching funding rates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFundingRates();
    const interval = setInterval(fetchFundingRates, 60000); // Обновление каждую минуту

    return () => clearInterval(interval);
  }, []);

  const filteredRates = fundingRates.filter(rate => 
    rate.symbol.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Пара',
      dataIndex: 'symbol',
      key: 'symbol',
      sorter: (a: FundingRateData, b: FundingRateData) => a.symbol.localeCompare(b.symbol),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Поиск по паре"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              size="small"
              style={{ width: 90 }}
            >
              Поиск
            </Button>
            <Button onClick={() => clearFilters()} size="small">
              Сбросить
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value: any, record: FundingRateData) =>
        record.symbol.toLowerCase().includes(String(value).toLowerCase()),
    },
    {
      title: 'Текущий фандинг',
      dataIndex: 'fundingRate',
      key: 'fundingRate',
      render: (rate: number) => (
        <Tag color={rate >= 0 ? 'green' : 'red'}>
          {(rate * 100).toFixed(4)}%
        </Tag>
      ),
      sorter: (a: FundingRateData, b: FundingRateData) => a.fundingRate - b.fundingRate,
    },
    {
      title: 'Прогноз фандинга',
      dataIndex: 'predictedRate',
      key: 'predictedRate',
      render: (rate: number) => (
        <Tag color={rate >= 0 ? 'green' : 'red'}>
          {(rate * 100).toFixed(4)}%
        </Tag>
      ),
    },
    {
      title: 'Текущая цена',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price.toLocaleString()}`,
    },
    {
      title: 'Объем за 24ч',
      dataIndex: 'volume24h',
      key: 'volume24h',
      render: (volume: number) => `$${volume.toLocaleString()}`,
      sorter: (a: FundingRateData, b: FundingRateData) => a.volume24h - b.volume24h,
    },
    {
      title: 'Следующий фандинг',
      dataIndex: 'nextFundingTime',
      key: 'nextFundingTime',
      render: (time: number) => new Date(time).toLocaleTimeString(),
    },
    {
      title: 'Действие',
      key: 'action',
      render: (_: any, record: FundingRateData) => (
        <Space size="middle">
          <a onClick={() => handleSymbolSelect(record.symbol)}>Подробнее</a>
        </Space>
      ),
    },
  ];

  const highFundingRates = getHighestFundingRate(filteredRates);

  return (
    <div className={`funding-rate-container ${className}`}>
      <Title level={2} className="funding-rate-title">Анализ Фандинга</Title>
      
      <Alert
        message="О фандинге"
        description="Фандинг - это платежи между трейдерами в бессрочных фьючерсных рынках. Положительные ставки означают, что лонги платят шортам, отрицательные - шорты платят лонгам. Фандинг обычно происходит каждые 8 часов."
        type="info"
        showIcon
        className="funding-rate-alert"
      />

      {error && (
        <Alert
          message="Ошибка"
          description={error}
          type="error"
          showIcon
          className="funding-rate-alert"
        />
      )}

      <Card className="funding-rate-filters">
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Text>Порог фандинга: {(fundingThreshold * 100).toFixed(2)}%</Text>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={fundingThreshold}
              onChange={setFundingThreshold}
              tooltip={{ formatter: (value) => `${(Number(value) * 100).toFixed(2)}%` }}
            />
          </Col>
          <Col span={8}>
            <Select
              value={sortDirection}
              onChange={setSortDirection}
              style={{ width: '100%' }}
            >
              <Option value="desc">По убыванию</Option>
              <Option value="asc">По возрастанию</Option>
            </Select>
          </Col>
          <Col span={8}>
            <Input
              placeholder="Поиск по паре"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={filteredRates}
        loading={loading}
        rowKey="symbol"
        pagination={{ pageSize: 10 }}
        className="funding-rate-table"
      />

      {selectedSymbol && historicalRates.length > 0 && (
        <Card 
          title={`История фандинга - ${selectedSymbol}`} 
          className="funding-rate-chart-card"
        >
          <Line
            data={historicalRates.map(rate => ({
              date: new Date(rate.fundingTime).toLocaleDateString(),
              rate: rate.fundingRate * 100
            }))}
            xField="date"
            yField="rate"
            point={{
              size: 5,
              shape: 'diamond',
            }}
            label={{
              style: {
                fill: '#aaa',
              },
            }}
            theme="dark"
          />
        </Card>
      )}

      {highFundingRates.length > 0 && (
        <Row gutter={[16, 16]} className="funding-rate-stats">
          {highFundingRates.map((rate, index) => (
            <Col span={8} key={rate.symbol}>
              <Card className="funding-rate-stat-card">
                <Statistic
                  title={`Фандинг ${rate.symbol}`}
                  value={rate.fundingRate * 100}
                  precision={4}
                  suffix="%"
                  valueStyle={{ color: rate.fundingRate >= 0 ? '#3f8600' : '#cf1322' }}
                  prefix={rate.fundingRate >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                />
                <Text type="secondary">
                  Следующий фандинг: {new Date(rate.nextFundingTime).toLocaleTimeString()}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {highFundingRates.length > 0 && (
        <Card title="Торговая стратегия" className="funding-rate-strategy-card">
          <Text>
            {highFundingRates[0].fundingRate > 0
              ? 'Рассмотрите короткие позиции по следующим парам, так как лонги платят шортам. Чем выше фандинг, тем выгоднее быть в шорте.'
              : 'Рассмотрите длинные позиции по следующим парам, так как шорты платят лонгам. Чем ниже (более отрицательный) фандинг, тем выгоднее быть в лонге.'}
          </Text>
          <ul style={{ marginTop: 16 }}>
            {highFundingRates.map(rate => (
              <li key={rate.symbol}>
                {rate.symbol}: {(rate.fundingRate * 100).toFixed(4)}% - 
                {rate.fundingRate > 0 
                  ? ' выгодно быть в шорте'
                  : ' выгодно быть в лонге'}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default FundingRate; 