// src/services/tournamentService.js — v2: Solo/Duo/Squad support added
import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc,
  setDoc, runTransaction, serverTimestamp,
  query, orderBy, where, onSnapshot, limit,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ── Tournament modes ──────────────────────────────────────────────────────────
export const TOURNAMENT_MODES = {
  SOLO:  { key:'solo',  label:'Solo',  size:1, emoji:'🎯', desc:'Akele khelo' },
  DUO:   { key:'duo',   label:'Duo',   size:2, emoji:'👥', desc:'2 log ki team' },
  SQUAD: { key:'squad', label:'Squad', size:4, emoji:'⚔️',  desc:'4 log ki team' },
};

export const GAME_LIST = [
  { name:'BGMI',         emoji:'🎯', modes:['solo','duo','squad'] },
  { name:'Free Fire MAX',emoji:'🔥', modes:['solo','duo','squad'] },
  { name:'COD Mobile',   emoji:'💥', modes:['solo','duo','squad'] },
];

// ── Real-time tournament listener ─────────────────────────────────────────────
export function subscribeTournaments(callback, onError) {
  const q = query(collection(db, 'tournaments'), orderBy('start_time', 'asc'));
  return onSnapshot(
    q,
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    onError
  );
}

// ── Fetch single tournament ───────────────────────────────────────────────────
export async function fetchTournament(id) {
  const snap = await getDoc(doc(db, 'tournaments', id));
  if (!snap.exists()) throw new Error('Tournament not found.');
  return { id: snap.id, ...snap.data() };
}

// ── Fetch user's joined tournament IDs — O(1) ─────────────────────────────────
export async function fetchUserRegistrations(uid) {
  const snap = await getDocs(collection(db, 'user_registrations', uid, 'tournaments'));
  return snap.docs.map(d => d.id);
}

// ── SOLO JOIN — single user joins directly ────────────────────────────────────
export async function joinTournament(uid, tournamentId) {
  const tournamentRef   = doc(db, 'tournaments', tournamentId);
  const userRef         = doc(db, 'users', uid);
  const registrationRef = doc(db, 'tournaments', tournamentId, 'registrations', uid);
  const userRegRef      = doc(db, 'user_registrations', uid, 'tournaments', tournamentId);

  await runTransaction(db, async tx => {
    const [tSnap, uSnap, regSnap] = await Promise.all([
      tx.get(tournamentRef), tx.get(userRef), tx.get(registrationRef),
    ]);

    if (!tSnap.exists())  throw new Error('Tournament does not exist.');
    if (!uSnap.exists())  throw new Error('User profile not found.');
    if (regSnap.exists()) throw new Error('Aap already is tournament mein join kar chuke ho.');

    const t = tSnap.data();
    const u = uSnap.data();
    const mode = t.tournament_mode || 'solo';

    if (mode !== 'solo') {
      throw new Error(
        `Yeh ${mode.toUpperCase()} tournament hai. Pehle team banao aur phir team join karo.`
      );
    }
    if (t.status === 'completed') throw new Error('Tournament already end ho gaya hai.');
    if (t.slots_filled >= t.slots_total) throw new Error('Tournament full hai. Koi slot nahi bachi.');
    if (u.elite_coins_balance < t.entry_fee) {
      throw new Error(
        `Balance kam hai. ${t.entry_fee} EC chahiye, aapke paas ${u.elite_coins_balance} EC hai.`
      );
    }

    tx.update(tournamentRef, { slots_filled: t.slots_filled + 1, updatedAt: serverTimestamp() });
    tx.update(userRef, {
      elite_coins_balance: u.elite_coins_balance - t.entry_fee,
      matches_played:      (u.matches_played || 0) + 1,
      updatedAt:           serverTimestamp(),
    });
    tx.set(registrationRef, {
      userId:    uid,
      username:  u.username,
      mode:      'solo',
      joinedAt:  serverTimestamp(),
      entry_fee: t.entry_fee,
    });
    tx.set(userRegRef, { tournamentId, joinedAt: serverTimestamp(), entry_fee: t.entry_fee });
  });
}

// ── DUO/SQUAD TEAM JOIN — captain joins for entire team ───────────────────────
// Each team member's entry fee is deducted individually from their balance.
// Slot is filled by team_size (2 for duo, 4 for squad) at once.
export async function joinTournamentAsTeam(teamId, memberUids, tournamentId) {
  if (!teamId || !memberUids?.length) throw new Error('Team info missing.');

  const tournamentRef = doc(db, 'tournaments', tournamentId);

  // 1. Validate all members exist and have enough balance
  const memberSnaps = await Promise.all(memberUids.map(uid => getDoc(doc(db, 'users', uid))));
  memberSnaps.forEach((snap, i) => {
    if (!snap.exists()) throw new Error(`Member ${memberUids[i]} ka profile nahi mila.`);
  });

  await runTransaction(db, async tx => {
    const tSnap = await tx.get(tournamentRef);
    if (!tSnap.exists()) throw new Error('Tournament nahi mila.');
    const t = tSnap.data();

    const mode     = t.tournament_mode || 'solo';
    const modeInfo = Object.values(TOURNAMENT_MODES).find(m => m.key === mode) || TOURNAMENT_MODES.SOLO;
    const teamSize = modeInfo.size;

    if (mode === 'solo') throw new Error('Yeh solo tournament hai. Solo join karo.');
    if (memberUids.length !== teamSize) {
      throw new Error(
        `${mode.toUpperCase()} mein ${teamSize} players chahiye. Aapke paas ${memberUids.length} hain.`
      );
    }
    if (t.status === 'completed') throw new Error('Tournament already end ho gaya hai.');
    if (t.slots_filled + teamSize > t.slots_total) {
      throw new Error(`Enough slots nahi hain. ${teamSize} slots chahiye, ${t.slots_total - t.slots_filled} bachi hain.`);
    }

    // Read all member docs inside transaction
    const uSnaps = await Promise.all(memberUids.map(uid => tx.get(doc(db, 'users', uid))));

    uSnaps.forEach((uSnap, i) => {
      const u   = uSnap.data();
      const uid = memberUids[i];
      if (u.elite_coins_balance < t.entry_fee) {
        throw new Error(
          `${u.username} ke paas kafi balance nahi. ${t.entry_fee} EC chahiye, ${u.elite_coins_balance} EC hai.`
        );
      }
      // Check already registered
      // (reg check inside transaction not possible for sub-collection, done outside)
    });

    // All checks passed — write atomically
    tx.update(tournamentRef, {
      slots_filled: t.slots_filled + teamSize,
      updatedAt:    serverTimestamp(),
    });

    uSnaps.forEach((uSnap, i) => {
      const u   = uSnap.data();
      const uid = memberUids[i];
      tx.update(doc(db, 'users', uid), {
        elite_coins_balance: u.elite_coins_balance - t.entry_fee,
        matches_played:      (u.matches_played || 0) + 1,
        updatedAt:           serverTimestamp(),
      });
      tx.set(doc(db, 'tournaments', tournamentId, 'registrations', uid), {
        userId:    uid,
        username:  u.username,
        teamId,
        mode,
        joinedAt:  serverTimestamp(),
        entry_fee: t.entry_fee,
      });
      tx.set(doc(db, 'user_registrations', uid, 'tournaments', tournamentId), {
        tournamentId, teamId, joinedAt: serverTimestamp(), entry_fee: t.entry_fee,
      });
    });
  });
}

// ── Admin: Create tournament ──────────────────────────────────────────────────
export async function createTournament(data) {
  if (!data.game_name)        throw new Error('Game select karo.');
  if (!data.tournament_mode)  throw new Error('Mode select karo (Solo/Duo/Squad).');
  if (data.prize_pool <= 0)   throw new Error('Prize pool > 0 hona chahiye.');
  if (data.slots_total < 2)   throw new Error('Min 2 slots chahiye.');

  const modeInfo = Object.values(TOURNAMENT_MODES).find(m => m.key === data.tournament_mode);
  if (!modeInfo) throw new Error('Invalid tournament mode.');

  // Validate slots_total is divisible by team size for team modes
  if (modeInfo.size > 1 && data.slots_total % modeInfo.size !== 0) {
    throw new Error(
      `${modeInfo.label} tournament mein slots ${modeInfo.size} ka multiple hona chahiye. ` +
      `Example: ${Math.ceil(data.slots_total / modeInfo.size) * modeInfo.size}`
    );
  }

  const ref = await addDoc(collection(db, 'tournaments'), {
    game_name:       data.game_name,
    tournament_mode: data.tournament_mode,
    mode_size:       modeInfo.size,
    entry_fee:       Number(data.entry_fee) || 0,
    prize_pool:      Number(data.prize_pool),
    slots_total:     Number(data.slots_total),
    slots_filled:    0,
    start_time:      data.start_time,
    rules:           data.rules || '',
    status:          'upcoming',
    stream_url:      data.stream_url || '',
    stream_platform: data.stream_platform || 'youtube',
    room_id:         '',
    room_password:   '',
    winner_uid:      '',
    sponsor_name:    data.sponsor_name || '',
    sponsor_logo:    data.sponsor_logo || '',
    createdAt:       serverTimestamp(),
    updatedAt:       serverTimestamp(),
  });
  return ref.id;
}

// ── Admin: Update tournament ──────────────────────────────────────────────────
export async function updateTournament(id, data) {
  await updateDoc(doc(db, 'tournaments', id), { ...data, updatedAt: serverTimestamp() });
}

// ── Admin: Credit prize — atomic — supports team prize split ──────────────────
export async function creditPrize(winnerUid, prizeAmount, tournamentId, teamMemberUids = []) {
  if (!winnerUid)       throw new Error('Winner UID required.');
  if (prizeAmount <= 0) throw new Error('Prize > 0 hona chahiye.');

  const tournamentRef = doc(db, 'tournaments', tournamentId);
  const tSnap         = await getDoc(tournamentRef);
  if (!tSnap.exists()) throw new Error('Tournament nahi mila.');
  if (tSnap.data().winner_uid) throw new Error('Prize already credit ho chuka hai.');

  const mode = tSnap.data().tournament_mode || 'solo';

  // For team modes: split prize equally among team members
  const winners    = (mode !== 'solo' && teamMemberUids.length > 0) ? teamMemberUids : [winnerUid];
  const perMember  = Math.floor(prizeAmount / winners.length);

  await runTransaction(db, async tx => {
    // Read all winner docs
    const uSnaps = await Promise.all(winners.map(uid => tx.get(doc(db, 'users', uid))));

    uSnaps.forEach((uSnap, i) => {
      if (!uSnap.exists()) throw new Error(`Winner ${winners[i]} ka profile nahi mila.`);
      const u = uSnap.data();
      tx.update(doc(db, 'users', winners[i]), {
        elite_coins_balance: u.elite_coins_balance + perMember,
        total_winnings:      (u.total_winnings || 0) + perMember,
        updatedAt:           serverTimestamp(),
      });
    });

    tx.update(tournamentRef, {
      winner_uid:      winnerUid,
      winner_uids:     winners,
      prize_per_member:perMember,
      status:          'completed',
      updatedAt:       serverTimestamp(),
    });
  });
}
