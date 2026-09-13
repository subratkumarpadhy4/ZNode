import React from 'react';

const TABS = [
  { id: 'today', label: 'Today' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'savings', label: 'Savings' }
];

export default function Nav({ activeTab, setActiveTab }) {
  return (
    <nav className="nav">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`nav-tab${activeTab === tab.id ? ' nav-tab--active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
