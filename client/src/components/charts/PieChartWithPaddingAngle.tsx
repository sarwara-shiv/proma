import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PieChartWithPaddingAngleProps {
  data: any[]; // Accept data as props
}

// Define colors for different statuses
const COLORS = ['#00C49F', '#FFBB28', '#0088FE'];

// Function to count occurrences of each status
const preprocessData = (data: { status: string }[]) => {
  const statusCount = data.reduce((acc, cur) => {
    acc[cur.status] = (acc[cur.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Convert the object to an array for Recharts
  return Object.keys(statusCount).map((status) => ({
    name: status,
    value: statusCount[status],
  }));
};

const PieChartWithPaddingAngle: React.FC<PieChartWithPaddingAngleProps> = ({ data }) => {
  const pieData = preprocessData(data);

  return (
    <div className="w-full  p-2 bg-gray-100 rounded-xl">

      <div className="w-full h-[300px] ">
      
      {/* // ResponsiveContainer wraps the PieChart and makes it responsive */}
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%" // X position
              cy="50%" // Y position
              outerRadius={70} // Radius of the pie
              fill="#8884d8"
              paddingAngle={5} // Padding between slices
              label // Adds labels to each slice
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PieChartWithPaddingAngle;
