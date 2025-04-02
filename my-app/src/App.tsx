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

function App() {
  const [selectedTab, setSelectedTab] = useState("Чеклист");
  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
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
  const [items, setItems] = useState<{ [category: string]: ChecklistItemState[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState("");

  const fetchChecklist = async (token: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/checklist?token=${token}`);
      if (!response.ok) throw new Error('Failed to fetch checklist');
      const data = await response.json();
      setItems(data.checklist);
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  const saveChecklist = async (token: string, checklist: ChecklistState) => {
    try {
      const response = await fetch('http://localhost:3001/api/updateChecklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, checklist }),
      });
      if (!response.ok) throw new Error('Failed to save checklist');
    } catch (error) {
      console.error('Error saving checklist:', error);
    }
  };

  // Инициализация
  useEffect(() => {
    const initialize = async () => {
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const newToken = urlParams.get('token') ?? "";
      setToken(newToken);
      await fetchChecklist(newToken);
    };
    initialize();
  }, []);

  // Автосохранение
  useEffect(() => {
    const handleBeforeUnload = () => token && saveChecklist(token, items);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [token, items]);

  // Обработчики изменений
  const handleNameChange = (category: string, id: number, newName: string) => {
    setItems(prev => ({
      ...prev,
      [category]: prev[category].map(item => 
        item.id === id ? { ...item, name: newName } : item
      ),
    }));
  };

  const handleCountChange = (category: string, id: number, newCount: number | undefined) => {
    setItems(prev => ({
      ...prev,
      [category]: prev[category].map(item => 
        item.id === id ? { ...item, count: newCount } : item
      ),
    }));
  };

  const handleDelete = (category: string, id: number) => {
    const item = items[category].find(item => item.id === id);
    if (item) {
      setItems(prev => ({
        ...prev,
        [category]: prev[category].filter(item => item.id !== id),
        "Удалённые": [...(prev["Удалённые"] || []), { ...item, isDeleted: true, prevCategory: category }]
      }));
    }
  };

  const handleRestore = (id: number) => {
    const item = items["Удалённые"]?.find(item => item.id === id);
    if (item && item.prevCategory) {
      setItems(prev => ({
        ...prev,
        "Удалённые": prev["Удалённые"]?.filter(item => item.id !== id),
        [item.prevCategory!]: [...(prev[item.prevCategory!] || []), { ...item, isDeleted: false, prevCategory: undefined }]
      }));
    }
  };

  const handleToggleCompleted = (category: string, id: number) => {
    setItems(prev => ({
      ...prev,
      [category]: prev[category].map(item => 
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
      isDeleted: false
    };
    setItems(prev => ({
      ...prev,
      [category]: [...(prev[category] || []), newItem]
    }));
  };
  return (
    <>
      <Header saveChecklist={()=>saveChecklist(token,items)}></Header>
      <Slider activeTab={selectedTab} onTabChange={handleTabChange} />
      <div className="contentWrapper">
      {/* Отображение контента в зависимости от выбранной вкладки */}


      {selectedTab === "Чеклист" &&    <Checklist
      items={items}
      loading={loading}
      error={error}
      onNameChange={handleNameChange}
      onCountChange={handleCountChange}
      onDelete={handleDelete}
      onRestore={handleRestore}
      onToggleCompleted={handleToggleCompleted}
      onAddItem={handleAddItem}
    />}
      {selectedTab === "Погода" && <div>Контент для Погоды</div>}
      {selectedTab === "Советы" && <div>Контент для Советов</div>}
      </div>
    </>
  );
}

export default App;

