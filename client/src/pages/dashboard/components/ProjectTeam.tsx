import { Kickoff, User, UserRole } from "@/interfaces";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface ArgsType {
    responsibilities: Kickoff['responsibilities']
}
const ProjectTeam:React.FC<ArgsType> = ({responsibilities})=>{
    const {t} = useTranslation();
    useEffect(()=>{

    },[responsibilities])

    return (
        <div className="">
            {responsibilities && responsibilities.length > 0 &&
                <div className="flex flex-col gap-4">
                    {responsibilities.map((obj, idx)=>{
                        const role = obj.role as unknown as UserRole;
                    return (
                        <div key={idx} className="text-slate-600 mb-2 border rounded-md p-2">
                            <div className="font-bold text-md">{role.displayName}</div>
                            {obj.persons && obj.persons.length > 0 ? 
                                <div className=" text-sm text-primary">
                                    {obj.persons.map((userObj, uidx)=>{
                                        const user = userObj as unknown as User;
                                        return (
                                            <div key={uidx} className="">
                                                {user.name}
                                            </div>
                                        )
                                    })}
                                </div> 
                                : <div>
                                    --
                                </div>
                            }
                            {obj.work && 
                                <div className="text-sm" dangerouslySetInnerHTML={{__html:obj.work}} />
                            }
                            {obj.details && 
                                <div className="text-xs italic text-slate-400" dangerouslySetInnerHTML={{__html:obj.details}} />
                            }
                        </div>
                    )})}
                </div>
            }
        </div>
    )
}
export default ProjectTeam;