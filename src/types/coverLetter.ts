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
}

export const DEFAULT_COVER_LETTER_FIELDS: CoverLetterFields = {
  applicantName: 'Ameer Ali',
  passportNumber: 'EG0876543',
  dob: '1992-05-15',
  companyName: 'Apex Solutions Ltd.',
  designation: 'Senior Software Engineer',
  joiningDate: '2021-10-01',
  patientInfo: 'My father, Mr. Yusuf Ali (Passport: EG0981234)',
  travelFromDate: '2026-08-10',
  travelToDate: '2026-08-25',
  referenceAddress: 'Grand Palace Hotel, 12 Park Street, Kolkata, WB, 700016',
  letterDate: '2026-07-21',
};

export const VISA_CATEGORIES = [
  'Tourist Visa',
  'Business Visa',
  'Medical Visa (Patient)',
  'Medical Attendant Visa',
  'Double Entry Visa'
] as const;

export type VisaCategory = typeof VISA_CATEGORIES[number];
