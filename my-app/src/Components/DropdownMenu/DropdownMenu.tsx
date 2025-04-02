import { useState, useEffect, useRef } from "react";
import styles from "./DropdownMenu.module.css"; // Подключаем стили
import Button from "../Button/Button";

const DropdownMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); 
  const handleGeneratePdf = async () => {
    const response = await fetch('http://localhost:3001/api/generatePDF', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ // Сериализация объекта в JSON-строку
        token: 'de013dc7-214e-4cbb-b3aa-f269f53b01b0',
      }),
    });
    
    // Check if the response is OK
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Convert the response to a Blob
    const pdfBlob = await response.blob();
    
    // Create a download link for the PDF
    const url = window.URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'output.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Release the URL object
    window.URL.revokeObjectURL(url);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event: MouseEvent) => { 
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      <Button color="#B8FD61" onClick={toggleMenu}>
        <span>Экспорт</span>
        {isOpen ? "▲" : "▼"}
      </Button>
      {isOpen && (
        <div className={styles.menu}>
          {/*TODO: Заменить мокапы на реальные функции */}
          <button className={styles.menuItem} onClick={ handleGeneratePdf}>как PDF</button>
          <button className={styles.menuItem} onClick={() => { alert("jpg") }}>как JPEG</button>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
