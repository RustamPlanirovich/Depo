import React, { useEffect, useState } from 'react';
import { Card, Table, Typography, Space, Tag, Tooltip, Alert, Row, Col, Statistic } from 'antd';
import { InfoCircleOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { binanceService, FundingRateData, HistoricalFundingRate } from '../../services/binanceService';
import { Line } from '@ant-design/charts';

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
      setError('Failed to fetch historical data');
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
        setError('Failed to fetch funding rates');
        console.error('Error fetching funding rates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFundingRates();
    const interval = setInterval(fetchFundingRates, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const columns = [
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
      sorter: (a: FundingRateData, b: FundingRateData) => a.symbol.localeCompare(b.symbol),
    },
    {
      title: 'Current Funding Rate',
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
      title: 'Predicted Rate',
      dataIndex: 'predictedRate',
      key: 'predictedRate',
      render: (rate: number) => (
        <Tag color={rate >= 0 ? 'green' : 'red'}>
          {(rate * 100).toFixed(4)}%
        </Tag>
      ),
    },
    {
      title: 'Current Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price.toLocaleString()}`,
    },
    {
      title: '24h Volume',
      dataIndex: 'volume24h',
      key: 'volume24h',
      render: (volume: number) => `$${volume.toLocaleString()}`,
      sorter: (a: FundingRateData, b: FundingRateData) => a.volume24h - b.volume24h,
    },
    {
      title: 'Next Funding',
      dataIndex: 'nextFundingTime',
      key: 'nextFundingTime',
      render: (time: number) => new Date(time).toLocaleTimeString(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: FundingRateData) => (
        <Space size="middle">
          <a onClick={() => handleSymbolSelect(record.symbol)}>View Details</a>
        </Space>
      ),
    },
  ];

  const highestRate = getHighestFundingRate(fundingRates);

  return (
    <div className={className}>
      <Title level={2}>Funding Rate Analysis</Title>
      
      <Alert
        message="About Funding Rates"
        description="Funding rates are payments between long and short traders in perpetual futures markets. Positive rates mean longs pay shorts, negative rates mean shorts pay longs. Rates are typically settled every 8 hours."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Table
        columns={columns}
        dataSource={fundingRates}
        loading={loading}
        rowKey="symbol"
        pagination={{ pageSize: 10 }}
      />

      {selectedSymbol && historicalRates.length > 0 && (
        <Card title={`Historical Funding Rates - ${selectedSymbol}`} style={{ marginTop: 24 }}>
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
          />
        </Card>
      )}

      {highestRate && (
        <Row gutter={16} style={{ marginTop: 24 }}>
          <Col span={12}>
            <Card>
              <Statistic
                title="Highest Funding Rate"
                value={highestRate.fundingRate * 100}
                precision={4}
                suffix="%"
                valueStyle={{ color: highestRate.fundingRate >= 0 ? '#3f8600' : '#cf1322' }}
                prefix={highestRate.fundingRate >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              />
              <Text type="secondary">Symbol: {highestRate.symbol}</Text>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Trading Strategy">
              <Text>
                {highestRate.fundingRate > 0
                  ? 'Consider short positions as longs are paying shorts. The higher the funding rate, the more profitable it is to be short.'
                  : 'Consider long positions as shorts are paying longs. The lower (more negative) the funding rate, the more profitable it is to be long.'}
              </Text>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default FundingRate; 