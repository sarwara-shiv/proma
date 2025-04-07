import { IoMdArrowDown } from "react-icons/io";
import { ToggleSwitch } from "../../../components/common";
import { useAppContext } from "../../../context/AppContext";
import { dailyReportActions } from "../../../hooks/dbHooks";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import CloseDailyReport from "./CloseDailyReport";

const ToggleDailyReport = ()=>{
    const {activeDailyReport, setActiveDailyReport} = useAppContext();
    const {t} = useTranslation();

    useEffect(()=>{
        if(!activeDailyReport){
            getActiveReport();
        }
    },[])

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
                <div className="toggle-btn flex flex-wrap gap-1 py-1 px-1 items-center bg-primary-light rounded-full">
                    <div onClick={toggleDailyReport}
                    className={`
                        cursor-pointer flex justify-center py-1/50 px-2 rounded-full  hover:shadow-none items-center ${activeDailyReport ? 
                           'bg-red-100 text-red-500 shadow-md shadow-red-500/50 ' : 
                           'bg-green-100 text-green-500 shadow-xl shadow-green-500/50 '
                        }    
                    `}>{activeDailyReport ? <span>{t('stop')}</span> : <span>{t('start')}</span> }</div>

                    <div className="cursor-pointer hover:text-primary"><MdOutlineKeyboardArrowDown className="text-2xl"/></div>
                    <CloseDailyReport />
                </div>
            </div>
        </div>
    )
}

export default ToggleDailyReport;