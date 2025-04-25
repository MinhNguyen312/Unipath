import pandas as pd

df = pd.read_csv('thpt2020_final.csv', dtype={'SBD': str})
df = df.fillna(0)

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

def check_student_group(row):
    has_khtn = any(row[subject] > 0 for subject in khtn_subjects)
    has_khxh = any(row[subject] > 0 for subject in khxh_subjects)
    return 'KHTN' if has_khtn else 'KHXH' if has_khxh else 'UNKNOWN'

# Thêm cột nhóm vào DataFrame
df['group'] = df.apply(check_student_group, axis=1)

# Khởi tạo điểm các khối là "N/A"
all_khoi = list(khoi_thi_khtn.keys()) + list(khoi_thi_khxh.keys())
for khoi in all_khoi:
    df[khoi] = "N/A"

# Tính điểm tổ hợp phù hợp
for idx, row in df.iterrows():
    if row['group'] == 'KHTN':
        khoi_thi = khoi_thi_khtn
    elif row['group'] == 'KHXH':
        khoi_thi = khoi_thi_khxh
    else:
        continue

    for khoi, mon in khoi_thi.items():
        score = sum(row[m] for m in mon)
        df.at[idx, khoi] = round(score, 1)

cols = ['SBD'] + all_khoi
df_khoi = df[cols]
df_khoi.loc[:, 'SBD'] = df_khoi['SBD'].apply(lambda x: str(x).zfill(8))

df_khoi.to_csv('khoithi_2020.csv', index=False)
print(" Đã lưu file tổng hợp khối thi: khoithi_2020.csv với các tổ hợp không phù hợp ghi là 'N/A'")
