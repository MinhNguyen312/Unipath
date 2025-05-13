from opentelemetry import metrics
from opentelemetry.exporter.prometheus import PrometheusMetricReader
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.resources import SERVICE_NAME, Resource

def setup_telemetry():
    resource = Resource(attributes={SERVICE_NAME: "llm-monitor"})
    reader = PrometheusMetricReader()
    provider = MeterProvider(resource=resource, metric_readers=[reader])
    metrics.set_meter_provider(provider)
    return metrics.get_meter("llm_monitor", "0.1.0")

meter = setup_telemetry()

denial_counter = meter.create_counter(
    name="llm_denials_total",
    description="Total number of denied responses",
    unit="1"
)

response_counter = meter.create_counter(
    name="llm_responses_total",
    description="Total number of processed responses",
    unit="1"
)
