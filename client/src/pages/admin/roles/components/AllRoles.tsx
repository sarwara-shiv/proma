import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import Loader from '../../../../components/common/Loader';

interface DataType {
    roleName: string;
    shortName: string;
    description?: string;
    _id: string;
    createdAt: string; // Changed to string for date representation
    updatedAt: string; // Changed to string for date representation
    permissions?: string[];
}

const AllRoles = () => {
    const { user } = useAuth();
    const [cookies] = useCookies(['access_token']);
    const [data, setData] = useState<DataType[]>([]);
    const [loader, setLoader] = useState(true);
    const JWT_TOKEN = cookies.access_token;
    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        getAllRoles();
    }, []);

    const getAllRoles = async () => {
        setLoader(true);
        try {
            const response = await axios.get(`${API_URL}/roles/get`, {
                headers: {
                    'Authorization': `Bearer ${JWT_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.status === "success") {
                // Assuming response.data.roles is the array of roles
                setData(response.data.data || []); // Ensure `roles` is set if it exists
            } else {
                console.error('Failed to fetch roles:', response.data.message);
                setData([]); // Reset data on failure
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
            setData([]); // Reset data on error
        } finally {
            setLoader(false);
        }
    };

    return (
        <div className='p-4'>
            {loader ? (
                <Loader type="full" loaderType="bounce" /> // Use Loader component with type and loaderType
            ) : (
                <div className='data-wrap'>
                    {data.length > 0 ? (
                        data.map((d) => (
                            <div key={d._id} className='role-item'>
                                <div>Name: {d.roleName}</div> 
                                <div>Short Name: {d.shortName}</div>
                                {/* Add more fields as needed */}
                            </div>
                        ))
                    ) : (
                        <p>No roles found</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default AllRoles;
