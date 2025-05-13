from airflow import DAG
from airflow.operators.bash import BashOperator
from datetime import datetime, timedelta

# Định nghĩa các tham số mặc định cho DAG
default_args = {
    'owner': 'nguyen1oc',
    'start_date': datetime(2024, 1, 1),
    'retries': 1,
    'retry_delay': timedelta(minutes=1),
}

# Khởi tạo DAG
with DAG(
    'diemthi_dag',  # Tên DAG
    default_args=default_args,
    description='DAG để chạy spider tự động', 
    catchup=False,
    tags=['vietnamnet', 'automation'],
) as dag:

    # Định nghĩa task chạy script Scrapy
    run_spider_task = BashOperator(
        task_id='run_spider_script',
        bash_command='''
            cd /opt/airflow/diem_thi/diemthi &&
            python run_spider.py
        ''',
        retries=3,
        retry_delay=timedelta(minutes=5),
    )
