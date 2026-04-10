const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
const PDFDocument = require('pdfkit');

admin.initializeApp();
const db = admin.firestore();

// Set SendGrid API Key from environment variables
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * Audit Trail: Tamper-proof log for patient document changes.
 */
exports.auditLog = functions.firestore
  .document('patients/{patientId}')
  .onWrite(async (change, context) => {
    const patientId = context.params.patientId;
    const before = change.before.exists ? change.before.data() : null;
    const after = change.after.exists ? change.after.data() : null;
    
    let action = 'update';
    if (!before) action = 'create';
    if (!after) action = 'delete';

    await db.collection('audit_logs').add({
      userId: context.auth ? context.auth.uid : 'system',
      action,
      documentId: patientId,
      before: before ? JSON.stringify(before) : null,
      after: after ? JSON.stringify(after) : null,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

/**
 * MHCA-14: Automatic Review Board notification.
 */
exports.notifyReviewBoard = functions.firestore
  .document('patients/{patientId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (after.status === 'awaiting_review' && before.status !== 'awaiting_review') {
      const patientId = context.params.patientId;
      
      // Generate PDF Summary
      const doc = new PDFDocument();
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', async () => {
        const pdfBuffer = Buffer.concat(buffers);
        
        const msg = {
          to: process.env.REVIEW_BOARD_EMAIL || 'reviewboard@kznhealth.gov.za',
          from: process.env.EMAIL_FROM || 'system@mhcassist.gov.za',
          subject: `MHCA-14: Review Required for Patient ${after.mhcaId}`,
          text: `Patient ${after.name} (${after.mhcaId}) is now under review. Summary attached.`,
          attachments: [
            {
              content: pdfBuffer.toString('base64'),
              filename: `MHCA14_${after.mhcaId}.pdf`,
              type: 'application/pdf',
              disposition: 'attachment',
            },
          ],
        };

        try {
          await sgMail.send(msg);
          await db.collection('notifications').add({
            patientId,
            type: 'REVIEW_BOARD_NOTIFICATION',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            status: 'sent'
          });
        } catch (error) {
          console.error('Error sending email:', error);
        }
      });

      doc.fontSize(20).text('MHCA-14 Review Summary', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Patient Name: ${after.name}`);
      doc.text(`MHCA ID: ${after.mhcaId}`);
      doc.text(`Status: ${after.status}`);
      doc.text(`Admission Date: ${after.admissionTimestamp.toDate().toLocaleDateString()}`);
      doc.end();
    }
  });

/**
 * Server-side RBAC: Set custom claims for user roles.
 */
exports.setRole = functions.https.onCall(async (data, context) => {
  const adminEmails = ['nzambaoliver@gmail.com', 'nzambaoliver6@gmail.com'];
  const { uid, role } = data;

  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
  }

  // Authorization Logic:
  // 1. Existing Admins can set any role for any user.
  // 2. The Default Admin Emails can set any role for any user (bootstrapping).
  // 3. Any user can set their OWN role IF it is NOT 'admin'.
  const isExistingAdmin = context.auth.token.role === 'admin';
  const isDefaultAdmin = adminEmails.includes(context.auth.token.email);
  const isSelfSettingNonAdmin = context.auth.uid === uid && role !== 'admin';

  const isAuthorized = isExistingAdmin || isDefaultAdmin || isSelfSettingNonAdmin;

  if (!isAuthorized) {
    throw new functions.https.HttpsError('permission-denied', 'Not authorized to set this role.');
  }

  if (!['nurse', 'clinician', 'review_board', 'admin'].includes(role)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid role.');
  }

  await admin.auth().setCustomUserClaims(uid, { role });
  await db.collection('users').doc(uid).set({ role }, { merge: true });
  
  return { status: 'success' };
});

/**
 * Low-tech USSD Endpoint: Simulation for status checks.
 */
exports.ussdStatusCheck = functions.https.onRequest(async (req, res) => {
  const patientId = req.query.id;
  if (!patientId) {
    return res.status(400).send('Missing patient ID');
  }

  const doc = await db.collection('patients').doc(patientId).get();
  if (!doc.exists) {
    return res.status(404).send('Patient not found');
  }

  const patient = doc.data();
  const deadline = patient.observationDeadline.toDate().toLocaleString();
  
  res.set('Content-Type', 'text/plain');
  res.send(`Patient ${patient.name} | Status: ${patient.status} | 72h deadline: ${deadline}`);
});

/**
 * Scheduled function to check 72-hour observation deadlines.
 */
exports.checkObservationDeadlines = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    
    const snapshot = await db.collection('patients')
      .where('observationDeadline', '<=', now)
      .where('status', 'in', ['admitted', 'observing'])
      .get();

    if (snapshot.empty) return null;

    const batch = db.batch();
    snapshot.forEach(doc => {
      const patient = doc.data();
      const alertRef = db.collection('alerts').doc();
      batch.set(alertRef, {
        patientId: doc.id,
        mhcaId: patient.mhcaId,
        type: 'OBSERVATION_OVERDUE',
        timestamp: now,
        resolved: false
      });
    });

    await batch.commit();
    return null;
  });

/**
 * Triggered when a new patient is registered.
 * Automatically schedules assessment tasks in sub-collection.
 */
exports.onPatientCreated = functions.firestore
  .document('patients/{patientId}')
  .onCreate(async (snapshot, context) => {
    const patientId = context.params.patientId;
    const now = admin.firestore.Timestamp.now().toDate();

    const assessmentsRef = db.collection('patients').doc(patientId).collection('assessments');

    // Schedule Medical Assessment
    await assessmentsRef.doc('medical_doctor_assessment').set({
      assessorName: 'PENDING',
      assessorRole: 'medical_doctor',
      signed: false,
      notes: '',
      scheduledTime: admin.firestore.Timestamp.fromDate(new Date(now.getTime() + 24 * 60 * 60 * 1000))
    });

    // Schedule Other Assessment
    await assessmentsRef.add({
      assessorName: 'PENDING',
      assessorRole: 'other_practitioner',
      signed: false,
      notes: '',
      scheduledTime: admin.firestore.Timestamp.fromDate(new Date(now.getTime() + 48 * 60 * 60 * 1000))
    });
  });
