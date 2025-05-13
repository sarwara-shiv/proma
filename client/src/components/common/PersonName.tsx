import { DecodedToken, User } from "@/interfaces"
import ImageIcon from "./ImageIcon"

interface ArgsType{
    user:User,
    key?:string | number,
    showName?:boolean
}
const PersonName:React.FC<ArgsType> = ({user, key, showName=true})=>{
    return (
        <div key={`${key && key}-${user._id}`} className="flex gap-1 items-center justify-center rounded-2xl bg-gray-100 border">
            <div className="w-8 h-8 rounded-full shadow bg-gray-300 flex items-center justify-center overflow-hidden border border-white">
                {user && user.image && user.name ? (
                <ImageIcon image={user.image} title={user.name} fullImageLink={false} />
                ) : (
                <span className="text-primary font-bold text-md">
                    {user.name?.charAt(0).toUpperCase()}
                </span>
                )}
            </div>
            {showName &&  
                <span className="text-primary text-sm pr-2 ">{user.name}</span>
            }
        </div>
    )
}

export default PersonName