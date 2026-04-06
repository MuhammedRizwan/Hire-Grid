// types/index.ts
export interface IUser {
  _id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface IJobApplication {
  _id: string;
  userId: string;
  companyName: string;
  hrEmail: string;
  position: string;
  status: 'applied' | 'follow-up' | 'interview' | 'rejected' | 'offer';
  emailSent: boolean;
  resumeSent: boolean;
  dateSent?: Date;
  followUpDate?: Date;
  remarks?: string;
  resumeUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEmailTemplate {
  subject: string;
  body: string;
}

export interface INotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'followup' | 'email' | 'reminder';
  read: boolean;
  createdAt: Date;
}