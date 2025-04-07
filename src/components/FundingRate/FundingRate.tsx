import React, { useEffect, useState } from 'react';
import { Card, Table, Typography, Space, Tag, Tooltip, Alert, Row, Col, Statistic } from 'antd';
import { InfoCircleOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { binanceService, FundingRateData, HistoricalFundingRate } from '../../services/binanceService';
import { Line } from '@ant-design/charts';
import './FundingRate.css';

const { Title, Text } = Typography;

interface FundingRateProps {
  className?: string;
}

const FundingRate: React.FC<FundingRateProps> = ({ className }) => {
  const [fundingRates, setFundingRates] = useState<FundingRateData[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [historicalRates, setHistoricalRates] = useState<HistoricalFundingRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getHighestFundingRate = (rates: FundingRateData[]): FundingRateData | null => {
    if (!rates || rates.length === 0) return null;
    return rates.reduce((max, current) => 
      Math.abs(current.fundingRate) > Math.abs(max.fundingRate) ? current : max
    );
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

  const columns = [
    {
      title: 'Пара',
      dataIndex: 'symbol',
      key: 'symbol',
      sorter: (a: FundingRateData, b: FundingRateData) => a.symbol.localeCompare(b.symbol),
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

  const highestRate = getHighestFundingRate(fundingRates);

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

      <Table
        columns={columns}
        dataSource={fundingRates}
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

      {highestRate && (
        <Row gutter={16} className="funding-rate-stats">
          <Col span={12}>
            <Card className="funding-rate-stat-card">
              <Statistic
                title="Наивысший фандинг"
                value={highestRate.fundingRate * 100}
                precision={4}
                suffix="%"
                valueStyle={{ color: highestRate.fundingRate >= 0 ? '#3f8600' : '#cf1322' }}
                prefix={highestRate.fundingRate >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              />
              <Text type="secondary">Пара: {highestRate.symbol}</Text>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Торговая стратегия" className="funding-rate-strategy-card">
              <Text>
                {highestRate.fundingRate > 0
                  ? 'Рассмотрите короткие позиции, так как лонги платят шортам. Чем выше фандинг, тем выгоднее быть в шорте.'
                  : 'Рассмотрите длинные позиции, так как шорты платят лонгам. Чем ниже (более отрицательный) фандинг, тем выгоднее быть в лонге.'}
              </Text>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default FundingRate; 