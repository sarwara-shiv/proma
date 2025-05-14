import { workLogActions } from "../../../../hooks/dbHooks";
import { AdminActiveWorklogType, DecodedToken, User } from "@/interfaces"
import { useEffect, useState } from "react"
import ActiveWorklogs from "./ActiveWorklogs";
import { HorizontalScroll } from "../../../../components/common";
import ProjectWorklogs from "./ProjectWorklogs";

interface ArgsType{
    user:DecodedToken | null
}
const UsersWorklogs:React.FC<ArgsType> = ({user})=>{
    const [dataType, setDataType] = useState<string>();

    useEffect(()=>{
        getAdminReport();
    },[]);

    const getAdminReport =async()=>{
        const type = "weekly";
        try{
            const res = await workLogActions({type:"adminReport", body:{startDate:"2025-05-01", endDate:"2025-05-30"}});
            console.log(res);

        }catch(err){
            console.error(err);
        }
    }


    return (
        <div className="w-full mb-6">
            <div className="flex flex-col">
                <div className="flex-1 mb-6">
                    <ActiveWorklogs />
                </div>
                <div className="flex-1 mb-6">
                    <ProjectWorklogs />
                </div>
            </div>
        </div>
    )
}

export default UsersWorklogs