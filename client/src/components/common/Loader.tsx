import React from 'react';
import { ReactComponent as BounceLoader } from '../../assets/images/svg/loader.svg';
import { ReactComponent as FadeLoader } from '../../assets/images/svg/loader-fade.svg'; 

interface ArgsType {
    loaderType?: 'fade' | 'bounce';
    type?: 'small' | 'full';
}

const Loader: React.FC<ArgsType> = ({ type = 'small', loaderType = 'fade' }) => {
    return (
        <div
            className={`loader-wrap  ${type === 'full' ? 'z-50 bg-primary-light bg-opacity-50 fixed w-full ml-64 h-full top-0 right-0 full-loader' : 'absolute text-center'} 
            justify-center flex`
        }
            aria-live="polite"
        >
            <div className={`${type === 'full' ? ' ml-64 relative w-full h-full flex justify-center items-center' : ''}`}>

                {loaderType === 'bounce' ? <BounceLoader width={50} /> : <FadeLoader width={type != 'full' ? 30 : 50} />}
            </div>
        </div>
    );
};

export default Loader;