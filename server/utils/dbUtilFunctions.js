import UserModel from "../models/userModel.js";
// UPDATE USER WORKLOAD
/**
 * 
 * @param {array [id, updateBy:number]} data 
 * @returns 
 */

const updateUserWorkload = async(data=[])=>{
    try{
        if (data && data.length > 0) {
            // Loop through each element in the `data` array
            data.forEach(async (item) => {
            const [id, updateBy] = item;
            const updateValue = updateBy !== undefined ? updateBy : 1;

              if (id) {
                try {
                  // Find the user by ID
                  const user = await UserModel.findById(id);
                  
                  if (!user) {
                    console.warn("User not found with id", id);
                    return;
                  }
          
                  // Check if workload exists and initialize if not
                  if (user.workLoad === undefined) {
                    user.workLoad = 0;
          
                    // If the update is negative, we return early since we can't subtract without workload
                    if (updateValue < 0) {
                      console.warn("Workload is not initialized and update is negative for user", id);
                      return;
                    }
                  }
          
                  // Update the workload using the $inc operator (add or subtract)
                  await UserModel.findByIdAndUpdate(
                    id,
                    {
                      $inc: { workLoad: updateValue } // Add (positive value) or subtract (negative value)
                    },
                    { new: false } // Option to return the updated document (set to false if not needed)
                  );
          
                  console.log('Workload updated for user', id, 'with update value:', updateValue);
                } catch (err) {
                  console.error("Error updating workload for user", id, err);
                }
              }
            });
          }
    }catch(e){
        console.log('some error updating workload');
        return e;
    }
}

export {updateUserWorkload}