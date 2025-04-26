import { Layout, Typography, Row, Col, Space, Divider} from "antd";
import { FacebookOutlined, InstagramOutlined, YoutubeOutlined, LinkedinOutlined, EnvironmentOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";



const {Footer} = Layout;
const {Paragraph, Title, Text} = Typography;

const AppFooter: React.FC = () => {
    return(
        <Footer style={{ 
            background: '#111827', 
            padding: '60px 50px 30px',
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            <Row gutter={[48, 32]}>
              <Col xs={24} md={8}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ 
                    width: 40, 
                    height: 40, 
                    backgroundColor: '#10B981', 
                    borderRadius: '50%',
                    marginRight: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}></div>
                  <Typography.Title level={4} style={{ margin: 0, color: '#fff' }}>
                    Unipath
                  </Typography.Title>
                </div>
                <Paragraph style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Unipath giúp học sinh Việt Nam định hướng kết quả kỳ thi tốt nghiệp Trung học Phổ thông và tìm kiếm trường đại học phù hợp nhất
                </Paragraph>
                <Space size="large" style={{ marginTop: 24 }}>
                  <a href="#" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 18 }}>
                    <FacebookOutlined />
                  </a>
                  <a href="#" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 18 }}>
                    <InstagramOutlined />
                  </a>
                  <a href="#" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 18 }}>
                    <YoutubeOutlined />
                  </a>
                  <a href="#" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 18 }}>
                    <LinkedinOutlined />
                  </a>
                </Space>
              </Col>
              
              <Col xs={24} md={5}>
                <Title level={5} style={{ color: '#fff', marginBottom: 20 }}>Tính năng</Title>
                <Space direction="vertical" size="middle" style={{ display: 'flex', color: 'rgba(255, 255, 255, 0.7)' }}>
                  <a href="#" style={{ color: 'inherit' }}>Dự đoán điểm chuẩn</a>
                  <a href="#" style={{ color: 'inherit' }}>Chọn trường</a>
                  <a href="#" style={{ color: 'inherit' }}>Phân tích điểm</a>
                  <a href="#" style={{ color: 'inherit' }}>So sánh ngành</a>
                </Space>
              </Col>
              
              <Col xs={24} md={5}>
                <Title level={5} style={{ color: '#fff', marginBottom: 20 }}>Hỗ trợ</Title>
                <Space direction="vertical" size="middle" style={{ display: 'flex', color: 'rgba(255, 255, 255, 0.7)' }}>
                  <a href="#" style={{ color: 'inherit' }}>FAQ</a>
                  <a href="#" style={{ color: 'inherit' }}>Liên hệ</a>
                  <a href="#" style={{ color: 'inherit' }}>Hướng dẫn</a>
                  <a href="#" style={{ color: 'inherit' }}>Chính sách</a>
                </Space>
              </Col>
              
              <Col xs={24} md={6}>
                <Title level={5} style={{ color: '#fff', marginBottom: 20 }}>Liên hệ</Title>
                <Space direction="vertical" size="middle" style={{ display: 'flex', color: 'rgba(255, 255, 255, 0.7)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <EnvironmentOutlined style={{ marginRight: 10, marginTop: 4 }} />
                    <span>123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <MailOutlined style={{ marginRight: 10 }} />
                    <span>contact@unipath.vn</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <PhoneOutlined style={{ marginRight: 10 }} />
                    <span>+84 28 1234 5678</span>
                  </div>
                </Space>
              </Col>
            </Row>
            
            <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.1)', margin: '40px 0 24px' }} />
            
            <Row justify="space-between" align="middle">
              <Col xs={24} md={12}>
                <Text style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  © 2025 Unipath. All rights reserved.
                </Text>
              </Col>
              <Col xs={24} md={12} style={{ textAlign: 'right' }}>
                <Space split={<Divider type="vertical" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />}>
                  <a href="#" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Điều khoản sử dụng</a>
                  <a href="#" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Chính sách bảo mật</a>
                  <a href="#" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Cookie</a>
                </Space>
              </Col>
            </Row>
          </Footer>
    )
}

export default AppFooter;