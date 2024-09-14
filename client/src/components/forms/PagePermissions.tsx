import React, { useState } from 'react';
import PagesConfig, { PageConfig, PageAction } from '../../config/pagesConfig';
import { PagePermission, PermissionsMap } from '../../interfaces';
import { useTranslation } from 'react-i18next';

// Define the prop type for the parent component's callback function
interface PagePermissionsFormProps {
  onPermissionsChange: (selectedPermissions: PermissionsMap) => void;
  initialPermissions?: PermissionsMap; // Optional prop for initial permissions
}

// Initial permission state for each page (without the 'page' key)
const initialPagePermissions: Omit<PagePermission, 'page'> = {
  canView: false,
  canCreate: false,
  canUpdate: false,
  canDelete: false,
};

const PagePermissionsForm: React.FC<PagePermissionsFormProps> = ({ onPermissionsChange, initialPermissions = {} }) => {
  const {t} = useTranslation();
  // State to track the selected permissions for each page, initialized with props
  const [permissionsState, setPermissionsState] = useState<PermissionsMap>(initialPermissions);

  // Handle permission toggle for a specific page and action
  const handlePermissionChange = (pageName: string, action: PageAction) => {
    setPermissionsState((prevState) => {
      const currentPermissions = prevState[pageName] || { ...initialPagePermissions, page: pageName };

      const updatedPermissions: PagePermission = {
        ...currentPermissions,
        [action]: !currentPermissions[action],  // Toggle the permission for the specified action
      };

      const newPermissionsState = {
        ...prevState,
        [pageName]: updatedPermissions,
      };

      // Notify parent component of the updated permissions
      onPermissionsChange(newPermissionsState);

      return newPermissionsState;
    });
  };

  return (
    <div>
      <h3 className='text-md font-semibold pt-2 pb-2'>{t('FORMS.pagePermissions')}</h3> 
      {Object.keys(PagesConfig).map((pageKey) => {
        const pageConfig: PageConfig = PagesConfig[pageKey];

        return (
          <div key={pageConfig.name} className='inline-flex items-center my-1 flex-col justify-start gap-2'>
            <div className='p-1'>
              <div style={{ border: '1px solid #ccc', padding: '10px' }}>
              <h4 className='text-dark me-2 pb-1 border-b border-gray-200 mb- text-sm mb-2'>
                {/* {pageConfig.icon && <pageConfig.icon />}  */}
                <span className='text-slate-300'>{t('page')}</span> : {pageConfig.displayName}
              </h4>
              <div className='text-sm text-slate-400 '>
                {pageConfig.actions.map((action: PageAction) => (
                  <label key={action} style={{ marginRight: '10px', display: 'inline-block' }} className='cursor-pointer'>
                    <input
                      type="checkbox"
                      className='peer sr-only'
                      checked={permissionsState[pageConfig.name]?.[action] || false}
                      onChange={() => handlePermissionChange(pageConfig.name, action)}
                      style={{ marginRight: '5px' }}
                    />
                    <span className='peer-checked:text-primary px-1 py-1 bg-gray-200/50 rounded peer-checked:bg-primary-light
                  peer-checked:text-primary'>{t(`FORMS.${action}`)}</span>
                  </label>
                ))}
              </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PagePermissionsForm;
