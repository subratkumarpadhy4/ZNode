import time
import json
import requests
import sys
from scenarios import MACHINES, build_reading

BACKEND_URL = 'http://localhost:3000/api/telemetry'
INTERVAL_SECONDS = 2

# Scenario schedule — when each machine enters each scenario
# Format: list of (start_second, scenario)
SCHEDULE = {
    'M1': [(0, 'normal')],
    'M2': [(0, 'normal'), (60, 'degrading'), (180, 'normal')],
    'M3': [(0, 'normal'), (120, 'failing'), (240, 'normal')],
}


def get_current_scenario(machine_id, elapsed):
    """Return the active scenario for a machine at the given elapsed time."""
    current = SCHEDULE[machine_id][0][1]
    for start_sec, scenario in SCHEDULE[machine_id]:
        if elapsed >= start_sec:
            current = scenario
    return current


def main():
    print("ZNode Simulator starting.")
    print(f"Backend: {BACKEND_URL}")
    print(f"Machines: M1 (CNC), M2 (FURNACE), M3 (KILN)")
    print(f"Interval: {INTERVAL_SECONDS} seconds")
    print("Schedule: M2 enters degrading at t=60s, normal at t=180s; M3 enters failing at t=120s, normal at t=240s")
    print("Ctrl+C to stop.")

    start_time = time.time()

    try:
        while True:
            elapsed = int(time.time() - start_time)

            for machine_id, profile in MACHINES.items():
                scenario = get_current_scenario(machine_id, elapsed)
                operating_state = profile['productive_state']
                reading = build_reading(machine_id, operating_state, scenario, elapsed)

                status_code = '???'
                try:
                    resp = requests.post(BACKEND_URL, json=reading, timeout=5)
                    status_code = resp.status_code
                except Exception as exc:
                    print(f"  ERROR posting {machine_id}: {exc}")

                print(
                    f"[t={elapsed:3d}s] {machine_id} {reading['operating_state']}"
                    f" kw={reading['kw']:.1f} temp={reading['temp']:.1f} → {status_code}"
                )

            time.sleep(INTERVAL_SECONDS)

    except KeyboardInterrupt:
        print("Simulator stopped.")


if __name__ == '__main__':
    main()
