"use client"

import * as React from "react"
import { Card, Table, Typography, ConfigProvider, Button, Empty } from "antd"
import { AutoSuggestInput } from "./AutoSuggestInput"
import { SchoolSelector } from "./SchoolSelector"
import { useUniversitiesByMajor } from "../../hooks/useUniversitiesByMajors"
import { useMajorInfo } from "../../hooks/useMajorInfo"
import { useScoreChart } from "../../hooks/useScoreChart"
import ScoreChart from "./ScoreChart"
import { majorCompareCache } from "../../hooks/useCompareStore"

const { Title } = Typography

interface RowData {
  key: string;
  info: React.ReactNode;
  [key: string]: any;
}

export default function SchoolComparison() {
  const [schools, setSchools] = React.useState<string[]>(["", "", ""])
  const [selectedMajor, setSelectedMajor] = React.useState("")
  const [submittedSchools, setSubmittedSchools] = React.useState<string[]>([])
  const [showTable, setShowTable] = React.useState(false)

  const { data: universityOptions = [], isLoading: isLoadingUniversities } = useUniversitiesByMajor(selectedMajor)

  const handleSchoolChange = (value: string, index: number) => {
    const newSchools = [...schools]
    newSchools[index] = value
    setSchools(newSchools)
  }

  const handleSubmit = () => {
    const validSchools = schools.filter((school) => school !== "")
    Object.keys(majorCompareCache).forEach((cachedSchool) => {
      if (!validSchools.includes(cachedSchool)) {
        delete majorCompareCache[cachedSchool];
      }
    });
    setSubmittedSchools(validSchools)
    setShowTable(validSchools.length > 0)
  }
  
  const { data: data1, isLoading: loading1 } = useMajorInfo(selectedMajor, submittedSchools[0] || "")
  const { data: data2, isLoading: loading2 } = useMajorInfo(selectedMajor, submittedSchools[1] || "")
  const { data: data3, isLoading: loading3 } = useMajorInfo(selectedMajor, submittedSchools[2] || "")

  const { data: scoreChart1 } = useScoreChart(selectedMajor, submittedSchools[0] || "");
  const { data: scoreChart2 } = useScoreChart(selectedMajor, submittedSchools[1] || "");
  const { data: scoreChart3 } = useScoreChart(selectedMajor, submittedSchools[2] || "");

  const columns = React.useMemo(() => {
    const cols = [
      {
        title: <strong style={{ color: "#2e7d32" }}>Thông tin</strong>,
        dataIndex: "info",
        key: "info",
      },
    ]

    submittedSchools.forEach((school, index) => {
      cols.push({
        title: <strong style={{ color: "#2e7d32" }}>{school}</strong>,
        dataIndex: `school${index}`,
        key: `school${index}`,
      })
    })

    return cols
  }, [submittedSchools])
  
  React.useEffect(() => {
    const datas = [data1, data2, data3];
    const scores = [scoreChart1, scoreChart2, scoreChart3];
    const loadings = [loading1, loading2, loading3];
  
    submittedSchools.forEach((school, index) => {
      const data = datas[index];
      const score = scores[index];
      const loading = loadings[index];
  
      if (!loading && data && score) {
        majorCompareCache[school] = {
          university: school,
          major: selectedMajor,
          city: data.dia_diem || "-",
          fee: data.hoc_phi || "-",
          examBlocks: [data.to_hop_mon || "-"],
          scores: score.map((s: { nam: number; diem: number }) => ({ year: s.nam, score: s.diem })),
        };
      }
    });
  }, [
    data1, data2, data3,
    scoreChart1, scoreChart2, scoreChart3,
    loading1, loading2, loading3,
    submittedSchools,
    selectedMajor
  ]);
  


  const dataSource: RowData[] = [
    {
      key: "1",
      info: <strong style={{ color: "#2e7d32" }}>Thành phố</strong>,
      school0: loading1 ? "Đang tải..." : data1?.dia_diem || "-",
      school1: loading2 ? "Đang tải..." : data2?.dia_diem || "-",
      school2: loading3 ? "Đang tải..." : data3?.dia_diem || "-",
    },
    {
      key: "2",
      info: <strong style={{ color: "#2e7d32" }}>Học phí</strong>,
      school0: loading1 ? "Đang tải..." : data1?.hoc_phi || "-",
      school1: loading2 ? "Đang tải..." : data2?.hoc_phi || "-",
      school2: loading3 ? "Đang tải..." : data3?.hoc_phi || "-",
    },
    {
      key: "3",
      info: <strong style={{ color: "#2e7d32" }}>Khối xét tuyển</strong>,
      school0: loading1 ? "Đang tải..." : data1?.to_hop_mon || "-",
      school1: loading2 ? "Đang tải..." : data2?.to_hop_mon || "-",
      school2: loading3 ? "Đang tải..." : data3?.to_hop_mon || "-",
    },
    {
      key: "4",
      info: <strong style={{ color: "#2e7d32" }}>Điểm chuẩn</strong>,
      school0: scoreChart1 ? (
        <div style={{ width: 300, height: 150 }}>
          <ScoreChart data={scoreChart1} />
        </div>
      ) : "-",
      school1: scoreChart2 ? (
        <div style={{ width: 300, height: 150 }}>
          <ScoreChart data={scoreChart2} />
        </div>
      ) : "-",
      school2: scoreChart3 ? (
        <div style={{ width: 300, height: 150 }}>
          <ScoreChart data={scoreChart3} />
        </div>
      ) : "-",
    }
  ]

  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            headerBg: "#E7F8F2",
            headerColor: "#2e7d32",
            borderColor: "#1E894E",
            rowHoverBg: "#E7F8F2",
          },
          Card: {
            colorBorderSecondary: "#c8e6c9",
          },
          Button: {
            colorPrimary: "#2e7d32",
            colorPrimaryHover: "#1b5e20",
            colorPrimaryActive: "#388e3c",
          },
        },
      }}
    >
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div>
          <Title level={3} style={{ color: "#2e7d32", marginBottom: "8px" }}>
            So sánh điểm của ngành
          </Title>
          
          <div style={{ paddingTop:"10px"}}>
              <label style={{ fontSize: "18px", fontWeight: "bold", color: "#2e7d32" }}>
               <span style={{ fontSize:"16px", color: "#ff4f51", fontWeight: "lighter" }}>*</span> Ngành học
              </label>
            
              <div style={{ marginTop:"8px"}}>
                <AutoSuggestInput
                  placeholder="Nhập tên ngành..."
                  onSelect={(value) => {
                    setSelectedMajor(value);
                    setSchools(["", "", ""]);
                    setShowTable(false);
                  }}
                />
              </div>
          </div>


          {selectedMajor && (
            <div style={{ marginTop: "16px", color: "rgba(0, 0, 0, 0.45)", fontSize: "14px" }}>
              Ngành đã chọn: <strong>{selectedMajor}</strong>
            </div>
          )}
        </div>

        <div className="school-selectors" style={{marginTop: "20px"}}>
          {[0, 1, 2].map((index) => (
            <div key={index} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "18px", fontWeight: "bold", color: "#2e7d32" }}>
               {index === 0 && <span style={{ fontSize:"16px", color: "#ff4f51", fontWeight: "lighter" }}>*</span>} Trường
              </label>
              <SchoolSelector
                value={schools[index]}
                onChange={(val) => handleSchoolChange(val, index)}
                options={universityOptions}
                disabled={isLoadingUniversities || !selectedMajor}
                selectedValues={schools}
                isRequired={index === 0? true : false}
              />
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginTop: "24px", paddingBottom: "24px" }}>
          <Button
            type="primary"
            size="large"
            onClick={handleSubmit}
            disabled={!selectedMajor || schools.every((school) => school === "")}
            style={{ backgroundColor: "#1E894E", borderColor: "#2e7d32"}}
          >
            So sánh trường
          </Button>
        </div>

        {showTable && submittedSchools.length > 0 && (
          <Card style={{ borderRadius: "12px", overflow: "hidden", paddingTop: "8px" }}>
            <Table
              columns={columns}
              dataSource={dataSource}
              pagination={false}
              bordered
              size="middle"
              scroll={{ x: "max-content" }}
              style={{ tableLayout: "fixed" }}
              footer={() => 'Nguồn: VNExpress'}
            />
          </Card>
          
        )}

        {showTable && submittedSchools.length === 0 && (
          <Card
            style={{ borderRadius: "12px", overflow: "hidden", textAlign: "center", padding: "24px" }}
          >
            <Empty description="Vui lòng chọn ít nhất một trường để so sánh" />
          </Card>
        )}
      </div>
      
    </ConfigProvider>
  )
}
