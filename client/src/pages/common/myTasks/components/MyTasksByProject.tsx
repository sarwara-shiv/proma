import { NoData } from "../../../../components/common";
import { TasksByProject } from "../../../../interfaces";
import React from "react";

interface ArgsType {
  tasks?: TasksByProject[];
}

const MyTasksByProject:React.FC<ArgsType> = ({tasks}) => {
    console.log(tasks);
    return (
        <div className="flex flex-wrap gap-6">
            {tasks && tasks.length > 0 ? (
                <>
                {tasks.map((data, key)=>(
                    <div key={`tbp-${data.projectID}-${key}`} className={`card bg-white`}>
                        {data.project.name}
                        {data.tasks && data.tasks.length > 0 && <>
                            <div>Tasks: {data.tasks.length}</div>
                        </>}
                    </div>
                ))}
                </>
            ) : (<NoData/>)}
        </div>
    );
}

export default MyTasksByProject