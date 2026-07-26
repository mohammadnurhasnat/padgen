export interface CoverLetterFields {
  applicantName: string;
  passportNumber: string;
  dob: string;
  companyName: string;
  designation: string;
  joiningDate: string;
  patientInfo: string;
  travelFromDate: string;
  travelToDate: string;
  referenceAddress: string;
  letterDate: string;
  indianBusinessName?: string;
  indianBusinessAddress?: string;
  medicalHospitalName?: string;
  medicalHospitalAddress?: string;
  medicalDepartment?: string;
  delhiEmbassyName?: string;
}

export const DEMO_COVER_LETTER_FIELDS: CoverLetterFields = {
  applicantName: 'MOHAMMAD NUR HASNAT',
  passportNumber: 'EG0876543',
  dob: '15/05/1992',
  companyName: 'Processing Hub',
  designation: 'Proprietor',
  joiningDate: '01/10/2021',
  patientInfo: 'My father, Mr. Abdul Ali (Passport: EG0981234)',
  travelFromDate: '10/08/2026',
  travelToDate: '25/08/2026',
  referenceAddress: 'Grand Palace Hotel, 12 Park Street, Kolkata, WB, 700016, India',
  letterDate: '25/07/2026',
  indianBusinessName: 'Reliance Industries Limited',
  indianBusinessAddress: 'Maker Chambers IV, 222 Nariman Point, Mumbai, Maharashtra 400021, India',
  medicalHospitalName: 'Apollo Hospitals Chennai',
  medicalHospitalAddress: '21 Greams Lane, Off Greams Road, Chennai, Tamil Nadu 600006, India',
  medicalDepartment: 'Cardiology',
  delhiEmbassyName: 'Embassy of the United States',
};

export const DEFAULT_COVER_LETTER_FIELDS: CoverLetterFields = {
  applicantName: '',
  passportNumber: '',
  dob: '',
  companyName: '',
  designation: '',
  joiningDate: '',
  patientInfo: '',
  travelFromDate: '',
  travelToDate: '',
  referenceAddress: '',
  letterDate: '',
  indianBusinessName: '',
  indianBusinessAddress: '',
  medicalHospitalName: '',
  medicalHospitalAddress: '',
  medicalDepartment: '',
  delhiEmbassyName: '',
};

export const VISA_CATEGORIES = [
  'Tourist Visa',
  'Business Visa',
  'Medical Visa (Patient)',
  'Medical Attendant Visa',
  'Double Entry Visa'
] as const;

export type VisaCategory = typeof VISA_CATEGORIES[number];
