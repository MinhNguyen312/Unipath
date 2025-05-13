import { Input,Layout, Card, Typography, Form, InputNumber,Button, Table, Select, Row, Col, Radio, RadioChangeEvent } from "antd";
import React, {useState} from "react";
import type { ColumnsType } from 'antd/es/table';
import { evaluationCombinations } from "../../data/evaluationCombinations";
import {ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import axios from "axios";
import SchoolComparison from '../../components/SchoolCompare/SchoolCompare.tsx';
import './styles.css';

const {Title} = Typography;
const {Content} = Layout;

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";


  interface University {
    id: string;
    ten_truong: string;
    diem: number;
    location: string;
    ma_nganh: string;
    ten_nganh: string;
    to_hop_mon: string[];
    predicted_diem: number;
    score_diff:number;
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
    const [searchText ,setSearchText] = useState('');
    const [filteredData, setFilteredData] = useState<University[]>([]);
    

    
    const normalizeVietnamese = (str: string) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.toLowerCase();
    setSearchText(value);
    const filtered = Array.from(results).filter((record) =>
      normalizeVietnamese(record.ten_nganh).includes(normalizeVietnamese(searchText))
    );

    setFilteredData(filtered);

  }

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
      if(findMode === "combination"){
        const scores: Record<string,string> = {}

        subjects.forEach(item => {
          scores[item] = values[item];
        })

        try {
          const res = await axios.post(`${API_BASE_URL}/api/matches`,{
            scores
          })

          setResults(res.data);
          setFilteredData(res.data);
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

        

        try {
          const res = await axios.post(`${API_BASE_URL}/api/matches`, {
            scores
          },
          
        );
    
          setResults(res.data); // Assuming API returns an array of matches
          setFilteredData(res.data);
        } catch (error) {
          console.error("Failed to fetch matched universities:", error);
        }
      }

    };

    const onFindModeChange = (e: RadioChangeEvent) => {

      setFindMode(e.target.value);
    }

  
    const columns: ColumnsType<University> = [    
      { title: 'Tên Trường', dataIndex: 'ten_truong', key: 'ten_truong' },
      { title: 'Mã Ngành', dataIndex:'ma_nganh', key: 'ma_nganh'},
      { title: 'Ngành', dataIndex: 'ten_nganh', key: 'ten_nganh' },
      {
        title: 'Tổ hợp',
        dataIndex: 'to_hop_mon',
        key: 'to_hop_mon',
        width:100
       // render: (to_hop_mon: string[]) => Array.isArray(to_hop_mon) ? to_hop_mon.join(', ') : 'Không có tổ hợp',
      },
      { title: 'Điểm Chuẩn 2024', dataIndex: 'diem', key: 'diem', width:80 },
      {title:'Điểm Chuẩn Dự Đoán 2025', dataIndex:'predicted_diem', key:'predicted_diem',
      render: (value) => value != null ? value.toFixed(2) : '-',
      width:90  
      },
      {title:'Dự Đoán Chênh Lệch', dataIndex:'score_diff', key:'score_diff', render: 
      (value) => { 
        if(value == null) return '-';
        const formatted = value > 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
        return (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'flex-end',
            color: value > 0 ? '#f5222d' : value < 0 ? '#52c41a' : 'black' 
          }}>
           <span>{formatted}</span>
            {value > 0 ? 
              <ArrowUpOutlined style={{ fontSize: '12px', marginRight: '3px' }} /> : 
              value < 0 ? 
              <ArrowDownOutlined style={{ fontSize: '12px', marginRight: '3px' }} /> : 
              null
            }
           
          </div>
        );

},
    width:90
      }
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ marginTop: '20px' }}>
          <Card style={{ maxWidth: '100%', marginLeft: '10%', marginRight: '10%' }}>
            <Title level={3} style={{color:'#1e894e'}}>Tìm Trường Đại Học</Title>
      
            <Row gutter={[24, 24]} justify="center">
              {/* Left Column: Form (Smaller width) */}
              <Col xs={24} lg={5}>
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
                        label={findMode === "combination" ? "Tổ hợp" : "Khối thi"}
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
              <Col xs={24} lg={19}>
                
              <Card>
                  <Title level={4} style={{color:'#1e894e'}}>Tìm kiếm ngành học</Title>
                                     
                  <Row>
                    <Col>
                      <Input.Search
                        placeholder="khoa hoc may tinh"
                        value={searchText}
                        onChange={handleSearch}
                        style={{ width: 300 }}
                        />
                    </Col>
                  </Row>  

                 {filteredData.length > 0 ? (
                    <>
                      <Title level={4} style={{color:'#1e894e'}}>Ngành Học Phù Hợp</Title>
                      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <Table
                          key={filteredData.length}
                          dataSource={Array.from(filteredData)}
                          columns={columns}
                          rowKey={(record) => `${record.id}`}
                          pagination={{}}
                          scroll={{ x: 'max-content' }}
                          bordered
                          style={{ 
                          tableLayout: 'fixed' 
                          }}
                           
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
