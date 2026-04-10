import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 15,
  },
  label: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  value: {
    fontSize: 12,
    marginBottom: 10,
    borderBottom: '1pt solid #ccc',
    paddingBottom: 2,
  },
  footer: {
    marginTop: 50,
    fontSize: 10,
    textAlign: 'center',
    color: '#999',
  },
  barcode: {
    marginTop: 20,
    width: 150,
    height: 40,
    alignSelf: 'center',
  }
});

interface MHCA04Props {
  patient: {
    mhcaId: string;
    name: string;
    idNumber: string;
    admissionTimestamp: Date;
    familyPhone: string;
  };
  barcodeUrl?: string;
  qrCodeUrl?: string;
  notifications?: {
    sms: boolean;
    whatsapp: boolean;
  };
}

export const MHCA04Document = ({ patient, barcodeUrl, qrCodeUrl, notifications }: MHCA04Props) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <View>
          <Text style={styles.header}>Form MHCA 04</Text>
          <Text style={{ fontSize: 10, color: '#444' }}>Department of Health - Republic of South Africa</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          {qrCodeUrl && <Image src={qrCodeUrl} style={{ width: 70, height: 70 }} />}
          <Text style={{ fontSize: 7, marginTop: 2, color: '#666' }}>Scan to Contact Clinic</Text>
        </View>
      </View>

      <Text style={{ fontSize: 14, textAlign: 'center', marginBottom: 25, fontWeight: 'bold' }}>
        Application for Assisted Care, Treatment and Rehabilitation
      </Text>

      <View style={{ border: '1pt solid #eee', padding: 15, borderRadius: 5 }}>
        <View style={styles.section}>
          <Text style={styles.label}>Patient Full Name</Text>
          <Text style={styles.value}>{patient.name}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>ID / Passport Number</Text>
          <Text style={styles.value}>{patient.idNumber}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Unique Patient ID (MHCA ID)</Text>
          <Text style={styles.value}>{patient.mhcaId}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Date of Admission</Text>
          <Text style={styles.value}>{patient.admissionTimestamp.toLocaleDateString()} {patient.admissionTimestamp.toLocaleTimeString()}</Text>
        </View>
      </View>

      <View style={{ marginTop: 20, padding: 10, backgroundColor: '#f8fafc', borderRadius: 5 }}>
        <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 8, color: '#1e293b' }}>Digital Notification Record</Text>
        <View style={{ flexDirection: 'row', gap: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: notifications?.sms ? '#22c55e' : '#cbd5e1' }} />
            <Text style={{ fontSize: 9 }}>SMS Notification: {notifications?.sms ? 'SENT' : 'PENDING'}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: notifications?.whatsapp ? '#22c55e' : '#cbd5e1' }} />
            <Text style={{ fontSize: 9 }}>WhatsApp Notification: {notifications?.whatsapp ? 'SENT' : 'PENDING'}</Text>
          </View>
        </View>
        <Text style={{ fontSize: 8, color: '#64748b', marginTop: 5 }}>Recipient: {patient.familyPhone}</Text>
      </View>

      <View style={{ marginTop: 30, alignItems: 'center' }}>
        {barcodeUrl && <Image src={barcodeUrl} style={styles.barcode} />}
        <Text style={{ fontSize: 8, marginTop: 4, letterSpacing: 2 }}>{patient.mhcaId}</Text>
      </View>

      <View style={{ marginTop: 40, borderTop: '1pt solid #000', paddingTop: 10 }}>
        <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Signature of Applicant / Family Member</Text>
        <View style={{ height: 50 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 10 }}>Print Name: ___________________________</Text>
          <Text style={{ fontSize: 10 }}>Date: ____________________</Text>
        </View>
      </View>

      <Text style={styles.footer}>
        This document is generated electronically by MHCAssist. Verification can be performed by scanning the QR code above.
        Compliance with Mental Health Care Act No. 17 of 2002.
      </Text>
    </Page>
  </Document>
);
