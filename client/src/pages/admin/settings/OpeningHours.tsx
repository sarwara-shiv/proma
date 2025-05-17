import { useTranslation } from "react-i18next"
import { Headings } from "../../../components/common"
import { useState } from "react"

const openingHoursObj:Record<string, {from:string, till:string, break?:number}[]> = {
    'sun':[],
    'mon':[{from:'08:00', till:'16:30', break:1}],
    'tue':[{from:'08:00', till:'16:30', break:1}],
    'wed':[{from:'08:00', till:'16:30', break:1}],
    'thu':[{from:'08:00', till:'16:30', break:1}],
    'fri':[{from:'08:00', till:'16:30', break:1}],
    'sat':[],
}
const OpeningHours = ()=>{
    const [openingHours, setOpeningHours] = useState<Record<string, {from:string, till:string, break?:number}[]>>(openingHoursObj)
    const {t} = useTranslation();
    return (
        <div>
            <div className="mb-2">
                <Headings text={t('openingHours')} type="h4" />
            </div>
            {openingHours && Object.keys(openingHours).length > 0 && (
                Object.entries(openingHours).map(([key, entry]) => {
                    return (
                    <div key={key} className="flex justify-between border-b p-2">
                        <span className="text-sm font-semibold text-gray-600">{t(key)}</span>
                        <div className="flex flex-wrap ">
                            {entry && entry.length > 0 ? entry.map((time, idx)=>{
                                return (
                                    <div className="flex gap-1 text-sm">
                                        <span className="text-gray-500">{time.from}</span>
                                        <span>-</span>
                                        <span className="text-gray-500">{time.till}</span>
                                    </div>
                                )
                            })
                            :
                            <div>-</div>
                        }
                        </div>
                    </div>
                    );
                })
                )}

        </div>
    )
}

export default OpeningHours