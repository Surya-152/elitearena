// scripts/seed.mjs — Run with: npm run seed
import { initializeApp }   from 'firebase/app';
import {
  getFirestore, collection, addDoc, serverTimestamp, Timestamp,
  doc, setDoc,
} from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { readFileSync }    from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath }   from 'url';

function parseEnv(path) {
  const result = {};
  try {
    for (const raw of readFileSync(path, 'utf8').split('\n')) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const eq  = line.indexOf('=');
      if (eq === -1) continue;
      let val = line.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      result[line.slice(0, eq).trim()] = val;
    }
  } catch { console.error('❌ Could not read .env'); process.exit(1); }
  return result;
}

const __dir = dirname(fileURLToPath(import.meta.url));
const env   = parseEnv(resolve(__dir, '../.env'));

if (!env.VITE_FIREBASE_API_KEY) {
  console.error('❌ Missing Firebase keys. cp .env.example .env and fill them in.'); process.exit(1);
}

const app  = initializeApp({
  apiKey:            env.VITE_FIREBASE_API_KEY,
  authDomain:        env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             env.VITE_FIREBASE_APP_ID,
});
const db   = getFirestore(app);
const auth = getAuth(app);

const now = Date.now(), hr = 3_600_000, day = 86_400_000;

const TOURNAMENTS = [
  { game_name:'BGMI',          entry_fee:10,  prize_pool:500,  slots_total:100, start_time:Timestamp.fromMillis(now+2*hr),  status:'upcoming', rules:'TPP mode only. No emulators. Squads of 4.' },
  { game_name:'Free Fire MAX', entry_fee:25,  prize_pool:1200, slots_total:50,  start_time:Timestamp.fromMillis(now+4*hr),  status:'live',     rules:'Classic BR mode. Top 3 squads win.' },
  { game_name:'BGMI',          entry_fee:50,  prize_pool:5000, slots_total:25,  start_time:Timestamp.fromMillis(now+day),   status:'upcoming', rules:'Pro league. No emulators. Strict FPS limits.' },
  { game_name:'COD Mobile',    entry_fee:5,   prize_pool:200,  slots_total:200, start_time:Timestamp.fromMillis(now+6*hr),  status:'upcoming', rules:'TDM best of 5 rounds.' },
  { game_name:'Free Fire MAX', entry_fee:0,   prize_pool:100,  slots_total:100, start_time:Timestamp.fromMillis(now+2*day), status:'upcoming', rules:'Free entry — newcomers welcome! Solo mode.' },
  { game_name:'BGMI',          entry_fee:100, prize_pool:10000,slots_total:16,  start_time:Timestamp.fromMillis(now+3*day), status:'upcoming', rules:'Elite Championship. Invitation required.' },
];

// Optional demo users (skipped if already exist)
const DEMO_USERS = [
  { email:'player1@demo.com', password:'demo123456', username:'ProGamer_X',    coins:1500, winnings:2500, matches:12 },
  { email:'player2@demo.com', password:'demo123456', username:'SniperElite',   coins:800,  winnings:1200, matches:8  },
  { email:'player3@demo.com', password:'demo123456', username:'RushMaster99',  coins:200,  winnings:500,  matches:5  },
];

async function seed() {
  console.log('\n🌱  Seeding EliteArena Firestore…\n');

  // Tournaments
  console.log('📋  Creating tournaments…');
  let tOk = 0;
  for (const t of TOURNAMENTS) {
    try {
      const ref = await addDoc(collection(db, 'tournaments'), {
        ...t, slots_filled:0, createdAt:serverTimestamp(), updatedAt:serverTimestamp(),
      });
      console.log(`  ✅  ${t.game_name.padEnd(14)} ${t.status.padEnd(10)} → ${ref.id}`);
      tOk++;
    } catch (e) { console.error(`  ❌  ${t.game_name}: ${e.message}`); }
  }

  // Demo users (best-effort — skip auth errors)
  console.log('\n👥  Creating demo users…');
  for (const u of DEMO_USERS) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, u.email, u.password);
      await updateProfile(cred.user, { displayName: u.username });
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid:                 cred.user.uid,
        email:               u.email,
        username:            u.username,
        elite_coins_balance: u.coins,
        total_winnings:      u.winnings,
        matches_played:      u.matches,
        role:                'user',
        createdAt:           serverTimestamp(),
        updatedAt:           serverTimestamp(),
      });
      console.log(`  ✅  ${u.username} (${u.email})`);
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') {
        console.log(`  ⚠️   ${u.username} already exists — skipped`);
      } else {
        console.error(`  ❌  ${u.username}: ${e.message}`);
      }
    }
  }

  console.log(`\n🎮  Done! ${tOk} tournaments + demo users seeded.`);
  console.log('    npm run dev  →  http://localhost:5173\n');
  process.exit(0);
}

seed();
