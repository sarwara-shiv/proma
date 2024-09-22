import React, { useEffect, useState } from 'react'
import { PersonsInvolved, User, UserRole } from '@/interfaces'
import { getRecords } from '../../../../hooks/dbHooks'
import FormsTitle from '../../../../components/common/FormsTitle';
import { useTranslation } from 'react-i18next';


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

  return (
    <div>
      <FormsTitle text={t('FORMS.personsInvolved')}/>
      <div>
        {userRoles && userRoles.map((item,index)=>{
          return (
            <div key={`pi-${index}-${item._id}`}>
                <h2>{item.displayName}</h2>
            </div>
          );
        })}
      </div>

    </div>
  )
}

export default PersonsInvolvedForm
