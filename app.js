// == CONFIG ================================================================
const SUPABASE_URL = 'https://wzhcwiumxtcwxooecfap.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_usyCC5oS2PkNrem4R4ywKQ_zSx3HS5o';
// =========================================================================

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// -- VOTER IDENTITY -------------------------------------------------------
const nameInput = document.getElementById('voter-name-input');
nameInput.value = localStorage.getItem('candyVoterName') || '';
nameInput.addEventListener('change', () => {
  localStorage.setItem('candyVoterName', nameInput.value.trim());
  updateTripcode();
  document.getElementById('admin-tab-btn').style.display = isJanitor() ? '' : 'none';
});
const voterName = () => nameInput.value.trim() || 'Anonymous';

const deviceId = (() => {
  let id = localStorage.getItem('candyDeviceId');
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('candyDeviceId', id); }
  return id;
})();

// -- TRIPCODE (fake hash for imageboard flavor) ---------------------------
function hashTrip(str) {
  if (!str) return '';
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return '!' + Math.abs(h).toString(36).slice(0, 8).toUpperCase();
}

function updateTripcode() {
  const name = nameInput.value.trim();
  document.getElementById('tripcode').textContent = name ? hashTrip(name) : '';
}
updateTripcode();

// -- ADMIN / JANITOR CHECK ------------------------------------------------
const _jn = [
  [0x62, 0x72, 0x61, 0x6e, 0x64, 0x6f, 0x6e],
  [0x62, 0x77, 0x6f, 0x72, 0x66]
];
const _jd = a => a.map(c => String.fromCharCode(c)).join('');
const isJanitor = () => _jn.some(a => _jd(a) === voterName().toLowerCase());
document.getElementById('admin-tab-btn').style.display = isJanitor() ? '' : 'none';

// -- POST NUMBER GENERATOR ------------------------------------------------
let _postNo = Math.floor(Math.random() * 90000000) + 10000000;
function nextPostNo() { return _postNo++; }

// -- HTML ESCAPE ----------------------------------------------------------
function escHtml(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

// -- TABS -----------------------------------------------------------------
function switchTab(btn) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(el => el.classList.remove('active'));
  const tab = btn.dataset.tab;
  document.getElementById('tab-' + tab).classList.add('active');
  btn.classList.add('active');
  if (tab === 'this-week') loadBallot();
  if (tab === 'pool') loadPool();
  if (tab === 'history') loadHistory();
}

// -- FLASH MESSAGES -------------------------------------------------------
let flashTimer;
function flash(msg, type) {
  type = type || 'info';
  clearTimeout(flashTimer);
  document.getElementById('flash').innerHTML = '<div class="banner ' + type + '">' + msg + '</div>';
  flashTimer = setTimeout(() => { document.getElementById('flash').innerHTML = ''; }, 5000);
}

// -- RANDOM FORUM SIGNATURES ----------------------------------------------
const signatures = [
  "Posted from my Zune HD",
  "i put on my robe and wizard hat",
  "this post brought to you by TORTURE PHARMACEUTICALS",
  "- sent from my Motorola RAZR",
  "sig limit exceeded, buy premium",
  "dont quote me on that",
  "EDIT: wow this blew up. rip my inbox",
  "\"I gotta have more cowbell\" - Christopher Walken",
  "if you can read this, the annoying alarm in the parking lot is not my car",
  "Posted from Netscape Navigator 4.08",
  "All your base are belong to us",
  "Has anyone really been far even as decided to use even go want to do look more like?",
  "Epstein didn't kill himself",
  "I AM ERROR",
  "- posted from my Compaq Presario",
  "THIS SPACE INTENTIONALLY LEFT BLANK (it wasn't)"
];

function randomSig() {
  return signatures[Math.floor(Math.random() * signatures.length)];
}

// -- RANDOM BANNED MESSAGES -----------------------------------------------
const bannedReasons = [
  "Reason: Posting candy corn apologia",
  "Reason: Excessive shitposting about Skittles",
  "Reason: Attempting to bribe the janitor with Fun Dip",
  "Reason: Unregistered lobbying for Big Chocolate",
  "Reason: Claiming circus peanuts are edible",
  "Reason: Voting twice (nice try)",
  "Reason: Necco Wafer radicalization"
];

function maybeBanned() {
  if (Math.random() < 0.08) {
    return '<div class="banned-notice">USER WAS BANNED FOR THIS POST<br><span style="font-size:0.58rem;">' +
      bannedReasons[Math.floor(Math.random() * bannedReasons.length)] + '</span></div>';
  }
  return '';
}

// -- AI CANDY IMAGES ------------------------------------------------------
let _candyCache = {};

async function ensureImageSeeds(candies) {
  const missing = candies.filter(c => !c.image_seed);
  for (const c of missing) {
    const seed = Math.floor(Math.random() * 9999999) + 1;
    await db.from('candies').update({ image_seed: seed }).eq('id', c.id);
    c.image_seed = seed;
  }
}

function candyImageUrl(c) {
  const prompt = encodeURIComponent(
    'high quality product photo of ' + c.name + ' candy, vibrant colors, studio lighting, ' +
    'candy packaging visible, photorealistic, appetizing, white background'
  );
  return 'https://image.pollinations.ai/prompt/' + prompt +
    '?seed=' + c.image_seed + '&width=600&height=380&nologo=true&model=flux';
}

function loadCandyImages(candies) {
  const cached = candies.filter(c => c.image_url);
  const uncached = candies.filter(c => !c.image_url);

  cached.forEach(c => loadSingleImage(c, 0));
  uncached.forEach((c, i) => loadSingleImage(c, (i + 1) * 3000));
}

function loadSingleImage(c, delay) {
  setTimeout(() => {
    const img = document.getElementById('cimg-' + c.id);
    if (!img) return;
    const url = c.image_url || candyImageUrl(c);
    let retries = 0;
    const maxRetries = 3;

    const giveUp = setTimeout(() => {
      const wrap = img.closest('.vote-img-wrap');
      if (wrap && !img.classList.contains('loaded')) wrap.style.display = 'none';
    }, 45000);

    img.onload = () => {
      clearTimeout(giveUp);
      img.classList.add('loaded');
      if (!c.image_url) {
        db.from('candies').update({ image_url: url }).eq('id', c.id);
        c.image_url = url;
      }
    };

    img.onerror = () => {
      retries++;
      if (retries <= maxRetries) {
        const backoff = 4000 * Math.pow(2, retries - 1);
        img.removeAttribute('src');
        setTimeout(() => { img.src = url; }, backoff);
      } else {
        const wrap = img.closest('.vote-img-wrap');
        if (wrap) wrap.style.display = 'none';
        clearTimeout(giveUp);
      }
    };

    img.src = url;
  }, delay);
}

function showWinnerModal(candyId) {
  const c = _candyCache[candyId];
  if (!c) return;
  document.getElementById('winner-modal-name').textContent = c.name;
  document.getElementById('winner-modal').classList.add('active');
  const img = document.getElementById('winner-modal-img');
  const url = c.image_url || candyImageUrl(c);
  img.onload = () => img.classList.add('loaded');
  img.onerror = () => { const s = img.src; img.removeAttribute('src'); setTimeout(() => img.src = s, 4000); };
  img.src = url;
}

// -- THIS WEEK (ballot) ---------------------------------------------------
async function loadBallot() {
  const el = document.getElementById('ballot-container');
  el.innerHTML = '<div class="spinner">Loading...</div>';

  const { data: ballots, error } = await db
    .from('ballots')
    .select('*, ballot_options(candy_id, candies(id, name, notes, image_seed, image_url))')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) { el.innerHTML = '<div class="banner error">DB error: ' + escHtml(error.message) + '</div>'; return; }

  if (!ballots || ballots.length === 0) {
    renderNoBallot(el);
    return;
  }

  const ballot = ballots[0];
  const candies = ballot.ballot_options.map(o => o.candies);
  await ensureImageSeeds(candies);
  candies.forEach(c => { _candyCache[c.id] = c; });
  const { data: votes } = await db.from('votes').select('candy_id, voter_name, device_id').eq('ballot_id', ballot.id);
  renderBallot(el, ballot, votes || []);
  loadCandyImages(candies);
  updateTop8();
}

function renderNoBallot(el) {
  el.innerHTML =
    '<div class="empty-state">' +
    '<p>No ballot this week yet.</p>' +
    (isJanitor()
      ? '<button class="btn primary" onclick="generateBallot()">Generate This Week\'s Ballot</button>'
      : '<p style="font-size:0.78rem;">The janitor hasn\'t generated a ballot yet. Patience.</p>') +
    '</div>';
}

function renderBallot(el, ballot, votes) {
  const me = voterName();
  const myVote = votes.find(v => v.device_id === deviceId);
  const counts = {};
  const votersByCandy = {};
  ballot.ballot_options.forEach(o => { counts[o.candy_id] = 0; votersByCandy[o.candy_id] = []; });
  votes.forEach(v => { counts[v.candy_id] = (counts[v.candy_id] || 0) + 1; votersByCandy[v.candy_id].push(v.voter_name); });
  const maxCount = Math.max(...Object.values(counts), 1);

  const isTiebreaker = !!ballot.title;
  const ballotTitle = ballot.title || "This Week's Ballot";

  let html = '<div class="section-header"><h2>' + escHtml(ballotTitle) + '</h2><div class="btn-row">';
  if (!ballot.closed && isJanitor()) {
    html += '<button class="btn sm" onclick="closeBallot(\'' + ballot.id + '\')">Close Ballot</button>';
  }
  if (isJanitor()) {
    html += '<button class="btn primary sm" onclick="generateBallot()">New Ballot</button>';
  }
  html += '</div></div>';

  if (isTiebreaker && !ballot.closed) {
    html += '<div class="tiebreaker-banner">SUGAR RUSH SUDDEN DEATH OVERTIME</div>';
  }

  if (ballot.closed) {
    const stickyBadge = '<span class="badge sticky">Sticky</span><span class="badge locked">Locked</span>';
    html += '<div class="banner warn">This ballot is closed. Thread locked by janitor. ' + stickyBadge + (ballot.winner_id ? ' Winner below.' : '') + '</div>';
  }

  if (me === 'Anonymous' && !ballot.closed) {
    html += '<div class="banner info">Enter a name up top to vote, newfriend.</div>';
  }

  html += ballot.ballot_options.map(opt => {
    const c = opt.candies;
    const count = counts[c.id] || 0;
    const isMyVote = myVote && myVote.candy_id === c.id;
    const isWinner = ballot.winner_id === c.id;
    const pct = Math.round((count / maxCount) * 100);
    const canVote = !ballot.closed && me !== 'Anonymous';
    const postNo = nextPostNo();

    let cls = 'card vote-card';
    if (isMyVote) cls += ' my-vote';
    if (isWinner) cls += ' is-winner';
    if (ballot.closed) cls += ' closed-card';

    const onClick = canVote ? ' onclick="castVote(\'' + ballot.id + '\', \'' + c.id + '\')"' : '';

    const winnerBtn = !ballot.closed && myVote && !ballot.winner_id && isJanitor()
      ? '<button class="btn primary sm" style="margin-top:6px" onclick="event.stopPropagation();markWinner(\'' + ballot.id + '\',\'' + c.id + '\')">Declare Winner</button>'
      : '';

    const voterDisplay = votersByCandy[c.id].map(n =>
      '<span style="color:#117864;">' + escHtml(n) + '</span> <span class="post-trip">' + hashTrip(n) + '</span>'
    ).join(', ');

    const flagHtml = '<button class="flag-btn" onclick="event.stopPropagation();flagCandy(\'' + escHtml(c.name) + '\')">[flag]</button>';

    return '<div class="' + cls + '"' + onClick + '>' +
      '<div class="vote-img-wrap">' +
        '<img id="cimg-' + c.id + '" class="vote-img' + (c.image_url ? ' loaded' : '') + '" ' +
          (c.image_url ? 'src="' + c.image_url + '"' : '') + ' alt="' + escHtml(c.name) + '">' +
        '<div class="watermark">CANDYVOTE.COM</div>' +
      '</div>' +
      '<div class="vote-body">' +
        '<div>' +
          '<div class="post-header">' +
            '<span class="post-name">' + escHtml(c.name) + '</span> ' +
            (isWinner ? '<span class="badge winner">Winner</span><span class="badge goldmine">Comedy Goldmine</span>' : '') +
            (isMyVote ? '<span class="post-you">(You)</span>' : '') +
            ' <span class="post-no">No.<a>' + postNo + '</a></span> ' +
            flagHtml +
          '</div>' +
          (c.notes ? '<div class="greentext">' + escHtml(c.notes) + '</div>' : '') +
          '<div class="cl-location">Posted ' + randomTimeAgo() + ' in Cubicle Farm, KS</div>' +
        '</div>' +
        '<div class="bar-wrap">' +
          '<div class="vote-count">' + count + ' vote' + (count !== 1 ? 's' : '') +
            (voterDisplay ? ' <span style="color:#888;">(' + voterDisplay + ')</span>' : '') +
          '</div>' +
          '<div class="vote-bar"><div class="vote-bar-fill" style="width:' + pct + '%"></div></div>' +
          (canVote && !myVote ? '<div class="hint">click to vote</div>' : '') +
          winnerBtn +
        '</div>' +
      '</div>' +
      '<div class="forum-sig">' + randomSig() + '</div>' +
      maybeBanned() +
    '</div>';
  }).join('');

  const allVoters = [...new Set(votes.map(v => v.voter_name))];
  if (allVoters.length > 0) {
    html += '<div class="voters">Voted: ' + allVoters.map(n =>
      escHtml(n) + ' <span class="post-trip">' + hashTrip(n) + '</span>'
    ).join(', ') + '</div>';
  }

  el.innerHTML = html;
}

function randomTimeAgo() {
  const units = ['minutes', 'hours', 'days'];
  const n = Math.floor(Math.random() * 23) + 1;
  const u = units[Math.floor(Math.random() * units.length)];
  return n + ' ' + u + ' ago';
}

// -- VOTING ---------------------------------------------------------------
async function castVote(ballotId, candyId) {
  const me = voterName();
  if (me === 'Anonymous') { flash('Enter your name first, lurker.', 'error'); return; }

  const { error } = await db.from('votes').upsert(
    { ballot_id: ballotId, candy_id: candyId, voter_name: me, device_id: deviceId },
    { onConflict: 'ballot_id,device_id' }
  );

  if (error) { flash('Vote failed: ' + escHtml(error.message), 'error'); return; }
  loadBallot();
}

async function markWinner(ballotId, candyId) {
  const { error } = await db.from('ballots')
    .update({ closed: true, winner_id: candyId })
    .eq('id', ballotId);

  if (error) { flash('Failed to crown winner', 'error'); return; }

  await db.from('stockings').insert({
    candy_id: candyId,
    stocked_on: new Date().toISOString().split('T')[0]
  });

  flash('Winner declared! Into the machine it goes!', 'success');
  showWinnerModal(candyId);
  loadBallot();
}

async function closeBallot(ballotId) {
  const { data: votes } = await db.from('votes').select('candy_id').eq('ballot_id', ballotId);

  if (votes && votes.length > 0) {
    const counts = {};
    votes.forEach(v => { counts[v.candy_id] = (counts[v.candy_id] || 0) + 1; });
    const maxVotes = Math.max(...Object.values(counts));
    const tied = Object.keys(counts).filter(id => counts[id] === maxVotes);

    if (tied.length > 1) {
      await db.from('ballots').update({ closed: true }).eq('id', ballotId);

      const { data: newBallot, error } = await db.from('ballots')
        .insert({ week_of: thisFriday(), closed: false, title: 'SUGAR RUSH SUDDEN DEATH OVERTIME' })
        .select().single();

      if (error) { flash('Failed to create tiebreaker!', 'error'); return; }

      await db.from('ballot_options').insert(
        tied.map(id => ({ ballot_id: newBallot.id, candy_id: id }))
      );

      flash('TIE DETECTED! SUDDEN DEATH OVERTIME INITIATED!', 'error');
      loadBallot();
      return;
    }
  }

  const { error } = await db.from('ballots').update({ closed: true }).eq('id', ballotId);
  if (error) { flash('Failed to close ballot', 'error'); return; }
  loadBallot();
}

async function generateBallot() {
  const { data: candies } = await db.from('candies').select('*').eq('is_active', true);
  if (!candies || candies.length === 0) {
    flash('No candy in the stash yet. Add some first, you absolute walnut.', 'error');
    return;
  }

  const { data: stockings } = await db.from('stockings').select('candy_id, stocked_on');
  const lastStocked = {};
  (stockings || []).forEach(s => {
    if (!lastStocked[s.candy_id] || s.stocked_on > lastStocked[s.candy_id]) {
      lastStocked[s.candy_id] = s.stocked_on;
    }
  });

  const now = new Date();
  const scored = candies.map(c => {
    const ls = lastStocked[c.id];
    const days = ls ? Math.floor((now - new Date(ls)) / 86400000) : 365;
    return { c, score: Math.min(days + 1, 365) };
  });

  const count = Math.min(Math.max(Math.ceil(scored.length / 3), 4), scored.length);
  const selected = weightedPick(scored, count);

  const { data: ballot, error } = await db
    .from('ballots')
    .insert({ week_of: thisFriday(), closed: false })
    .select().single();

  if (error) { flash('Failed to create ballot: ' + escHtml(error.message), 'error'); return; }

  await db.from('ballot_options').insert(
    selected.map(c => ({ ballot_id: ballot.id, candy_id: c.id }))
  );

  flash('New ballot generated! Let the shitposting begin.', 'success');
  loadBallot();
}

function weightedPick(scored, count) {
  const pool = [...scored];
  const picked = [];
  for (let i = 0; i < count; i++) {
    if (!pool.length) break;
    const total = pool.reduce((s, x) => s + x.score, 0);
    let rand = Math.random() * total;
    for (let j = 0; j < pool.length; j++) {
      rand -= pool[j].score;
      if (rand <= 0) { picked.push(pool[j].c); pool.splice(j, 1); break; }
    }
  }
  return picked;
}

function thisFriday() {
  const d = new Date();
  const day = d.getDay();
  const diff = day <= 5 ? 5 - day : 12 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

// -- CANDY POOL -----------------------------------------------------------
async function loadPool() {
  const el = document.getElementById('pool-list');
  el.innerHTML = '<div class="spinner">Loading...</div>';

  const { data: candies } = await db.from('candies').select('*').eq('is_active', true).order('name');
  const { data: stockings } = await db.from('stockings').select('candy_id, stocked_on');

  const lastStocked = {};
  (stockings || []).forEach(s => {
    if (!lastStocked[s.candy_id] || s.stocked_on > lastStocked[s.candy_id]) {
      lastStocked[s.candy_id] = s.stocked_on;
    }
  });

  if (!candies || candies.length === 0) {
    el.innerHTML = '<div class="card"><div class="empty-state"><p>No candy yet. Someone add something. Anyone. Please.</p></div></div>';
    return;
  }

  el.innerHTML = '<div class="section-header"><h2>Candy Pool (' + candies.length + ')</h2></div>' +
    candies.map(c => {
      const postNo = nextPostNo();
      return '<div class="card pool-card">' +
        '<div>' +
          '<div class="post-header">' +
            '<span class="post-name">' + escHtml(c.name) + '</span>' +
            ' <span class="post-no">No.<a>' + postNo + '</a></span>' +
            ' <button class="flag-btn" onclick="flagCandy(\'' + escHtml(c.name).replace(/'/g, "\\'") + '\')">[flag]</button>' +
          '</div>' +
          (c.notes ? '<div class="greentext">' + escHtml(c.notes) + '</div>' : '') +
          '<div class="r-meta">Submitted by ' + escHtml(c.submitted_by || 'Anonymous') +
            ' <span class="post-trip">' + hashTrip(c.submitted_by || '') + '</span></div>' +
          '<div class="r-meta">' + (lastStocked[c.id]
            ? 'Last stocked: ' + fmtDate(lastStocked[c.id])
            : 'Never stocked') + '</div>' +
        '</div>' +
        (isJanitor() ? '<div style="display:flex;flex-direction:column;gap:0.3rem;align-items:flex-end;">' +
          (lastStocked[c.id]
            ? '<button class="btn sm" onclick="clearStockings(\'' + c.id + '\')">Clear History</button>'
            : '<button class="btn sm" onclick="markStocked(\'' + c.id + '\')">Mark Stocked</button>') +
          '<button class="btn danger sm" onclick="removeCandy(\'' + c.id + '\')">Remove</button>' +
        '</div>' : '') +
      '</div>';
    }).join('');
}

document.getElementById('add-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('new-name').value.trim();
  const notes = document.getElementById('new-notes').value.trim();
  if (!name) return;

  const { error } = await db.from('candies').insert({
    name: name,
    notes: notes || null,
    submitted_by: voterName()
  });

  if (error) { flash('Failed to add candy: ' + escHtml(error.message), 'error'); return; }
  document.getElementById('new-name').value = '';
  document.getElementById('new-notes').value = '';
  flash(escHtml(name) + ' added to the stash.', 'success');
  loadPool();
});

async function removeCandy(id) {
  if (!confirm('Remove this candy from the pool?')) return;
  await db.from('candies').update({ is_active: false }).eq('id', id);
  flash('Candy yeeted from the pool.', 'success');
  loadPool();
}

async function markStocked(id) {
  await db.from('stockings').insert({
    candy_id: id,
    stocked_on: new Date().toISOString().split('T')[0]
  });
  flash('Marked as stocked.', 'success');
  loadPool();
}

async function clearStockings(id) {
  if (!confirm('Clear stocking history for this candy?')) return;
  await db.from('stockings').delete().eq('candy_id', id);
  flash('History cleared.', 'success');
  loadPool();
}

// -- HISTORY --------------------------------------------------------------
async function loadHistory() {
  const el = document.getElementById('history-list');
  el.innerHTML = '<div class="spinner">Loading...</div>';

  const { data: stockings } = await db
    .from('stockings')
    .select('*, candies(name)')
    .order('stocked_on', { ascending: false })
    .limit(50);

  if (!stockings || stockings.length === 0) {
    el.innerHTML = '<div class="card"><div class="empty-state"><p>No stocking history yet. The machine hungers.</p></div></div>';
    return;
  }

  el.innerHTML = stockings.map(s => {
    const postNo = nextPostNo();
    return '<div class="card history-card">' +
      '<div>' +
        '<div class="post-header">' +
          '<span class="post-name">' + escHtml(s.candies.name) + '</span>' +
          ' <span class="post-no">No.<a>' + postNo + '</a></span>' +
        '</div>' +
      '</div>' +
      '<div class="history-date">' + fmtDate(s.stocked_on) + '</div>' +
    '</div>';
  }).join('');
}

// -- TOP 8 (sidebar) ------------------------------------------------------
async function updateTop8() {
  const el = document.getElementById('top8-list');
  if (!el) return;
  const { data: stockings } = await db.from('stockings').select('candy_id, candies(name)');
  if (!stockings || stockings.length === 0) {
    el.innerHTML = '<div style="color:#666;padding:4px 0;">No data yet</div>';
    return;
  }
  const counts = {};
  const names = {};
  stockings.forEach(s => {
    counts[s.candy_id] = (counts[s.candy_id] || 0) + 1;
    names[s.candy_id] = s.candies.name;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  el.innerHTML = sorted.map((entry, i) =>
    '<div class="top8-item">' +
      '<span class="top8-rank">' + (i + 1) + '.</span>' +
      '<span class="top8-name">' + escHtml(names[entry[0]]) + '</span>' +
      '<span style="color:#888;">' + entry[1] + 'x</span>' +
    '</div>'
  ).join('');
}

// -- UTILITY --------------------------------------------------------------
function fmtDate(str) {
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// -- FLAG (craigslist) ----------------------------------------------------
function flagCandy(name) {
  const reasons = ['prohibited', 'spam', 'miscategorized', 'best of', 'overpriced (it\'s free)', 'causes diabetes'];
  const reason = reasons[Math.floor(Math.random() * reasons.length)];
  alert('Thank you for flagging "' + name + '" as [' + reason + '].\n\nYour flag has been forwarded to nobody.\n\nThis action has no effect whatsoever.');
}
