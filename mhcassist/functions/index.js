const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

/**
 * Scheduled function to check 72-hour observation deadlines.
 * Runs every hour.
 */
exports.checkObservationDeadlines = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    
    // Find patients whose deadline has passed and are still 'admitted' or 'observing'
    const snapshot = await db.collection('patients')
      .where('observationDeadline', '<=', now)
      .where('status', 'in', ['admitted', 'observing'])
      .get();

    if (snapshot.empty) {
      console.log('No overdue observations found.');
      return null;
    }

    const batch = db.batch();
    const alerts = [];

    snapshot.forEach(doc => {
      const patient = doc.data();
      console.warn(`ALERT: Patient ${patient.mhcaId} (${patient.name}) has exceeded the 72-hour observation window.`);
      
      // In a real app, integrate with Twilio here
      // await sendSMS(patient.familyPhone, `Observation deadline exceeded for ${patient.name}`);
      
      // Log alert in a separate collection
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
 * Automatically schedules assessment tasks.
 */
exports.onPatientCreated = functions.firestore
  .document('patients/{patientId}')
  .onCreate(async (snapshot, context) => {
    const patientId = context.params.patientId;
    const patient = snapshot.data();
    const now = admin.firestore.Timestamp.now().toDate();

    // Schedule Medical Assessment (24h)
    const medicalTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    await db.collection('assessments').add({
      patientId,
      type: 'medical',
      assignedTo: 'PENDING',
      scheduledTime: admin.firestore.Timestamp.fromDate(medicalTime),
      completed: false
    });

    // Schedule Non-Medical Assessment (48h)
    const nonMedicalTime = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    await db.collection('assessments').add({
      patientId,
      type: 'non_medical',
      assignedTo: 'PENDING',
      scheduledTime: admin.firestore.Timestamp.fromDate(nonMedicalTime),
      completed: false
    });

    console.log(`Scheduled assessments for patient ${patient.mhcaId}`);
  });
