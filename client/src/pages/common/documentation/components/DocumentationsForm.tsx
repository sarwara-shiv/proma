import { CustomInput } from '../../../../components/forms';
import { FormButton, PageTitel } from '../../../../components/common';
import { AlertPopupType, Documentation, FlashPopupType, NavItem, OrderByFilter, PaginationProps, QueryFilters } from '@/interfaces';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { MdAdd, MdClose, MdMenu } from 'react-icons/md';
import { useParams } from 'react-router-dom';
import RichtTextEditor from '../../../../components/forms/RichtTextEditor';
import { addUpdateRecords, getRecordsWithFilters } from '../../../../hooks/dbHooks';
import { useAuth } from '../../../../hooks/useAuth';
import { DeleteById } from '../../../../components/actions';
import CustomContextMenu from '../../../../components/common/CustomContextMenu';
interface ArgsType{
    setSubNavItems?: React.Dispatch<React.SetStateAction<any>>;
}

const checkDataBy: string[] = ['name'];
const DocumentationsForm:React.FC<ArgsType> = ({setSubNavItems}) => {
    const {t} = useTranslation();
    const {user} = useAuth();
    const {action, id} = useParams();
    const [loader, setLoader] = useState(true);
    const [records, setRecords] = useState<Documentation[]>([]);
    const [alertData, setAlertData] = useState<AlertPopupType>({ isOpen: false, content: "", type: "info", title: "" });
    const [flashPopupData, setFlashPopupData] = useState<FlashPopupType>({isOpen:false, message:"", duration:3000, type:'success'});
    const [paginationData, setPaginationData] = useState<PaginationProps>({currentPage:1,totalRecords:0, limit:50, totalPages:0})
    const [recordType, setRecordType] = useState<string>('maintasks');
    const [subSection, setSubSection] = useState<string>();

    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true)
    const [formData, setFormData] = useState<Documentation>({
        _pid:id,
        name:'',
        description:'',
        customFields:[],
        subDocuments:[]
    });
    let navItems: NavItem[] = [
        { link: `projects`, title: "projects_all" },
        { link: `projects/view/${id}`, title: "project" },
        { link: `documentation/add/${id}`, title: "documentation_add" },
        { link: `documentation/update/${id}`, title: "documentation_update" },
    ];

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
      };

    useEffect(()=>{
        setSubNavItems && setSubNavItems(navItems);
        getRecords();
      },[])

    const handleInputChange = (name:string, value:string)=>{
        if(name){
            setFormData({...formData, [name]:value})
        }
    }

    const getRecords = async () => {
        setLoader(true);
        try {
            const filters:QueryFilters = {
                // isActive:true,
                // createdAt:{date:'23.09.2024', format:'DD.MM.YYYY'}
            }

            const populateFields = [
                { path: '_pid' }, 
                {
                  path: 'subDocuments',
                  populate: [
                    {
                      path: 'subDocuments',
                      populate: [
                        {
                          path: 'subDocuments',
                          populate: [
                            {
                              path: 'subDocuments',
                              populate: { path: 'subDocuments' },
                            },
                            { path: 'createdBy' }, 
                          ],
                        },
                        { path: 'createdBy' }, 
                      ],
                    },
                    { path: 'createdBy' }, 
                  ],
                },
              ]
            const res = await getRecordsWithFilters({
                type: "documentation", 
                limit:paginationData.limit as unknown as number, 
                pageNr:paginationData.currentPage as unknown as number, 
                populateFields, 
                filters,
            });  
            console.log(res);
            if (res.status === "success") {
                setRecords(res.data || []);
                console.log(res.data);
                console.log(res);
                setPaginationData({...paginationData, totalRecords:res.totalRecords, totalPages:res.totalPages, currentPage:res.currentPage})
            }else{
                setRecords([]);
            }
        } catch (error) {
            console.error("Error fetching roles:", error);
            setRecords([]);
        }finally{
            setLoader(false);
        }
    };

    // submit data
    const saveData = async({sectionId='', level=1}:{sectionId:string, level:number})=>{
        try{
            const userid = user?._id;
            if(userid){
                const createdBy = userid;
                const res = await addUpdateRecords({
                    type: 'documentation', action:"add",
                    checkDataBy:checkDataBy, body:{ ...formData, createdBy, level}
                })

                if(res && res.status === 'success'){
                    getRecords();
                }
                
                console.log(res);
            }
        }catch(err){
            console.log(err)
        }
    }

    const onDelete = (data:any)=>{
        if(data.status === "success"){ 
          getRecords();
        }else{
          console.error({error:data.message, code:data.code}); 
        }
    }

  return (
    <div className='data-wrap relative'>
        <div className="flex h- relative overflow-y-auto">
            {/* Sidebar */}
            <div
                className={`transition-all duration-200 w-60 overflow-y-auto h-[100vh]  border-e  ${
                isSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0  pointer-events-none' 
                } fixed h-full text-slate-700`}
            >
                <div className='p-2 text-sm font-bold text-primary'>MainDocs</div>
                <div className="px-2 h-4/5 overflow-x-auto text-sm">
                    {records && records.length > 0 && records.map((record, index)=>{
                        return (
                            <div key={`main-${index}-${record._id}`} className='border-b py-0.5'>
                                <div className='flex justify-between gap-1 items-center'>
                                    <span className='font-semibold text-xs'>{record.name}</span>
                                    <CustomContextMenu iconSize='xs'> 
                                        <ul>
                                            <li className='px-1 py-1 my-1 hover:bg-slate-100'>
                                                <div className='flex justify-between items-center text-xs gap-1 hover:bg-primary-light hover:text-primary cursor-pointer whitespace-normal break-words'
                                                
                                                >
                                                    {t('addSubSection')} <MdAdd />
                                                </div>
                                            </li>
                                            <li className='px-1 py-1 my-1 hover:bg-slate-100'>
                                                <DeleteById text={t('delete')} data={{id:record._id || '', type:'documentation', page:"documentation"}} 
                                                content={`Delte Project: ${record.name}`} 
                                                onYes={onDelete}/>
                                            </li>
                                        </ul>
                                    </CustomContextMenu>
                                </div>                         
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className={`flex-1 p-4 transition-all ease duration-200 ${isSidebarOpen ? 'ml-60' : 'ml-0'}`}>
                <button
                    onClick={toggleSidebar}
                    className={`fixed -translate-y-4 border
                        -translate-x-4  text-parimary-dark p-2 flex justify-center items-center text-xl
                        rounded-sm hover:bg-primary-light transition-colors duration-200
                        `}
                >
                    {isSidebarOpen ? <MdClose /> : <MdMenu /> }
                </button>

                <div className={`mt-10 flex justify-center `}>  
                    <div className='card bg-white max-w-4xl'> 
                        <div className='mb-3'>
                            <PageTitel text={`${t('Section')}`} color='slate-300' size='2xl'/>
                        </div>
                        <div>
                            <CustomInput type='text' name='name' label={t('name')} value={formData.name}
                                onChange={(e)=>handleInputChange('name', e.target.value)}
                            />
                            <RichtTextEditor value={formData.description || ''} onChange={(value)=>handleInputChange('description', value)}/>
                        </div>
                        <div className="mt-6 text-right fixed bottom-2 flex right-2">
                            <FormButton  btnText={action === 'update' ? t('update') : t('create')}  onClick={()=>saveData({sectionId:'', level:1})}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default DocumentationsForm
