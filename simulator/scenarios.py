import random
import time

MACHINES = {
    'M1': {
        'type': 'CNC',
        'baseline_kw': 50.0,
        'baseline_temp': 80.0,
        'baseline_production_rate': 100.0,
        'productive_state': 'ACTIVE_CUTTING',
        'idle_kw': 5.0,
        'idle_temp': 35.0,
    },
    'M2': {
        'type': 'FURNACE',
        'baseline_kw': 85.0,
        'baseline_temp': 1150.0,
        'baseline_production_rate': 200.0,
        'productive_state': 'ACTIVE_BURN',
        'idle_kw': 10.0,
        'idle_temp': 200.0,
    },
    'M3': {
        'type': 'KILN',
        'baseline_kw': 40.0,
        'baseline_temp': 900.0,
        'baseline_production_rate': 80.0,
        'productive_state': 'ACTIVE_BURN',
        'idle_kw': 8.0,
        'idle_temp': 150.0,
    }
}


def build_reading(machine_id, operating_state, scenario, elapsed_seconds):
    """Build a telemetry reading dict matching the Phase 1 schema."""
    profile = MACHINES[machine_id]
    is_idle = (operating_state == 'IDLE')

    if is_idle:
        kw = profile['idle_kw']
        temp = profile['idle_temp']
        production_rate = 0.0
        units_produced = 0.0
        defects = 0
    else:
        baseline_kw = profile['baseline_kw']
        baseline_temp = profile['baseline_temp']

        if scenario == 'normal':
            kw = baseline_kw * random.uniform(0.98, 1.02)
            temp = baseline_temp * random.uniform(0.99, 1.01)
        elif scenario == 'degrading':
            progress = min(elapsed_seconds / 60.0, 1.0)
            kw = baseline_kw * (1.0 + progress * 0.30) * random.uniform(0.98, 1.02)
            temp = baseline_temp * (1.0 + progress * 0.05) * random.uniform(0.99, 1.01)
        elif scenario == 'failing':
            kw = baseline_kw * 1.7 * random.uniform(0.98, 1.02)
            temp = baseline_temp * 1.15 * random.uniform(0.99, 1.01)
        else:
            kw = baseline_kw
            temp = baseline_temp

        production_rate = profile['baseline_production_rate']
        units_produced = round(production_rate * (2 / 3600), 3)
        defects = 0

    return {
        'machine_id': machine_id,
        'type': profile['type'],
        'operating_state': operating_state,
        'kw': round(kw, 2),
        'temp': round(temp, 2),
        'production_rate': round(production_rate, 2),
        'units_produced': units_produced,
        'defects': defects,
        'timestamp': int(time.time()),
    }
