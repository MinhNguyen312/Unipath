import React from 'react';
import { Layout } from 'antd';
import './styles.css';
import SchoolCompare from '../../components/SchoolCompare/SchoolCompare';
const { Content } = Layout;


const Analysis: React.FC = () => {
  return (
    <Layout>
      <Content className="analysis-content">
        <SchoolCompare />
      </Content>
    </Layout>
  );
};

export default Analysis; 