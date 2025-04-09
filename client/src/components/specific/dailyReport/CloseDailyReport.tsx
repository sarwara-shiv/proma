import { IoMdArrowDown } from "react-icons/io";
import { ToggleSwitch } from "../../common";
import { useAppContext } from "../../../context/AppContext";
import { dailyReportActions } from "../../../hooks/dbHooks";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import CustomDateTimePicker2 from "../../../components/forms/CustomDateTimePicker";
import CustomTimePicker from "../../../components/forms/CustomTimePicker";

const CloseDailyReport = ()=>{
    const {activeDailyReport, setActiveDailyReport} = useAppContext(); 
    const [time, setTime] = useState<string>('');
    const {t} = useTranslation();

    return <div>
        {/* <CustomDateTimePicker2 selectedDate={null} showDateSelect={false} showTimeSelect={true} onChange={(id, date, name)=> console.log(id, date, name)}/> */}
        <CustomTimePicker onChange={()=>console.log(123)} popup={true}/>
    </div>
}

export default CloseDailyReport; 