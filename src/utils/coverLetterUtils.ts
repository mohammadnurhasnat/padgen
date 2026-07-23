import { jsPDF } from 'jspdf';
import { CoverLetterFields, VisaCategory } from '../types/coverLetter';
import { CompanyData, Theme } from '../types';

export function formatDateString(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function generateTemplateText(category: VisaCategory, fields: CoverLetterFields): string {
  const {
    applicantName,
    passportNumber,
    dob,
    companyName,
    designation,
    joiningDate,
    patientInfo,
    travelFromDate,
    travelToDate,
    referenceAddress,
    letterDate,
  } = fields;

  const fDob = formatDateString(dob) || '[Date of Birth]';
  const fJoiningDate = formatDateString(joiningDate) || '[Joining Date]';
  const fTravelFrom = formatDateString(travelFromDate) || '[Travel From Date]';
  const fTravelTo = formatDateString(travelToDate) || '[Travel To Date]';
  const fLetterDate = formatDateString(letterDate) || '[Letter Date]';

  const dateSection = `Date: ${fLetterDate}`;
  const addressSection = `To,\nThe Visa Officer,\nHigh Commission of India,\nDhaka, Bangladesh.`;

  switch (category) {
    case 'Tourist Visa':
      return `${dateSection}

${addressSection}

Subject: Request for Tourist Visa (T) to visit India.

Dear Sir/Madam,

I, ${applicantName || '[Applicant Name]'} (Passport No: ${passportNumber || '[Passport Number]'}, Date of Birth: ${fDob}), am writing to request a multiple-entry Tourist Visa for my upcoming visit to India.

I am currently employed at ${companyName || '[Company Name]'} as ${designation || '[Designation]'}, having joined the company on ${fJoiningDate}. I have been granted an official leave from my company for my travel from ${fTravelFrom} to ${fTravelTo}.

During my stay in India, I will be sightseeing and experiencing the local culture. I have planned my accommodation at ${referenceAddress || '[Indian Reference / Hotel Address]'}, which will serve as my main base of contact.

I assure you that I am fully capable of financing my entire travel and stay in India. I have attached all the necessary documents, including my passport, bank statement, employment certificate, and itinerary, for your kind consideration.

I kindly request you to grant me the visa to facilitate my travel. I assure you that I will adhere to all the laws and regulations of India and return to my home country before my visa expires.

Thank you for your time and assistance.

Sincerely,


${applicantName || '[Applicant Name]'}
Passport No: ${passportNumber || '[Passport Number]'}`;

    case 'Business Visa':
      return `${dateSection}

${addressSection}

Subject: Request for Business Visa (B) to India.

Dear Sir/Madam,

I, ${applicantName || '[Applicant Name]'} (Passport No: ${passportNumber || '[Passport Number]'}, Date of Birth: ${fDob}), representing ${companyName || '[Company Name]'} as ${designation || '[Designation]'} (Joining Date: ${fJoiningDate}), am writing this letter to request a Business Visa for my upcoming travel to India.

The purpose of my visit is to attend key business discussions, explore corporate opportunities, and meet with our local business partners in India from ${fTravelFrom} to ${fTravelTo}.

My primary business host and reference address in India will be:
${referenceAddress || '[Indian Reference / Hotel Address]'}

All expenses pertaining to my business trip, including travel, boarding, lodging, and medical insurance, will be fully borne by ${companyName || '[Company Name]'}. I have enclosed my invitation letter, trade certificate, tax documents, and financial statements for your review.

I would highly appreciate it if you could grant me a multiple-entry Business Visa. I guarantee that I will abide by all visa rules and complete my return travel on schedule.

Thank you for your kind consideration of my application.

Sincerely,


${applicantName || '[Applicant Name]'}
${designation || '[Designation]'}
${companyName || '[Company Name]'}
Passport No: ${passportNumber || '[Passport Number]'}`;

    case 'Medical Visa (Patient)':
      return `${dateSection}

${addressSection}

Subject: Request for Medical Visa (MED) to India.

Dear Sir/Madam,

I, ${applicantName || '[Applicant Name]'} (Passport No: ${passportNumber || '[Passport Number]'}, Date of Birth: ${fDob}), am writing this letter to request a Medical Visa to travel to India for critical specialized medical treatment.

I am currently employed at ${companyName || '[Company Name]'} as ${designation || '[Designation]'} (Joining Date: ${fJoiningDate}). I have been suffering from health complications that require immediate advanced diagnosis and medical procedures.

Upon consultation, I have been referred to seek advanced treatment in India. I have scheduled appointments and plan to undergo treatment from ${fTravelFrom} to ${fTravelTo} at the following medical facility:
${referenceAddress || '[Indian Reference / Hotel Address]'}

I will be funding all medical expenses, travel, and accommodation myself. All supporting documents, including the doctor's referral letter, hospital appointment confirmation, and my financial statement, are enclosed herewith.

I respectfully request you to grant me a Medical Visa at your earliest convenience so that I can begin my treatment on time.

Thank you for your understanding and prompt support.

Sincerely,


${applicantName || '[Applicant Name]'}
Passport No: ${passportNumber || '[Passport Number]'}`;

    case 'Medical Attendant Visa':
      return `${dateSection}

${addressSection}

Subject: Request for Medical Attendant Visa (MED-X) to India.

Dear Sir/Madam,

I, ${applicantName || '[Applicant Name]'} (Passport No: ${passportNumber || '[Passport Number]'}, Date of Birth: ${fDob}), am writing this letter to request a Medical Attendant Visa to travel to India to accompany and assist a medical patient.

I am currently employed at ${companyName || '[Company Name]'} as ${designation || '[Designation]'} (Joining Date: ${fJoiningDate}). I will be traveling to assist the patient, ${patientInfo || '[Patient Info]'}, who is undergoing critical medical treatment in India.

The treatment is scheduled from ${fTravelFrom} to ${fTravelTo} at the following medical institution:
${referenceAddress || '[Indian Reference / Hotel Address]'}

As an attendant, I will be responsible for providing physical support, coordinating with the hospital staff, and managing accommodation during our stay. My presence is vital to facilitate the patient's recovery and care.

I have attached all required medical references, hospital appointment confirmations, proof of relationships, and bank solvency papers. I request your kind consideration in granting me the Medical Attendant Visa.

Thank you for your prompt consideration and support.

Sincerely,


${applicantName || '[Applicant Name]'}
Passport No: ${passportNumber || '[Passport Number]'}`;

    case 'Double Entry Visa':
      return `${dateSection}

${addressSection}

Subject: Request for Double Entry Visa to India.

Dear Sir/Madam,

I, ${applicantName || '[Applicant Name]'} (Passport No: ${passportNumber || '[Passport Number]'}, Date of Birth: ${fDob}), currently employed at ${companyName || '[Company Name]'} as ${designation || '[Designation]'} (Joining Date: ${fJoiningDate}), am writing this letter to request a Double Entry Visa to India.

My travel plan consists of two distinct entries. The first entry is from ${fTravelFrom} to ${fTravelTo}, during which I will visit India for sightseeing and personal reasons. Following this, I have an essential requirement to re-enter India shortly after a brief side excursion to a neighboring country.

My reference contact and address in India is:
${referenceAddress || '[Indian Reference / Hotel Address]'}

I am fully capable of financing my entire travel and stay in India. All necessary papers, including my round-trip flight bookings, hotel reservations, and bank statements, are enclosed for your review.

Therefore, I kindly request you to grant me a Double Entry Visa. I assure you that I will respect all the laws and regulations of India.

Thank you for your time and assistance.

Sincerely,


${applicantName || '[Applicant Name]'}
Passport No: ${passportNumber || '[Passport Number]'}`;
  }
}

export function generateCoverLetterPDF(coverFields: CoverLetterFields, companyData: CompanyData, letterBody: string) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 20;
  const contentWidth = pageWidth - (marginX * 2);
  
  const lineY = 53;
  const startY = 65; 
  const endY = 280; 

  const drawDecorations = (pdfDoc: jsPDF) => {
    // Top Bar #0C8493
    pdfDoc.setFillColor(12, 132, 147);
    pdfDoc.rect(0, 0, pageWidth, 4.5, 'F');

    // Bottom Bar #FF8006
    pdfDoc.setFillColor(255, 128, 6);
    pdfDoc.rect(0, pageHeight - 4.5, pageWidth, 4.5, 'F');
  };

  const drawHeaderContent = (pdfDoc: jsPDF) => {
    pdfDoc.setFont('times', 'bold');
    pdfDoc.setFontSize(26);
    pdfDoc.setTextColor(30, 41, 59);
    
    const compName = coverFields.companyName.toUpperCase();
    pdfDoc.text(compName, pageWidth / 2, 18, { align: 'center' });

    pdfDoc.setFont('times', 'normal');
    pdfDoc.setFontSize(12.5);
    pdfDoc.setTextColor(71, 85, 105);

    const addrText = `${coverFields.referenceAddress}.`;
    pdfDoc.text(addrText, pageWidth / 2, 26, { align: 'center', maxWidth: 170 });

    const phoneStr = companyData.phone || '01712345678';
    pdfDoc.text(`Mobile: ${phoneStr}`, pageWidth / 2, 33, { align: 'center' });

    const emailText = `Email: ${companyData.email || `info@${coverFields.companyName.toLowerCase().replace(/\s+/g, '')}.com`}`;
    pdfDoc.text(emailText, pageWidth / 2, 40, { align: 'center' });

    // Horizontal separator line under address block at exactly 53mm
    pdfDoc.setDrawColor(12, 132, 147);
    pdfDoc.setLineWidth(0.5);
    pdfDoc.line(0, lineY, pageWidth, lineY);
  };

  drawDecorations(doc);
  drawHeaderContent(doc);

  doc.setFont('times', 'normal');
  doc.setFontSize(11.5);
  doc.setTextColor(15, 23, 42);
  const leading = 6.2;

  const paragraphs = letterBody.split('\n');
  let currentY = startY;

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i];
    if (paragraph.trim() === '') {
      currentY += leading * 0.8;
      continue;
    }

    const trimmed = paragraph.trim();
    const isBold =
      trimmed.startsWith('Subject:') ||
      trimmed.startsWith('To,') ||
      trimmed.startsWith('Dear') ||
      trimmed.startsWith('Sincerely,') ||
      trimmed.toLowerCase() === 'sincerely';

    if (isBold) {
      doc.setFont('times', 'bold');
    } else {
      doc.setFont('times', 'normal');
    }

    const wrappedLines: string[] = doc.splitTextToSize(paragraph, contentWidth);

    for (let j = 0; j < wrappedLines.length; j++) {
      const line = wrappedLines[j];

      if (currentY + leading > endY) {
        doc.addPage();
        drawDecorations(doc);
        currentY = 25;
      }

      doc.text(line, marginX, currentY);
      currentY += leading;
    }
  }

  doc.save(`Cover_Letter_${coverFields.applicantName.replace(/\s+/g, '_') || 'Applicant'}.pdf`);
}
