import React, { useState, useEffect } from 'react';
import { Layout, Affix, Menu, Typography} from 'antd';
import { HomeOutlined, BarChartOutlined, SearchOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import './styles.css';

const { Header } = Layout;

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const menuItems = [
    { key: '1', icon: <HomeOutlined />, label: <Link to={ROUTES.HOME}> Trang Chủ</Link>, path: ROUTES.HOME },
    { key: '2', icon: <BarChartOutlined />, label: <Link to={ROUTES.ANALYSIS}> Phân Tích</Link>, path: ROUTES.ANALYSIS },
    { key: '3', icon: <SearchOutlined />, label: <Link to={ROUTES.FIND_SCHOOL}> Tìm Trường</Link>, path: ROUTES.FIND_SCHOOL },
  ];

  const getCurrentMenuKey = () => {
    const path = location.pathname;
    if (path.startsWith(ROUTES.ANALYSIS)) return '2';
    if (path.startsWith(ROUTES.FIND_SCHOOL)) return '3';
    return '1';
  };

  const renderMenu = (
    <Menu
      mode={isMobile ? 'vertical' : 'horizontal'}
      selectedKeys={[getCurrentMenuKey()]}
      items={menuItems}
      style={{
        background: isMobile ? '#fff' : 'transparent',
        border: 'none',
        flex: 1,
        justifyContent: 'flex-end',
      }}
    />
  );

  return (
    <Layout>
      <Affix>
        <Header
          style={{
            background: scrolled ? 'white' : 'transparent',
            boxShadow: scrolled ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none',
            transition: 'all 0.3s ease',
            zIndex: 1000,
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div className="logo" style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: 40,
                height: 40,
                backgroundColor: '#1E894E',
                borderRadius: '50%',
                marginRight: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
            <Typography.Title
              level={isMobile ? 5 : 4}
              style={{
                margin: 0,
                color: '#1E894E',
                fontSize: isMobile ? 18 : undefined,
              }}
            >
              Unipath
            </Typography.Title>
          </div>

          {isMobile ? (
            <>
              <div style={{ display: 'flex', gap: 24 }}>
                {menuItems.map((item) => (
                    <Link
                        to={item.path}
                        style={{
                        color: getCurrentMenuKey() === item.key ? '#1E894E' : '#555',
                        fontSize: 20,
                        transition: 'color 0.2s',
                        }}
                    >
                        {item.icon}
                    </Link>
          ))}
        </div>
            </>
          ) : (
            renderMenu
          )}
        </Header>
      </Affix>
    </Layout>
  );
};

export default Navbar;
