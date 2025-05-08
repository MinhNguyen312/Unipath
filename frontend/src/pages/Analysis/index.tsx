import React from 'react';
import { Layout } from 'antd';
import './styles.css';
import SchoolCompare from '../../components/SchoolCompare/SchoolCompare';
const { Content } = Layout;
import TableauEmbed from '../../components/Tableau/TableauEmbed';
import { Card } from 'antd';

const Analysis: React.FC = () => {
  return (
    <Layout>
      <Content>
        <Card style={{width: '100%', height: '120%'}}>
          <TableauEmbed />
        </Card>
      </Content>
    </Layout>
  );
};

export default Analysis; 