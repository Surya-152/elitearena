// src/services/teamService.js — Team/Squad/Duo Tournament System
import {
  doc, getDoc, setDoc, updateDoc, addDoc, deleteDoc,
  collection, query, where, getDocs, onSnapshot,
  runTransaction, serverTimestamp, limit,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const TEAM_MODES = {
  SOLO:  { label:'Solo',  size:1, emoji:'🎯' },
  DUO:   { label:'Duo',   size:2, emoji:'👥' },
  SQUAD: { label:'Squad', size:4, emoji:'⚔️' },
};

// ── Create a team ─────────────────────────────────────────────────────────────
export async function createTeam(uid, username, teamName) {
  if (!teamName?.trim() || teamName.trim().length < 3)
    throw new Error('Team name min 3 characters hona chahiye.');

  // Check unique team name
  const q = await getDocs(query(collection(db,'teams'), where('name','==',teamName.trim()), limit(1)));
  if (!q.empty) throw new Error('Yeh team name already le liya gaya hai.');

  // Check user not already in a team
  const existing = await getDocs(query(collection(db,'teams'), where('memberIds','array-contains',uid), limit(1)));
  if (!existing.empty) throw new Error('Aap already ek team mein hain. Pehle leave karo.');

  const ref = await addDoc(collection(db, 'teams'), {
    name:       teamName.trim(),
    captainUid: uid,
    captainUsername: username,
    memberIds:  [uid],
    members:    [{ uid, username, role:'captain', joinedAt: new Date().toISOString() }],
    wins:       0,
    totalEarnings: 0,
    createdAt:  serverTimestamp(),
    updatedAt:  serverTimestamp(),
  });

  // Update user document
  await updateDoc(doc(db,'users',uid), { teamId: ref.id, updatedAt: serverTimestamp() });
  return ref.id;
}

// ── Get team by ID ─────────────────────────────────────────────────────────────
export async function getTeam(teamId) {
  const snap = await getDoc(doc(db,'teams',teamId));
  if (!snap.exists()) throw new Error('Team not found.');
  return { id: snap.id, ...snap.data() };
}

// ── Invite member (generate invite code) ─────────────────────────────────────
export async function generateInviteCode(teamId, captainUid) {
  const team = await getTeam(teamId);
  if (team.captainUid !== captainUid) throw new Error('Sirf captain invite bhej sakta hai.');

  const code = Math.random().toString(36).slice(2,8).toUpperCase();
  const expiry = new Date(Date.now() + 24 * 3600 * 1000); // 24hr

  await updateDoc(doc(db,'teams',teamId), {
    inviteCode:       code,
    inviteCodeExpiry: expiry.toISOString(),
    updatedAt:        serverTimestamp(),
  });
  return code;
}

// ── Join team via invite code ─────────────────────────────────────────────────
export async function joinTeamByCode(uid, username, code) {
  // Check user not already in a team
  const existingUser = await getDocs(query(collection(db,'teams'), where('memberIds','array-contains',uid), limit(1)));
  if (!existingUser.empty) throw new Error('Aap already ek team mein hain.');

  // Find team by invite code
  const q = await getDocs(query(collection(db,'teams'), where('inviteCode','==',code.toUpperCase()), limit(1)));
  if (q.empty) throw new Error('Invalid invite code.');

  const teamDoc = q.docs[0];
  const team    = teamDoc.data();

  // Check expiry
  if (team.inviteCodeExpiry && new Date(team.inviteCodeExpiry) < new Date())
    throw new Error('Invite code expire ho gaya. Captain se naya code maango.');

  // Check max size (4 for squad)
  if (team.memberIds.length >= 4)
    throw new Error('Team full hai (max 4 members).');

  await runTransaction(db, async (tx) => {
    const tSnap = await tx.get(doc(db,'teams',teamDoc.id));
    const t     = tSnap.data();
    if (t.memberIds.includes(uid)) throw new Error('Aap already is team mein hain.');
    const newMembers  = [...t.members,  { uid, username, role:'member', joinedAt: new Date().toISOString() }];
    const newMemberIds= [...t.memberIds, uid];
    tx.update(doc(db,'teams',teamDoc.id), { members: newMembers, memberIds: newMemberIds, updatedAt: serverTimestamp() });
    tx.update(doc(db,'users',uid), { teamId: teamDoc.id, updatedAt: serverTimestamp() });
  });

  return teamDoc.id;
}

// ── Leave team ────────────────────────────────────────────────────────────────
export async function leaveTeam(uid, teamId) {
  await runTransaction(db, async (tx) => {
    const tSnap = await tx.get(doc(db,'teams',teamId));
    if (!tSnap.exists()) throw new Error('Team not found.');
    const t = tSnap.data();
    if (t.captainUid === uid && t.memberIds.length > 1)
      throw new Error('Captain team nahi chhor sakta jab tak members hain. Pehle captain transfer karo.');

    const newMembers   = t.members.filter(m => m.uid !== uid);
    const newMemberIds = t.memberIds.filter(id => id !== uid);

    if (newMemberIds.length === 0) {
      tx.delete(doc(db,'teams',teamId));
    } else {
      tx.update(doc(db,'teams',teamId), { members: newMembers, memberIds: newMemberIds, updatedAt: serverTimestamp() });
    }
    tx.update(doc(db,'users',uid), { teamId: null, updatedAt: serverTimestamp() });
  });
}

// ── Real-time team listener ───────────────────────────────────────────────────
export function subscribeTeam(teamId, callback, onError) {
  return onSnapshot(doc(db,'teams',teamId), snap => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
    else callback(null);
  }, onError);
}

// ── Team leaderboard ──────────────────────────────────────────────────────────
export async function fetchTopTeams(count = 20) {
  const q = query(collection(db,'teams'), limit(count));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id:d.id, ...d.data() }))
    .sort((a,b) => (b.totalEarnings||0) - (a.totalEarnings||0));
}
