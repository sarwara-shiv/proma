import { useTranslation } from 'react-i18next';
import { getRecords } from '../../hooks/dbHooks';
import { UserRole } from '../../interfaces';
import React, { useEffect, useState } from 'react'

interface ArgsType{
    type?: 'single';
    name?:string;
    selectedRoles?:UserRole[] | string[];
    onChange:(selectedRoles:string[], name:string)=>void;
}


const UserRolesSelect:React.FC<ArgsType> = ({type="single", selectedRoles=[], onChange, name}) => {
    const {t} = useTranslation();
    const [rolesData, setRolesData] = useState<UserRole[]>([]);
    const [idNr, setIdNr] = useState(Math.floor(Math.random() * 100));
    const [singleValueSelect, setSingleValueSelect] = useState('');
    const [multipleValueSelect, setMultipleValueSelect] = useState([]);
    useEffect(() => {
        const fetchRoles = async () => {
          try {
            const res = await getRecords({ type: "roles", body: {} }); 
            if (res.status === "success") {
              setRolesData(res.data);
            }
          } catch (error) {
            console.error("Error fetching roles:", error);
          }
        };

        // set default value
        if(selectedRoles && selectedRoles.length > 0){
            const sRoles = selectedRoles as unknown as UserRole[]; 
            if(type === 'single'){
                const roleId = sRoles[0]._id as unknown as string;
                setSingleValueSelect(roleId);
            }
        }
    
        fetchRoles();
    }, []);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>)=>{
        const {name, value} = event.target;
        if(typeof value === 'string'){
            if(type === 'single'){
                setSingleValueSelect(value);
                const sRole = rolesData.find((role:any)=>{
                    return role['_id'] === value;
                })
                const name = sRole && sRole['name'] ? sRole['name'] : '';
                onChange([value], name);
            }
        }
    }
  return (
    <div className='flex flex-col'>
        <label>{t('roles')}</label>
        <div className={`fields-roles-${type}-wrapper ${(type === 'single' || type === 'multiple') && 'items-center space-x-2'}`}>
            {rolesData && <>
                {type === 'single' && 
                    <>
                    {rolesData.map((item, index)=>{
                        const value = item._id as unknown as string;
                        const checked = singleValueSelect && singleValueSelect === item._id as unknown as string;
                        return (
                            <div key={`role-${index}-${idNr}`} className="inline-flex items-center mb-2">
                                <input 
                                    type='radio'
                                    name={name || 'roles'}
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
                                        bg-gray-200/50
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

export default UserRolesSelect
