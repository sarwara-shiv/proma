import { IoMdArrowDown } from "react-icons/io";
import { ToggleSwitch } from "../../common";
import { useAppContext } from "../../../context/AppContext";
import { dailyReportActions } from "../../../hooks/dbHooks";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import CustomDateTimePicker2 from "../../../components/forms/CustomDateTimePicker";
import CustomTimePicker from "../../../components/forms/CustomTimePicker";

const CloseDailyReport = ()=>{
    const {activeDailyReport, setActiveDailyReport} = useAppContext(); 
    const {t} = useTranslation();

    return <div>
        {/* <CustomDateTimePicker2 selectedDate={null} showDateSelect={false} showTimeSelect={true} onChange={(id, date, name)=> console.log(id, date, name)}/> */}
        <CustomTimePicker />
    </div>
}

export default CloseDailyReport; 