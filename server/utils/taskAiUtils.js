import UserModel from '../models/userModel.js'; 
export const fixTasksOverdueQuery = async (rawQuery) => {
    console.log('------fix query');
    const result = [];
    const newQuery = {};
    const data = {};
    if(rawQuery){
        if(rawQuery.assignedTo){
            newQuery.dueDate = {$lte:new Date()}
            if(rawQuery.assignedTo._id) newQuery.assignedTo = rawQuery.assignedTo;
            if(rawQuery.assignedTo._cid){
                const user = await UserModel.findOne({ _cid: rawQuery.assignedTo._cid }, { _id: 1, name:1 });
                if(user){
                    newQuery.assignedTo = user._id;
                    data.assignedTo = user.name;
                }
            }
        }
        result['query'] = newQuery;
        result['data'] = data;
    }

    return result;
}