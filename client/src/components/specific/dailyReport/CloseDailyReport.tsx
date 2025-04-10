import { IoMdArrowDown } from "react-icons/io";
import { CustomTooltip, ToggleSwitch } from "../../common";
import { useAppContext } from "../../../context/AppContext";
import { dailyReportActions } from "../../../hooks/dbHooks";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdOutlineKeyboardArrowDown, MdPause, MdPlayArrow, MdStop } from "react-icons/md";
import CustomDateTimePicker2 from "../../../components/forms/CustomDateTimePicker";
import CustomTimePicker from "../../../components/forms/CustomTimePicker";
import { RichTextArea } from "../../../components/forms";
import { format, differenceInMilliseconds } from "date-fns";

const CloseDailyReport = ()=>{
    const {activeDailyReport, setActiveDailyReport, activeWorkLog, setActiveWorkLog} = useAppContext(); 
    const [time, setTime] = useState<string>('');
    const [note, setNote] = useState<string>('');
    const {t} = useTranslation();
    const [timeDiff, setTimeDiff] = useState('00:00');

    useEffect(()=>{
        if(!activeDailyReport){
            getActiveReport();
        }
    },[activeWorkLog])

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


    useEffect(() => {
        const updateTimeDiff = () => {
          if (activeDailyReport?.startDate) {
            const now = new Date();
            const start = new Date(activeDailyReport.startDate);
            const diffMs = differenceInMilliseconds(now, start);
    
            const totalMinutes = Math.floor(diffMs / 60000);
            const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
            const minutes = String(totalMinutes % 60).padStart(2, '0');
    
            setTimeDiff(`${hours}:${minutes}`);
          }
        };
    
        updateTimeDiff(); // run initially
        const interval = setInterval(updateTimeDiff, 1000); // every minute
    
        return () => clearInterval(interval);

        

      }, [activeDailyReport]);

      useEffect(()=>{
        console.log(activeDailyReport);
        setActiveDailyReport(activeDailyReport);
      },[activeDailyReport])

     // TOGGLE DAILY REPORT
     /**
      * 
      * case1 : status open
      * - pause
      * - close
      * 
      */
     const toggleDailyReport = async(type:'close' | 'resume' | 'pause'  = 'pause')=>{
        if(activeDailyReport){
            try{

                if(activeDailyReport.status === 'paused' || (activeDailyReport.status === 'open' && type === 'pause')){
                    let body:any = {id:activeDailyReport._id, type}
                    const res = await dailyReportActions({type:'update', body:{...body}});
                    console.log(res); 
                    if(res && res.data){
                        if(res.data.status && res.data.status === 'closed'){
                            setActiveDailyReport(null);
                            setActiveWorkLog(null);
                        }else{
                            setActiveDailyReport(res.data);
                        }

                    }
                }else{
                    const id = activeDailyReport._id;
                    const res = await dailyReportActions({type:'stop', body:{id, notes:activeDailyReport.notes}});
                    console.log(res); 
                    if(res && res.code === 'report_stopped'){
                        setActiveDailyReport(null);
                        setActiveWorkLog(null);
                    }
                }

                // if(!pause){
                //     const id = activeDailyReport._id;
                //     const res = await dailyReportActions({type:'stop', body:{id, notes:activeDailyReport.notes}});
                //     console.log(res); 
                //     if(res && res.code === 'report_stopped'){
                //         setActiveDailyReport(null);
                //     }
                // }else{
                //     let body:any = {id:activeDailyReport._id}
                //     if(activeDailyReport.status === 'paused'){
                //         body = {...body, type}
                //     }else{
                //         body = {...body, type:'pause'}
                //     }

                //     const res = await dailyReportActions({type:'update', body:{...body}});
                //     console.log(res); 
                //     if(res && res.data){
                //         setActiveDailyReport(res.data);
                //     }
                // }
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

    return <div className="p-2 w-fit">
        <div className="flex justify-between gap-3 items-center">
            <div className="w-fit flex justify-center items-center gap-2">
                <CustomTooltip
                    content={t('stop')}
                    trigger="hover"
                    side="top"
                  >
                <div onClick={()=>toggleDailyReport( 'close')}
                    className={`
                        cursor-pointer flex w-fit justify-center py-1/50 p-1 text-xl rounded-full  hover:shadow-none items-center ${activeDailyReport ? 
                        'bg-red-100 text-red-500 shadow-md shadow-red-500/50 ' : 
                        'bg-green-100 text-green-500 shadow-md shadow-green-500/50 transition-all'  
                        }    
                    `}>{activeDailyReport ? <span><MdStop/></span> : <span><MdPlayArrow /></span> } 
                </div>
                </CustomTooltip>
                {activeDailyReport && activeDailyReport.status === 'open' &&
                    <CustomTooltip
                    content={t('pause')}
                    trigger="hover"
                    side="top"
                  >
                    <div onClick={()=>toggleDailyReport('pause')}
                    className={`
                        cursor-pointer flex w-fit justify-center py-1/50 p-1 text-xl rounded-full  hover:shadow-none items-center
                        bg-amber-200 text-amber-500 shadow-md shadow-amber-400 transition-all
                    `}><span><MdPause/></span>
                    </div>
                    </CustomTooltip>
                }
                {activeDailyReport && activeDailyReport.status === 'paused' &&
                    <CustomTooltip
                    content={t('start')}
                    trigger="hover"
                    side="top"
                  >
                    <div onClick={()=>toggleDailyReport('resume')}
                    className={`
                        cursor-pointer flex w-fit justify-center py-1/50 p-1 text-xl rounded-full  hover:shadow-none items-center
                        bg-amber-200 text-amber-500 shadow-md shadow-amber-400 transition-all
                    `}><span><MdPlayArrow/></span>
                    </div>
                    </CustomTooltip>
                }
            </div>
            <div>
                {timeDiff}
            </div>
            <div className="flex ">
                <CustomTimePicker onChange={()=>console.log(123)} popup={false} />
            </div>
        </div>
        <div className="mt-3 min-w-[350px] bg-primary-light p-2 rounded-sm">
            <h4 className="text-sm">{t('notes')}</h4>
            <RichTextArea onChange={(name,value)=>setNote(value)}  defaultValue={note} height="100"/>
        </div>
    </div>
}

export default CloseDailyReport; 