import React from 'react';
import ListComponent from './components/ListComponent';

function App() {
  // const appStyle = {
  //   display: 'flex',
  //   flexDirection: 'column',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   backgroundColor: '#f0f8ff',
  // };

  // const headerStyle = {
  //   fontSize: '30px',
  //   marginBottom: '20px',
  //   color: '#007bff', 
  // };

  return (
    <div>
      {/* <div style={appStyle}> */}
      <h1 /* style={headerStyle} */>Список задач</h1>
      {/* </div> */}
      <ListComponent number={1} />
    </div>
  );
}

export default App;
