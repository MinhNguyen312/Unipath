import pandas as pd
import os

# Nhóm môn theo khối
khtn_subjects = ['Li', 'Hoa', 'Sinh']
khxh_subjects = ['Su', 'Dia', 'GDCD']

# Các tổ hợp khối thi theo từng nhóm
khoi_thi_khtn = {
    'A00': ['Toan', 'Li', 'Hoa'],
    'A01': ['Toan', 'Li', 'NgoaiNgu'],
    'A02': ['Toan', 'Li', 'Sinh'],
    'B00': ['Toan', 'Hoa', 'Sinh'],
    'C01': ['Van', 'Toan', 'Li'],
    'C05': ['Van', 'Li', 'Hoa'],
    'C06': ['Van', 'Li', 'Sinh'],
    'C08': ['Van', 'Hoa', 'Sinh'],
    'D08': ['Toan', 'Sinh', 'NgoaiNgu'],
    'D11': ['Van', 'Li', 'NgoaiNgu'],
    'D12': ['Van', 'Hoa', 'NgoaiNgu'],
    'D13': ['Van', 'Sinh', 'NgoaiNgu']
}

khoi_thi_khxh = {
    'C03': ['Van', 'Toan', 'Su'],
    'C04': ['Van', 'Toan', 'Dia'],
    'C09': ['Van', 'Dia', 'Li'],
    'C11': ['Van', 'Su', 'Dia'],
    'C13': ['Van', 'Sinh', 'Dia'],
    'D09': ['Toan', 'Su', 'NgoaiNgu'],
    'D10': ['Toan', 'Dia', 'NgoaiNgu'],
    'D14': ['Van', 'Su', 'NgoaiNgu'],
    'D15': ['Van', 'Dia', 'NgoaiNgu']
}

# Hàm xác định nhóm khối thi
def check_student_group(row):
    has_khtn = any(row.get(subject, 0) > 0 for subject in khtn_subjects)
    has_khxh = any(row.get(subject, 0) > 0 for subject in khxh_subjects)
    return 'KHTN' if has_khtn else 'KHXH' if has_khxh else 'UNKNOWN'

# Chạy qua các năm
for year in range(2020, 2025):
    input_file = f'thpt{year}_final.csv'
    output_file = f'khoithi_{year}.csv'

    if not os.path.exists(input_file):
        print(f" Không tìm thấy file: {input_file}")
        continue

    print(f"\n Đang xử lý dữ liệu năm {year}...")

    df = pd.read_csv(input_file, dtype={'SBD': str})
    df = df.fillna(0)

    df['group'] = df.apply(check_student_group, axis=1)

    all_khoi = list(khoi_thi_khtn.keys()) + list(khoi_thi_khxh.keys())
    for khoi in all_khoi:
        df[khoi] = "N/A"

    for idx, row in df.iterrows():
        if row['group'] == 'KHTN':
            khoi_thi = khoi_thi_khtn
        elif row['group'] == 'KHXH':
            khoi_thi = khoi_thi_khxh
        else:
            continue

        for khoi, mon in khoi_thi.items():
            try:
                score = sum(float(row.get(m, 0)) for m in mon)
                df.at[idx, khoi] = score
            except:
                continue  

    cols = ['SBD', 'khu_vuc'] + all_khoi
    df_khoi = df[cols]

    df_khoi['SBD'] = df_khoi['SBD'].apply(lambda x: str(x).zfill(8))

    # Xuất ra file CSV
    df_khoi.to_csv(output_file, index=False)
    print(f" Đã lưu: {output_file} ({len(df_khoi)} dòng)")
