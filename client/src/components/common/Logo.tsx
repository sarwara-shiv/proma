import React from 'react';
import { ReactComponent as LogoSvgWhite } from '../../assets/images/svg/logo-white.svg';
import { ReactComponent as LogoSvg } from '../../assets/images/svg/logo.svg';
import { ReactComponent as LogoIconSvg } from '../../assets/images/svg/logo-icon.svg';

interface ArgsType {
    type?: string;
    size?: 'base' | 'xs' | 'sm'| 'md'| 'lg'| 'xl';
    height?: number;
    color?:'primary' | 'white';
    onClick?: () => void;
}

const Logo: React.FC<ArgsType> = ({ type, size = 'base', height, onClick, color='primary' }) => {
    return (
        <div className={`logo-wrap logo-wrap--${size}`} onClick={onClick}>
            {type === 'icon' ? (
                <LogoIconSvg height={
                    height ? height :
                    size === 'xs' ? 10 :
                    size === 'sm' ? 20 :
                    size === 'md' ? 30 :
                    size === 'lg' ? 40 :  
                    size === 'xl' ? 60 :
                    20  
                }/>
            ) : (
                <>{color === 'white' ? 
                    <LogoSvgWhite height={
                        height ? height :
                        size === 'xs' ? 10 :
                        size === 'sm' ? 20 :
                        size === 'md' ? 30 :
                        size === 'lg' ? 40 :  
                        size === 'xl' ? 60 :
                        20  
                    }/>
                    :

                    <LogoSvg height={
                        height ? height :
                        size === 'xs' ? 10 :
                        size === 'sm' ? 20 :
                        size === 'md' ? 30 :
                        size === 'lg' ? 40 :  
                        size === 'xl' ? 60 :
                        20  
                    }/>
                } 
                </>
            )}
        </div>
    );
};
export default Logo