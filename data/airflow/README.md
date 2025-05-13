Initialize the environment
```bash
mkdir -p ./dags ./logs ./plugins ./config
echo -e "AIRFLOW_UID=$(id -u)" > .env
```

Initialize the database

```bash
docker compose up airflow-init
```

Run airflow
```bash
docker compose up -d
```

Go to http://localhost:8080

Username: airflow

Password: airflow

Code crawl data in folder `dags`