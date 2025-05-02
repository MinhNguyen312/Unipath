import React from 'react';
import { Layout } from 'antd';
import SchoolComparison from '../../components/SchoolCompare/SchoolCompare';
import './styles.css';
import ChatbotWidget from '../../components/Chatbot/ChatbotWidget';
const { Content } = Layout;

const Finder: React.FC = () => {
  return (
    <Layout>
      <Content className="finder-content">
        <SchoolComparison />
        <ChatbotWidget />
      </Content>
    </Layout>
  );
};

export default Finder; 