import { create } from 'zustand';

export const useStore = create((set) => ({
  machines: {},
  incidents: {},
  activityFeed: [],
  selectedMachineId: null,
  floorView: '2d',
  setFloorView: (v) => set({ floorView: v }),

  setSnapshot: (list) => set((s) => {
    const machines = { ...s.machines };
    const incidents = { ...s.incidents };
    for (const m of list) {
      machines[m.machine_id] = m;
      incidents[m.machine_id] = m.incident;
    }
    return { machines, incidents };
  }),

  applyUpdates: (list) => set((s) => {
    const machines = { ...s.machines };
    const incidents = { ...s.incidents };
    let feed = [...s.activityFeed];

    for (const m of list) {
      machines[m.machine_id] = m;
      incidents[m.machine_id] = m.incident;

      for (const ev of m.lifecycleEvents || []) {
        feed.unshift({
          id: `${m.machine_id}-${ev.timestamp}-${ev.type}`,
          timestamp: ev.timestamp,
          machine_id: m.machine_id,
          type: ev.type,
          reason: ev.reason || null
        });
      }
    }

    if (feed.length > 20) feed = feed.slice(0, 20);
    return { machines, incidents, activityFeed: feed };
  }),

  selectMachine: (id) => set({ selectedMachineId: id }),
  clearSelection: () => set({ selectedMachineId: null })
}));
