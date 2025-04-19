import { IoMdArrowDown } from "react-icons/io";
import { ToggleSwitch, DigitalClock, CustomPopup, TimeElapsed } from "../../../components/common";
import { useAppContext } from "../../../context/AppContext";
import { dailyReportActions } from "../../../hooks/dbHooks";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdOutlineKeyboardArrowDown, MdPause } from "react-icons/md";
import CloseDailyReport from "./CloseDailyReport";
import { CustomPopupType, DailyReport } from "../../../interfaces";
import CustomContextMenu from "../../../components/common/CustomContextMenu";


const ToggleDailyReport = ()=>{
    const {activeDailyReport, setActiveDailyReport} = useAppContext();
    const {t} = useTranslation();
    const [isOldReport, setIsOldReport] = useState<boolean>(false);
    const [custoPopupData, setCustomPopupData] = useState<CustomPopupType>({isOpen:false, title:'', content:''})

    useEffect(()=>{
        if(!activeDailyReport){
            getActiveReport();
        }
    },[])

    useEffect(()=>{
        if(activeDailyReport)
            validateReport(activeDailyReport);
    }, [activeDailyReport]);

    const isSameDate = (dateStr: string): boolean => {
        const today = new Date().toISOString().slice(0, 10);
        const reportDate = new Date(dateStr).toISOString().slice(0, 10);
        console.log(today);
        return today === reportDate;
      };
      
      const validateReport = (report: any) => {
        const isOpenOrPaused =
          report.status === 'open' || (Array.isArray(report.paused) && report.paused.length > 0);
      
        if (isOpenOrPaused && !isSameDate(report.startDate)) {
          console.log('⚠️ Please close old report:', report._cid);
          setIsOldReport(true);
        }
      };

    // GET ACTIVE DAILY REPORT
    const getActiveReport = async()=>{
        try{
            const res = await dailyReportActions({type:'active', body:{}});
            console.log(res);
            if(res.status === 'success' && res.data){
                setActiveDailyReport(res.data);
            }else{
                setActiveDailyReport(null)
            }
        }catch(error){
            console.error(error);
        }
    }

    // open popup
    const openDailyReport = ()=>{
        setCustomPopupData((res:CustomPopupType)=>{
            return ({...res, isOpen:true, data:'', 
            content:<>
                <CloseDailyReport />   
                </>
            })
        })
    }


    // close popup
    const closePopup = ()=>{
        setCustomPopupData(res=>{
            return {...res, isOpen:false}
        })
    }

    // TOGGLE DAILY REPORT
    const toggleDailyReport = async()=>{
        if(activeDailyReport){
            try{
                const id = activeDailyReport._id;
                const res = await dailyReportActions({type:'stop', body:{id, notes:activeDailyReport.notes}});
                console.log(res); 
                if(res && res.code === 'report_stopped'){
                    setActiveDailyReport(null);
                }
            }catch(error){
                console.error(error);
            }
        }else{
            try{
                const res = await dailyReportActions({type:'start', body:{}});
                console.log(res);
                if(res && res.data){
                    setActiveDailyReport(res.data);
                }
            }catch(error){
                console.error(error);
            }
        }
    }

    return (
        <div>
            <div className="toggle-report">
                <div className="toggle-btn flex flex-wrap gap-1 py-0 px-1 items-center bg-primary-light rounded-full">
                    {activeDailyReport ?
                    <div className="cursor-pointer hover:text-primary flex flex-row" >
                    <CustomContextMenu showIcon={false} maxWidth={400} text={<>
                            {/* <DigitalClock /> */}
                            {activeDailyReport.status === 'paused' ? <><MdPause /> {t('paused')}</>: 
                                <><TimeElapsed startDate={activeDailyReport.startDate} showSeconds={false}/> </>
                            }
                            <MdOutlineKeyboardArrowDown className="text-2xl"/>
                        </>}>
                        <CloseDailyReport />
                    </CustomContextMenu>
                </div>
                    :
                    <div onClick={toggleDailyReport}
                    className={`
                        cursor-pointer flex justify-center py-1/50 px-2 rounded-full  hover:shadow-none items-center ${activeDailyReport ? 
                           'bg-red-100 text-red-500 shadow-md shadow-red-500/50 ' : 
                           'bg-green-100 text-green-500 shadow-xl shadow-green-500/50 '
                        }    
                    `}><span>{t('start')}</span>
                    <DigitalClock />
                    </div> 
                    }

                    
                </div>
            </div>

            <CustomPopup 
                isOpen={custoPopupData.isOpen}
                onClose={closePopup}
                noFunction={closePopup}
                data={custoPopupData.data? custoPopupData.data : {}}
                title={custoPopupData.title}
                content={custoPopupData.content}
            />


        </div>
    )
}

export default ToggleDailyReport;