import { FC } from "react";
import styles from "./Slider.module.css";
import Button from "../Button/Button";

const tabs = ["Чеклист", "Погода"]; // Вкладки

interface SliderProps {
  activeTab: string; // Текущая активная вкладка
  onTabChange: (tab: string) => void; // Функция для обработки изменения вкладки
}

const Slider: FC<SliderProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className={styles.slider}>
      {tabs.map((tab) => (
        <Button
          key={tab}
          onClick={() => onTabChange(tab)} // Вызов обработчика из пропсов
          className={`${styles.tab} ${
            activeTab === tab ? styles.active : ""
          }`}
        >
          {tab}
        </Button>
      ))}
    </div>
  );
};

export default Slider;
