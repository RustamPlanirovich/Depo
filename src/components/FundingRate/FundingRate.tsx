import React, { useState, useEffect, useRef } from 'react';
import { Table, Card, Alert, Row, Col, Statistic, Input, Slider, Select, Button, Tabs, message } from 'antd';
import { Line } from '@ant-design/charts';
import { SearchOutlined, FireFilled } from '@ant-design/icons';
import html2canvas from 'html2canvas';
import { binanceService } from '../../services/binanceService';
import { bybitService } from '../../services/bybitService';
import { okxService } from '../../services/okxService';
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
  
  // Create a ref map for strategy cards
  const strategyCardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

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
    const mskTime = date.toLocaleTimeString('ru-RU', { 
      timeZone: 'Europe/Moscow', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const localTime = date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const timeUntil = formatTimeUntilFunding(timestamp);
    return `${mskTime}мск - ${localTime} местное (через ${timeUntil})`;
  };

  const formatTimeUntilFunding = (nextFundingTime: number): string => {
    const now = Date.now();
    const timeLeft = nextFundingTime - now;
    
    // Конвертируем миллисекунды в минуты и часы
    const minutes = Math.floor(timeLeft / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      if (remainingMinutes === 0) {
        return `${hours} ${pluralize(hours, 'час', 'часа', 'часов')}`;
      }
      if (remainingMinutes < 10) {
        return `${hours}:0${remainingMinutes}`;
      }
      return `${hours}:${remainingMinutes}`;
    }
    
    if (minutes === 0) {
      return 'менее минуты';
    }
    
    return `${minutes} ${pluralize(minutes, 'мин', 'мин', 'мин')}`;
  };

  const pluralize = (number: number, one: string, few: string, many: string): string => {
    const lastDigit = number % 10;
    const lastTwoDigits = number % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return many;
    }

    if (lastDigit === 1) {
      return one;
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
      return few;
    }

    return many;
  };

  const copySymbolToClipboard = (symbol: string) => {
    const formattedSymbol = symbol.includes('-') ? symbol.replace('-', '/') : symbol;
    navigator.clipboard.writeText(formattedSymbol).then(() => {
      message.success(`Скопировано: ${formattedSymbol}`);
    }).catch(() => {
      message.error('Не удалось скопировать символ');
    });
  };

  const copyCardAsImage = async (cardRef: HTMLDivElement) => {
    try {
      const canvas = await html2canvas(cardRef, {
        backgroundColor: '#2c2c2e',
        scale: 2, // Увеличиваем качество
      });
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                'image/png': blob
              })
            ]);
            message.success('Карточка скопирована в буфер обмена');
          } catch (err) {
            // Fallback для браузеров, которые не поддерживают копирование изображений
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'funding-card.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            message.success('Карточка сохранена как изображение');
          }
        }
      }, 'image/png', 1.0);
    } catch (error) {
      message.error('Не удалось создать изображение');
      console.error('Error creating image:', error);
    }
  };

  const columns = [
    {
      title: 'Символ',
      dataIndex: 'symbol',
      key: 'symbol',
      render: (symbol: string) => (
        <span 
          onClick={() => copySymbolToClipboard(symbol)}
          style={{ cursor: 'pointer', color: '#0a84ff' }}
          className="symbol-cell"
        >
          {symbol}
        </span>
      ),
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
      render: (value: number) => (
        <span className={value >= 0 ? 'positive-value' : 'negative-value'}>
          {value.toFixed(4)}%
        </span>
      ),
      sorter: (a: FundingRateData, b: FundingRateData) => a.fundingRate - b.fundingRate,
    },
    {
      title: 'Предсказанный фандинг',
      dataIndex: 'predictedFundingRate',
      key: 'predictedFundingRate',
      render: (value: number) => (
        <span className={value >= 0 ? 'positive-value' : 'negative-value'}>
          {isNaN(value) ? '0.00' : value.toFixed(4)}%
        </span>
      ),
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
    if (!fundingRates.length) return null;

    const sortedRates = [...fundingRates]
      .filter(rate => Math.abs(rate.fundingRate) > fundingThreshold)
      .sort((a, b) => {
        const fundingDiff = Math.abs(b.fundingRate) - Math.abs(a.fundingRate);
        if (fundingDiff !== 0) return fundingDiff;
        return a.nextFundingTime - b.nextFundingTime;
      });

    const now = Date.now();
    const HIGH_FUNDING_THRESHOLD = 0.8;

    return (
      <Card title="Торговые стратегии" className="funding-rate-strategies">
        <div className="strategies-grid">
          {sortedRates.map((rate) => {
            const timeUntilFunding = rate.nextFundingTime - now;
            const isHighPriority = Math.abs(rate.fundingRate) >= HIGH_FUNDING_THRESHOLD;
            const isNearestFunding = timeUntilFunding <= 3600000;
            const cardKey = `${rate.symbol}-${rate.exchange}`;

            return (
              <div
                key={cardKey}
                className={`strategy-card ${isHighPriority ? 'high-priority' : ''} ${
                  isNearestFunding ? 'nearest-funding' : ''
                }`}
                ref={(el: HTMLDivElement | null) => {
                  if (el) {
                    strategyCardRefs.current[cardKey] = el;
                  }
                }}
              >
                <div className="strategy-header">
                  <span 
                    className="strategy-symbol"
                    onClick={() => copySymbolToClipboard(rate.symbol)}
                  >
                    {rate.symbol}
                  </span>
                  <span 
                    className="strategy-exchange"
                    onClick={() => {
                      const cardRef = strategyCardRefs.current[cardKey];
                      if (cardRef) {
                        copyCardAsImage(cardRef);
                      }
                    }}
                  >
                    {rate.exchange}
                  </span>
                </div>
                <div className={`strategy-funding ${rate.fundingRate >= 0 ? 'positive' : ''}`}>
                  {rate.fundingRate.toFixed(4)}%
                  {isHighPriority && <FireFilled className="fire-icon" />}
                </div>
                <div className="strategy-time">
                  {formatFundingTime(rate.nextFundingTime)}
                </div>
                <div className="strategy-recommendation">
                  {rate.fundingRate > 0 ? 'Рекомендуется шорт' : 'Рекомендуется лонг'}
                </div>
              </div>
            );
          })}
        </div>
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
    <div className="funding-rate">
      <h1>Анализ фандинг-рейтов</h1>
      
      <Alert
        message="Информация о фандинг-рейтах"
        description="Фандинг-рейт - это плата, которую трейдеры платят или получают за удержание позиций. Положительный фандинг означает, что лонги платят шортам, отрицательный - наоборот."
        type="info"
        showIcon
        className="funding-rate-alert"
      />

      {renderStrategies()}

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
    </div>
  );
};

export default FundingRate; 