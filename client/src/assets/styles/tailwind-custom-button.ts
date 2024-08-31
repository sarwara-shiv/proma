import type { PluginAPI } from 'tailwindcss/types/config';

const customButtonPlugin = (plugin: PluginAPI) => {
  plugin.addComponents({
    '.btn': {
      padding: '.5rem 1rem',
      borderRadius: '0.375rem', // Example for 'md' borderRadius
      fontWeight: '600',
      display: 'inline-block',
      textAlign: 'center',
      transition: 'background 0.2s ease, color 0.2s ease',
      cursor:"pointer"
    },
    '.btn-solid': {
      backgroundColor: plugin.theme('colors.primary'), // primary color
      color: '#ffffff',
      borderWidth: '2px',
      borderColor: plugin.theme('colors.primary'),
      '&:hover': {
        backgroundColor: 'transparent',
        color: plugin.theme('colors.primary'),
      },
    },
    '.btn-outline': {
      backgroundColor: 'transparent',
      color: plugin.theme('colors.primary'),
      border: '2px solid',
      borderColor: plugin.theme('colors.primary'),
      '&:hover': {
        backgroundColor: plugin.theme('colors.primary'),
        color: '#ffffff',
      },
    },
    '.btn-ghost': {
      backgroundColor: 'transparent',
      color: plugin.theme('colors.primary'),
      '&:hover': {
        backgroundColor: plugin.theme('colors.primary-light'), // Example for 'primary-light'
      },
    },
    // Additional styles can be added here
  });
};

export default customButtonPlugin;