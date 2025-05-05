import { CustomAlert, FlashPopup } from '../../../../components/common';
import { getRecordsWithFilters } from '../../../../hooks/dbHooks';
import { AlertPopupType, Documentation, FlashPopupType, NavItem, PaginationProps, QueryFilters } from '@/interfaces';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import '../../../../assets/styles/documentation.css'
import { useParams } from 'react-router-dom';
import DocumentationNav from './DocumentationNav';
import { MdClose, MdMenu } from 'react-icons/md';
interface ArgsType{
    setSubNavItems?: React.Dispatch<React.SetStateAction<any>>;
    navItems?:NavItem[]
}

const ProjectDocumentations:React.FC<ArgsType> = ({setSubNavItems, navItems}) => {
    const {action, id} = useParams();
    const {t} = useTranslation();
    const [loader, setLoader] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true)
    const [records, setRecords] = useState<Documentation[]>([]);
    const [alertData, setAlertData] = useState<AlertPopupType>({ isOpen: false, content: "", type: "info", title: "" });
    const [flashPopupData, setFlashPopupData] = useState<FlashPopupType>({isOpen:false, message:"", duration:3000, type:'success'});
    const [paginationData, setPaginationData] = useState<PaginationProps>({currentPage:1,totalRecords:0, limit:50, totalPages:0})
    const [activeDocData, setActiveDocData] = useState<Documentation | null>(null);


    const pnavItems: NavItem[] = [
        { link: `projects`, title: "projects_all" },
        { link: `documentation/add/${id}`, title: "documentation_add" },
        { link: `documentation/update/${id}`, title: "documentation_update" },
      ];

      useEffect(()=>{
        getRecords();
        setSubNavItems && setSubNavItems(navItems);
      },[])

      const getRecords = async () => {
        setLoader(true);
        if(id){
        try {
            const filters:QueryFilters = {
                level:1,
                _pid:id
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
        }
    };
  return (
    <div className='data-wrap relative -m-4 documentation-data'>
        <div className="flex h- relative overflow-y-auto">
            {/* Sidebar */}
            <div
                className={`transition-all duration-200 w-60 overflow-y-auto h-[100vh]  border-e  ${
                isSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0  pointer-events-none' 
                } fixed h-full text-slate-700`}
            >
                <div className='p-2 text-sm font-bold text-primary
                    flex justify-between items-center bg-primary-light
                '>
                    <span>{t('mainDocs')}</span>

                </div>
             
                <div className="px-0 h-4/5 overflow-x-auto text-sm">
                {/* <DocumentationNav records={records} activeTask={activeTask}/> */}
                    {/* New documentation */}
                    {records && records.length > 0 && 
                        <DocumentationNav records={records} setActiveDocData={setActiveDocData}/>
                    }    


                    {/* New documentation ends */}
                </div>
            </div>

            {/* Main Content */}
            <div className={`flex-1 p-4 transition-all ease duration-200 ${isSidebarOpen ? 'ml-60' : 'ml-0'}`}>
                <button
                    onClick={()=>setIsSidebarOpen(!isSidebarOpen)}
                    className={`fixed -translate-y-4 border
                        -translate-x-4  text-parimary-dark p-2 flex justify-center items-center text-xl
                        rounded-sm hover:bg-primary-light transition-colors duration-200 bg-white shadow-md
                        `}
                >
                    {isSidebarOpen ? <MdClose /> : <MdMenu /> }
                </button>

                <div className={`mt-10 flex flex-col justify-center pb-8`}>
                    {activeDocData && 
                    <>
                      <h2 className='mb-3 flex justify-start items-center text-xl font-semibold text-primary
                        border-b
                      '>
                        {activeDocData.name}
                      </h2>
                      <div>
                        {activeDocData.description && 
                          <div dangerouslySetInnerHTML={{ __html: activeDocData.description}} />
                        }
                      </div>

                      {activeDocData.customFields && activeDocData.customFields.length > 0 && 
                        activeDocData.customFields.map((customdesc, index)=>{
                          return (
                            <>
                              {customdesc.name && 
                                <h4 className='mb-3 mt-3 flex justify-start items-center text-md
                                font-semibold text-slate-800 bg-slate-200 p-1 
                                border-b
                              '>
                                {customdesc.name}
                              </h4>
                              }
                              {customdesc.value && 
                                <div dangerouslySetInnerHTML={{ __html: customdesc.value}} />
                              }
                            </>
                          )
                        })
                      
                      }
                    </>
                    }

                </div>
            </div>
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

export default ProjectDocumentations
