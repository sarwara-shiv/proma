import React from "react";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, Typography } from "@mui/material";

// Define TypeScript types
interface UserData {
  userId: { _id: string; name: string; email: string };
  time: { days: number; hours: number; minutes: number };
  totalDuration: number;
  userName: string;
  workingTime: { days: number; hours: number; minutes: number };
}

interface UserPieChartProps {
  users: UserData[];
}

// Function to generate a subtle, pastel color from a user ID
const generateColor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Subtle colors by reducing saturation and adjusting lightness for a pastel look
  const color = `hsl(${hash % 360}, 30%, 75%)`; // Reduced saturation and higher lightness
  return color;
};

const UserPieChart: React.FC<UserPieChartProps> = ({ users }) => {
  // Prepare chart data with total duration broken down into hours (from minutes)
  const userChartData = users.map((user) => {
    const { days, hours, minutes } = user.time;
    const totalHours = Math.floor(user.totalDuration / 60); // Convert total duration to hours
    return {
      name: `${user.userName}`,
      time: totalHours, // Show time as total hours
      userT: user.time,
      totalMinutes: user.totalDuration, // Store total minutes for calculation purposes
      color: generateColor(user.userId._id), // Generate a color dynamically
      timeFormatted: `${user.time.days}d ${user.time.hours}h ${minutes}m (${totalHours}h)` // Show days, hours, minutes, and total hours
    };
  });

  // Calculate total time spent in hours for percentage calculation
  const totalTimeInHours = userChartData.reduce((acc, user) => acc + user.time, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const user = payload[0].payload; // Access the data for the hovered slice
      return (
        <div style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '5px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>
          <p style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>
            {user.name}
          </p>
          <p style={{ fontSize: '12px', color: '#555' }}>
            {user.timeFormatted}
          </p>
        </div>
      );
    }
    return null; // Return null if no tooltip is active
  };

  return (
    <Card sx={{ boxShadow: 3, borderRadius: 2, mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Users' Total Time (Pie Chart)
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={userChartData}
              dataKey="time" // Use the time (in hours) for each slice
              nameKey="name"
              cx="50%" // Position the pie chart in the center
              cy="50%"
              outerRadius={150} // Adjust the radius of the pie chart
              label
              labelLine={false} // Disable the line pointing to labels
            >
              {userChartData.map((user, index) => (
                <Cell key={`cell-${index}`} fill={user.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default UserPieChart;
