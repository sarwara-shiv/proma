import { DecodedToken, User } from "@/interfaces"

interface ArgsType{
    user:DecodedToken | null
}
const UsersWorklogs:React.FC<ArgsType> = ({user})=>{
    return (
        <div className="w-full mb-6">
            Worklogs
        </div>
    )
}

export default UsersWorklogs