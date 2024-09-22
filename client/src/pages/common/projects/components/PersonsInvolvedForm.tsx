import React, { useEffect, useState } from 'react'
import { PersonsInvolved, User, UserRole } from '@/interfaces'
import { getRecords } from '../../../../hooks/dbHooks'
import FormsTitle from '../../../../components/common/FormsTitle';
import { useTranslation } from 'react-i18next';
import { IoIosRemove, IoMdAdd } from "react-icons/io";
import { ObjectId } from 'mongodb';

interface ArgsType{
  selectedValues:PersonsInvolved[];
  onChange:(value:PersonsInvolved[])=>void
}
const PersonsInvolvedForm:React.FC<ArgsType> = ({selectedValues=[], onChange}) => {
  const {t} = useTranslation();
  const [loader, setLoader] = useState<boolean>(false);
  const [userGroups, setUserGroups] = useState<UserRole[]>([]);
  const [pInvolved, setPinvolved] = useState<PersonsInvolved[]>([]);

  useEffect(()=>{
    getGroups();

  },[])
  useEffect(()=>{
    onChange(pInvolved);

  },[pInvolved])

  const getGroups = async()=>{
    setLoader(true);
      try {
          const res = await getRecords({type:'groups'});  
          console.log(res);
          if (res.status === "success") {
            setUserGroups(res.data || []); 
          }else{
            setUserGroups([]);
          }
      } catch (error) {
          console.error("Error fetching roles:", error);
          setUserGroups([]);
      }finally{
          setLoader(false);
      }
  }

  // Add User to person involved
  const addPersonGroup = (role:ObjectId)=>{
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

  const isGroupAdded = (role:ObjectId)=>{
    const roleExists = pInvolved.some(d=>d.role===role);
    return roleExists ? true : false;
  }

  return (
    <div> 
      <FormsTitle text={t('FORMS.personsInvolved')}/>
      <div className='flex flex-row flex-wrap gap-2 mt-3 text-sm'>
        {userGroups && userGroups.map((item,index)=>{
          let _id = item._id as unknown as ObjectId;
          const isGroup = isGroupAdded(_id);
          return (
            <div key={`pi-${index}-${item._id}`} className={`
                p-2 mb-2 flex flex-row items-center rounded-sm  cursor-pointer
                ${isGroup ? 'text-primary bg-primary-light': 'text-slate-400 bg-slate-100'}
              `}
             onClick={()=>addPersonGroup(_id)}>
              <h2>{item.displayName}</h2>
              <div className={`
                flex items-center flex-row justify-center text-lg ml-2  rounded-full
                 ${isGroup ? 'bg-white text-red-600': 'bg-primary-light text-green-600'}
                `}>
                {isGroup ? <IoIosRemove />: <IoMdAdd />}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  )
}

export default PersonsInvolvedForm
