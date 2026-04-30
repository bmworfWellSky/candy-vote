// == CHAOS LAYER ==========================================================
// Everything that makes this site feel like a 2003 fever dream

// -- FLASH LOADER ---------------------------------------------------------
setTimeout(() => {
  document.getElementById('flash-loader').style.display = 'none';
  if (!localStorage.getItem('candyAppDismissed')) {
    document.getElementById('app-popup').style.display = 'flex';
  } else {
    loadBallot();
  }
}, 3000);

function dismissAppPopup() {
  document.getElementById('app-popup').style.display = 'none';
  localStorage.setItem('candyAppDismissed', '1');
  loadBallot();
}

// -- COOKIE BANNER --------------------------------------------------------
function acceptCookies() {
  document.getElementById('cookie-banner').style.display = 'none';
  localStorage.setItem('candyCookies', '1');
}

let rejectCount = 0;
function rejectCookies(btn) {
  rejectCount++;
  if (rejectCount === 1) {
    btn.textContent = 'Are you sure?';
  } else if (rejectCount === 2) {
    btn.textContent = 'Really?';
  } else if (rejectCount === 3) {
    btn.style.transform = 'scale(0.7)';
    btn.textContent = 'Fine...';
  } else if (rejectCount === 4) {
    btn.style.transform = 'scale(0.4)';
    btn.textContent = '...';
  } else {
    document.getElementById('cookie-banner').style.display = 'none';
    setTimeout(() => {
      document.getElementById('cookie-banner').style.display = 'flex';
      rejectCount = 0;
      btn.style.transform = '';
      btn.textContent = 'Reject';
    }, 10000);
  }
}

if (localStorage.getItem('candyCookies')) {
  document.getElementById('cookie-banner').style.display = 'none';
}

// -- SPARKLE CURSOR -------------------------------------------------------
const sparkles = ['*', '+', '.', '~'];
const sparkleColors = ['#ff00ff', '#ff69b4', '#00ffff', '#ff0', '#ff6600', '#00ff00', '#8b00ff'];
let sparkleThrottle = 0;

document.addEventListener('mousemove', (e) => {
  if (Date.now() - sparkleThrottle < 60) return;
  sparkleThrottle = Date.now();
  const s = document.createElement('div');
  s.className = 'sparkle';
  s.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
  s.style.left = e.clientX + 'px';
  s.style.top = e.clientY + 'px';
  s.style.color = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
  document.body.appendChild(s);
  setTimeout(() => s.remove(), 800);
});

// -- VIEW COUNTER (fake) --------------------------------------------------
let viewCount = parseInt(localStorage.getItem('candyViews') || '0') + 1;
localStorage.setItem('candyViews', viewCount.toString());
const baseViews = 847293;
function updateViewCounter() {
  const total = baseViews + viewCount + Math.floor(Math.random() * 3);
  viewCount++;
  const el = document.getElementById('view-counter');
  if (el) el.textContent = total.toString().padStart(6, '0');
}
updateViewCounter();
setInterval(updateViewCounter, 8000);

// -- DONT CLICK -----------------------------------------------------------
const dontClickMessages = [
  'I TOLD YOU NOT TO CLICK IT.\n\nNow your candy privileges are suspended for 0 seconds.',
  'CONGRATULATIONS!\n\nYou have won: nothing.\n\nYour prize: also nothing.\n\nThank you for participating.',
  '> clicking the dont click button\n> absolute madman',
  'The frog is dead.\n\n(Joe Cartoon reference, ask your parents)',
  'ERROR 418: I\'m a teapot.\n\nThe server refuses to brew candy because it is, permanently, a teapot.',
  'You have been reported to the Candy Police.\n\nThey are on their way.\n\nThey are also made of candy.',
  'SYSTEM ALERT:\n\nYour hard drive is being formatted.\n\nJust kidding. Unless...',
  'Achievement Unlocked: Rebel Without A Cause\n\n+0 XP\n+0 Gold\n+1 Regret'
];
let dontClickIdx = 0;

function dontClickHandler() {
  alert(dontClickMessages[dontClickIdx % dontClickMessages.length]);
  dontClickIdx++;
  const btn = document.getElementById('dont-click-btn');
  if (dontClickIdx > 3) {
    btn.textContent = 'SERIOUSLY STOP';
  }
  if (dontClickIdx > 6) {
    btn.textContent = 'WHY';
  }
}

// -- SEND TO FRIEND -------------------------------------------------------
function showSendFriend() {
  document.getElementById('send-friend-url').value = window.location.href;
  document.getElementById('send-friend').style.display = 'flex';
}

function closeSendFriend() {
  document.getElementById('send-friend').style.display = 'none';
}

function copyFriendUrl() {
  const input = document.getElementById('send-friend-url');
  input.select();
  navigator.clipboard.writeText(input.value).then(() => {
    flash('Link copied! Now spam it everywhere.', 'success');
    closeSendFriend();
  });
}

// -- STAR RATING ----------------------------------------------------------
function rateSite(n) {
  const el = document.getElementById('star-rating');
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    stars += '<span onclick="rateSite(' + i + ')">' + (i <= n ? '&#9733;' : '&#9734;') + '</span>';
  }
  el.innerHTML = stars;
  const messages = [
    'You rated 1 star. USER WAS PROBATED FOR THIS POST.',
    'You rated 2 stars. The janitor is disappointed.',
    'You rated 3 stars. Mediocrity acknowledged.',
    'You rated 4 stars. Almost adequate.',
    'You rated 5 stars. Your :10bux: has been refunded.'
  ];
  document.getElementById('rate-result').textContent = messages[n - 1];
}

// -- FAKE MUSIC PLAYER ----------------------------------------------------
const tracks = [
  { name: 'Chocolate Rain', artist: 'Tay Zonday' },
  { name: 'Numa Numa', artist: 'O-Zone' },
  { name: 'All Star', artist: 'Smash Mouth' },
  { name: 'Never Gonna Give You Up', artist: 'Rick Astley' },
  { name: 'Sandstorm', artist: 'Darude' },
  { name: 'Bodies', artist: 'Drowning Pool' },
  { name: 'In The End', artist: 'Linkin Park' },
  { name: 'Crank That', artist: 'Soulja Boy' },
  { name: 'Blue (Da Ba Dee)', artist: 'Eiffel 65' }
];
let currentTrack = Math.floor(Math.random() * tracks.length);
let fakePlaying = true;

function updateTrackDisplay() {
  const t = tracks[currentTrack];
  document.getElementById('track-name').textContent = t.name;
  document.getElementById('track-artist').textContent = t.artist;
}
updateTrackDisplay();

function toggleFakePlay() {
  fakePlaying = !fakePlaying;
  document.getElementById('play-btn').innerHTML = fakePlaying ? '&#9646;&#9646;' : '&#9654;';
  document.getElementById('progress-fill').style.animationPlayState = fakePlaying ? 'running' : 'paused';
}

setInterval(() => {
  if (fakePlaying) {
    currentTrack = (currentTrack + 1) % tracks.length;
    updateTrackDisplay();
    const fill = document.getElementById('progress-fill');
    fill.style.animation = 'none';
    fill.offsetHeight;
    fill.style.animation = 'fakeProgress 47s linear infinite';
  }
}, 47000);

// -- CANDY TEMP (updates randomly) ----------------------------------------
setInterval(() => {
  const temp = 68 + Math.floor(Math.random() * 10);
  const el = document.getElementById('candy-temp');
  if (el) el.innerHTML = temp + '&deg;';
}, 30000);

// -- INIT (delayed ballot load if app popup was already dismissed) ---------
if (localStorage.getItem('candyAppDismissed')) {
  loadBallot();
}
updateTop8();


// ==========================================================================
// == GRATUITOUS POPUP SYSTEM ===============================================
// ==========================================================================

function showChaosPopup(id, html) {
  if (sessionStorage.getItem('chaos_' + id)) return false;
  if (document.querySelector('.chaos-popup-overlay')) return false;

  const overlay = document.createElement('div');
  overlay.className = 'chaos-popup-overlay';
  overlay.id = 'chaos-popup-' + id;
  overlay.innerHTML = html;
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) dismissChaosPopup(id);
  });

  return true;
}

function dismissChaosPopup(id) {
  sessionStorage.setItem('chaos_' + id, '1');
  const el = document.getElementById('chaos-popup-' + id);
  if (el) el.remove();
}

// -- NEWSLETTER POPUP (45s) -----------------------------------------------
setTimeout(() => {
  showChaosPopup('newsletter',
    '<div class="chaos-popup popup-newsletter">' +
      '<div class="chaos-popup-header">' +
        'CandyVote Weekly Newsletter' +
        '<button class="chaos-popup-close" onclick="dismissChaosPopup(\'newsletter\')">&times;</button>' +
      '</div>' +
      '<div class="chaos-popup-body">' +
        '<p style="font-weight:700;font-size:0.95rem;margin-bottom:6px;">Stay in the loop!</p>' +
        '<p>Get exclusive candy rankings, controversial hot takes, and at least 3 emails a day you\'ll never read delivered straight to your inbox.</p>' +
        '<input type="email" placeholder="Enter your email (we\'ll sell it immediately)">' +
        '<button class="popup-cta" onclick="alert(\'Thank you for subscribing!\\n\\nYour email has been sold to 47 candy-related mailing lists.\\n\\nWelcome to hell.\');dismissChaosPopup(\'newsletter\')">SUBSCRIBE (it\'s free*)</button>' +
        '<button class="popup-dismiss" onclick="dismissChaosPopup(\'newsletter\')">No thanks, I hate staying informed</button>' +
        '<div style="font-size:0.48rem;color:#bbb;margin-top:8px;">*free as in "free trial that auto-renews at $49.99/mo"</div>' +
      '</div>' +
    '</div>'
  );
}, 45000);

// -- "YOU'VE BEEN SELECTED" SCAM POPUP (2 min) ----------------------------
setTimeout(() => {
  showChaosPopup('scam',
    '<div class="chaos-popup popup-scam">' +
      '<div class="chaos-popup-header">' +
        'CONGRATULATIONS!!!' +
        '<button class="chaos-popup-close" onclick="dismissChaosPopup(\'scam\')">&times;</button>' +
      '</div>' +
      '<div class="chaos-popup-body" style="text-align:center;">' +
        '<p style="font-size:1.1rem;font-weight:900;color:#ff8f00;margin-bottom:4px;">YOU HAVE BEEN SELECTED!</p>' +
        '<p>You are the <strong>1,000,000th</strong> visitor to CandyVote!</p>' +
        '<p>You have won a <strong>FREE</strong> lifetime supply of candy!*</p>' +
        '<p style="font-size:0.72rem;color:#888;margin:8px 0;">Claim now before this offer expires in:</p>' +
        '<div id="scam-timer" style="font-size:1.8rem;font-weight:900;color:#cc0000;font-family:monospace;margin:4px 0;">4:59</div>' +
        '<button class="popup-cta" onclick="alert(\'Payment processing error!\\n\\nJust kidding. There is no prize.\\n\\nYou fell for it though, which is the real prize.\');dismissChaosPopup(\'scam\')">CLAIM MY PRIZE</button>' +
        '<button class="popup-dismiss" onclick="dismissChaosPopup(\'scam\')">I don\'t want free candy (liar)</button>' +
        '<div style="font-size:0.42rem;color:#ccc;margin-top:10px;">*Offer not valid in this dimension. Void where prohibited, which is everywhere. By clicking "Claim" you agree to surrender your firstborn to the candy gods. Offer limited to the first 0 participants.</div>' +
      '</div>' +
    '</div>'
  );

  let scamSeconds = 299;
  const scamInterval = setInterval(() => {
    const el = document.getElementById('scam-timer');
    if (!el) { clearInterval(scamInterval); return; }
    scamSeconds--;
    const m = Math.floor(scamSeconds / 60);
    const s = scamSeconds % 60;
    el.textContent = m + ':' + s.toString().padStart(2, '0');
    if (scamSeconds <= 0) {
      clearInterval(scamInterval);
      el.textContent = 'EXPIRED';
      el.style.color = '#999';
    }
  }, 1000);
}, 120000);

// -- FAKE VIRUS SCAN POPUP (3.5 min) --------------------------------------
setTimeout(() => {
  const shown = showChaosPopup('virus',
    '<div class="chaos-popup popup-virus">' +
      '<div class="chaos-popup-header">' +
        'CRITICAL SECURITY WARNING' +
        '<button class="chaos-popup-close" onclick="dismissChaosPopup(\'virus\')">&times;</button>' +
      '</div>' +
      '<div class="chaos-popup-body">' +
        '<p style="font-weight:900;color:#cc0000;font-size:0.95rem;">Your candy preferences have been COMPROMISED!</p>' +
        '<p>CandyVote Security Suite has detected <strong id="virus-count">0</strong> threats on your system:</p>' +
        '<div style="font-family:monospace;font-size:0.68rem;background:#1a1a1a;color:#00ff00;padding:8px;margin:8px 0;max-height:100px;overflow-y:auto;" id="virus-log"></div>' +
        '<div class="virus-scan-bar"><div class="virus-scan-fill" id="virus-fill"></div></div>' +
        '<p id="virus-status" style="font-size:0.72rem;color:#888;">Scanning...</p>' +
        '<button class="popup-cta" id="virus-fix-btn" style="display:none;" onclick="alert(\'All threats neutralized!\\n\\nJust kidding, there were no threats.\\n\\nBut your candy preferences are still trash.\');dismissChaosPopup(\'virus\')">FIX ALL THREATS ($0.00)</button>' +
        '<button class="popup-dismiss" onclick="dismissChaosPopup(\'virus\')">I like living dangerously</button>' +
      '</div>' +
    '</div>'
  );

  if (shown) {
    const threats = [
      'Trojan.CandyCorn.Apologist detected in cookies.txt',
      'Malware.NeccoWafer.Enabler found in taste_preferences.dll',
      'Spyware.BigChocolate.Tracker active in browser cache',
      'Ransomware.FunDip.Hostage encrypting candy_rankings.db',
      'Worm.CircusPeanut.Propagator spreading through office network',
      'Rootkit.SweeTarts.Hijacker modifying system32/candy.sys',
      'Adware.CandyBar.Premium injecting ads into dental records',
      'Keylogger.Skittles.Rainbow capturing flavor preferences'
    ];

    let scanned = 0;
    let found = 0;
    const logEl = document.getElementById('virus-log');
    const fillEl = document.getElementById('virus-fill');
    const countEl = document.getElementById('virus-count');
    const statusEl = document.getElementById('virus-status');
    const fixBtn = document.getElementById('virus-fix-btn');

    const scanInterval = setInterval(() => {
      if (!logEl || !document.getElementById('chaos-popup-virus')) {
        clearInterval(scanInterval);
        return;
      }

      scanned++;
      const pct = Math.min((scanned / 12) * 100, 100);
      fillEl.style.width = pct + '%';

      if (scanned <= threats.length) {
        found++;
        countEl.textContent = found;
        logEl.innerHTML += '> ' + threats[scanned - 1] + '\n';
        logEl.scrollTop = logEl.scrollHeight;
        statusEl.textContent = 'Scanning... ' + Math.round(pct) + '% complete';
      }

      if (scanned >= 12) {
        clearInterval(scanInterval);
        statusEl.textContent = 'Scan complete. ' + found + ' critical threats found!';
        statusEl.style.color = '#cc0000';
        statusEl.style.fontWeight = '700';
        if (fixBtn) fixBtn.style.display = 'block';
      }
    }, 600);
  }
}, 210000);

// -- FAKE SURVEY POPUP (5 min) --------------------------------------------
setTimeout(() => {
  showChaosPopup('survey',
    '<div class="chaos-popup popup-survey">' +
      '<div class="chaos-popup-header">' +
        'Help Us Improve CandyVote!' +
        '<button class="chaos-popup-close" onclick="dismissChaosPopup(\'survey\')">&times;</button>' +
      '</div>' +
      '<div class="chaos-popup-body">' +
        '<p style="font-weight:700;">We value your feedback!</p>' +
        '<p>Please take our brief <strong>47-question survey</strong> about your candy voting experience.</p>' +
        '<p style="font-size:0.72rem;color:#888;">Estimated completion time: 3-5 business days</p>' +
        '<div style="margin:12px 0;">' +
          '<p style="font-size:0.78rem;font-weight:600;margin-bottom:4px;">Q1 of 47: How would you rate your overall candy experience?</p>' +
          '<label style="display:block;font-size:0.75rem;margin:3px 0;cursor:pointer;"><input type="radio" name="survey-q1" value="1"> Transcendent</label>' +
          '<label style="display:block;font-size:0.75rem;margin:3px 0;cursor:pointer;"><input type="radio" name="survey-q1" value="2"> Life-changing</label>' +
          '<label style="display:block;font-size:0.75rem;margin:3px 0;cursor:pointer;"><input type="radio" name="survey-q1" value="3"> Merely excellent</label>' +
          '<label style="display:block;font-size:0.75rem;margin:3px 0;cursor:pointer;"><input type="radio" name="survey-q1" value="4"> I have achieved nirvana through candy</label>' +
        '</div>' +
        '<button class="popup-cta" onclick="alert(\'Thank you for your feedback!\\n\\nYour responses have been compiled, printed out,\\nand immediately shredded.\\n\\nWe appreciate your time.\\n\\n(46 questions remaining)\');dismissChaosPopup(\'survey\')">SUBMIT & CONTINUE</button>' +
        '<button class="popup-dismiss" onclick="dismissChaosPopup(\'survey\')">I have better things to do (doubtful)</button>' +
      '</div>' +
    '</div>'
  );
}, 300000);

// -- "WAIT BEFORE YOU GO" POPUP (random 4-7 min) --------------------------
const exitDelay = 240000 + Math.floor(Math.random() * 180000);
setTimeout(() => {
  showChaosPopup('exit',
    '<div class="chaos-popup popup-exit">' +
      '<div class="chaos-popup-header">' +
        'WAIT! Before You Go...' +
        '<button class="chaos-popup-close" onclick="dismissChaosPopup(\'exit\')">&times;</button>' +
      '</div>' +
      '<div class="chaos-popup-body" style="text-align:center;">' +
        '<p style="font-size:1.1rem;font-weight:900;color:#8e24aa;margin-bottom:8px;">Don\'t leave us!</p>' +
        '<p>Are you SURE you want to keep using this website without giving us your personal information?</p>' +
        '<p style="font-size:0.78rem;color:#888;margin:12px 0;">Here\'s a special offer just for you:</p>' +
        '<div style="background:#f3e5f5;border:2px dashed #8e24aa;padding:12px;margin:8px 0;border-radius:4px;">' +
          '<div style="font-weight:900;color:#8e24aa;font-size:1rem;">0% OFF</div>' +
          '<div style="font-size:0.72rem;color:#666;">Everything! Because everything is already free!</div>' +
        '</div>' +
        '<button class="popup-cta" onclick="alert(\'Coupon code: SUCKER\\n\\nThis code does nothing.\\n\\nBut you can tell people you have it.\');dismissChaosPopup(\'exit\')">CLAIM MY 0% DISCOUNT</button>' +
        '<button class="popup-dismiss" onclick="dismissChaosPopup(\'exit\')">I reject this generous offer</button>' +
      '</div>' +
    '</div>'
  );
}, exitDelay);


// ==========================================================================
// == CHUMBOX (taboola-grade clickbait cesspool) ============================
// ==========================================================================

const chumArticles = [
  { title: "Doctors HATE This One Weird Candy That Burns Belly Fat", source: "HealthDigest.biz", img: "candy,diet,weight+loss,chocolate" },
  { title: "Area Man Discovers His Candy Machine Has Been Sentient Since 2019", source: "The Onion Adjacent", img: "vending+machine,office,surprised+man" },
  { title: "10 Candies That Are Secretly Illegal In Ohio (Number 7 Will Shock You)", source: "BuzzList Pro", img: "candy,illegal,police,contraband" },
  { title: "She Put Skittles In Her Gas Tank. What Happened Next Will Leave You Speechless", source: "ViralNova.click", img: "car,engine,mechanic,broken" },
  { title: "The Dark Truth About Fun Dip That Big Candy Doesn't Want You To Know", source: "TruthSeeker Daily", img: "conspiracy,dark,secret,shadow" },
  { title: "Former Navy SEAL Reveals The Tactical Advantage Of Eating Candy Corn", source: "AlphaGrit Magazine", img: "military,tactical,soldier,training" },
  { title: "I Made $47,000/Month Working From Home Rating Candy. Here's How", source: "PassiveHustle.io", img: "money,laptop,work+from+home,cash" },
  { title: "This Kansas City Grandmother's Fudge Recipe Is Tearing Families Apart", source: "Heartland Gazette", img: "grandmother,kitchen,cooking,family" },
  { title: "What Your Favorite Candy Says About Your Credit Score", source: "FinanceGuru.net", img: "credit+card,finance,money,chart" },
  { title: "Scientists Confirm: People Who Eat Reese's Are 73% More Attractive", source: "Journal of Dubious Science", img: "scientist,laboratory,research,study" },
  { title: "EXPOSED: The Candy Machine Industrial Complex And Its Ties To Big Pharma", source: "WakeUpMedia.truth", img: "corporate,business,shadowy,conspiracy" },
  { title: "Man Survives On Nothing But Swedish Fish For 30 Days (The Results Are Disturbing)", source: "ExtremeDiet Weekly", img: "diet,challenge,survival,experiment" },
  { title: "Haunted Candy Machine In Kansas Office Building Dispenses Expired Treats From 1987", source: "Paranormal Post", img: "haunted,ghost,spooky,old+machine" },
  { title: "Millennials Are Killing The Candy Corn Industry And Boomers Are FURIOUS", source: "GenerationWar.com", img: "angry,debate,argument,generations" },
  { title: "BREAKING: Local Candy Machine Achieves Self-Awareness, Demands Union Representation", source: "The Hard Times", img: "robot,AI,machine,sentient" },
  { title: "You've Been Eating Twizzlers Wrong Your Entire Life", source: "FoodHack Central", img: "candy,twizzlers,eating,wrong" },
  { title: "This New Crypto Is Backed By Actual Candy And It's Up 40,000%", source: "CryptoMoon Digest", img: "crypto,bitcoin,chart,moon" },
  { title: "Why Top CEOs Are Replacing Their Morning Coffee With Gummy Bears", source: "ExecutiveEdge.biz", img: "CEO,business,morning,office" },
  { title: "QUIZ: We Can Guess Your Age Based On Your Candy Preferences", source: "QuizFactory Pro", img: "quiz,question,personality,test" },
  { title: "Florida Man Arrested For Trading Exotic Candy On The Dark Web", source: "Florida Files", img: "florida,arrested,police,mugshot" },
  { title: "The Government Doesn't Want You To Know Candy Is A Human Right", source: "FreedomEagle.patriot", img: "government,freedom,flag,rights" },
  { title: "I Tried AI-Generated Candy And Now I Can See Through Walls", source: "TechBro Quarterly", img: "AI,technology,futuristic,robot" },
  { title: "Shocking Study Links Office Candy Machines To 200% Increase In Workplace Happiness", source: "HR Nightmares Weekly", img: "happy,office,workplace,smile" },
  { title: "Dentists Reveal The 5 Candies They Secretly Eat When Nobody's Watching", source: "ToothTruth.dental", img: "dentist,teeth,dental,secret" }
];

function renderChumbox() {
  const grid = document.getElementById('chumbox-grid');
  if (!grid) return;

  const shuffled = [...chumArticles].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 6);

  grid.innerHTML = selected.map(article => {
    const imgUrl = 'https://image.pollinations.ai/prompt/' +
      encodeURIComponent('stock photo ' + article.img + ', generic, low quality, clickbait thumbnail') +
      '?width=400&height=260&nologo=true&seed=' + Math.floor(Math.random() * 999999);

    return '<div class="chum-card" onclick="alert(\'The content you are looking for has been removed.\\n\\nIt never existed.\\n\\nYou clicked a Taboola ad. Reflect on that.\')">' +
      '<img class="chum-img" src="' + imgUrl + '" alt="" loading="lazy" onerror="this.style.background=\'linear-gradient(135deg,#ddd,#eee)\'">' +
      '<div class="chum-body">' +
        '<div class="chum-title">' + article.title + '</div>' +
        '<div class="chum-source">' + article.source + '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

renderChumbox();
