import CustomDateTimePicker from '../../../../components/forms/CustomDatePicker';
import { CustomDropdown, CustomInput } from '../../../../components/forms';
import { addUpdateRecords, getRecords } from '../../../../hooks/dbHooks';
import { AlertPopupType, FlashPopupType, MainTask, NavItem, RelatedUpdates, User, UserGroup } from '@/interfaces'
import { ObjectId } from 'mongodb';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import MentionUserInput from '../../../../components/forms/MensionUserInput';
import { TaskCategory, TaskStatuses } from '../../../../config/predefinedDataConfig';
import CustomSmallButton from '../../../../components/common/CustomSmallButton';
import { format } from 'date-fns';
import { CustomAlert, FlashPopup } from '../../../../components/common';
import {useAuthContext } from '../../../../context/AuthContext';

interface ArgsType{
    pid:ObjectId | string;
    mainTasks?:MainTask[];
    mainTask?:MainTask | null;
    action?: 'add' | 'update';
    setSubNavItems?: React.Dispatch<React.SetStateAction<any>>
    onChange?:(value:MainTask[])=>void
}
const checkDataBy: string[] = ['name'];
const navItems: NavItem[] = [
    { link: "projects", title: "projects_all" },
    { link: "maintasks", title: "maintasks_all" },
  ];
  

const MainTaskForm:React.FC<ArgsType> = ({mainTasks, onChange, pid, mainTask, action='add', setSubNavItems}) => {
    const {t} = useTranslation();
    const {user} = useAuthContext();
    const [mainTasksData, setMainTasksData] = useState<MainTask[]>();
    const [userGroupsData, setUserGroupsData] = useState<UserGroup[]>();
    const [currentMainTask, setCurrentMainTask] = useState<MainTask>();
    const [responsiblePerson, setResponsiblePerson] = useState<User | null>();
    const [alertData, setAlertData] = useState<AlertPopupType>({ isOpen: false, content: "", type: "info", title: "" });
    const [flashPopupData, setFlashPopupData] = useState<FlashPopupType>({isOpen:false, message:"", duration:3000, type:'success'});

    const emptyMainTask:MainTask ={
        _pid:pid as unknown as string,
        name:'',
        category:'',
        startDate:null,
        dueDate:null,
        endDate:null,
        responsiblePerson:null,
        note:[],
        subtasks:[],
        status:'toDo'
    }


    useEffect(()=>{
        setSubNavItems && setSubNavItems(navItems);
        if(mainTasks) setMainTasksData(mainTasks)
        if(mainTask){
            action = 'update';
            setCurrentMainTask(mainTask);
            if(mainTask.responsiblePerson){
                const rUser = mainTask.responsiblePerson as unknown as User;
                setResponsiblePerson(rUser);
            }
        }else{
            setCurrentMainTask(emptyMainTask);
        }
        getUserGroupData();
    }, [])
    useEffect(()=>{
        mainTasksData && onChange && onChange(mainTasksData);
    }, [mainTasksData]);
    useEffect(()=>{
        if(mainTask){
            setCurrentMainTask(mainTask);
            const rPerson = mainTask.responsiblePerson as unknown as User;
            setResponsiblePerson(rPerson)
        }
        else{
            setCurrentMainTask(emptyMainTask);
            setResponsiblePerson(null)
        }
    }, [mainTask]);

    const getUserGroupData = async()=>{
        try{
            const res = await getRecords({type:'groups'});
            if(res.status === 'success' && res.data){
                setUserGroupsData(res.data);
            }
        }catch(error){
            console.log(error);
        }
    }

    const updateCurrentTask = (field: keyof MainTask, value: any) => {
        
        let newValue = value;
        if(field === 'responsiblePerson'){
            setResponsiblePerson(value);
            newValue = value._id;
        }
        setCurrentMainTask((prevState) => {
            if (prevState) {
                return {
                    ...prevState,
                    [field]: newValue, 
                };
            } else {
                return emptyMainTask;
            }
        });
        
    };

    const isDataValid = ()=>{
        if(currentMainTask?.name && currentMainTask.responsiblePerson && currentMainTask.startDate)
        return true;
        return false;
    }

    const updateMainTasks = async()=>{
        if(currentMainTask){
            try{
                try{
                   
                    let relatedUpdates:RelatedUpdates[]= []
                    if(pid){
                        relatedUpdates= [{
                            collection:'projects',
                            field:'mainTasks',
                            type:'array',
                            ids:[pid]
                        }]
                    }

                    let newData = {...currentMainTask};

                    let id = '';
                    if(mainTask){
                         action = 'update';
                         id = mainTask._id as unknown as string;
                         console.log(mainTask);
                         console.log(currentMainTask);
                    }else{
                        const createdBy = user && user._id ? user._id : null;
                        if(createdBy !== null){
                            newData.createdBy = createdBy
                        }
                    }
                    

                    

                    const response = await addUpdateRecords({id, type: "maintasks", checkDataBy:checkDataBy, action, relatedUpdates, body:{ ...newData}}); 
                      if (response.status === "success") {
                            console.log(response);
                          const content = `${t(`RESPONSE.${response.code}`)}`;
                          setFlashPopupData({...flashPopupData, isOpen:true, message:content, type:"success"});
                          if(mainTasks){
                              setMainTasksData([...mainTasks, currentMainTask]);
                            }else{
                              setMainTasksData([currentMainTask]);

                          }
                      } else {
                        let content = `${t(`RESPONSE.${response.code}`)}`
                        if(response.data){
                          content = Object.entries(response.data).map(([key, value]) => {
                              return value && `${key} exists`;
                          }).filter(Boolean).join(', ');
                        }
                        setAlertData({...alertData, isOpen:true, title:"Fail", type:"fail", content});
                        console.error('Error:', response.message, 'Code:', response.code);
                      }
                  }catch(error){
                    console.log(error);
                  }
            }catch(error){
                console.log(error);
            }
            //setCurrentMainTask(emptyMainTask);
        }
        
    }

    

  return (
    <div className='
        card bg-white
    '>
        <div className={`fields grid gap-2 
            grid-cols-1  sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4`
        }
        >
            <div className=''>
                <CustomInput name='name' type='text'
                value={currentMainTask?.name}
                onChange={(e)=>updateCurrentTask('name', e.target.value)} 
                label={t('FORMS.name')}
                />
            </div>
            <div className='grid gap-2 grid-cols-2'>
                <div>
                    <CustomDateTimePicker selectedDate={currentMainTask?.startDate || null} name='startDate'
                    label={t('FORMS.startDate')}
                    onChange={(recordId, value, name)=>updateCurrentTask('startDate', value)} />
                </div>
                <div>
                    <CustomDateTimePicker selectedDate={currentMainTask?.dueDate || null} name='dueDate'
                    label={t('FORMS.dueDate')}
                    onChange={(recordId, value, name)=>updateCurrentTask('dueDate', value)} />
                </div>
            </div>
            {/* {action === 'update' && 
                <div>
                    <CustomDateTimePicker selectedDate={currentMainTask?.endDate || null} name='endDate'
                    label={t('FORMS.endDate')}
                    onChange={(recordId, value, name)=>updateCurrentTask('endDate', value)} />
                </div>
            } */}
            <div className=''>
                {userGroupsData && 
                    <CustomDropdown data={TaskCategory}  
                    selectedValue={currentMainTask?.category}
                    label={t('FORMS.category')}
                    onChange={(recordId, name, value, data)=>updateCurrentTask('category', value)}/>
                }
            </div>
            
           
            <div className=''>
                <h4>
                    <span className='text-sm text-gray-300'>
                        {t('FORMS.responsiblePerson')} : 
                    </span>
                    {responsiblePerson && 
                        <span>{responsiblePerson.name}</span>
                    }
                </h4>
                <MentionUserInput type='users' inputType='text' data={{}} 
                onClick={(user, data)=>updateCurrentTask('responsiblePerson', user)}/>
            </div>
            {/* <div className=''>
                <CustomDropdown data={TaskStatuses} label={t('FORMS.status')} name='status'
                selectedValue={currentMainTask?.status}
                onChange={(recordId, name, value)=>updateCurrentTask('status', value)} 
                />
            </div> */}
        </div>
        <div className='flex justify-end mt-2'>
            <CustomSmallButton type={action === 'update' ?  'update' : 'add'} 
            text={action === 'update' ?  `${t('update')}` : `${t('add')}`}
            onClick={updateMainTasks} />
        </div>
        <CustomAlert
          onClose={() => setAlertData({ ...alertData, isOpen: !alertData.isOpen })}
          isOpen={alertData.isOpen}
          content={alertData.content}
          title={alertData.title}
          type={alertData.type || 'info'} 
        />

        <FlashPopup isOpen={flashPopupData.isOpen} message={flashPopupData.message} onClose={()=>setFlashPopupData({...flashPopupData, isOpen:false})} type={flashPopupData.type || 'info'}/>
 
    </div>
  )
}

export default MainTaskForm
