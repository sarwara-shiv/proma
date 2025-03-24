import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LabelList } from "recharts";
import { Card, CardContent, Typography } from "@mui/material";

// Define TypeScript types
interface UserData {
  userId: { _id: string; name: string; email: string };
  time: { days: number; hours: number; minutes: number };
  totalDuration: number;
  userName: string;
  workingTime: { days: number; hours: number; minutes: number };
}

interface UserBarChartProps {
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

const UserBarChart: React.FC<UserBarChartProps> = ({ users }) => {
  // Convert duration (in minutes) to days, hours, and minutes
  const convertToTime = (duration: number) => {
    const days = Math.floor(duration / 1440); // 1 day = 1440 minutes
    const hours = Math.floor((duration % 1440) / 60); // 1 hour = 60 minutes
    const minutes = duration % 60; // Remaining minutes
    return { days, hours, minutes };
  };

  // Prepare chart data with total duration broken down into days, hours, and minutes
  const userChartData = users.map((user) => {
    const { days, hours, minutes } = user.time;
    return {
      name: `${user.userName}`,
      time: `${Math.floor(user.totalDuration/60)}`, // Show time as total hours
      userT:user.time,
      totalMinutes: user.totalDuration, // Store total minutes for calculation purposes
      color: generateColor(user.userId._id), // Generate a color dynamically
      timeFormatted: `${user.time.days}d ${user.time.hours}h ${minutes}m (${Math.floor(user.totalDuration/60)}h)` // Show days, hours, minutes, and total hours
    };
  });

  // Find the max total duration in minutes to display the max value correctly
  const maxMinutes = Math.max(...userChartData.map((data) => data.totalMinutes));

  // Formatter to show days, hours, or minutes on the X-axis
  const formatXAxis = (value: number) => {
    if (value >= 1440) {
      // Convert to days and show as integer (no decimals)
      return `${Math.floor(value / 1440)}`; // Use Math.floor to get absolute days (rounded down to nearest day)
    } else if (value >= 60) {
      // Convert to hours and show as integer (no decimals)
      return `${Math.floor(value / 60)}h`; // Use Math.floor to get absolute hours (rounded down)
    } else {
      // Show minutes as integer
      return `${Math.floor(value)}m`; // No decimal places, just show minutes
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const user = payload[0].payload; // Access the data for the hovered bar
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

  const getMaxLabelWidth = () => {
    const longestLabel = userChartData.reduce((max, user) => {
      const labelLength = `${user.name} ${user.userT.days}d ${user.userT.hours}h ${user.userT.minutes}`.length;
      return Math.max(max, labelLength);
    }, 0);
    return longestLabel;
  };

  const yAxisWidth = useMemo(() => getMaxLabelWidth()*4, [userChartData]);
  console.log(yAxisWidth)
   // Custom tick component for Y-Axis
   const CustomTick = ({ x, y, payload }: any) => {
    const user = userChartData.find((u) => u.name === payload.value); // Find the user by name
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={-110}
          y={0}
          dy={-5} // Position the label with a slight offset
          textAnchor="right"
          fill="#555"
          fontSize="12px"
          fontWeight="bold"
        >
          {user?.name}
        </text>
        <text
          x={-110}
          y={0}
          dy={7} // Position the time below the name
          textAnchor="right"
          fill="#888"
          fontSize="10px"
          width={100}
          style={{whiteSpace:''}}
        >
          {user?.timeFormatted}
        </text>
      </g>
    );
  };

  return (
    <Card sx={{ boxShadow: 3, borderRadius: 2, mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Users' Total Time
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            layout="vertical" // Vertical bar chart
            data={userChartData}
            margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              label={{ value: "Time", position: "insideBottomRight", offset: 0 }}
              tickFormatter={formatXAxis} // Apply the custom formatter
            />
            <YAxis
              type="category"
              dataKey="name"
              width={yAxisWidth} // Increased width to accommodate extra space for custom tick
              tick={<CustomTick />} // Use the CustomTick component to render Y-axis labels
            />
            <Tooltip content={<CustomTooltip />} />
            {/* <Tooltip
              formatter={(value: number, name: string, props: any) => {
                // Ensure props.payload is not undefined and contains valid data
                // console.log(props);
                if (props.payload && props.payload) {
                  const user = props.payload;
                  return [`${user.timeFormatted}`]
                }
                return "No data"; // Default fallback
              }}
            /> */}
            <Bar dataKey="totalMinutes" barSize={10}>
              {userChartData.map((user, index) => (
                <Cell key={`cell-${index}`} fill={user.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default UserBarChart;

