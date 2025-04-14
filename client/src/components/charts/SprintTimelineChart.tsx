import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from 'recharts';

// Type for each sprint
type SprintStatus = 'active' | 'completed' | 'upcoming' | 'delayed';

interface Sprint {
  _cid: string;
  name: string;
  startDate: Date | string;
  endDate: Date | string;
  status: SprintStatus;
}

// Type for the chart data format
interface SprintChartData {
  _cid: string;
  name: string;
  startDate: number;
  endDate: number;
  duration: number;
  status: SprintStatus;
}

interface Props {
  sprints: Sprint[];
}

const getStatusColor = (status: SprintStatus): string => {
  switch (status) {
    case 'active':
      return '#22c55e'; // green
    case 'completed':
      return '#3b82f6'; // blue
    case 'upcoming':
      return '#facc15'; // yellow
    case 'delayed':
      return '#ef4444'; // red
    default:
      return '#9ca3af'; // gray
  }
};

const SprintTimelineChart: React.FC<Props> = ({ sprints }) => {
  const data: SprintChartData[] = sprints.map((sprint) => {
    const start = new Date(sprint.startDate).getTime();
    const end = new Date(sprint.endDate).getTime();

    return {
      _cid: sprint._cid,
      name: sprint.name,
      startDate: start,
      endDate: end,
      duration: end - start,
      status: sprint.status,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={50 * data.length}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 20, right: 20, left: 50, bottom: 20 }}
      >
        <XAxis
          type="number"
          domain={['auto', 'auto']}
          tickFormatter={(unixTime) => new Date(unixTime).toLocaleDateString()}
        />
        <YAxis type="category" dataKey="name" />
        <Tooltip
          formatter={(value, name) =>
            name === 'duration'
              ? `${Math.round((value as number) / (1000 * 60 * 60 * 24))} days`
              : value
          }
          labelFormatter={(label) => `Sprint: ${label}`}
        />
        <Bar
          dataKey="duration"
          background
          isAnimationActive={false}
        >
          <LabelList dataKey="name" position="insideLeft" fill="#fff" />
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SprintTimelineChart;
