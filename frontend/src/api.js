const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export async function postAcknowledge(machineId) {
  const res = await fetch(`${BACKEND}/api/incidents/${machineId}/acknowledge`, { method: 'POST' });
  return res.json();
}

export async function postClaimFixed(machineId) {
  const res = await fetch(`${BACKEND}/api/incidents/${machineId}/claim-fixed`, { method: 'POST' });
  return res.json();
}

export async function fetchSnapshot() {
  const res = await fetch(`${BACKEND}/api/machines/snapshot`);
  return res.json();
}

export { BACKEND };
