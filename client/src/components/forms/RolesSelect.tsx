import React, { useState, useEffect } from 'react';
import CustomSelectList from '../../components/forms/CustomSelectList';
import { getRecords } from '../../hooks/dbHooks';
import { UserRole } from '../../interfaces';

interface RolesSelectProps {
  type?: 'single' | 'multiple'; // Determines if single or multiple selections are allowed
  selectedRoles?: string[]; // Selected roles
  onChange: (selectedRoles: string[], name:string) => void; // Callback to update parent component
}

const RolesSelect: React.FC<RolesSelectProps> = ({ selectedRoles = [], onChange, type = "single" }) => {
  const [rolesData, setRolesData] = useState<UserRole[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await getRecords({ type: "roles", body: {} });
        if (res.status === "success") {
          setRolesData(res.data);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    fetchRoles();
  }, []);

  const handleRoleChange = (value: string | string[]) => {
    if (typeof value === 'string') {
      if (type === 'single') {
        // For single selection, overwrite the array with just the selected value
       const sRole = rolesData.find((role:any)=>{
          return role['_id'] === value ;
        });
        console.log(sRole);
        const name = sRole && sRole['name'] ? sRole['name'] : '';
        onChange([value], name);
      } else {
        // For multiple selection, toggle the role in the array
        const updatedRoles = selectedRoles.includes(value)
          ? selectedRoles.filter((role) => role !== value) // Remove if already selected
          : [...selectedRoles, value]; // Add if not already selected
        onChange(updatedRoles, '');
      }
    } else {
      // If value is an array (multiple selection case), just pass it to onChange
      onChange(value, '');
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (type === 'multiple') {

    } else {
      
    }
  };


  return (
    <div className={`fields-wrapper ${(type === 'single' || type === 'multiple') && 'items-center space-x-2'}`}>
      { <CustomSelectList
        label="Roles"
        name="roles"
        data={rolesData}
        selectedValue={selectedRoles}
        inputType={type === "single" ? "radio" : "checkbox"} // Radio for single, checkbox for multiple
        onChange={handleRoleChange}
      /> }
    </div>
  );
};

export default RolesSelect;
