// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import React from 'react';
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App

import { useEffect, useState } from "react";
import "./App.css";
import Header from "./Components/Header/Header";
import Slider from "./Components/Slider/Slider";
import Checklist from "./Components/Checklist/Checklist";
import host from "./constants";
import WeatherDisplay from "./Components/WeatherDisplay/WeatherDisplay";
import ReactGA from 'react-ga4';

function App() {
  const [selectedTab, setSelectedTab] = useState("Чеклист");
  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    if(tab==="Погода"){
      ReactGA.event("view_weather-"+token);
    }
  };
  interface ChecklistItemState {
    id: number;
    name: string;
    count?: number;
    completed: boolean;
    isDeleted: boolean;
    prevCategory?: string;
  }
  interface ChecklistState {
    [category: string]: ChecklistItemState[];
  }
  const [items, setItems] = useState<{
    [category: string]: ChecklistItemState[];
  }>({});
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState("");

  const fetchChecklist = async (token: string) => {
    try {
      const response = await fetch(`${host}/api/checklist?token=${token}`);
      if (!response.ok) throw new Error("Failed to fetch checklist");
      const data = await response.json();
      setItems(data.checklist.checklist);
      setWeather(data.checklist.weather);
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  const saveChecklist = async (token: string, checklist: ChecklistState) => {
    try {
      const response = await fetch(`${host}/api/updateChecklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, checklist }),
      });
      if (!response.ok) throw new Error("Failed to save checklist");
    } catch (error) {
      console.error("Error saving checklist:", error);
    }
  };

  // Инициализация
  useEffect(() => {
    const initialize = async () => {
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const newToken = urlParams.get("token") ?? "";
      setToken(newToken);
      await fetchChecklist(newToken);
    };
    initialize();
  }, []);
    useEffect(() => {
    ReactGA.initialize('G-55V95JTGT3');
    ReactGA.send({ hitType: 'pageview', page: window.location.pathname+"notappmaster" });
  }, []);

  // Автосохранение
  useEffect(() => {
    const handleBeforeUnload = () => token && saveChecklist(token, items);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [token, items]);

  // Обработчики изменений
  const handleNameChange = (category: string, id: number, newName: string) => {
    setItems((prev) => ({
      ...prev,
      [category]: prev[category].map((item) =>
        item.id === id ? { ...item, name: newName } : item
      ),
    }));
  };

  const handleCountChange = (
    category: string,
    id: number,
    newCount: number | undefined
  ) => {
    setItems((prev) => ({
      ...prev,
      [category]: prev[category].map((item) =>
        item.id === id ? { ...item, count: newCount } : item
      ),
    }));
  };

  const handleDelete = (category: string, id: number) => {
    const item = items[category].find((item) => item.id === id);
    if (item) {
      setItems((prev) => ({
        ...prev,
        [category]: prev[category].filter((item) => item.id !== id),
        Удалённые: [
          ...(prev["Удалённые"] || []),
          { ...item, isDeleted: true, prevCategory: category },
        ],
      }));
    }
  };

  const handleRestore = (id: number) => {
    const item = items["Удалённые"]?.find((item) => item.id === id);
    if (item && item.prevCategory) {
      setItems((prev) => ({
        ...prev,
        Удалённые: prev["Удалённые"]?.filter((item) => item.id !== id),
        [item.prevCategory!]: [
          ...(prev[item.prevCategory!] || []),
          { ...item, isDeleted: false, prevCategory: undefined },
        ],
      }));
    }
  };

  const handleToggleCompleted = (category: string, id: number) => {
    setItems((prev) => ({
      ...prev,
      [category]: prev[category].map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
    }));
  };

  const handleAddItem = (category: string, name: string, hasCount: boolean) => {
    const newItem = {
      id: Date.now(),
      name,
      count: hasCount ? 1 : undefined,
      completed: false,
      isDeleted: false,
    };
    setItems((prev) => ({
      ...prev,
      [category]: [...(prev[category] || []), newItem],
    }));
  };
  return (
    <>
      <Header
        saveChecklist={() => saveChecklist(token, items)}
        token={token}
      ></Header>
      <Slider activeTab={selectedTab} onTabChange={handleTabChange} />
      <div className="contentWrapper">
        {/* Отображение контента в зависимости от выбранной вкладки */}

        {selectedTab === "Чеклист" && (
          <Checklist
            items={items}
            loading={loading}
            error={error}
            onNameChange={handleNameChange}
            onCountChange={handleCountChange}
            onDelete={handleDelete}
            onRestore={handleRestore}
            onToggleCompleted={handleToggleCompleted}
            onAddItem={handleAddItem}
          />
        )}
        {selectedTab === "Погода" && weather ? (
          <WeatherDisplay weatherData={weather}></WeatherDisplay>
        ) : (
          <div>Загрузка...</div>
        )}
        {/* {selectedTab === "Советы" && (
          <ul className="advices">
            <li>- Налей гель, шампунь в маленькие бутылочки</li>
            <li>- Используй вакуумные пакеты для того, чтобы вещи занимали меньше места </li>
            <li>- Вещи можно скручивать
            вместо складывания - так они меньше мнутся</li>
          </ul>
        )} */}
      </div>
    </>
  );
}

export default App;
