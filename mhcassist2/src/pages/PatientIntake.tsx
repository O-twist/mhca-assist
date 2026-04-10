import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { MHCA04Document } from '../components/MHCA04Document';
import { formatPatientId, parseSAID, cn } from '../lib/utils';
import { User, Phone, Fingerprint, Calendar, FileText, Download, CheckCircle, MessageSquare, Send, Baby } from 'lucide-react';
import { usePatients } from '../hooks/usePatients';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

export const PatientIntake = () => {
  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [familyPhone, setFamilyPhone] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedPatient, setSubmittedPatient] = useState<any>(null);
  const [barcodeUrl, setBarcodeUrl] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [notificationSent, setNotificationSent] = useState({ sms: false, whatsapp: false });
  
  const navigate = useNavigate();
  const { addPatient } = usePatients();

  const generateCodes = async (mhcaId: string, patientName: string, phone: string) => {
    try {
      // Generate QR Code as a WhatsApp link
      const message = `Inquiry about Patient ${patientName} (${mhcaId})`;
      const whatsappUrl = `https://wa.me/${phone.replace(/\s+/g, '')}?text=${encodeURIComponent(message)}`;
      
      const qrDataUrl = await QRCode.toDataURL(whatsappUrl, {
        margin: 1,
        width: 200,
        color: { dark: '#0f172a', light: '#ffffff' }
      });
      setQrCodeUrl(qrDataUrl);

      // Generate Barcode using a canvas
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, mhcaId, {
        format: "CODE128",
        width: 2,
        height: 100,
        displayValue: false
      });
      setBarcodeUrl(canvas.toDataURL('image/png'));
    } catch (err) {
      console.error('Error generating codes:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser && !localStorage.getItem('mhca_mock_user')) return;

    setIsSubmitting(true);
    const timestamp = Date.now();
    const mhcaId = formatPatientId(timestamp);
    
    // 72 hours from now
    const observationDeadline = new Date(timestamp + 72 * 60 * 60 * 1000);

    const idData = parseSAID(idNumber);

    const patientData = {
      mhcaId,
      name,
      idNumber,
      dateOfBirth: idData?.dob || null,
      ageGroup: idData?.ageGroup || 'adult',
      familyPhone,
      observationDeadline: Timestamp.fromDate(observationDeadline),
      status: 'draft',
      createdBy: auth.currentUser?.uid || 'mock-user-id',
      clinicId: 'KZN-CLINIC-001',
      consent: {
        given: true,
        timestamp: serverTimestamp(),
        version: '1.0'
      }
    };

    try {
      await generateCodes(mhcaId, name, familyPhone);
      const result = await addPatient(patientData);
      setSubmittedPatient({ ...patientData, id: result.id, admissionTimestamp: new Date() });
    } catch (error) {
      console.error("Error adding patient:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendWhatsApp = () => {
    const message = `MHCAssist Notification: Patient ${submittedPatient.name} (${submittedPatient.mhcaId}) has been admitted for observation. Please contact the clinic for more details.`;
    const url = `https://wa.me/${submittedPatient.familyPhone.replace(/\s+/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setNotificationSent(prev => ({ ...prev, whatsapp: true }));
  };

  const sendSMS = () => {
    // Mock SMS sending
    alert(`SMS Notification sent to ${submittedPatient.familyPhone}`);
    setNotificationSent(prev => ({ ...prev, sms: true }));
  };

  if (submittedPatient) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-8 py-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-600 rounded-full">
          <CheckCircle size={48} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Patient Registered Successfully</h2>
          <p className="text-slate-500 mt-2">Patient ID: <span className="font-mono font-bold text-slate-900">{submittedPatient.mhcaId}</span></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 justify-center">
              <Download size={18} className="text-blue-500" />
              Official Documents
            </h3>
            <p className="text-sm text-slate-500">
              Download the MHCA-04 form with integrated QR and Barcodes.
            </p>
            <PDFDownloadLink
              document={<MHCA04Document patient={submittedPatient} barcodeUrl={barcodeUrl} qrCodeUrl={qrCodeUrl} notifications={notificationSent} />}
              fileName={`MHCA04_${submittedPatient.mhcaId}.pdf`}
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
            >
              {({ loading }) => (
                <>
                  <Download size={18} />
                  {loading ? 'Generating...' : 'Download PDF'}
                </>
              )}
            </PDFDownloadLink>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 justify-center">
              <MessageSquare size={18} className="text-green-500" />
              Family Notifications
            </h3>
            <p className="text-sm text-slate-500">
              Notify the family via SMS or WhatsApp immediately.
            </p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={sendWhatsApp}
                className="inline-flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition-all"
              >
                <Send size={18} />
                {notificationSent.whatsapp ? 'WhatsApp Sent' : 'Send WhatsApp'}
              </button>
              <button 
                onClick={sendSMS}
                className="inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                <MessageSquare size={18} />
                {notificationSent.sms ? 'SMS Sent' : 'Send SMS'}
              </button>
            </div>
          </div>
        </div>

        <button 
          onClick={() => navigate('/')}
          className="text-slate-500 font-medium hover:text-slate-800 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">New Patient Intake</h1>
        <p className="text-slate-500">Register a new patient under the Mental Health Care Act.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <User size={16} className="text-slate-400" />
                Full Name
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Enter patient's full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Fingerprint size={16} className="text-slate-400" />
                ID / Passport Number
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Enter ID number"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
              />
              {idNumber.length === 13 && (
                <div className={cn(
                  "mt-1 text-[10px] font-bold uppercase flex items-center gap-1",
                  parseSAID(idNumber)?.ageGroup === 'child' ? "text-orange-600" : "text-slate-400"
                )}>
                  {parseSAID(idNumber)?.ageGroup === 'child' ? (
                    <>
                      <Baby size={12} />
                      Minor / Child (Under 18)
                    </>
                  ) : (
                    "Adult (18+)"
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Phone size={16} className="text-slate-400" />
                Family Contact Phone
              </label>
              <input
                type="tel"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="+27 00 000 0000"
                value={familyPhone}
                onChange={(e) => setFamilyPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Calendar size={16} className="text-slate-400" />
                Admission Date
              </label>
              <input
                type="text"
                disabled
                className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                value={new Date().toLocaleDateString()}
              />
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-4">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-blue-900">Automatic MHCA-04 Generation</p>
              <p className="text-xs text-blue-700 mt-1">
                Submitting this form will automatically generate a printable MHCA-04 document with a unique patient ID and 72-hour observation timer.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              id="consent"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="consent" className="text-xs text-slate-600 leading-relaxed">
              I consent to the processing of my personal information as described in the <span className="text-blue-600 font-bold underline cursor-pointer">Privacy Notice</span>. I understand this data is handled in compliance with POPIA.
            </label>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !consentGiven}
            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isSubmitting ? 'Registering...' : 'Register Patient & Generate Form'}
          </button>
        </div>
      </form>
    </div>
  );
};
