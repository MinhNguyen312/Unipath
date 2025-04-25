import csv
import time
import unicodedata
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
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    return webdriver.Chrome(options=options)

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

def get_benchmark_info(ma_truong, ten_truong, dia_diem, url):
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

def save_to_csv(data, filename="vnexpress__2024.csv"):
    with open(filename, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["ma_truong", "ten_truong", "dia_diem", "ma_nganh", "ten_nganh", "diem", "to_hop_mon", "hoc_phi", "ghi_chu"])
        writer.writerows(data)
    print(f" Đã lưu {len(data)} dòng vào {filename}")

def crawl_all():
    all_data = []
    links = get_all_university_links()
    print(f" Tìm thấy {len(links)} trường")
    for ma_truong, ten_truong, dia_diem, url in links:
        print(f"Đang crawl: {ma_truong} - {ten_truong} ({dia_diem})")
        try:
            rows = get_benchmark_info(ma_truong, ten_truong, dia_diem, url)
            all_data.extend(rows)
        except Exception as e:
            print(f"Lỗi với {ma_truong}: {e}")
    return all_data

if __name__ == "__main__":
    data = crawl_all()
    save_to_csv(data)
