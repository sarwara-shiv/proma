import React, { useEffect, useState } from 'react'
import { PersonsInvolved, User, UserRole } from '@/interfaces'
import { getRecords } from '../../../../hooks/dbHooks'
import FormsTitle from '../../../../components/common/FormsTitle';
import { useTranslation } from 'react-i18next';
import { IoIosRemove, IoMdAdd } from "react-icons/io";
import { ObjectId } from 'mongodb';


const PersonsInvolvedForm = () => {
  const {t} = useTranslation();
  const [loader, setLoader] = useState<boolean>(false);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [pInvolved, setPinvolved] = useState<PersonsInvolved[]>([]);

  useEffect(()=>{
    getRoles();

  },[])

  const getRoles = async()=>{
    setLoader(true);
      try {
          const res = await getRecords({type:'roles'});  
          console.log(res);
          if (res.status === "success") {
            setUserRoles(res.data || []); 
          }else{
            setUserRoles([]);
          }
      } catch (error) {
          console.error("Error fetching roles:", error);
          setUserRoles([]);
      }finally{
          setLoader(false);
      }
  }

  // Add User to person involved
  const addPersonRole = (role:ObjectId)=>{
    if(pInvolved && pInvolved.length > 0){
      setPinvolved(prevVal => {
        // Check if the role already exists
        const roleExists = prevVal.some(d => d.role === role);
  
        if (roleExists) {
          // Remove the role if it exists
          return prevVal.filter(d => d.role !== role);
        } else {
          // Add the role if it doesn't exist
          return [...prevVal, { role }];
        }
      });
    }else{
      setPinvolved([...pInvolved, {role}]);
    }
  }

  const isRoleAdded = (role:ObjectId)=>{
    const roleExists = pInvolved.some(d=>d.role===role);
    return roleExists ? true : false;
  }

  return (
    <div> 
      <FormsTitle text={t('FORMS.personsInvolved')}/>
      <div className='flex flex-row flex-wrap gap-2 mt-3 text-sm'>
        {userRoles && userRoles.map((item,index)=>{
          let roleId = item._id as unknown as ObjectId;
          return (
            <div key={`pi-${index}-${item._id}`} className={`
                p-2 mb-2 flex flex-row items-center rounded-sm  cursor-pointer
                ${isRoleAdded(roleId) ? 'text-primary bg-primary-light': 'text-slate-400 bg-slate-100'}
              `}
             onClick={()=>addPersonRole(roleId)}>
              <h2>{item.displayName}</h2>
              <div className={`
                flex items-center flex-row justify-center text-lg ml-2  rounded-full
                 ${isRoleAdded(roleId) ? 'bg-white text-red-600': 'bg-primary-light text-green-600'}
                `}>
                {isRoleAdded(roleId) ? <IoIosRemove />: <IoMdAdd />}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  )
}

export default PersonsInvolvedForm
