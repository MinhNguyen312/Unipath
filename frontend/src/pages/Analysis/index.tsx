import React from 'react';
import { Layout } from 'antd';
import './styles.css';
const { Content } = Layout;
import TableauEmbed from '../../components/Tableau/TableauEmbed';


const Analysis: React.FC = () => {
  return (
    <Layout>
      <Content className="finder-content" style={{ backgroundColor: 'white' }}>
        <TableauEmbed />
      </Content>
    </Layout>
  );
};

export default Analysis; 