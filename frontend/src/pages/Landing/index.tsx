import { BarChartOutlined, BankOutlined, SearchOutlined, FireOutlined, CheckCircleOutlined, RocketOutlined, SwapOutlined, RightCircleOutlined } from '@ant-design/icons';
import {
    Layout,
    Button,
    Typography,
    Row,
    Col,
    Card,
    Space,
    Tag,
} from 'antd'

import './styles.css'

const {Content} = Layout;
const {Title, Paragraph} = Typography;



const Landing: React.FC = () =>{


    //  Stats Data
    const stats = [
        { number: '150+', label: 'Trường đại học' },
        { number: '1000+', label: 'Ngành học' },
      ];


    return(
        <Layout>
            <Content>
                {/* Hero Section */}
                <section style={{ 
                padding: '80px 50px', 
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                position: 'relative',
                overflow: 'hidden'
                }}>
                <div style={{ position: 'absolute', right: -100, top: -100, width: 300, height: 300, background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0) 70%)', borderRadius: '50%' }}></div>
                <div style={{ position: 'absolute', left: -50, bottom: -50, width: 200, height: 200, background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0) 70%)', borderRadius: '50%' }}></div>
                
                <Row gutter={[48, 0]} align="middle">
                    <Col xs={24} md={14}>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <div>
                        <Tag color='#1E894E' style={{ fontSize: '14px', padding: '2px 10px', marginBottom: 16, borderRadius: 4 }}>
                            <FireOutlined /> Mùa tuyển sinh 2025
                        </Tag>
                        <Title level={1} style={{ 
                            fontSize: '44px',
                            marginTop: 0,
                            marginBottom: 16,
                            fontWeight: 700, 
                            color: '#333',
                            lineHeight: 1.2
                        }}>
                            Cùng học sinh THPT <span style={{ color: '#1E894E' }}>vượt qua</span> kỳ thi Đại Học
                        </Title>
                        <Paragraph style={{ fontSize: '18px', lineHeight: 1.6, marginBottom: 24, color: '#666' }}>
                            Unipath giúp học sinh Việt Nam định hướng kết quả kỳ thi tốt nghiệp Trung học Phổ thông và tìm kiếm trường đại học phù hợp nhất
                        </Paragraph>
                        
                        <Space size="middle">
                            <Button 
                            type="primary" 
                            size="large" 
                            icon={<SearchOutlined />}
                            style={{ 
                                backgroundColor: '#1E894E',
                                height: 48, 
                                borderRadius: 8,
                                border: 'none',
                                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
                            }}
                            >
                            Tìm Trường Phù Hợp
                            </Button>
                            <Button 
                            size="large" 
                            style={{ 
                                height: 48, 
                                borderRadius: 8,
                                borderColor: '#1E894E',
                                color: '#1E894E'
                            }}
                            >
                            Phân tích điểm
                            </Button>
                        </Space>
                        </div>

                        <div style={{ marginTop: 24, marginBottom: 24 }}>
                            <Row gutter={[24, 16]}>
                                {stats.map((stat, index) => (
                                <Col 
                                key={index} 
                                span={8}
                                xs={24}
                                sm={12}
                                md={8}
                                className='col-mobile-margin'>
                                    <Space align="center">
                                    <CheckCircleOutlined style={{ color: '#1E894E' }} />
                                    <Typography.Text strong >{stat.number}</Typography.Text>
                                    <Typography.Text>{stat.label}</Typography.Text>
                                    </Space>
                                </Col>
                                ))}
                            </Row>
                        </div>
                    </Space>
                    </Col>
                    
                    <Col xs={24} md={10}>
                    <div style={{ 
                        background: '#fff', 
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)', 
                        borderRadius: 12,
                        padding: 40,
                        height: '100%',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ position: 'absolute', right: -20, top: -20, width: 100, height: 100, background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0) 70%)', borderRadius: '50%' }}></div>
                        
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <Title level={4} style={{ marginTop: 0 }}>Bắt đầu tìm kiếm ngay</Title>
                        <div>
                        <Typography.Text>Nhập điểm thi hoặc điểm dự đoán:</Typography.Text>
                            <div
                                style={{
                                height: 160,
                                marginTop: 16,
                                padding: '16px', 
                                background: 'rgba(16, 185, 129, 0.05)',
                                borderRadius: 8,
                                border: '1px dashed rgba(16, 185, 129, 0.3)',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                flexDirection: 'column',
                                textAlign: 'center', 
                                }}
                            >
                                <RocketOutlined
                                style={{
                                    fontSize: 32,
                                    color: '#1E894E',
                                    marginBottom: 16,
                                }}
                                />
                                <Typography.Text style={{ color: '#666' }}>
                                Tra cứu dễ dàng với các công cụ tìm kiếm
                                </Typography.Text>
                            </div>
                        </div>
                        <Button 
                            type="primary" 
                            block 
                            style={{ 
                            background: '#1E894E', 
                            height: 48,
                            borderRadius: 8,
                            border: 'none'
                            }}
                        >
                            Bắt đầu ngay
                        </Button>
                        </Space>
                    </div>
                    </Col>
                </Row>
                </section>

                <section style={{ 
                padding: '80px 50px', 
                background: '#f9fafb' 
                }}>
                <Title level={2} style={{ textAlign: 'center', marginBottom: 16 }}>Các Tính Năng</Title>
                <Paragraph style={{ textAlign: 'center', fontSize: '18px', marginBottom: 60, color: '#666', maxWidth: '700px', margin: '0 auto 60px auto' }}>
                    Unipath cung cấp các tính năng giúp học sinh 
                </Paragraph>

                <Row gutter={[32, 32]} justify="center">
                    <Col xs={24} sm={12} lg={6}>
                    <Card 
                        hoverable
                        style={{ 
                        height: '100%',
                        borderRadius: 12,
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        }}
                        bodyStyle={{ 
                        padding: '30px 24px',
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        textAlign: 'center' 
                        }}
                    >
                        <div style={{ 
                        width: 64, 
                        height: 64, 
                        borderRadius: '50%', 
                        background: 'rgba(16, 185, 129, 0.1)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        marginBottom: 20
                        }}>
                        <SearchOutlined style={{ fontSize: 28, color: '#1E894E' }} />
                        </div>
                        <Title level={4} style={{ marginTop: 0, marginBottom: 12 }}>Dự đoán điểm chuẩn</Title>
                        <Typography.Text style={{ color: '#666' }}>Dự đoán điểm chuẩn của các trường đại học</Typography.Text>
                    </Card>
                    </Col>
                    
                    <Col xs={24} sm={12} lg={6}>
                    <Card 
                        hoverable
                        style={{ 
                        height: '100%',
                        borderRadius: 12,
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        }}
                        bodyStyle={{ 
                        padding: '30px 24px',
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        textAlign: 'center' 
                        }}
                    >
                        <div style={{ 
                        width: 64, 
                        height: 64, 
                        borderRadius: '50%', 
                        background: 'rgba(16, 185, 129, 0.1)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        marginBottom: 20
                        }}>
                        <BankOutlined style={{ fontSize: 28, color: '#1E894E' }} />
                        </div>
                        <Title level={4} style={{ marginTop: 0, marginBottom: 12 }}>Chọn Trường</Title>
                        <Typography.Text style={{ color: '#666' }}>Nhập điểm và gợi ý trường phù hợp</Typography.Text>
                    </Card>
                    </Col>
                    
                    <Col xs={24} sm={12} lg={6}>
                    <Card 
                        hoverable
                        style={{ 
                        height: '100%',
                        borderRadius: 12,
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        }}
                        bodyStyle={{ 
                        padding: '30px 24px',
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        textAlign: 'center' 
                        }}
                    >
                        <div style={{ 
                        width: 64, 
                        height: 64, 
                        borderRadius: '50%', 
                        background: 'rgba(16, 185, 129, 0.1)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        marginBottom: 20
                        }}>
                        <BarChartOutlined style={{ fontSize: 28, color: '#1E894E' }} />
                        </div>
                        <Title level={4} style={{ marginTop: 0, marginBottom: 12 }}>Phân Tích Điểm</Title>
                        <Typography.Text style={{ color: '#666' }}>Tổng hợp phân tích điểm của các trường trên toàn quốc từ 2021</Typography.Text>
                    </Card>
                    </Col>
                    
                    <Col xs={24} sm={12} lg={6}>
                    <Card 
                        hoverable
                        style={{
                        height: '100%',
                        borderRadius: 12,
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        }}
                        bodyStyle={{ 
                        padding: '30px 24px',
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        textAlign: 'center' 
                        }}
                    >
                        <div style={{ 
                        width: 64, 
                        height: 64, 
                        borderRadius: '50%', 
                        background: 'rgba(16, 185, 129, 0.1)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        marginBottom: 20
                        }}>
                        <SwapOutlined style={{ fontSize: 28, color: '#1E894E' }} />
                        </div>
                        <Title level={4} style={{ marginTop: 0, marginBottom: 12 }}>So sánh ngành</Title>
                        <Typography.Text style={{ color: '#666' }}>Chọn trường và so sánh điểm chuẩn của ngành</Typography.Text>
                    </Card>
                    </Col>
                </Row>
                </section>

                {/* How It Works */}
                <section style={{ padding: '80px 50px', background: '#fff' }}>
                <Title level={2} style={{ textAlign: 'center', marginBottom: 16 }}>Cách Unipath Hoạt Động</Title>
                <Paragraph style={{ textAlign: 'center', fontSize: '18px', marginBottom: 60, color: '#666', maxWidth: '700px', margin: '0 auto 60px auto' }}>
                    Ba bước đơn giản để tìm trường đại học phù hợp với bạn
                </Paragraph>

                <Row gutter={[48, 48]} justify="center">
                    <Col xs={24} md={8}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                        width: 80, 
                        height: 80, 
                        borderRadius: '50%', 
                        background: 'rgba(16, 185, 129, 0.1)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        margin: '0 auto 24px auto',
                        position: 'relative'
                        }}>
                        <div style={{ 
                            position: 'absolute', 
                            top: -10, 
                            right: -10, 
                            width: 30, 
                            height: 30, 
                            borderRadius: '50%', 
                            background: '#1E894E', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 'bold'
                        }}>1</div>
                        <SearchOutlined style={{ fontSize: 36, color: '#1E894E' }} />
                        </div>
                        <Title level={4}>Nhập Điểm Của Bạn</Title>
                        <Typography.Text style={{ color: '#666' }}>
                        Nhập điểm thi hoặc điểm dự đoán của các môn học để bắt đầu
                        </Typography.Text>
                    </div>
                    </Col>
                    
                    <Col xs={24} md={8}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                        width: 80, 
                        height: 80, 
                        borderRadius: '50%', 
                        background: 'rgba(16, 185, 129, 0.1)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        margin: '0 auto 24px auto',
                        position: 'relative'
                        }}>
                        <div style={{ 
                            position: 'absolute', 
                            top: -10, 
                            right: -10, 
                            width: 30, 
                            height: 30, 
                            borderRadius: '50%', 
                            background: '#1E894E', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 'bold'
                        }}>2</div>
                        <BarChartOutlined style={{ fontSize: 36, color: '#1E894E' }} />
                        </div>
                        <Title level={4}>Xem Phân Tích</Title>
                        <Typography.Text style={{ color: '#666' }}>
                        Nhận phân tích chi tiết về các trường và ngành phù hợp với điểm của bạn
                        </Typography.Text>
                    </div>
                    </Col>
                    
                    <Col xs={24} md={8}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                        width: 80, 
                        height: 80, 
                        borderRadius: '50%', 
                        background: 'rgba(16, 185, 129, 0.1)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        margin: '0 auto 24px auto',
                        position: 'relative'
                        }}>
                        <div style={{ 
                            position: 'absolute', 
                            top: -10, 
                            right: -10, 
                            width: 30, 
                            height: 30, 
                            borderRadius: '50%', 
                            background: '#1E894E', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 'bold'
                        }}>3</div>
                        <RightCircleOutlined style={{ fontSize: 36, color: '#1E894E' }} />
                        </div>
                        <Title level={4}>Đưa Ra Quyết Định</Title>
                        <Typography.Text style={{ color: '#666' }}>
                        So sánh các lựa chọn và quyết định trường đại học phù hợp nhất với bạn
                        </Typography.Text>
                    </div>
                    </Col>
                </Row>
                </section>
            </Content>
        </Layout>
    );
}

export default Landing;