import DataTable from '../../../../components/table/DataTable';
import { Loader } from '../../../../components/common';
import { getRecords, getRecordsWithFilters, getRecordsWithLimit } from '../../../../hooks/dbHooks';
import { MainTask, OrderByFilter, QueryFilters, Task, User } from '@/interfaces';
import { ColumnDef } from '@tanstack/react-table';
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns';
import { getColorClasses } from '../../../../mapping/ColorClasses';
import { compareDates, getDatesDifference } from '../../../../utils/dateUtils';

const pinnedColumns = ['_cid', 'name', 'actions_cell'];
const fixedWidthColumns = ['actions_cell', '_cid'];

const AllTasks = () => {
    const {t} = useTranslation();
    const [records, setRecords] = useState<Task[]>();
    const [loader, setLoader] = useState(true);

    useEffect(()=>{
        getData();
    },[]);

    // get all tasks
    const getData = async()=>{
        setLoader(true);
        try{
            const populateFields=['_mid', 'responsiblePerson'];
            const orderBy:OrderByFilter={
                createdAt:'asc',
                _mid:'asc',
                status:'asc'
            }
            const filters:QueryFilters = {
                // level:1,
            }
            const res = await getRecordsWithFilters({type:'tasks', limit:1000, orderBy, filters, pageNr:1, populateFields});
            if(res){
                if(res.status === 'success'){
                    setRecords(res.data);
                }
            }
            setLoader(false);
            console.log(res);
        }catch(err){
            setLoader(false);
            console.log(err);
        }
    }

    const columns: ColumnDef<Task, any>[] = useMemo(() => [
        {
            header: `${t('id')}`,
            accessorKey: '_cid',
            id:"_cid",
            cell: ({ getValue, row }) => { 
              const cid = getValue() && getValue();
              const _id = row.original._id ? row.original._id as unknown as string : '';
              return (
                  <div>
                      {cid}
                  </div>
              )
            },
              meta:{
                  style :{
                  textAlign:'left',
                  width:'80px'
                  }
              }
          },
        {
            header: `${t('name')}`,
            accessorKey: 'name',
            id:"name",
            cell: ({ getValue, row }) => { 
              const cid = getValue() && getValue();
              const _id = row.original._id ? row.original._id as unknown as string : '';
              return (
                  <div>
                      {cid}
                  </div>
              )
            },
              meta:{
                  style :{
                  textAlign:'left',
                  width:'80px'
                  }
              }
          },
        {
            header: `${t('maintask')}`,
            accessorKey: '_mid',
            id:"maintask",
            cell: ({ getValue, row }) => { 
              const cid = getValue() ? getValue() as unknown as MainTask : null;
              const _id = row.original._id ? row.original._id as unknown as string : '';
              return (
                  <div>
                      {cid ? cid.name : ''}
                  </div>
              )
            },
              meta:{
                  style :{
                  textAlign:'left',
                  width:'80px'
                  }
              }
          },
        {
            header: `${t('responsiblePerson')}`,
            accessorKey: 'responsiblePerson',
            id:"responsiblePerson",
            cell: ({ getValue, row }) => { 
              const cid = getValue() ? getValue() as unknown as User : null;
              const _id = row.original._id ? row.original._id as unknown as string : '';
              return (
                  <div>
                      {cid ? cid.name : ''}
                  </div>
              )
            },
              meta:{
                  style :{
                  textAlign:'left',
                  width:'80px'
                  }
              }
          },
        {
            header: `${t('status')}`,
            accessorKey: 'status',
            id:"status",
            cell: ({ getValue, row }) => { 
              const cid = getValue() && getValue();
              const _id = row.original._id ? row.original._id as unknown as string : '';
              return (
                  <div className={`${getColorClasses(cid)} rounded-md px-1`} >
                      {cid}
                  </div>
              )
            },
              meta:{
                  style :{
                  textAlign:'center',
                  width:'80px'
                  }
              }
          },
        {
            header: `${t('priority')}`,
            accessorKey: 'priority',
            id:"priority",
            cell: ({ getValue, row }) => { 
              const cid = getValue() && getValue();
              const _id = row.original._id ? row.original._id as unknown as string : '';
              return (
                  <div className={`${getColorClasses(cid)} rounded-md px-1`} >
                      {cid}
                  </div>
              )
            },
              meta:{
                  style :{
                  textAlign:'center',
                  width:'80px'
                  }
              }
          },
        {
            header: `${t('createdAt')}`,
            accessorKey: 'createdAt',
            id:"createdAt",
            cell: ({ getValue, row }) => { 
              const cid = getValue() && getValue();
              const _id = row.original._id ? row.original._id as unknown as string : '';
              return (
                  <div>
                      {cid ? format(cid, 'dd.MM.yyyy') : ''}
                  </div>
              )
            },
              meta:{
                  style :{
                  textAlign:'left',
                  width:'80px'
                  }
              }
          },
        {
            header: `${t('dueDate')}`,
            accessorKey: 'dueDate',
            id:"dueDate",
            cell: ({ getValue, row }) => { 
              const cid = getValue() && getValue();
              const _id = row.original._id ? row.original._id as unknown as string : '';
              return (
                  <div>
                      {cid ? format(cid, 'dd.MM.yyyy') : ''}
                  </div>
              )
            },
              meta:{
                  style :{
                  textAlign:'left',
                  width:'80px'
                  }
              }
          },
        {
            header: `${t('dueDays')}`,
            id:"due",
            cell: ({ getValue, row }) => { 
              const cid = getValue() && getValue();
              const sDate = row.original.startDate? row.original.startDate : null;
              const dDate = row.original.dueDate ? row.original.dueDate : null;
              const value:{years:number, months:number, days:number, totalDays:number} | null = sDate && dDate ? getDatesDifference(new Date(), dDate) : null
              return (
                  <div className={` px-1 font-bold rounded-md
                    ${value && value.totalDays && value?.totalDays < 0 ? 'bg-red-100 text-red-500 ' : 'bg-green-100 text-green-500 '}
                  `}>
                      {value && <div>
                          {value.totalDays ?  <span>{value.totalDays}</span> : ''} 
                          {/* {value.days && value.days > 0 ?  <span>{value.days} : Days</span> : ''} 
                          {value.months && value.months > 0 ?  <span>{value.months}: Months</span>:''} 
                          {value.years && value.years > 0 ?  <span>{value.years} : Years</span>:''}  */}
                        </div>}
                  </div>
              )
            },
              meta:{
                  style :{
                  textAlign:'center',
                  width:'80px'
                  }
              }
          },
    ], []);

  return (
    <div className='mt-8 p-4'>
        {loader ? <Loader type='full'/>: 
        <>
            {records && records.length > 0 && 
                <div className='card bg-white'>
                    <DataTable pinnedColumns={pinnedColumns} fixWidthColumns={fixedWidthColumns} data={records} columns={columns}/>
                </div>
            
            }
        
        </>
            
        }
    </div>
  )
}

export default AllTasks
