import { getColorClasses } from "../../mapping/ColorClasses";
import { getDatesDifferenceInDays } from "../../utils/dateUtils";
import { useTranslation } from "react-i18next";

interface ArgsType {
    dueDate:Date;
    startDate?:Date;
    endDate?:Date;
    type?:'short' | 'full'
}
const DaysLeft:React.FC<ArgsType> = ({startDate = new Date(), dueDate, type='full', endDate}) =>{
    const {t} = useTranslation();
    if(endDate) startDate = endDate;
    const result = getDatesDifferenceInDays(dueDate, startDate);
    console.log(result);

    if(!result || ((!result.days && result.days !== 0 )|| !result.status)) return null;

    return (
        <div className=''>
            {result.status !== 'dueToday' ? 
                <div className={`${getColorClasses(result.status)} ${type === 'short' ? 'text-xs bg-transparent shadow-none' : ''} flex gap-1 px-1 rounded-xl items-center shadow`}>
                       {type === 'full' && !endDate && <div>{t(result.status)}</div>}
                        <span className="text-md font-bold">{result.days}</span> {(type === 'full' || endDate )&& <span>{Math.abs(result.days)> 1 ? <>{t('days')}</> : <>{t('day')}</>}</span>}
                    </div>
                :
                <div className={`${getColorClasses(result.status)} rounded-xl px-2 shadow`}>
                    {t(result.status)}
                </div>
            }
        </div>
    )
}

export default DaysLeft