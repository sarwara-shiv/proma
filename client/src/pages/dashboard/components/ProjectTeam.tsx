import { Headings, ImageIcon } from "../../../components/common";
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
                            <Headings text={role.displayName} type="h4"/>
                            {obj.persons && obj.persons.length > 0 ? 
                                <div className=" text-sm text-primary flex gap-4 mt-2 mb-2">
                                    {obj.persons.map((userObj, uidx)=>{
                                        const user = userObj as unknown as User;
                                        return (
                                            <div key={uidx} className="flex items-center gap-1 bg-gray-100 pr-2 rounded-2xl border">
                                                <div className="w-8 h-8 rounded-full shadow bg-gray-300 flex items-center justify-center overflow-hidden border border-white">
                                                        {user.image && user.name ? (
                                                        <ImageIcon image={user.image} title={user.name} fullImageLink={false} />
                                                        ) : (
                                                        <span className="text-primary font-bold text-md">
                                                            {user.name?.charAt(0).toUpperCase()}
                                                        </span>
                                                        )}
                                                    </div>
                                                <span>
                                                    {user.name}
                                                </span>
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