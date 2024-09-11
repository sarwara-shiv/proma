import { ObjectId } from 'mongodb';

export interface Role {
  _id: ObjectId;
  name: string;
  shortName: string;
  permissions: string[];
  isEditable: boolean;
  type: 'default' | string;
  createdAt: Date;
  updatedAt: Date;
  __v: number; 
}