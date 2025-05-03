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
def run_spider(start, end, year):
    output_file = f"output_{year}_{start:02}-{end:02}.csv"
    cmd = [
        "scrapy",
        "crawl",
        "diem_spider",
        "-a", f"start_province={start}",
        "-a", f"end_province={end}",
        "-a", f"year={year}",
        "-o", output_file
    ]
    subprocess.run(cmd)


# Gộp CSV sau khi crawl xong
def merge_csv_files(output_name):
    year = output_name.split("_")[1].split(".")[0]
    csv_files = sorted(glob.glob(f"output_{year}_*.csv"))
    if not csv_files:
        print(f"Không tìm thấy file CSV nào cho năm {year}.")
        return

    df_list = []
    for file in csv_files:
        df = pd.read_csv(file, dtype={"SBD": str})
        df_list.append(df)

    merged = pd.concat(df_list, ignore_index=True)
    merged.sort_values("SBD", inplace=True)
    merged.to_csv(output_name, index=False)
    print(f"Gộp xong {len(csv_files)} file năm {year} → {output_name} ({len(merged)} dòng)")


# Main
if __name__ == "__main__":
    print(" Bắt đầu crawl dữ liệu từ 64 tỉnh...")

    start_time = time.time()
    province_ranges = split_provinces()
    years = list(range(2021, 2025)) 

    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = []
        for year in years:
            print(f"\n Đang crawl năm {year}...")
            for start, end in province_ranges:
                futures.append(executor.submit(run_spider, start, end, year))
        for f in futures:
            f.result()

    elapsed = time.time() - start_time
    print(f" Crawl xong trong {elapsed:.2f} giây. Bắt đầu gộp file...")

    for year in years:
        merge_csv_files(output_name=f"thpt_{year}_final.csv")
