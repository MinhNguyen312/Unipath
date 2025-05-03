import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChartOutlined, 
  BankOutlined, 
  SearchOutlined, 
  FireOutlined, 
  CheckCircleOutlined, 
  RocketOutlined, 
  SwapOutlined, 
  RightCircleOutlined 
} from '@ant-design/icons';

import {
  Layout,
  Button,
  Typography,
  Row,
  Col,
  Card,
  Space,
  Tag,
} from 'antd';
import './styles.css';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

// Stats data
const stats = [
  { number: '150+', label: 'Trường đại học' },
  { number: '1000+', label: 'Ngành học' },
];

// Feature cards data
const featureCards = [
  {
    icon: <SearchOutlined style={{ fontSize: 28, color: '#1E894E' }} />,
    title: 'Dự đoán điểm chuẩn',
    description: 'Dự đoán điểm chuẩn của các trường đại học'
  },
  {
    icon: <BankOutlined style={{ fontSize: 28, color: '#1E894E' }} />,
    title: 'Chọn Trường',
    description: 'Nhập điểm và gợi ý trường phù hợp'
  },
  {
    icon: <BarChartOutlined style={{ fontSize: 28, color: '#1E894E' }} />,
    title: 'Phân Tích Điểm',
    description: 'Tổng hợp phân tích điểm của các trường trên toàn quốc từ 2021'
  },
  {
    icon: <SwapOutlined style={{ fontSize: 28, color: '#1E894E' }} />,
    title: 'So sánh ngành',
    description: 'Chọn trường và so sánh điểm chuẩn của ngành'
  }
];

// Steps data
const steps = [
  {
    icon: <SearchOutlined style={{ fontSize: 36, color: '#1E894E' }} />,
    title: 'Nhập Điểm Của Bạn',
    description: 'Nhập điểm thi hoặc điểm dự đoán của các môn học để bắt đầu'
  },
  {
    icon: <BarChartOutlined style={{ fontSize: 36, color: '#1E894E' }} />,
    title: 'Xem Phân Tích',
    description: 'Nhận phân tích chi tiết về các trường và ngành phù hợp với điểm của bạn'
  },
  {
    icon: <RightCircleOutlined style={{ fontSize: 36, color: '#1E894E' }} />,
    title: 'Đưa Ra Quyết Định',
    description: 'So sánh các lựa chọn và quyết định trường đại học phù hợp nhất với bạn'
  }
];

const Landing: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Layout>
      <Content>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-gradient-top"></div>
          <div className="hero-gradient-bottom"></div>
          
          <Row gutter={[48, 0]} align="middle">
            <Col xs={24} md={14}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Tag color='#1E894E' className="hero-tag">
                    <FireOutlined /> Mùa tuyển sinh 2025
                  </Tag>
                  <Title level={1} className="hero-title">
                    Cùng học sinh THPT <span className="text-primary">vượt qua</span> kỳ thi Đại Học
                  </Title>
                  <Paragraph className="hero-paragraph">
                    Unipath giúp học sinh Việt Nam định hướng kết quả kỳ thi tốt nghiệp Trung học Phổ thông và tìm kiếm trường đại học phù hợp nhất
                  </Paragraph>
                  
                  <Space size="middle">
                    <Button 
                      type="primary" 
                      size="large" 
                      icon={<SearchOutlined />}
                      className="primary-button"
                      onClick={() => navigate('/find_school')}
                    >
                      Tìm Trường Phù Hợp
                    </Button>
                    <Button 
                      size="large" 
                      className="outline-button"
                      onClick={() => navigate('/analytics')}
                    >
                      Phân tích điểm
                    </Button>
                  </Space>
                </div>

                <div className="stats-container">
                  <Row gutter={[24, 16]}>
                    {stats.map((stat, index) => (
                      <Col 
                        key={index} 
                        span={8}
                        xs={24}
                        sm={12}
                        md={8}
                        className='col-mobile-margin'
                      >
                        <Space align="center">
                          <CheckCircleOutlined className="icon-check" />
                          <Typography.Text strong>{stat.number}</Typography.Text>
                          <Typography.Text>{stat.label}</Typography.Text>
                        </Space>
                      </Col>
                    ))}
                  </Row>
                </div>
              </Space>
            </Col>
            
            <Col xs={24} md={10}>
              <div className="form-card">
                <div className="form-card-gradient"></div>
                
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Title level={4} style={{ marginTop: 0 }}>Bắt đầu tìm kiếm ngay</Title>
                  <div>
                    <Typography.Text>Nhập điểm thi hoặc điểm dự đoán:</Typography.Text>
                    <div className="search-placeholder">
                      <RocketOutlined className="search-icon" />
                      <Typography.Text className="search-text">
                        Tra cứu dễ dàng với các công cụ tìm kiếm
                      </Typography.Text>
                    </div>
                  </div>
                  <Button type="primary" block className="primary-button" onClick={() => navigate('/find_school')}>
                    Bắt đầu ngay
                  </Button>
                </Space>
              </div>
            </Col>
          </Row>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <Title level={2} className="section-title">Các Tính Năng</Title>
          <Paragraph className="section-description">
            Unipath cung cấp các tính năng giúp học sinh 
          </Paragraph>

          <Row gutter={[32, 32]} justify="center">
            {featureCards.map((feature, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card 
                  hoverable
                  className="feature-card"
                  bodyStyle={{ 
                    padding: '30px 24px',
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    textAlign: 'center' 
                  }}
                >
                  <div className="feature-icon-circle">
                    {feature.icon}
                  </div>
                  <Title level={4} className="feature-title">{feature.title}</Title>
                  <Typography.Text className="feature-description">{feature.description}</Typography.Text>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works-section">
          <Title level={2} className="section-title">Cách Unipath Hoạt Động</Title>
          <Paragraph className="section-description">
            Ba bước đơn giản để tìm trường đại học phù hợp với bạn
          </Paragraph>

          <Row gutter={[48, 48]} justify="center">
            {steps.map((step, index) => (
              <Col xs={24} md={8} key={index}>
                <div className="step-container">
                  <div className="step-icon-circle">
                    <div className="step-number">{index + 1}</div>
                    {step.icon}
                  </div>
                  <Title level={4}>{step.title}</Title>
                  <Typography.Text className="step-description">
                    {step.description}
                  </Typography.Text>
                </div>
              </Col>
            ))}
          </Row>
        </section>
      </Content>
    </Layout>
  );
}

export default Landing;