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

import { useState } from "react";
import "./App.css";
import Header from "./Components/Header/Header";
import Slider from "./Components/Slider/Slider";
import Checklist from "./Components/Checklist/Checklist";

function App() {
  const [selectedTab, setSelectedTab] = useState("Чеклист");

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
  };
  return (
    <>
      <Header></Header>
      <Slider activeTab={selectedTab} onTabChange={handleTabChange} />
      <div className="contentWrapper">
      {/* Отображение контента в зависимости от выбранной вкладки */}


      {selectedTab === "Чеклист" &&    <Checklist></Checklist>}
      {selectedTab === "Погода" && <div>Контент для Погоды</div>}
      {selectedTab === "Советы" && <div>Контент для Советов</div>}
      </div>
    </>
  );
}

export default App;

