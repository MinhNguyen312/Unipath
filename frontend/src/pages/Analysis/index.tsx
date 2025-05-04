import React from 'react';
import { Layout } from 'antd';
import './styles.css';
const { Content } = Layout;
import TableauEmbed from '../../components/Tableau/TableauEmbed';


const Analysis: React.FC = () => {
  return (
    <Layout>
      <Content className="finder-content" style={{ backgroundColor: 'white' }}>
        {/* <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
            <a href='#'>
              <img alt='Dashboard' src='https://public.tableau.com/static/images/Un/Unipath/Chung/1.png' />
            </a>
        </div> */}
        <TableauEmbed />
      </Content>
    </Layout>
  );
};

export default Analysis; 