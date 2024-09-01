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
            className={`loader-wrap ${type === 'full' ? 'full-loader' : 'small-loader'}`}
            aria-live="polite"
        >
            {loaderType === 'bounce' ? <BounceLoader width={50} /> : <FadeLoader width={50} />}
        </div>
    );
};

export default Loader;