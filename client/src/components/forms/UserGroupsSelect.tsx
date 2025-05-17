import { useTranslation } from 'react-i18next';
import { getRecords } from '../../hooks/dbHooks';
import { UserGroup } from '../../interfaces';
import React, { useEffect, useState } from 'react'
import { Headings } from '../common';

interface ArgsType{
    type?: 'single' | 'multiple';
    name?:string;
    selectedValues?:UserGroup[] | string[];
    onChange:(selectedValues:string[], name:string)=>void;
}


const UserGroupsSelect:React.FC<ArgsType> = ({type="single", selectedValues=[], onChange, name}) => {
    const {t} = useTranslation();
    const [groupsData, setGroupsData] = useState<UserGroup[]>([]);
    const [idNr, setIdNr] = useState(Math.floor(Math.random() * 100));
    const [singleValueSelect, setSingleValueSelect] = useState('');
    const [multipleValueSelect, setMultipleValueSelect] = useState<string[]>([]);
    useEffect(() => {
        console.log(selectedValues);
        const fetchGroups = async () => {
          try {
            const res = await getRecords({ type: "groups", body: {} }); 
            if (res.status === "success") {
              setGroupsData(res.data);
            }
          } catch (error) {
            console.error("Error fetching roles:", error);
          }
        };

        // set default value
        if(selectedValues && selectedValues.length > 0){
            const sGroups = selectedValues as unknown as UserGroup[]; 
            if(type === 'single'){
                const groupId = sGroups[0]._id as unknown as string;
                setSingleValueSelect(groupId);
            }
            if(type === 'multiple'){
                const groupIds = sGroups.map((group) => group._id as unknown as string);
                setMultipleValueSelect(groupIds);
            }
        }

        fetchGroups();
    }, []);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>)=>{
        const {name, value} = event.target;
        if(typeof value === 'string'){
            if(type === 'single'){
                setSingleValueSelect(value);
                const sGroup = groupsData.find((role:any)=>{
                    return role['_id'] === value;
                })
                const name = sGroup && sGroup['name'] ? sGroup['name'] : '';
                onChange([value], name);
            }
            if(type === 'multiple'){
                const checkedBoxes = Array.from(
                    document.querySelectorAll(`input[name="${name}"]:checked`)
                  ).map((input) => (input as HTMLInputElement).value);
                setMultipleValueSelect(checkedBoxes);
                const values = checkedBoxes.length > 0 ? checkedBoxes : [];
                onChange([...values], name);
            }
        }
    }
  return (
    <div className='flex flex-col mt-4 border p-2 rounded-md'>
        <div className='mb-2'>
            <Headings text={t('userGroups')} type="h6" />
        </div>
        <div className={`fields-roles-${type}-wrapper ${(type === 'single' || type === 'multiple') && 'flex gap-2 flex-wrap'}`}>
            {groupsData && <>
                {type === 'single' && 
                    <>
                    {groupsData.map((item, index)=>{
                        const value = item._id as unknown as string;
                        const checked = singleValueSelect && singleValueSelect === item._id as unknown as string;
                        return (
                            <div key={`role-${index}-${idNr}`} className="items-center">
                                <input 
                                    type='radio'
                                    name={name || 'groups'}
                                    value={value}
                                    className='peer sr-only'
                                    id={`role-${index}-${idNr}`}
                                    onChange={handleInputChange}
                                    { ...checked ? {checked:true} : {}}
                                /> 

                                <label htmlFor={`role-${index}-${idNr}`} 
                                className='cursor-pointer
                                        px-2
                                        py-1
                                        rounded
                                        text-sm
                                        border
                                        text-gray-400
                                        border-gray-200/50
                                        focus:outline-none
                                        active:outline-none
                                        peer-checked:bg-primary-light
                                        peer-checked:text-primary
                                        peer-checked:border-transparent
                                        peer-focus:ring-none
                                        peer-focus:ring-none
                                        transition-colors
                                        duration-150'
                                >
                                    {item.displayName}
                                </label>

                            </div>
                        )
                    })}
                    </>
                }
                {type === 'multiple' && 
                    <>
                    {groupsData.map((item, index)=>{
                        const value = item._id as unknown as string;
                        const sVal = multipleValueSelect.some((d)=>{
                            return d === item._id as unknown as string
                        })
                        const checked = sVal ? true : false;
                        return (
                            <div key={`role-${index}-${idNr}`} className="inline-flex items-center">
                                <input 
                                    type='checkbox'
                                    name={name || 'groups'}
                                    value={value}
                                    className='peer sr-only'
                                    id={`role-${index}-${idNr}`}
                                    onChange={handleInputChange}
                                    { ...checked ? {checked:true} : {}}
                                /> 

                                <label htmlFor={`role-${index}-${idNr}`} 
                                className='cursor-pointer
                                        px-2
                                        py-1
                                        rounded
                                        text-sm
                                        border
                                        text-gray-400
                                        border-gray-200
                                        focus:outline-none
                                        active:outline-none
                                        peer-checked:bg-primary-light
                                        peer-checked:text-primary
                                        peer-checked:border-transparent
                                        peer-focus:ring-none
                                        peer-focus:ring-none
                                        transition-colors
                                        duration-150'
                                >
                                    {item.displayName}
                                </label>

                            </div>
                        )
                    })}
                    </>
                }
            </>}
        
        </div>
    </div>
  )
}

export default UserGroupsSelect
