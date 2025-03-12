import { useTranslation } from "react-i18next";
import { NoData } from "../../../../components/common";
import { TasksByProject } from "../../../../interfaces";
import React from "react";

interface ArgsType {
  tasks?: TasksByProject[];
}

const MyTasksByProject:React.FC<ArgsType> = ({tasks}) => {
    console.log(tasks);
    const {t} = useTranslation()
    return (
        <div className="flex flex-wrap gap-6">
            {tasks && tasks.length > 0 ? (
                <>
                {tasks.map((data, key)=>(
                    <div key={`tbp-${data.projectID}-${key}`} className={`card bg-white`}>
                        <div className="text-primary text-md font-bold gap-2">
                            {data.project.name}
                            <span className="text-xs px-1 py-0.5 text-slate-500 ml-1 font-normal bg-slate-200/60 rounded-sm">{t(`${data.project.projectType}`)}</span>
                        </div>
                        <div className="text-sm">
                            {data.tasks && data.tasks.length > 0 && <>
                                <div>Tasks: {data.tasks.length}</div>
                            </>}
                        </div>
                    </div>
                ))}
                </>
            ) : (<NoData/>)}
        </div>
    );
}

export default MyTasksByProject