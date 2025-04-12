import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

// Define task and column types
interface Task {
  id: string;
  name: string;
  status: string;
}

interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

interface Data {
  tasks: Task[];
  columns: { [key: string]: Column };
  columnOrder: string[];
}

// Sample data
const initialData: Data = {
  tasks: [
    { id: "task-1", name: "Task 1", status: "toDo" },
    { id: "task-2", name: "Task 2", status: "toDo" },
    { id: "task-3", name: "Task 3", status: "inProgress" },
    { id: "task-4", name: "Task 4", status: "completed" },
  ],
  columns: {
    toDo: {
      id: "toDo",
      title: "To Do",
      taskIds: ["task-1", "task-2"],
    },
    inProgress: {
      id: "inProgress",
      title: "In Progress",
      taskIds: ["task-3"],
    },
    completed: {
      id: "completed",
      title: "Completed",
      taskIds: ["task-4"],
    },
  },
  columnOrder: ["toDo", "inProgress", "completed"],
};

const EditSprints_copy: React.FC = () => {
  const [data, setData] = useState<Data>(initialData);

  // Handle the drag and drop logic
  const handleDragEnd = (result: DropResult): void => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
  
    const sourceColumn = data.columns[source.droppableId];
    const destColumn = data.columns[destination.droppableId];
  
    // Moving within the same column
    if (sourceColumn === destColumn) {
      const newTaskIds = Array.from(sourceColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);
  
      const newColumn = {
        ...sourceColumn,
        taskIds: newTaskIds,
      };
  
      setData((prev) => ({
        ...prev,
        columns: {
          ...prev.columns,
          [newColumn.id]: newColumn,
        },
      }));
    } else {
      // Moving to a different column — update status too
      const startTaskIds = Array.from(sourceColumn.taskIds);
      startTaskIds.splice(source.index, 1);
      const endTaskIds = Array.from(destColumn.taskIds);
      endTaskIds.splice(destination.index, 0, draggableId);
  
      const updatedTasks = data.tasks.map((task) =>
        task.id === draggableId ? { ...task, status: destColumn.id } : task
      );
  
      const newColumns = {
        ...data.columns,
        [sourceColumn.id]: {
          ...sourceColumn,
          taskIds: startTaskIds,
        },
        [destColumn.id]: {
          ...destColumn,
          taskIds: endTaskIds,
        },
      };
  
      setData({
        tasks: updatedTasks,
        columns: newColumns,
        columnOrder: data.columnOrder,
      });
    }
  };
  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8">Sprint Tasks</h2>
      <div className="flex justify-start items-start gap-8 overflow-x-auto pb-8 max-h-60">
        <div className="w-[300px] bg-gray-100 p-4 rounded-lg shadow-lg">

        </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex justify-between space-x-8 flex-1 w-auto">
          {data.columnOrder.map((columnId) => {
            const column = data.columns[columnId];
            const tasks = column.taskIds.map(
              (taskId) => data.tasks.find((task) => task.id === taskId)!
            );

            return (
              <div
                key={columnId}
                className="w-[300px] bg-gray-100 p-4 rounded-lg shadow-lg"
              >
                <h3 className="text-xl font-semibold text-center mb-4">
                  {column.title}
                </h3>
                <Droppable droppableId={column.id} type="task">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-4"
                    >
                      {tasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white p-4 rounded-lg shadow-sm cursor-pointer"
                            >
                              <p className="text-gray-700">{task.name}</p>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
    </div>
  );
};

export default EditSprints_copy;
