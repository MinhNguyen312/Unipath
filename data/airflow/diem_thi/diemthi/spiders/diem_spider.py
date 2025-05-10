from collections import deque
from bs4 import BeautifulSoup
import scrapy

class DiemSpider(scrapy.Spider):
    name = "diem_spider"
    allowed_domains = ["vietnamnet.vn"]

    custom_settings = {
        'HTTPERROR_ALLOWED_CODES': [404],
        'HTTPERROR_FORCE_ALL': True
    }

    empty_count_window = 20  # Cửa sổ kiểm tra liên tục

    def __init__(self, start_province=1, end_province=64, year=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.start_province = int(start_province)
        self.end_province = int(end_province)
        self.year = int(year) if year else 2021

    def start_requests(self):
        for province in range(self.start_province, self.end_province + 1):
            start_sbd = f"{province:02}000001"
            yield scrapy.Request(
                url=f"https://vietnamnet.vn/giao-duc/diem-thi/tra-cuu-diem-thi-tot-nghiep-thpt/{self.year}/{start_sbd}.html",
                callback=self.parse_score,
                meta={
                    "province": province,
                    "number": 1,
                    "history": deque(maxlen=self.empty_count_window)
                }
            )

    def parse_score(self, response):
        province = response.meta["province"]
        number = response.meta["number"]
        history = response.meta["history"]
        sbd = f"{province:02}{number:06}"

        got_data = False

        if response.status == 404:
            self.logger.info(f"[{sbd}] → 404 Not Found")
            history.append(False)
        else:
            soup = BeautifulSoup(response.text, 'html.parser')
            result_div = soup.find('div', class_='resultSearch__right')

            edu_info = soup.find('p', class_='edu-institution')
            khu_vuc = edu_info.get_text(strip=True).replace("Sở GD&ĐT", "").strip() if edu_info else 'UNKNOWN'

            if result_div and result_div.find('table'):
                scores_dict = {
                    'Toán': 'N/A', 'Văn': 'N/A', 'Sử': 'N/A',
                    'Địa': 'N/A', 'GDCD': 'N/A', 'Ngoại ngữ': 'N/A',
                    'Lí': 'N/A', 'Hóa': 'N/A', 'Sinh': 'N/A'
                }

                table = result_div.find('table')
                rows = table.find_all('tr')
                for row in rows:
                    cols = row.find_all('td')
                    if len(cols) >= 2:
                        subject = cols[0].text.strip()
                        score = cols[1].text.strip()
                        if subject in scores_dict:
                            scores_dict[subject] = score

                yield {
                    'SBD': sbd,
                    'khu_vuc': khu_vuc,
                    'Toan': scores_dict['Toán'],
                    'Van': scores_dict['Văn'],
                    'Su': scores_dict['Sử'],
                    'Dia': scores_dict['Địa'],
                    'GDCD': scores_dict['GDCD'],
                    'NgoaiNgu': scores_dict['Ngoại ngữ'],
                    'Li': scores_dict['Lí'],
                    'Hoa': scores_dict['Hóa'],
                    'Sinh': scores_dict['Sinh'],
                }
                

                got_data = True
                history.append(True)
            else:
                self.logger.info(f"[{sbd}] không có dữ liệu HTML hợp lệ")
                history.append(False)

        # Nếu quá 90% trong cửa sổ kiểm tra là fail → dừng tỉnh hiện tại
        if history.count(False) >= int(0.9 * self.empty_count_window):
            self.logger.info(f"Dừng crawl tỉnh {province:02} tại SBD {sbd} do không có dữ liệu liên tục.")
            return

        # Crawl số tiếp theo
        next_number = number + 1
        next_sbd = f"{province:02}{next_number:06}"
        yield scrapy.Request(
            url=f"https://vietnamnet.vn/giao-duc/diem-thi/tra-cuu-diem-thi-tot-nghiep-thpt/{self.year}/{next_sbd}.html",
            callback=self.parse_score,
            meta={
                "province": province,
                "number": next_number,
                "history": history
            }
        )