import React, { useEffect, useState } from 'react'
import { PersonsInvolved, User, UserRole,KickoffResponsibility } from '@/interfaces'
import { getRecords, getRecordWithID } from '../../../../hooks/dbHooks'
import FormsTitle from '../../../../components/common/FormsTitle';
import { useTranslation } from 'react-i18next';
import { IoIosRemove, IoMdAdd } from "react-icons/io";
import { ObjectId } from 'mongodb';
import MentionUserInput from '../../../../components/forms/MensionUserInput';
import { CustomInput } from '../../../../components/forms';

interface ArgsType{
  selectedValues:KickoffResponsibility[];
  onChange:(value:KickoffResponsibility[])=>void
}


const KickoffResponsibilities:React.FC<ArgsType> = ({selectedValues=[], onChange}) => {
  const {t} = useTranslation();
  const [loader, setLoader] = useState<boolean>(false);
  const [userGroups, setUserGroups] = useState<UserRole[]>([]);
  const [pInvolved, setPinvolved] = useState<KickoffResponsibility[]>(selectedValues);
  const [usersData, setUsersData] = useState<User[]>([]);

  useEffect(()=>{
    getGroups();
    getUsersData();
  },[])
  useEffect(()=>{
    onChange(pInvolved);
    
  },[pInvolved])

  const getGroups = async()=>{
    setLoader(true);
      try {
          const res = await getRecords({type:'groups'});  
          if (res.status === "success") {
            setUserGroups(res.data || []); 
            console.log(res.data)
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

  const getUsersData = async()=>{
    console.log('getUserData');
    const allPersonIds = selectedValues.map(item => item.persons).flat();
    console.log(pInvolved);
    console.log(selectedValues);
    if(allPersonIds && allPersonIds.length > 0){
      console.log(allPersonIds);
      try{
        const ids = allPersonIds as unknown as string[];
        console.log(ids);
        const response = await getRecordWithID({id:ids, type:'users'});
        if(response.status === 'success' && response.data && response.data.length > 0){
          setUsersData(response.data);
        }
      }catch(error){
  
      }
    }
  }

  const addPersons = (user: User, data: any) => {
    const { role } = data;
    const { _id  }= user; // User's _id
    const person = _id as unknown as ObjectId;

    if(pInvolved && pInvolved.length > 0){

      // set data
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

      // set users data
      setUsersData((prevVal) => {
          const userExists = prevVal.some(d => d._id === user._id);
          if(userExists){
            return [...prevVal];
          }else{
            return [...prevVal, user];
          }
      });
    }else{
      setPinvolved([...pInvolved, {role, persons:[person]}]);
      setUsersData([...usersData, user]);
    }
  };

  const removeUser = ({role, user}:{role:ObjectId, user:ObjectId})=>{
    const person = user as unknown as ObjectId;

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

        if (userExists) {
          roleData.persons = roleData.persons.filter((p) => p !== person);
          if (roleData.persons.length === 0) {
            return prevVal.filter((_, index) => index !== roleIndex);
          }
          prevVal[roleIndex] = roleData;
        }

        return [...prevVal];
      }
      return [...prevVal];
    });
  }

  const handleInputChange=({field, role, index, value}:{field:string, role:ObjectId, index:number, value:string})=>{
    setPinvolved(prevVal => {
        // Check if the role already exists
        const roleExists = prevVal.some(d => d.role === role);
  
        if (roleExists) {
          const roleIndex = prevVal.findIndex((d) => d.role === role);
          const roleData = prevVal[roleIndex];
        if(field === 'work' || field === 'details'){
            roleData[field] = value;
            prevVal[roleIndex] = roleData;
        }

          return [...prevVal];
        } else {
          // Add the role if it doesn't exist
          return [...prevVal];
        }
      });
  }
  

  const isGroupAdded = (role:ObjectId)=>{
    const roleExists = pInvolved.some(d=>d.role===role);
    return roleExists ? true : false;
  }

  return (
    <div> 
      <FormsTitle text={t('FORMS.kickoffResponsibilities')}/>
      <div className='text-sm fields-wrap grid grid-cols-1 md:grid-cols-1 gap-2'>
        {userGroups && userGroups.map((item,index)=>{
          let _id = item._id as unknown as ObjectId;
          const isGroup = isGroupAdded(_id);
          return (
            <div key={`pi-${index}-${item._id}`} className={`
                p-2 mb-2 flex flex-col items-left rounded-sm  cursor-pointer
                ${isGroup ? 'text-primary bg-primary-light': 'text-slate-400 bg-slate-100'}
              `}
             >
               
              <div className='flex flex-row items-center'>
                  <h2>{item.displayName}</h2>
                </div>
                <div className='w-full'>
                    <div className='flex flex-col'>
                    {pInvolved && pInvolved.length > 0 && pInvolved.map((p,pk)=>{
                        return (
                        <div key={`prk-${index}-${pk}-${p.role}`} className='w-full'>                     
                            {p.role as unknown as string === _id as unknown as string && 
                            <div className='w-full block'>
                                <div className='flex flex-row gap-2 mt-2'>
                                    {p.persons && p.persons.map((pers, persk)=>{
                                        const pId = pers as unknown as string;
                                        const user = usersData.find((ud) => ud._id as unknown as string === pId);
                                        return (
                                            <div key={`pk-${pk}-${persk}`} className='bg-white p-1 flex flex-row items-center rounded-sm'>
                                                <span>{user && user.name}</span>
                                                <div onClick={()=>removeUser({role:_id, user:pers})}  className={`
                                                    flex items-center flex-row justify-center text-lg ml-2  rounded-full
                                                    bg-red-100 text-red-600
                                                    `}>
                                                    <IoIosRemove />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                                
                                {p.role && p.persons && p.persons.length > 0 && 
                                <div className='flex flex-col'>
                                    <div className='w-full'>
                                        <CustomInput type='text' label='work' value={p.work}
                                        onChange={(e)=>handleInputChange({field:'work', role:_id, index, value:e.target.value})} />
                                    </div>
                                    <div className='w-full'>
                                        <CustomInput type='textarea' label='details' value={p.details}
                                        onChange={(e)=>handleInputChange({field:'details', role:_id, index,value:e.target.value})} />
                                    </div>
                                </div>
                                }
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

export default KickoffResponsibilities
