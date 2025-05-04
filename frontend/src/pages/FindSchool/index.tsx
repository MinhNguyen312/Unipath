import { Layout, Card, Typography, Form, InputNumber,Button, Table, Select, Row, Col, Radio, RadioChangeEvent } from "antd";
import React, {useState} from "react";
import type { ColumnsType } from 'antd/es/table';
import { evaluationCombinations } from "../../data/evaluationCombinations";
import axios from "axios";

const {Title} = Typography;
const {Content} = Layout;

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";


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
    [subject: string]: string;
  }

  
  const examCombination = [
    {label: "KHTN", value: ["Toán", "Ngữ Văn", "Anh Văn", "Vật Lý","Hóa Học", "Sinh Học"]},
    {label: "KHXH", value: ["Toán", "Ngữ Văn", "Anh Văn", "Lịch Sử", "GDCD", "Địa Lí"]}
  ]

const FindSchool : React.FC = () => {

    
    const [selectedCombo, setSelectedCombo] = useState<string | null>("A00");
    const [subjects, setSubjects] = useState<string[]>([]);
    const [results, setResults] = useState<University[]>([]);
    const [findMode, setFindMode] = useState<string>("combination"); 



    const onComboChange = (value: string) => {

      if(findMode === "combination"){
        const combo = evaluationCombinations.find((item) => item.label === value);
        setSelectedCombo(value);
        setSubjects(combo ? combo.value : []);
      } else {
        const combo = examCombination.find((item) => item.label === value);
        setSelectedCombo(value);
        setSubjects(combo ? combo.value : []);
      }      
    };
  

    const onFinish = async (values: FormValues) => {  
        console.log(values);
      if(findMode === "combination"){
        let scores: Record<string,string> = {}

        subjects.forEach(item => {
          scores[item] = values[item];
        })

        try {
          const res = await axios.post(`${API_BASE_URL}/api/universities/match`,{
            scores
          })

          setResults(res.data);
        } catch(error) {
          console.error("Failed to fetch matched universities:", error);
        }
        
      } else {
        let scores = {};

        switch(selectedCombo){
          case "KHTN":
            scores = {
              "Toán": values["Toán"],
              "Ngữ Văn": values["Ngữ Văn"],
              "Anh Văn": values["Anh Văn"],
              "Vật Lý": values["Vật Lý"],
              "Hóa Học": values["Hóa Học"],
              "Sinh Học": values["Sinh Học"],
            };
            break;
          case "KHXH":
            scores = {
              "Toán": values["Toán"],
              "Ngữ Văn": values["Ngữ Văn"],
              "Anh Văn": values["Anh Văn"],
              "Địa Lí": values["Địa Lí"],
              "Lịch Sử": values["Lịch Sử"],
              "GDCD": values["GDCD"],
            }
        }

        console.log(scores);
        

        try {
          const res = await axios.post(`${API_BASE_URL}/api/universities/match`, {
            scores
          },
          
        );
    
          setResults(res.data); // Assuming API returns an array of matches
        } catch (error) {
          console.error("Failed to fetch matched universities:", error);
        }
      }

    };

    const onFindModeChange = (e: RadioChangeEvent) => {

      setFindMode(e.target.value);
    }

  
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
                      label="Tìm trường theo tổ hợp xét tuyển hoặc khối thi"
                      labelCol={{span: 24}}

                    >
                      <>
                        <Radio.Group
                          value={findMode}
                          onChange={onFindModeChange}
                          optionType="button"
                          size="large"
                          options={
                            [
                              {
                                value: "combination",
                                label: "Tổ hợp"
                              },
                              {
                                value: "overall",
                                label: "Điểm Tốt nghiệp"
                              }
                            ]
                          }
                        />

                      </>
                    </Form.Item>

                    <Form.Item
                        labelCol={{ span: 6 }}  
                        wrapperCol={{ span: '100%' }}
                        labelAlign="left"  
                        label={findMode === "combination" ? "Tổ hợp xét tuyển" : "Khối thi"}
                        name="combination"
                        
                        rules={[{ required: true, message: 'Please select a combination' }]}
                    >
                      <Select
                        placeholder={findMode === "combination" ? "Chọn khối xét tuyển (e.g., A00)" : "Chọn khối thi (e.g., KHTN)"}
                        onChange={onComboChange}
                        options={ findMode === "combination"  ? 
                          
                          
                          evaluationCombinations.map((item) => ({
                          label: item.label,
                          value: item.label,
                        }))
                      
                        : examCombination.map((item) => ({
                          label: item.label,
                          value: item.label
                        }))
                      }
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
                          dataSource={Array.from(results)}
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
        </Content>
      </Layout>      
    )
}

export default FindSchool;