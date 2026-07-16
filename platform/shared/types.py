# --- Shared Global Type Aliases ---
from typing import Dict, Any, Union, List

# API Payload Data types
JSONPayload = Dict[str, Any]
ConfigParameters = Dict[str, Union[str, int, float, bool]]

# Metric Dataset: list of timestamps and float values
MetricValues = List[List[Union[int, float]]]
MetricResponse = Dict[str, Union[str, MetricValues]]
