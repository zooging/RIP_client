import { useEffect, useState } from "react";
import CreateComponent from "./CreateComponent";
import ItemComponent from "./ItemComponent";
import ViewTasks from "./ViewTasks";
import io from "socket.io-client";

const ListComponent = (props) => {
  const [list, setList] = useState([]);
  const [showTasks, setShowTasks] = useState(false);
  const [socket, setSocket] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [userCredentialsEntered, setUserCredentialsEntered] = useState(false);

  const [loginStatus, setLoginStatus] = useState(false);
  const [authStep, setAuthStep] = useState('registration');

  useEffect(() => {
    const newSocket = io("http://localhost:3000", {
      withCredentials: true,
      extraHeaders: {
        "my-custom-header": "value",
      },
    });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);


  useEffect(() => {
    if (socket) {
      socket.on("chat message", (msg) => {
        console.log("Получено сообщение из чата:", msg);
        setChatMessages((prevMessages) => [...prevMessages, msg]);
      });
      socket.on("clear chat", () => {
        console.log("История чата была очищена");
        setChatMessages([]);
      });
    }
  }, [socket]);

  const handleSendMessage = (content) => {
    if (socket) {
      socket.emit("chat message", content);
    }  
    setChatMessages((prevMessages) => [...prevMessages, { content, sentByUser: true }]);
  };

  const handleClearChat = () => {
    if (socket) {
      socket.emit("clear chat");
    }
  };
  
  useEffect(() => {
    fetch("http://localhost:3000")
      .then((response) => response.json())
      .then((responseData) => {
        console.log(responseData);
        setList(responseData);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const handleSave = (content) => {
    if (content.trim() === "") {
      console.error("Ошибка при сохранении данных: содержимое пусто");
      return;
    }
  
    fetch("http://localhost:3000", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: content }),
    })
      .then((response) => response.json())
      .then(() => {
        // Обновляем список, используя форму функции обратного вызова для setList
        setList((prevList) => {
          const newList = [...prevList]; // Создаем новый массив, чтобы избежать прямого изменения состояния
          // Запрашиваем обновленный список снова
          fetch("http://localhost:3000")
            .then((response) => response.json())
            .then((responseData) => {
              if (Array.isArray(responseData)) {
                // Обновляем список с последними данными
                return [...responseData];
              } else {
                console.error("Недопустимый формат ответа:", responseData);
                return prevList; // Возвращаем предыдущий список, если ответ недействителен
              }
            })
            .then((updatedList) => {
              setList(updatedList); // Устанавливаем состояние с обновленным списком
            });
          return newList; // Мгновенно возвращаем предыдущий список для обновления интерфейса
        });
      });
  };
  
  

  const handleDelete = (key) => {
    fetch(`http://localhost:3000/?id=${list[key].id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          let arr = Array.from(list);
          arr.splice(key, 1);
          setList(arr);
        } else {
          console.error("Failed to delete:", response.status, response.statusText);
        }
      })
      .catch((error) => {
        console.error("Error deleting data:", error);
      });
  };

  const handleRegisterClick = async () => {
    try {
      const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, confirmPassword }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Registration successful:', data);
        setRegistrationComplete(true);
        setAuthStep('login');
      } else {
        console.error('Registration failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error during registration:', error);
    }
  };
  

  const handleLoginClick = async () => {
    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Login successful:', data);
        setLoginStatus(true);
        setAuthStep('tasks'); // Сброс статуса регистрации
      } else {
        console.error('Login failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };
  
  useEffect(() => {
    if (registrationComplete) {
      console.log("Registration complete:", registrationComplete);
    }
  }, [registrationComplete]);
  

  useEffect(() => {
    if (loginStatus) {
      fetchTasks();
    }
  }, [loginStatus]);

  const fetchTasks = () => {
    fetch("http://localhost:3000")
      .then((response) => response.json())
      .then((responseData) => {
        console.log(responseData);
        setList(responseData);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  return (
    <div className="list-container">
      {authStep === 'registration' && !registrationComplete && (

        <>
          <h3>Регистрация</h3>
          <div>
            <input
              type="email"
              placeholder="Электронная почта"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Подтверждение пароля"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button onClick={() => { handleRegisterClick(); }}>Зарегистрироваться</button>
        </>
      )}
  
  {authStep === 'login' && registrationComplete && !userCredentialsEntered && (
        <>
          <h3>Вход</h3>
          <div>
            <input
              type="email"
              placeholder="Электронная почта"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button onClick={() => { handleLoginClick(); }}>Войти</button>
        </>
      )}
  
  {authStep === 'tasks' && loginStatus && (
        <>
          <h3>Добавить новую задачу</h3>
          <CreateComponent onSave={(content) => handleSave(content)} className="task-input" />
  
          <button onClick={() => setShowTasks(!showTasks)}>
            {showTasks ? "Скрыть задачи" : "Показать все задачи"}
          </button>
  
          {showTasks && <ViewTasks />}
  
          <div className="chat-container">
            <h3>Чат</h3>
            <CreateComponent
              onSave={(content) => handleSendMessage(content)}
              buttonText="Отправить"
              className="chat-input"
              style={{
                width: "100%",
                boxSizing: "border-box",
                marginTop: "10px",
                padding: "10px",
                fontSize: "14px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <button onClick={handleClearChat}>Очистить чат</button>
            <div className="chat-messages">
              {chatMessages.map((message, index) => (
                <div key={index} className={message.sentByUser ? "user-message" : "other-message"}>
                  {message.content}
                </div>
              ))}
            </div>
          </div>
  
          {list &&
            list.map((item, key) => {
              if (!item) return null;
              return <ItemComponent key={item.id} data={item} onDelete={() => handleDelete(key)} />;
            })}
        </>
      )}
    </div>
  );
  
  
};

export default ListComponent;