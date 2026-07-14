from datetime import datetime, timezone
from typing import Any


def success_response(data: Any) -> dict[str, Any]:
    return {
        "data": data,
        "meta": {
            "generatedAt": datetime.now(timezone.utc).isoformat(),
        },
    }
