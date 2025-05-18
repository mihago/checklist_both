// WeatherDisplay.tsx
import React from 'react';
import styles from './WeatherDisplay.module.css';

interface WeatherData {
  minTemp: number;
  maxTemp: number;
  textResult: string;
  monthIndex: number;
}

type WeatherCardProps = Omit<WeatherData, 'monthIndex'> & { month: string };
interface WeatherDisplayProps {
  weatherData: WeatherData[];
}

const WeatherCard: React.FC<WeatherCardProps> = ({ 
  month, 
  minTemp, 
  maxTemp, 
  textResult 
}) => {
  return (
    <div className={styles.card}>
      <h2 className={styles.month}>{month}</h2>
      
      <div className={styles.tempContainer}>
        <span className={styles.tempValue}>
          {minTemp}° / {maxTemp}°C
        </span>
        <span className={styles.tempLabel}>Диапазон температур</span>
      </div>

      <div className={styles.divider}></div>

      <p className={styles.description}>
        {textResult}
      </p>
    </div>
  );
};

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weatherData }) => {
  const months = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь'
];

  return (
    <div className={styles.app}>
      <div className={styles.weatherList}>
        {weatherData.map((data, index) => (
          <WeatherCard
            key={index}
            month={months[data.monthIndex]}
            minTemp={data.minTemp}
            maxTemp={data.maxTemp}
            textResult={data.textResult}
          />
        ))}
      </div>
    </div>
  );
};

export default WeatherDisplay;