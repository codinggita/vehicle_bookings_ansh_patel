import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
export default function Dashboard() {
  const [data] = useState([{ name: 'A', rides: 10 }]);
  return (
    <div className="dashboard-container">
      <h2>Command Center Dashboard</h2>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <AreaChart data={data}>
            <Area dataKey="rides" stroke="#b9e85f" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
