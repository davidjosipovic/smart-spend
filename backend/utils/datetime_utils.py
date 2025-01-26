from datetime import datetime, timezone

def is_datetime_after(datetime_str: str | None) -> bool:
    print(datetime_str)
    if datetime_str is None:
        return True

    # Convert string to datetime object
    given_datetime = datetime.fromisoformat(datetime_str.replace("Z", "+00:00"))

    # Get current datetime with UTC timezone (offset-aware)
    current_datetime = datetime.now(timezone.utc)

    # Check if the given datetime is after the current datetime
    return given_datetime > current_datetime
