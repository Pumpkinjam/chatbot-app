import React from "react";
import { Typography, Icon } from 'antd';
import Chatbot from './Chatbot/Chatbot';
const { Title } = Typography;

function App() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
       
        <Chatbot />


      </div>
    </div>
  )
}

export default App
