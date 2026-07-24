import { jsPDF } from 'jspdf';
import { NOCFields, NOCCategory } from '../types/noc';
import { Theme } from '../types';

export function formatDateString(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function generateNOCText(category: NOCCategory, fields: NOCFields): string {
  const {
    refNo,
    issueDate,
    companyName,
    applicantName,
    designation,
    empId,
    passportNo,
    joiningDate,
    destinationCountry,
    leaveFrom,
    leaveTo,
    signatoryName,
    signatoryTitle,
  } = fields;

  const fIssueDate = formatDateString(issueDate) || '[Issue Date]';
  const fJoiningDate = formatDateString(joiningDate) || '[Joining Date]';
  const fLeaveFrom = formatDateString(leaveFrom) || '[Leave Start Date]';
  const fLeaveTo = formatDateString(leaveTo) || '[Leave End Date]';

  const headerMeta = `Ref No: ${refNo || 'NOC/2026/001'}\nDate: ${fIssueDate}`;

  switch (category) {
    case 'Foreign Travel & Visa':
      return `${headerMeta}

TO WHOM IT MAY CONCERN

NO OBJECTION CERTIFICATE (NOC)

This is to certify that Mr./Ms. ${applicantName || '[Applicant Name]'} (Employee ID: ${empId || '[Emp ID]'}, Passport No: ${passportNo || '[Passport No]'}) is a full-time employee of ${companyName || '[Company Name]'}, holding the position of ${designation || '[Designation]'}. He/She has been serving in our organization since ${fJoiningDate}.

We confirm that ${companyName || '[Company Name]'} has NO OBJECTION to Mr./Ms. ${applicantName || '[Applicant Name]'} traveling to ${destinationCountry || '[Destination Country]'} for personal/recreational purposes during his/her official leave period from ${fLeaveFrom} to ${fLeaveTo}.

He/She is expected to resume his/her duties at ${companyName || '[Company Name]'} on completion of the approved leave on ${fLeaveTo}. All travel expenses will be borne entirely by the applicant.

We wish him/her a safe and pleasant trip.

Sincerely,

_________________________
${signatoryName || '[Authorized Signatory Name]'}
${signatoryTitle || '[Authorized Signatory Title]'}
${companyName || '[Company Name]'}`;

    case 'Higher Studies':
      return `${headerMeta}

TO WHOM IT MAY CONCERN

NO OBJECTION CERTIFICATE FOR HIGHER STUDIES

This is to certify that Mr./Ms. ${applicantName || '[Applicant Name]'} (Employee ID: ${empId || '[Emp ID]'}) is currently employed at ${companyName || '[Company Name]'} as a ${designation || '[Designation]'} since ${fJoiningDate}.

${companyName || '[Company Name]'} has NO OBJECTION to Mr./Ms. ${applicantName || '[Applicant Name]'} pursuing higher studies/academic degree program in ${destinationCountry || '[Country/University]'}.

Should he/she be selected for the program, the management will grant appropriate study leave/permission in accordance with our organization's policy. His/Her conduct during his/her tenure with us has been exemplary.

Sincerely,

_________________________
${signatoryName || '[Authorized Signatory Name]'}
${signatoryTitle || '[Authorized Signatory Title]'}
${companyName || '[Company Name]'}`;

    case 'Job / Project Transfer':
      return `${headerMeta}

TO WHOM IT MAY CONCERN

NO OBJECTION CERTIFICATE (EMPLOYMENT & PROJECT ASSIGNMENT)

This is to certify that Mr./Ms. ${applicantName || '[Applicant Name]'} (Employee ID: ${empId || '[Emp ID]'}) is employed with ${companyName || '[Company Name]'} as ${designation || '[Designation]'}.

We hereby declare that ${companyName || '[Company Name]'} has NO OBJECTION to Mr./Ms. ${applicantName || '[Applicant Name]'} taking up external project consultations/transfer assignments in ${destinationCountry || '[Location/Organization]'}.

He/She has fulfilled all current project obligations with us, and we have no remaining liabilities or objections regarding his/her participation.

Sincerely,

_________________________
${signatoryName || '[Authorized Signatory Name]'}
${signatoryTitle || '[Authorized Signatory Title]'}
${companyName || '[Company Name]'}`;

    case 'General No Objection':
    default:
      return `${headerMeta}

TO WHOM IT MAY CONCERN

NO OBJECTION CERTIFICATE

This is to certify that Mr./Ms. ${applicantName || '[Applicant Name]'} (Employee ID: ${empId || '[Emp ID]'}, Passport/NID No: ${passportNo || '[Passport No]'}) is employed with ${companyName || '[Company Name]'} in the capacity of ${designation || '[Designation]'} since ${fJoiningDate}.

This certificate is issued at the request of the employee for official verification purposes, and ${companyName || '[Company Name]'} confirms that there are no objections, disciplinary actions, or legal impediments associated with his/her service record.

We certify that his/her performance and character during his/her tenure have been satisfactory.

Sincerely,

_________________________
${signatoryName || '[Authorized Signatory Name]'}
${signatoryTitle || '[Authorized Signatory Title]'}
${companyName || '[Company Name]'}`;
  }
}

export function generateNOCPDF(
  category: NOCCategory,
  fields: NOCFields,
  customBody?: string,
  theme?: Theme
) {
  const doc = new jsPDF({
    unit: 'mm',
    format: 'a4',
  });

  const bodyText = customBody || generateNOCText(category, fields);

  // Colors
  const primaryColor = theme?.primary || '#1E293B';
  const accentColor = theme?.accent || '#C5A880';

  // 1. Top Decorative Brand Bar
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, 210, 8, 'F');

  doc.setFillColor(accentColor);
  doc.rect(0, 8, 210, 1.5, 'F');

  // 2. Company Header Info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(primaryColor);
  doc.text(fields.companyName.toUpperCase() || 'ACME CORPORATION', 105, 25, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(fields.companyAddress || '123 Business Avenue, Suite 400', 105, 31, { align: 'center' });
  doc.text(
    `Tel: ${fields.companyPhone || '+1 (555) 000-0000'}  |  Email: ${fields.companyEmail || 'info@company.com'}`,
    105,
    36,
    { align: 'center' }
  );

  // Horizontal divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(20, 41, 190, 41);

  // 3. Date & Ref Row
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`REF NO: ${fields.refNo || 'NOC/2026/001'}`, 20, 48);

  const fDate = formatDateString(fields.issueDate);
  doc.text(`DATE: ${fDate}`, 190, 48, { align: 'right' });

  // 4. Main Certificate Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(primaryColor);
  
  let docTitle = 'NO OBJECTION CERTIFICATE';
  if (category === 'Higher Studies') docTitle = 'NO OBJECTION CERTIFICATE (HIGHER STUDIES)';
  if (category === 'Job / Project Transfer') docTitle = 'NO OBJECTION CERTIFICATE (JOB / PROJECT TRANSFER)';

  doc.text('TO WHOM IT MAY CONCERN', 105, 60, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(docTitle, 105, 67, { align: 'center' });

  doc.setDrawColor(accentColor);
  doc.setLineWidth(0.8);
  doc.line(70, 70, 140, 70);

  // 5. Letter Body Text
  // Strip out ref/date and title from customBody if they exist so it's clean
  let cleanBody = bodyText
    .replace(/^Ref No:.*\n?/m, '')
    .replace(/^Date:.*\n?/m, '')
    .replace(/^TO WHOM IT MAY CONCERN\n?/m, '')
    .replace(/^NO OBJECTION CERTIFICATE.*\n?/m, '')
    .trim();

  doc.setFont('times', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);

  const lines = doc.splitTextToSize(cleanBody, 170);
  doc.text(lines, 20, 80, { lineHeightFactor: 1.5 });

  // 6. Footer Decorative Bar
  doc.setFillColor(primaryColor);
  doc.rect(0, 287, 210, 10, 'F');

  // Save PDF
  const filename = `${fields.applicantName.toLowerCase().replace(/\s+/g, '_')}_noc_certificate.pdf`;
  doc.save(filename);
}
