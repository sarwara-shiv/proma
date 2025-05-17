import shadows from '@mui/material/styles/shadows';
import customButtonPlugin from './src/assets/styles/tailwind-custom-button';
import customStyles from './src/assets/styles/tailwind-custom-styles';
import { keyframes } from '@emotion/react';
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#3aafa9",
        "primary-dark": "#2b7a78",
        "primary-light": "#def2f1",
        "dark": "#17252a",
        "medium": "#9f9f9f",
        "light": "#afafaf",
        "completed":"#dcfce7",
        "completed-dark":"#16a34a",
        "inProgress":"#e0f2fe",
        "inProgress-dark":"#0369a1",
        "onHold": "#fef3c7",         
        "onHold-dark": "#f59e0b",  
        "cancelled": "#fee2e2",      
        "cancelled-dark": "#b91c1c",  
        "toDo": "#dfdfdf",           
        "toDo-dark": "#6a6a6a",    
        "blocked": "#fde8e8",        
        "blocked-dark": "#c53030", 
        "pendingReview": "#fef9c3",  
        "pendingReview-dark": "#d97706",  
        "open": "#e0f7fa",          
        "open-dark": "#0288d1",    
        "closed": "#e0f2f1",        
        "closed-dark": "#00695c", 
        "answered": "#e0ffe4",      
        "answered-dark": "#2e7d32", 
        "waiting": "#e3f2fd",        
        "waiting-dark": "#1e40af", 
        "notAnswered": "#fce4ec",    
        "notAnswered-dark": "#ad1457",  
        "high": "#f8d7da",          
        "high-dark": "#c53030",    
        "low": "#f1f8e9",           
        "low-dark": "#388e3c",     
        "medium": "#fff3e0",        
        "medium-dark": "#f59f16",  
        "notStarted": "#f3f4f6",    
        "notStarted-dark": "#4b5563", 
        "warning": "#fff8c5",        
        "warning-dark": "#d97706",
        "danger": "#fee2e2",     
        "danger-dark": "#b91c1c",  
        "info": "#bfdbfe",      
        "info-dark": "#2563eb",    
        "success": "#d1fae5",       
        "success-dark": "#16a34a", 
        "fail": "#fca5a5",     
        "fail-dark": "#dc2626",    
        "error": "#fde2e2",     
        "error-dark": "#b91c1c", 
        "active": "#d1fae5",   
        "active-dark": "#16a34a",  
        "notActive": "#fca5a5",  
        "notActive-dark": "#dc2626", 
        "default": '#dfdfdf',
        "default-dark": '#696969',
        
        "color1": "#3aafa9",           // Primary (Teal)
        "color1-dark": "#2b7a78",

        "color2": "#fef3c7",           // On Hold (Yellow)
        "color2-dark": "#f59e0b",

        "color3": "#fee2e2",           // Cancelled (Light Red)
        "color3-dark": "#b91c1c",

        "color4": "#e0ffe4",           // Answered (Light Green)
        "color4-dark": "#2e7d32",

        "color5": "#bfdbfe",           // Info (Light Blue)
        "color5-dark": "#2563eb",

        "color6": "#f8d7da",           // High (Light Pink/Red)
        "color6-dark": "#c53030",

        "color7": "#f1f8e9",           // Low (Light Green)
        "color7-dark": "#388e3c",

        "color8": "#e3f2fd",           // Waiting (Light Blue)
        "color8-dark": "#1e40af",

        "color9": "#fff3e0",           // Medium (Light Orange)
        "color9-dark": "#f59f16",

        "color10": "#fde2e2",          // Error (Light Red)
        "color10-dark": "#b91c1c",

        "color11": "#d1fae5",          // Success (Mint Green)
        "color11-dark": "#16a34a",

        "color12": "#e0f7fa",          // Open (Light Cyan)
        "color12-dark": "#0288d1",

        "color13": "#e6f4ea",          // Alternative Green for Cancelled to avoid repetition
        "color13-dark": "#2f855a",     // Darker Green

        "color14": "#fff8c5",          // Warning (Pale Yellow)
        "color14-dark": "#d97706",

        "color15": "#fce4ec",          // Not Answered (Pink)
        "color15-dark": "#ad1457"
      },
      boxShadow:{
        card:'0px 0px 18px 1px rgba(0,0,0,0.1)',
        ligh:'0px 2px 8px -2px rgba(0,0,0,0.1)',
      },
      keyframes:{
        ring: {
          '0%': { transform: 'rotate(0deg)' },
          '10%': { transform: 'rotate(15deg)' },
          '20%': { transform: 'rotate(-10deg)' },
          '30%': { transform: 'rotate(15deg)' },
          '40%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' },
          '60%': { transform: 'rotate(-2deg)' },
          '70%': { transform: 'rotate(2deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
      },
      animation: {
        'ring': 'ring 1s ease-in-out 1',
        'ring-infinite': 'ring 1s ease-in-out infinite',
        'ring-slow': 'ring 2s ease-in-out infinite',
      },
    },
  },
  plugins: [
    customButtonPlugin,customStyles, 
    function ({ addBase, theme }) {
      addBase({
        ':root': {
          '--primary': theme('colors.primary'),
          '--primary-dark': theme('colors.primary-dark'),
          '--primary-light': theme('colors.primary-light'),
          // Add all other colors you need...
        },
      });
    },
    function ({ addUtilities }) {
      const delays = {
        '.delay-0': { 'animation-delay': '0s' },
        '.delay-1': { 'animation-delay': '1s' },
        '.delay-2': { 'animation-delay': '2s' },
        '.delay-3': { 'animation-delay': '3s' },
        '.delay-5': { 'animation-delay': '5s' },
      }

      const iterations = {
        '.repeat-once': { 'animation-iteration-count': '1' },
        '.repeat-infinite': { 'animation-iteration-count': 'infinite' },
        '.repeat-2': { 'animation-iteration-count': '2' },
        '.repeat-3': { 'animation-iteration-count': '3' },
      }

      addUtilities(delays, ['responsive'])
      addUtilities(iterations, ['responsive'])
    },
  ], 
}