export type NOCCategory =
  | 'Tourist'
  | 'Medical'
  | 'Business'
  | 'Double-Entry';

export interface NOCFields {
  refNo: string;
  issueDate: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  applicantName: string;
  gender: 'male' | 'female';
  designation: string;
  empId: string;
  passportNo: string;
  joiningDate: string;
  purposeCategory: NOCCategory;
  destinationCountry: string;
  leaveFrom: string;
  leaveTo: string;
  signatoryName: string;
  signatoryTitle: string;
}

export const NOC_CATEGORIES: NOCCategory[] = [
  'Tourist',
  'Medical',
  'Business',
  'Double-Entry',
];

export const DEMO_NOC_FIELDS: NOCFields = {
  refNo: 'NOC/2026/089',
  issueDate: '25/07/2026',
  companyName: 'Processing Hub',
  companyAddress: '34/D, Level-3, Jamuna Future Park, Vatara, Dhaka-1229',
  companyPhone: '+8801332601510',
  companyEmail: 'processinghubbd@gmail.com',
  applicantName: 'MOHAMMAD NUR HASNAT',
  gender: 'male',
  designation: 'Proprietor',
  empId: 'PH-88026',
  passportNo: 'A08942159',
  joiningDate: '15/03/2021',
  purposeCategory: 'Tourist',
  destinationCountry: 'India',
  leaveFrom: '10/08/2026',
  leaveTo: '25/08/2026',
  signatoryName: 'Robert Vance',
  signatoryTitle: 'Head of Human Resources',
};

export const DEFAULT_NOC_FIELDS: NOCFields = {
  refNo: '',
  issueDate: '',
  companyName: '',
  companyAddress: '',
  companyPhone: '',
  companyEmail: '',
  applicantName: '',
  gender: 'male',
  designation: '',
  empId: '',
  passportNo: '',
  joiningDate: '',
  purposeCategory: 'Tourist',
  destinationCountry: '',
  leaveFrom: '',
  leaveTo: '',
  signatoryName: '',
  signatoryTitle: '',
};
