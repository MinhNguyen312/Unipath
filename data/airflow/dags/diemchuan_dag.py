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
    'diemchuan_dag',  # Tên DAG
    default_args=default_args,
    description='DAG để crawl dữ liệu điểm chuẩn từ VnExpress',
    catchup=False,
    tags=['vnexpress', 'automation'],
) as dag:

    # Task chạy script vnexpress.py
    run_vnexpress = BashOperator(
        task_id='run_vnexpress',
        bash_command='''
            cd /opt/airflow/diem_chuan &&
            python vnexpress.py
        ''',
        retries=3,
        retry_delay=timedelta(minutes=1),
    ) 