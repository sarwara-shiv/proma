import React, { useEffect, useState } from 'react'
import { PersonsInvolved, User, UserRole } from '@/interfaces'
import { getRecords } from '../../../../hooks/dbHooks'
import FormsTitle from '../../../../components/common/FormsTitle';
import { useTranslation } from 'react-i18next';
import { IoIosRemove, IoMdAdd } from "react-icons/io";
import { ObjectId } from 'mongodb';
import MentionUserInput from '../../../../components/forms/MensionUserInput';

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
    console.log(pInvolved);
  },[pInvolved])

  const getGroups = async()=>{
    setLoader(true);
      try {
          const res = await getRecords({type:'groups'});  
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
    // if(pInvolved && pInvolved.length > 0){
    //   setPinvolved(prevVal => {
    //     // Check if the role already exists
    //     const roleExists = prevVal.some(d => d.role === role);
  
    //     if (roleExists) {
    //       // Remove the role if it exists
    //       return prevVal.filter(d => d.role !== role);
    //     } else {
    //       // Add the role if it doesn't exist
    //       return [...prevVal, { role, persons:[] }];
    //     }
    //   });
    // }else{
    //   setPinvolved([...pInvolved, {role, persons:[]}]);
    // }
  }

  const addPersons = (user: User, data: any) => {
    const { role } = data;
    const { _id  }= user; // User's _id
    const person = _id as unknown as ObjectId;

    if(pInvolved && pInvolved.length > 0){
      setPinvolved(prevVal => {
        // Check if the role already exists
        const roleExists = prevVal.some(d => d.role === role);
  
        if (roleExists) {
          const roleIndex = prevVal.findIndex((d) => d.role === role);
          const roleData = prevVal[roleIndex];

          if (!roleData.persons) {
            roleData.persons = [];
          }

          const userExists = roleData.persons.some((p) => p === person);
          console.log(userExists);

          if (!userExists) {
            console.log(person);

            roleData.persons = [...roleData.persons, person]; 
            console.log(roleData);
            prevVal[roleIndex] = roleData;
          }

          return [...prevVal];
        } else {
          // Add the role if it doesn't exist
          return [...prevVal, { role, persons:[person] }];
        }
      });
    }else{
      setPinvolved([...pInvolved, {role, persons:[person]}]);
    }
  };
  

  const isGroupAdded = (role:ObjectId)=>{
    const roleExists = pInvolved.some(d=>d.role===role);
    return roleExists ? true : false;
  }

  return (
    <div> 
      <FormsTitle text={t('FORMS.personsInvolved')}/>
      <div className='text-sm fields-wrap grid grid-cols-1 md:grid-cols-2 gap-2'>
        {userGroups && userGroups.map((item,index)=>{
          let _id = item._id as unknown as ObjectId;
          const isGroup = isGroupAdded(_id);
          return (
            <div key={`pi-${index}-${item._id}`} className={`
                p-2 mb-2 flex flex-col items-left rounded-sm  cursor-pointer
                ${isGroup ? 'text-primary bg-primary-light': 'text-slate-400 bg-slate-100'}
              `}
             onClick={()=>addPersonGroup(_id)}>
              <div className='flex flex-row items-center'>
                  <h2>{item.displayName}</h2>
                  
                  <div className={`
                    flex items-center flex-row justify-center text-lg ml-2  rounded-full
                    ${isGroup ? 'bg-white text-red-600': 'bg-primary-light text-green-600'}
                    `}>
                    {isGroup ? <IoIosRemove />: <IoMdAdd />}
                  </div>
                </div>
                <div>
                <div className='flex flex-row'>
                  {pInvolved && pInvolved.length > 0 && pInvolved.map((p,pk)=>{
                    return (
                      <div key={`prk-${index}`}>                     
                        {p.role as unknown as string === _id as unknown as string && 
                        <div className='flex flex-row gap-2 mt-2'>
                          {p.persons && p.persons.map((pers, persk)=>{
                            return (
                              <div key={`pk-${pk}-${persk}`} className='bg-white p-1'>
                                {pers as unknown as string}
                              </div>
                            )
                          })}
                        </div>
                        }
                      </div>
                    )
                  })}
                </div>
                </div>
                <div className="mt-2 w-full">
                  <MentionUserInput type='users' inputType='text' data={{role: item._id}} onClick={addPersons}/>
                </div>
            </div>
          );
        })}
      </div>

    </div>
  )
}

export default PersonsInvolvedForm
