import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ISprint, Task } from "../../../../interfaces";
import { useMemo } from "react";
import { countTasksByStatus } from "../../../../utils/tasksUtils";
import { useTranslation } from "react-i18next";

interface Props {
  sprints: ISprint[];
}

const SprintStatusChart: React.FC<Props> = ({ sprints }) => {
  const { t } = useTranslation();

  // Transform sprints into chart data
  const data = useMemo(() => {
    return sprints.map((sprint) => {
      const statusCount = countTasksByStatus(sprint.backlog as unknown as Task[]);
      return {
        sprintId: sprint._cid,
        ...statusCount,
      };
    });
  }, [sprints]);

  // Dynamic color per status
  const statusColors: Record<string, string> = {
    completed: "#22c55e",
    toDo: "#f59e0b",
    inProgress: "#3b82f6",
    blocked: "#ef4444",
    review: "#8b5cf6",
  };

  const allStatuses = Array.from(
    new Set(data.flatMap((d) => Object.keys(d).filter((key) => key !== "sprintId")))
  );

  return (
    <div className="w-full h-[300px] p-4 bg-white shadow rounded mb-12">
      <h2 className="text-lg font-bold mb-2">{t("Sprint Task Status Summary")}</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="sprintId" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          {allStatuses.map((status) => (
            <Bar
              key={status}
              dataKey={status}
              stackId="a"
              fill={statusColors[status] || "#ccc"}
              name={t(status)}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SprintStatusChart;
