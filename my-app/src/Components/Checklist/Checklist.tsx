import { useState, useEffect} from "react";
import ChecklistItem from "./../ChecklistItem/ChecklistItem";
import ChecklistCategory from "./../ChecklistCategory/ChecklistCategory";
import styles from "./Checklist.module.css";

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

const CategoryColors = ["rgba(184,253,97,0.05)","rgba(253,184,97,0.05)","rgba(97,184,253,0.05)", "rgba(253,97,184,0.05)","rgba(97,253,184,0.05)","rgba(184,97,253,0.05  )"];

const Checklist = () => {
  const [items, setItems] = useState<ChecklistState>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string>("");

  // // Функция для получения токена
  // const fetchToken = async () => {
  //   // eslint-disable-next-line no-useless-catch
  //   try {
  //     const response = await fetch('http://localhost:3001/api/generateToken', {
  //       method: 'POST',
  //     });
  //     if (!response.ok) {
  //       throw new Error('Failed to generate token');
  //     }
  //     const data = await response.json();
  //     setToken(data.token);
  //     return data.token;
  //   } catch (error) {
  //     throw error;
  //   }
  // };

  // // Функция для генерации чеклиста
  // const generateChecklist = async (token: string) => {
  //   // eslint-disable-next-line no-useless-catch
  //   try {
  //     const response = await fetch('http://localhost:3001/api/makeChecklist', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ token }),
  //     });
  //     if (!response.ok) {
  //       throw new Error('Failed to generate checklist');
  //     }
  //   } catch (error) {
  //     throw error;
  //   }
  // };

  // Функция для загрузки чеклиста
  const fetchChecklist = async (token: string) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await fetch(`http://localhost:3001/api/checklist?token=${token}`);
      if (!response.ok) {
        throw new Error('Failed to fetch checklist');
      }
      const data = await response.json();
      setItems(data.checklist);
    } catch (error) {
      throw error;
    }
  };

  // Функция для сохранения изменений
  const saveChecklist = async (token: string, checklist: ChecklistState) => {
    try {
      const response = await fetch('http://localhost:3001/api/updateChecklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, checklist }),
      });
      if (!response.ok) {
        throw new Error('Failed to save checklist');
      }
    } catch (error) {
      console.error('Error saving checklist:', error);
    }
  };

  // Загрузка токена, генерация и загрузка чеклиста
  useEffect(() => {
    const initializeChecklist = async () => {
      try {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        setToken(urlParams.get('token')??"");
        await fetchChecklist(token);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(String(error));
        }
      } finally {
        setLoading(false);
      }
    };

    initializeChecklist();
  }, []);

  // Сохранение изменений при закрытии или обновлении страницы
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (token) {
        saveChecklist(token, items);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [token, items]);

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
    const newItem: ChecklistItemState = {
      id: Date.now(),
      name,
      count: hasCount ? 1 : undefined,
      completed: false,
      isDeleted: false
    };
    setItems(prev => ({
      ...prev,
      [category]: [...prev[category], newItem]
    }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className={styles.checklist}>
      {Object.keys(items).filter(category => category !== "Удалённые").map((category, index) => (
        <ChecklistCategory
          key={category}
          title={category}
          containerColor={category === "Удалённые" ? "#fff" : CategoryColors[index%6]}
          onAddItem={(name, hasCount) => handleAddItem(category, name, hasCount)}
        >
          {items[category].map(item => (
            <ChecklistItem
              key={item.id}
              name={item.name}
              count={item.count}
              completed={item.completed}
              isDeleted={item.isDeleted}
              onNameChange={(newName) => handleNameChange(category, item.id, newName)}
              onCountChange={(newCount) => handleCountChange(category, item.id, newCount)}
              onToggleCompleted={() => handleToggleCompleted(category, item.id)}
              onDelete={() => handleDelete(category, item.id)}
              onRestore={() => null}
            />
          ))}
        </ChecklistCategory>
      ))}

      <ChecklistCategory
        title="Удалённые"
        containerColor="#ccc"
        onAddItem={() => null}
      >
        {items["Удалённые"]?.map(item => (
          <ChecklistItem
            key={item.id}
            name={item.name}
            count={item.count}
            completed={item.completed}
            isDeleted={item.isDeleted}
            onNameChange={() => null}
            onCountChange={() => null}
            onToggleCompleted={() => null}
            onDelete={() => null}
            onRestore={() => handleRestore(item.id)}
          />
        ))}
      </ChecklistCategory>
    </div>
  );
};

export default Checklist;