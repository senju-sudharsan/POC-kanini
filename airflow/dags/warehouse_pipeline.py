from datetime import datetime
from airflow import DAG
from airflow.operators.bash import BashOperator

default_args = {
    "owner": "sudharsan",
    "depends_on_past": False,
}

with DAG(
    dag_id="warehouse_pipeline",
    default_args=default_args,
    start_date=datetime(2026, 7, 1),
    catchup=False,
    schedule=None,
    tags=["de-poc"],
) as dag:

    ingest = BashOperator(
        task_id="bronze_ingestion",
        bash_command="cd /opt/airflow/scripts && python ingestion.py",
    )

    silver = BashOperator(
        task_id="silver_transformations",
        bash_command="cd /opt/airflow/scripts && python silver_transformations.py",
    )

    gold = BashOperator(
        task_id="gold_transformations",
        bash_command="cd /opt/airflow/scripts && python gold_transformations.py",
    )

    validation = BashOperator(
        task_id="validation",
        bash_command="cd /opt/airflow/scripts && python validation.py",
    )

    ingest >> silver >> gold >> validation
