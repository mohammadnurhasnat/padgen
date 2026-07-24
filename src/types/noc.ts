export type NOCCategory =
  | 'Foreign Travel & Visa'
  | 'Higher Studies'
  | 'Job / Project Transfer'
  | 'General No Objection';

export interface NOCFields {
  refNo: string;
  issueDate: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  applicantName: string;
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
  'Foreign Travel & Visa',
  'Higher Studies',
  'Job / Project Transfer',
  'General No Objection',
];

export const DEFAULT_NOC_FIELDS: NOCFields = {
  refNo: 'NOC/2026/089',
  issueDate: new Date().toISOString().split('T')[0],
  companyName: 'Acme Corporation Ltd.',
  companyAddress: '123 Business Avenue, Suite 400, New York, NY',
  companyPhone: '+1 (555) 019-2834',
  companyEmail: 'hr@acmecorp.com',
  applicantName: 'Alex Mercer',
  designation: 'Senior Product Designer',
  empId: 'EMP-9042',
  passportNo: 'A08942159',
  joiningDate: '2021-03-15',
  purposeCategory: 'Foreign Travel & Visa',
  destinationCountry: 'United Kingdom',
  leaveFrom: '2026-08-10',
  leaveTo: '2026-08-25',
  signatoryName: 'Robert Vance',
  signatoryTitle: 'Head of Human Resources',
};
