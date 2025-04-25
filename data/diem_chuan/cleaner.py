import pandas as pd

def show_duplicates(df):
    duplicates = df[df.duplicated()]
    return duplicates

df = pd.read_csv("vnexpress__2024.csv")
df_cleaned = df.dropna(subset=['diem', 'to_hop_mon'])
df_cleaned = df_cleaned.drop(columns=['ghi_chu'])
# df_cleaned = df_cleaned.drop(columns=['ghi_chu', 'hoc_phi']) #2024 thì bỏ caisn ày
df_cleaned = df_cleaned.drop_duplicates()
df_cleaned['hoc_phi'] = df_cleaned.groupby(['ma_truong', 'ma_nganh'])['hoc_phi'].transform(lambda x: x.fillna(method='ffill').fillna(method='bfill'))
df_cleaned.to_csv("vnexpress_2024_cleaned.csv", index=False)
duplicates = show_duplicates(df_cleaned)

print("Các hàng trùng lặp:")
print(duplicates)
