import { Headings } from "../../../../components/common";
import { getRecordsWithFilters } from "../../../../hooks/dbHooks";
import { OrderByFilter, Project } from "@/interfaces";
import { format } from "date-fns";
import { useEffect, useState } from "react";

interface ArgsType {
    isAdmin:boolean;
    isManager:boolean;
}
const AdminProjectsList:React.FC<ArgsType> = ({isAdmin, isManager})=>{
    const [projectsData, setProjectsData] =  useState<Project[]>([]);

    useEffect(()=>{
        getData();
    },[]);

    const getData = async()=>{
        try{
            const orderBy:OrderByFilter = {
                status:1
            }
            const res = await getRecordsWithFilters({type:'projects', limit:5, pageNr:1, orderBy});
            console.log(res);
            if(res && res.status === 'success'){
                console.log(res.data);
                setProjectsData(res.data);
            }

        }catch(error){
            console.error(error);
        }
    }


    return <div className="p-2 card bg-white w-full max-w-lg">
        <Headings text="Projects" type="section"/>
        <div className="flex flex-col gap-1">
            {projectsData && projectsData.length > 0 && projectsData.map((project, idx)=>{
                return (
                    <div key={`${project._id}-${idx}`} className={`
                        flex flex-row text-sm p-1 gap-2 text-slate-500
                    `}>
                        <div className="">{project._cid}</div>
                        <div className="">{project.projectType}</div>
                        <div className="">{project.name}</div>
                        <div className="">{project.status}</div>
                        <div className="">{format(project.startDate, 'dd.MM.yyyy')}</div>
                    </div>
                )
            })
        }
        </div>
    </div>
} 

export default AdminProjectsList