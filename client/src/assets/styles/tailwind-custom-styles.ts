import { fontSize } from '@mui/system';
import type { PluginAPI } from 'tailwindcss/types/config';

const customStyles = (plugin: PluginAPI) => {
  plugin.addComponents({
    '.card': {
      padding: '0.75rem',
      borderRadius: '0.375rem',
      marginBottom:"1rem",
      boxShadow:'0px 2px 12px -2px rgba(0,0,0,0.1)',
      '.title':{
        fontSize:'1.5rem',
        lineHeight:'2rem',
        marginBottom:'0.75rem',
        color:'#cbd5e1'
      }
    }
  });
};

export default customStyles;