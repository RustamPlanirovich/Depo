import React from "react";
import { useAnalytics } from "../../hooks";
import { LineChart, BarChart, PieChart } from "../charts";
import { TIME_RANGES } from "../../constants";

/**
 * Analytics component - displays charts and statistics about deposit growth
 * @param {Object} props
 * @param {Array} props.days - Array of trading days
 * @param {Array} props.archivedDays - Array of archived trading days
 * @param {number} props.initialDeposit - Initial deposit amount
 * @param {number} props.deposit - Current deposit amount
 * @param {number} props.leverage - Current leverage
 * @param {number} props.dailyTarget - Daily target percentage
 * @param {Array} props.goals - Array of trading goals
 */
const Analytics = ({
  days,
  archivedDays,
  initialDeposit,
  deposit,
  leverage,
  dailyTarget,
  goals
}) => {
  const {
    includeArchived,
    setIncludeArchived,
    timeRange,
    setTimeRange,
    filteredDays,
    metrics,
    chartData
  } = useAnalytics(days, archivedDays, initialDeposit, deposit);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold mb-8" style={{ color: "var(--color-text-primary)" }}>Аналитика</h1>
      
      {/* Filters */}
      <div className="mac-card fade-in" style={{ backgroundColor: "var(--color-card)", color: "var(--color-text-primary)" }}>
        <h3 className="text-lg font-medium mb-2" style={{ color: "var(--color-accent)" }}>Фильтры</h3>
        <div className="text-sm mb-4" style={{ color: "var(--color-text-tertiary)" }}>
          Инструменты для настройки отображаемых данных. Позволяют выбрать временной период для анализа и включить/исключить архивные дни из расчетов.
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="mr-2" style={{ color: "var(--color-text-secondary)" }}>Период:</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="mac-input"
            >
              <option value={TIME_RANGES.ALL}>Всё время</option>
              <option value={TIME_RANGES.WEEK}>7 дней</option>
              <option value={TIME_RANGES.MONTH}>30 дней</option>
              <option value={TIME_RANGES.QUARTER}>90 дней</option>
              <option value={TIME_RANGES.YEAR}>1 год</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeArchived"
              checked={includeArchived}
              onChange={() => setIncludeArchived(!includeArchived)}
              className="mr-2"
            />
            <label htmlFor="includeArchived" style={{ color: "var(--color-text-secondary)" }}>
              Включать архивные дни
            </label>
          </div>
        </div>
      </div>
      
      {filteredDays.length > 0 ? (
        <>
          {/* Key Metrics */}
          <div className="mac-card fade-in" style={{ backgroundColor: "var(--color-card)", color: "var(--color-text-primary)" }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--color-accent)" }}>Ключевые метрики</h2>
            
            <div className="text-sm mb-4" style={{ color: "var(--color-text-tertiary)" }}>
              Важнейшие показатели эффективности вашей торговли за выбранный период. Здесь представлены общий рост, средний процент, успешность торговли и влияние используемого плеча.
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Growth */}
              <div className="mac-card" style={{ backgroundColor: "var(--color-card-tertiary)" }}>
                <div className="text-sm mb-1" style={{ color: "var(--color-text-tertiary)" }}>Общий рост</div>
                <div className={`text-2xl font-bold ${metrics.totalGrowth >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {metrics.totalGrowth.toFixed(2)}%
                </div>
                <div className="text-sm mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                  от начального депозита
                </div>
              </div>
              
              {/* Average Percentage */}
              <div className="mac-card" style={{ backgroundColor: "var(--color-card-tertiary)" }}>
                <div className="text-sm mb-1" style={{ color: "var(--color-text-tertiary)" }}>Средний % в день</div>
                <div className="text-2xl font-bold" style={{ color: "var(--color-accent)" }}>
                  {metrics.averageDailyGrowth.toFixed(2)}%
                </div>
                <div className="text-sm mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                  цель: {dailyTarget}%
                </div>
              </div>
              
              {/* Success Rate */}
              <div className="mac-card" style={{ backgroundColor: "var(--color-card-tertiary)" }}>
                <div className="text-sm mb-1" style={{ color: "var(--color-text-tertiary)" }}>Успешность</div>
                <div className="text-2xl font-bold" style={{ color: "var(--color-accent)" }}>
                  {metrics.successRate.toFixed(2)}%
                </div>
                <div className="text-sm mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                  прибыльных дней
                </div>
              </div>
              
              {/* Leverage Impact */}
              <div className="mac-card" style={{ backgroundColor: "var(--color-card-tertiary)" }}>
                <div className="text-sm mb-1" style={{ color: "var(--color-text-tertiary)" }}>Влияние плеча</div>
                <div className="text-2xl font-bold" style={{ color: "var(--color-accent)" }}>
                  {leverage}x
                </div>
                <div className="text-sm mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                  доход: ${(deposit - initialDeposit).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Deposit Growth Chart */}
            <div className="mac-card fade-in" style={{ backgroundColor: "var(--color-card)", color: "var(--color-text-primary)" }}>
              <h3 className="text-lg font-medium mb-4" style={{ color: "var(--color-accent)" }}>Рост депозита</h3>
              <div className="text-sm mb-4" style={{ color: "var(--color-text-tertiary)" }}>
                График показывает динамику изменения вашего депозита с течением времени. Позволяет оценить общий тренд роста капитала и периоды наиболее эффективной торговли.
              </div>
              <div style={{ height: "300px" }}>
                <LineChart data={chartData.depositGrowth} />
              </div>
            </div>
            
            {/* Daily Percentage Chart */}
            <div className="mac-card fade-in" style={{ backgroundColor: "var(--color-card)", color: "var(--color-text-primary)" }}>
              <h3 className="text-lg font-medium mb-4" style={{ color: "var(--color-accent)" }}>Ежедневный процент</h3>
              <div className="text-sm mb-4" style={{ color: "var(--color-text-tertiary)" }}>
                Столбчатая диаграмма отображает процентные результаты каждого торгового дня. Помогает анализировать стабильность вашей торговли и выявлять дни с аномальными результатами.
              </div>
              <div style={{ height: "300px" }}>
                <BarChart data={chartData.dailyPercentages} />
              </div>
            </div>
          </div>
          
          {/* Distribution Chart */}
          <div className="mac-card fade-in" style={{ backgroundColor: "var(--color-card)", color: "var(--color-text-primary)" }}>
            <h3 className="text-lg font-medium mb-4" style={{ color: "var(--color-accent)" }}>Распределение результатов</h3>
            <div className="text-sm mb-4" style={{ color: "var(--color-text-tertiary)" }}>
              Круговая диаграмма показывает соотношение прибыльных, убыточных и безубыточных дней. Позволяет оценить общую успешность вашей торговой стратегии и соотношение выигрышных/проигрышных сделок.
            </div>
            <div style={{ height: "300px" }}>
              <PieChart data={chartData.resultDistribution} />
            </div>
          </div>
        </>
      ) : (
        <div className="mac-card fade-in text-center p-8" style={{ backgroundColor: "var(--color-card)", color: "var(--color-text-primary)" }}>
          <p className="mb-4" style={{ color: "var(--color-text-secondary)" }}>Нет данных для отображения за выбранный период.</p>
          <button
            onClick={() => setTimeRange(TIME_RANGES.ALL)}
            className="mac-button"
          >
            Показать все данные
          </button>
        </div>
      )}
    </div>
  );
};

export default Analytics;
