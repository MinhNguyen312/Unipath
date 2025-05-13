import { Layout, Card, Typography, Form, InputNumber,Button, Table, Select, Row, Col } from "antd";
import React, {useState} from "react";
import type { ColumnsType } from 'antd/es/table';
import { universities } from "../../data/universities";
import { evaluationCombinations } from "../../data/evaluationCombinations";
import SchoolComparison from "../../components/SchoolCompare/SchoolCompare";

const {Title} = Typography;
const {Content} = Layout;



  interface University {
    name: string;
    requiredScore: number;
    location: string;
    code: string;
    major: string;
    acceptedCombinations: string[];
  }
  
  interface FormValues {
    combination: string;
    [subject: string]: any;
  }
  
  
  

const FindSchool : React.FC = () => {

    
    const [selectedCombo, setSelectedCombo] = useState<string | null>(null);
    const [subjects, setSubjects] = useState<string[]>([]);
    const [results, setResults] = useState<University[]>([]);
  
    const onComboChange = (value: string) => {
      const combo = evaluationCombinations.find((item) => item.label === value);
      setSelectedCombo(value);
      setSubjects(combo ? combo.value : []);
    };
  
    const onFinish = (values: FormValues) => {
      const totalScore = subjects.reduce((sum, subject) => {
        const subjectScore = parseFloat(values[subject]) || 0;
        return sum + subjectScore;
      }, 0);
  
      const matches = universities.filter(
        (uni) =>
          selectedCombo &&
          uni.acceptedCombinations.includes(selectedCombo) &&
          totalScore >= uni.requiredScore
      );
      setResults(matches);
    };
  
    const columns: ColumnsType<University> = [
      { title: 'Tên Trường', dataIndex: 'name', key: 'name' },
      { title: 'Mã Ngành', dataIndex:'code', key: 'code'},
      { title: 'Ngành', dataIndex: 'major', key: 'major' },
      {
        title: 'Tổ hợp',
        dataIndex: 'acceptedCombinations',
        key: 'acceptedCombinations',
        render: (combos: string[]) => combos.join(', '),
      },
      { title: 'Điểm Chuẩn', dataIndex: 'requiredScore', key: 'requiredScore' },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ marginTop: '20px' }}>
          <Card style={{ maxWidth: '100%', marginLeft: '10%', marginRight: '10%' }}>
            <Title level={3} style={{color:'#1e894e'}}>Tìm Trường Đại Học</Title>
      
            <Row gutter={[24, 24]} justify="center">
              {/* Left Column: Form (Smaller width) */}
              <Col xs={24} lg={8}>
                <Card>
                  <Form
                    layout="horizontal"  // Compact form layout
                    onFinish={onFinish}
                  >
                    <Form.Item
                        label="Chọn tổ hợp xét tuyển"
                        name="combination"
                        
                        rules={[{ required: true, message: 'Please select a combination' }]}
                    >
                      <Select
                        placeholder="Select a combination (e.g., A00)"
                        onChange={onComboChange}
                        options={evaluationCombinations.map((item) => ({
                          label: item.label,
                          value: item.label,
                        }))}
                      />
                    </Form.Item>
      
                    {/* Map through subjects and generate score inputs */}
                    {subjects.map((subject) => (
                      <Form.Item
                        key={subject}
                        label={`${subject}`}
                        name={subject}
                        labelCol={{ span: 6 }}  
                        wrapperCol={{ span: '100%' }}
                        labelAlign="left"  
                        rules={[{ required: true, message: `Hãy điền điểm thi ${subject}` }]}
                      >
                        <InputNumber
                          min={0}
                          max={10}
                          step={0.25}
                          style={{ width: '100%' }}  // Fixed width to make inputs compact
                        />
                      </Form.Item>
                    ))}
      
                    {subjects.length > 0 && (
                      <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                          Tìm Trường
                        </Button>
                      </Form.Item>
                    )}
                  </Form>
                </Card>
              </Col>
      
              {/* Right Column: Results (Larger width) */}
              <Col xs={24} lg={16}>
                <Card>
                  {results.length > 0 ? (
                    <>
                      <Title level={4} style={{color:'#1e894e'}}>Trường Đại Học Phù Hợp</Title>
                      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <Table
                          dataSource={results}
                          columns={columns}
                          rowKey={(record) => `${record.name}-${record.major}`}
                          pagination={false}
                          scroll={{ x: 'max-content' }}
                        />
                      </div>
                    </>
                  ) : selectedCombo ? (
                    <p>Không tìm thấy trường phù hợp</p>
                  ) : null}
                </Card>
              </Col>
            </Row>
          </Card>
          <Card style={{ maxWidth: '100%', marginLeft: '10%', marginRight: '10%', marginTop: '20px',marginBottom: '20px' }}>
            <SchoolComparison/>
          </Card>

        </Content>
      </Layout>      
    )
}

export default FindSchool;