import csv
import time
import unicodedata
import pandas as pd
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "https://diemthi.vnexpress.net"
START_URL = f"{BASE_URL}/tra-cuu-dai-hoc"

def setup_driver():
    options = Options()
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--ignore-certificate-errors")
    options.add_argument("--headless")  # Thêm chế độ headless
    options.add_argument("--disable-gpu")  # Đảm bảo tương thích với headless
    options.add_argument("--window-size=1920,1080")  # Đặt kích thước cửa sổ để tránh lỗi giao diện
    return webdriver.Chrome(options=options)

def clean_score_text(text):
    """Remove invisible Unicode characters and normalize the score string."""
    text = unicodedata.normalize('NFKD', text.strip())
    text = ''.join(c for c in text if ord(c) < 128)
    text = text.replace(",", ".")
    return text

def get_all_university_links():
    driver = setup_driver()
    driver.get(START_URL)
    wait = WebDriverWait(driver, 10)

    try:
        while True:
            try:
                load_more = wait.until(EC.element_to_be_clickable((By.CLASS_NAME, "btn_loadmore")))
                driver.execute_script("arguments[0].click();", load_more)
                time.sleep(1)
            except:
                break

        soup = BeautifulSoup(driver.page_source, "html.parser")
        links = []
        ul = soup.find("ul", class_="lookup__results list_more_colloge")
        if not ul:
            print("Không tìm thấy danh sách trường!")
            return []

        for li in ul.find_all("li", class_="lookup__result"):
            a_code = li.find("div", class_="lookup__result-code").find("a")
            a_name = li.find("div", class_="lookup__result-name").find("a")

            if a_code and a_name and a_code.get("href"):
                ma_truong = a_code.find("strong").text.strip()
                ten_truong = a_name.find("strong").text.strip()
                dia_diem = a_name.find("span").text.strip()
                full_url = BASE_URL + a_code["href"]
                links.append((ma_truong, ten_truong, dia_diem, full_url))
        return links
    finally:
        driver.quit()

def get_benchmark_info(ma_truong, ten_truong, dia_diem, url, target_year):
    driver = setup_driver()
    wait = WebDriverWait(driver, 15)

    try:
        driver.get(url)
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, "university__table")))

        # Cuộn trang để tải hết nút js-toggle-chart
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(1)

        # Nhấn tất cả nút js-toggle-chart với cơ chế thử lại
        toggle_buttons = driver.find_elements(By.CLASS_NAME, "js-toggle-chart")
        if not toggle_buttons:
            print(f"[{ma_truong}] Không tìm thấy nút js-toggle-chart nào trên trang.")
        else:
            print(f"[{ma_truong}] Tìm thấy {len(toggle_buttons)} nút js-toggle-chart. Bắt đầu nhấn...")
            for button in toggle_buttons:
                for attempt in range(3):
                    try:
                        driver.execute_script("arguments[0].click();", button)
                        time.sleep(1)  # Đảm bảo biểu đồ tải
                        break
                    except Exception as e:
                        print(f"[{ma_truong}] Lỗi khi nhấn nút js-toggle-chart (lần {attempt + 1}): {e}")
                        if attempt == 2:
                            print(f"[{ma_truong}] Bỏ qua nút js-toggle-chart sau 3 lần thử.")

        # Chờ ít nhất một biểu đồ Highcharts tải
        try:
            wait.until(EC.presence_of_element_located((By.CLASS_NAME, "highcharts-data-labels")))
            print(f"[{ma_truong}] Đã tìm thấy ít nhất một biểu đồ Highcharts.")
        except Exception as e:
            print(f"[{ma_truong}] Không có biểu đồ Highcharts nào được tải: {e}")

        soup = BeautifulSoup(driver.page_source, "html.parser")
        table = soup.find("table", class_="university__table")
        if not table:
            print(f"[{ma_truong}] Không tìm thấy bảng thông tin ngành.")
            return []

        all_rows = table.find_all("tr")
        if not all_rows:
            print(f"[{ma_truong}] Không tìm thấy ngành nào.")
            return []

        data = []
        i = 0
        while i < len(all_rows):
            row = all_rows[i]
            if "university__benchmark" in row.get("class", []):
                cols = row.find_all("td")
                if len(cols) < 6:
                    i += 1
                    continue

                ten_nganh_tag = cols[1].find("a")
                ten_nganh = ten_nganh_tag.text.strip() if ten_nganh_tag else cols[1].text.strip()
                spans = cols[1].find_all("span")
                ma_nganh = spans[-1].text.strip() if spans else ""

                to_hop_mon = ", ".join(a.text.strip() for a in cols[3].find_all("a"))
                hoc_phi = cols[4].text.strip()
                ghi_chu = cols[5].text.strip()

                # Lấy dữ liệu biểu đồ
                chart_data = {}
                if i + 1 < len(all_rows):
                    next_row = all_rows[i + 1]
                    if "university__benchmark--chart" in next_row.get("class", []):
                        chart_soup = BeautifulSoup(str(next_row), "html.parser")
                        # Lấy năm từ trục x
                        xaxis_labels = chart_soup.find("g", class_="highcharts-xaxis-labels")
                        years = []
                        if xaxis_labels:
                            for label in xaxis_labels.find_all("text"):
                                year_text = label.text.strip()
                                try:
                                    year = int(year_text)
                                    years.append(year)
                                except ValueError:
                                    print(f"[{ma_truong}] Lỗi: Không thể chuyển đổi năm '{year_text}' thành số cho ngành {ma_nganh}")
                                    continue
                            print(f"[{ma_truong}] Năm tìm thấy trong biểu đồ cho ngành {ma_nganh}: {years}")
                        else:
                            print(f"[{ma_truong}] Không tìm thấy trục x Highcharts cho ngành {ma_nganh}, bỏ qua.")
                            i += 1
                            continue

                        # Lấy điểm từ nhãn dữ liệu
                        highcharts_labels = chart_soup.find("g", class_="highcharts-data-labels highcharts-series-0 highcharts-column-series highcharts-tracker")
                        if highcharts_labels:
                            points = highcharts_labels.find_all("text")
                            scores = []
                            for idx, point in enumerate(points):
                                tspan = point.find("tspan")
                                score_text = tspan.text.strip() if tspan else point.text.strip()
                                raw_score_text = score_text
                                score_text = clean_score_text(score_text)
                                #print(f"[{ma_truong}] Ngành {ma_nganh}, điểm thô thứ {idx + 1}: '{raw_score_text}' -> sau làm sạch: '{score_text}'")
                                if not score_text:
                                    print(f"[{ma_truong}] Lỗi: Điểm biểu đồ rỗng cho ngành {ma_nganh}, bỏ qua.")
                                    i += 1
                                    break
                                try:
                                    score = float(score_text)
                                    scores.append(score)
                                except ValueError as e:
                                    print(f"[{ma_truong}] Lỗi: Không thể chuyển đổi điểm '{score_text}' thành số cho ngành {ma_nganh}: {e}")
                                    i += 1
                                    break

                            # Ghép năm với điểm
                            if len(years) != len(scores):
                                print(f"[{ma_truong}] Số năm ({len(years)}) không khớp với số điểm ({len(scores)}) cho ngành {ma_nganh}, bỏ qua.")
                                i += 1
                                continue

                            for year, score in zip(years, scores):
                                if year == target_year: 
                                    chart_data[year] = score
                            print(f"Dữ liệu biểu đồ cho ngành {ma_nganh}: {chart_data}")
                        else:
                            print(f"[{ma_truong}] Không tìm thấy nhãn dữ liệu Highcharts cho ngành {ma_nganh}, bỏ qua.")
                            i += 1
                            continue
                        i += 1
                    else:
                        print(f"[{ma_truong}] Không tìm thấy hàng university__benchmark--chart cho ngành {ma_nganh}, bỏ qua.")
                        i += 1
                        continue
                else:
                    print(f"[{ma_truong}] Không có hàng tiếp theo để tìm biểu đồ cho ngành {ma_nganh}, bỏ qua.")
                    i += 1
                    continue

                diem = chart_data.get(target_year, None)
                if diem is None:
                    print(f"[{ma_truong}] Không có điểm {target_year} trong biểu đồ cho ngành {ma_nganh}, bỏ qua.")
                    continue

                data.append([ma_truong, ten_truong, dia_diem, ma_nganh, ten_nganh, diem, to_hop_mon, hoc_phi, ghi_chu])
                print(f"[{ma_truong}] Đã thêm ngành {ma_nganh} với điểm {target_year}: {diem}")

            i += 1

        print(f"[{ma_truong}] Tìm thấy {len(data)} ngành có điểm năm {target_year}")
        return data
    finally:
        driver.quit()

def vn2024(ma_truong, ten_truong, dia_diem, url):
    driver = setup_driver()
    wait = WebDriverWait(driver, 10)

    try:
        driver.get(url)

        # try:
        #     year_dropdown = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "span.select2-selection--single")))
        #     year_dropdown.click()
        #     time.sleep(1)

        #     year_option = wait.until(EC.element_to_be_clickable((By.XPATH, "//li[contains(text(), 'Năm 2023')]")))
        #     year_option.click()
        #     time.sleep(2)
        # except:
        #     print(f"[{ma_truong}] Không thể chọn năm.")

        soup = BeautifulSoup(driver.page_source, "html.parser")
        table = soup.find("table", class_="university__table")
        if not table:
            print(f"Không tìm thấy bảng điểm trong {ma_truong}")
            return []

        rows = table.select("tr.university__benchmark, tr.university__benchmark.odd")
        print(f"[{ma_truong}] Tìm thấy {len(rows)} ngành")

        data = []
        for row in rows:
            cols = row.find_all("td")
            if len(cols) < 6:
                continue
            ten_nganh_tag = cols[1].find("a")
            ten_nganh = ten_nganh_tag.text.strip() if ten_nganh_tag else cols[1].text.strip()
            spans = cols[1].find_all("span")
            ma_nganh = spans[-1].text.strip() if spans else ""
            diem_text = cols[2].text.strip()
            try:
                diem = float(diem_text.replace(",", "."))
            except:
                diem = diem_text
            to_hop_mon = ", ".join(a.text.strip() for a in cols[3].find_all("a"))
            hoc_phi = cols[4].text.strip()
            ghi_chu = cols[5].text.strip()
            data.append([ma_truong, ten_truong, dia_diem, ma_nganh, ten_nganh, diem, to_hop_mon, hoc_phi, ghi_chu])
        return data
    finally:
        driver.quit()

def save_to_csv(data, filename):
    with open(filename, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["ma_truong", "ten_truong", "dia_diem", "ma_nganh", "ten_nganh", "diem", "to_hop_mon", "hoc_phi", "ghi_chu"])
        writer.writerows(data)
    print(f" Đã lưu {len(data)} dòng vào {filename}")

def crawl_all(target_year):
    all_data = []
    links = get_all_university_links()
    print(f" Tìm thấy {len(links)} trường")
    for ma_truong, ten_truong, dia_diem, url in links:
        print(f"Đang crawl: {ma_truong} - {ten_truong} ({dia_diem})")
        try:
            # Nếu là năm 2024, gọi hàm vn2024
            if target_year == 2024:
                rows = vn2024(ma_truong, ten_truong, dia_diem, url)
            else:
                rows = get_benchmark_info(ma_truong, ten_truong, dia_diem, url, target_year)
            all_data.extend(rows)
        except Exception as e:
            print(f" Lỗi với {ma_truong}: {e}")
    return all_data

def clean_csv_after_saving(filename):
    df = pd.read_csv(filename)
    df_cleaned = df.dropna(subset=['diem', 'to_hop_mon'])
    if 'ghi_chu' in df_cleaned.columns:
        df_cleaned = df_cleaned.drop(columns=['ghi_chu'])
    df_cleaned = df_cleaned.drop_duplicates()

    # Điền học phí bị thiếu theo nhóm mã trường + mã ngành
    if '2024' in filename and 'hoc_phi' in df_cleaned.columns:
        df_cleaned['hoc_phi'] = df_cleaned.groupby(['ma_truong', 'ma_nganh'])['hoc_phi']\
            .transform(lambda x: x.fillna(method='ffill').fillna(method='bfill'))

    new_filename = filename.replace(".csv", "_cleaned.csv")
    df_cleaned.to_csv(new_filename, index=False)
    print(f"Đã lưu file sạch vào: {new_filename}")

    duplicates = df_cleaned[df_cleaned.duplicated()]
    if not duplicates.empty:
        print("Các hàng trùng lặp:")
        print(duplicates)
    else:
        print("Không có hàng trùng lặp.")

if __name__ == "__main__":
    for year in range(2020, 2024):
        print(f"\n===== BẮT ĐẦU CRAWL NĂM {year} =====")
        data = crawl_all(target_year=year)
        filename = f"vnexpress__{year}.csv"
        save_to_csv(data, filename)
        clean_csv_after_saving(filename)
