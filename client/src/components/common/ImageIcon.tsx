import { AlertPopupType, CustomPopupType } from "@/interfaces";
import { useState } from "react";
import CustomAlert from "./CustomAlert";

interface ArgsType {
    image: { icon: string; full: string };
    title:string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    fullImageLink?:boolean;
}

const ImageIcon: React.FC<ArgsType> = ({ image, size = 'sm', title="Image", fullImageLink=false }) => {
    const [alertProps, setAlertProps] = useState<AlertPopupType>({isOpen:false, title:"", content:<></>});
    const pixelSize = {
        xs: 20, // 8 * 4
        sm: 32, // 8 * 4
        md: 50, // 14 * 4
        lg: 80, // 20 * 4
        xl: 120, // 20 * 4
    };

    const width = pixelSize[size];


    const showFullImage = ()=>{
        if(image.full){
            setAlertProps({...alertProps, isOpen:true, title, content:
                <div className="w-full h-auto max-w-sm">
                    <img src={`${process.env.REACT_APP_API_URL}${image.full}`} loading="lazy" />
                </div>

            })
        }
    }

    const closePopup = ()=>{
        setAlertProps({...alertProps, isOpen:false, title:"", content:''})
    }

    return (
        <div
            style={{ width, height: width }}
            className="border bg-primary-light rounded-full border-2 border-white shadow overflow-hidden"
        >
            {image?.icon && (
                <img
                    onClick={fullImageLink ? showFullImage : ()=>{}}
                    src={`${process.env.REACT_APP_API_URL}${image.icon}`}
                    className={`w-full h-full object-cover object-center ${fullImageLink && 'cursor-pointer hover:scale-110 transition-all'} `}
                    loading="lazy"
                    alt=""
                />
            )}

            <CustomAlert 
                isOpen={alertProps.isOpen}
                title={alertProps.title}
                content={alertProps.content}
                onClose={closePopup}
            />
        </div>
    );
};

export default ImageIcon;
