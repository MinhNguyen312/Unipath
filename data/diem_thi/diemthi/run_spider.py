import subprocess
import time
import os
import glob
import pandas as pd
from concurrent.futures import ThreadPoolExecutor

# Chia 64 tỉnh thành 8 nhóm
def split_provinces(start=1, end=64, num_groups=8):
    step = (end - start + 1) // num_groups
    ranges = []
    for i in range(num_groups):
        s = start + i * step
        e = start + (i + 1) * step - 1
        if i == num_groups - 1:
            e = end  # Đảm bảo nhóm cuối đủ
        ranges.append((s, e))
    return ranges

# Chạy 1 spider
def run_spider(start, end):
    output_file = f"output_{start:02}-{end:02}.csv"
    cmd = [
        "scrapy",
        "crawl",
        "diem_spider",
        "-a", f"start_province={start}",
        "-a", f"end_province={end}",
        "-o", output_file
    ]
    subprocess.run(cmd)

# Gộp CSV sau khi crawl xong
def merge_csv_files(output_name="thpt_2021.csv"):
    csv_files = sorted(glob.glob("output_*.csv"))
    if not csv_files:
        print("Không tìm thấy file CSV để gộp.")
        return

    df_list = []
    for file in csv_files:
        df = pd.read_csv(file, dtype={"SBD": str}) # Đọc SBD dưới dạng chuỗi để giữ số 0
        df_list.append(df)

    merged = pd.concat(df_list, ignore_index=True)
    merged.sort_values("SBD", inplace=True)  
    merged.to_csv(output_name, index=False)
    print(f"Đã gộp xong {len(csv_files)} file → {output_name} ({len(merged)} dòng)")

# Main
if __name__ == "__main__":
    print(" Bắt đầu crawl dữ liệu từ 64 tỉnh...")
    start_time = time.time()

    province_ranges = split_provinces()
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(run_spider, start, end) for start, end in province_ranges]
        for f in futures:
            f.result()

    elapsed = time.time() - start_time
    print(f" Crawl xong trong {elapsed:.2f} giây. Bắt đầu gộp file...")

    merge_csv_files()