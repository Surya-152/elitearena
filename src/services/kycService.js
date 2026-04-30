// src/services/kycService.js — FIXED: removed broken dynamic import
import {
  doc, updateDoc, addDoc, collection, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export async function submitKYC(uid, kycData) {
  if (!uid) throw new Error('Not logged in.');

  const maskedKyc = {
    ...kycData,
    aadharNumber: `XXXX-XXXX-${kycData.aadharNumber.slice(-4)}`,
    submittedAt:  serverTimestamp(),
  };

  await updateDoc(doc(db, 'users', uid), {
    kycStatus: 'submitted',
    kycData:   maskedKyc,
    updatedAt: serverTimestamp(),
  });

  await addDoc(collection(db, 'kyc_reviews'), {
    uid,
    fullName:    kycData.fullName,
    panNumber:   kycData.panNumber,
    aadharLast4: kycData.aadharNumber.slice(-4),
    dob:         kycData.dob,
    city:        kycData.city,
    state:       kycData.state,
    pincode:     kycData.pincode,
    status:      'pending',
    createdAt:   serverTimestamp(),
  });
}

// Admin: approve KYC
export async function approveKYC(uid, reviewId) {
  // FIX: was using broken dynamic import — now uses static import at top
  await updateDoc(doc(db, 'users', uid), {
    kycStatus:  'approved',
    updatedAt:  serverTimestamp(),
  });
  await updateDoc(doc(db, 'kyc_reviews', reviewId), {
    status:     'approved',
    reviewedAt: serverTimestamp(),
  });
}

// Admin: reject KYC
export async function rejectKYC(uid, reviewId, reason) {
  await updateDoc(doc(db, 'users', uid), {
    kycStatus:       'rejected',
    kycRejectReason: reason || 'Details verify nahi ho payi.',
    updatedAt:       serverTimestamp(),
  });
  await updateDoc(doc(db, 'kyc_reviews', reviewId), {
    status:     'rejected',
    reason:     reason || '',
    reviewedAt: serverTimestamp(),
  });
}
