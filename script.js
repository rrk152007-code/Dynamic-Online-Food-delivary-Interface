// ── ZEST — Food Delivered Fast | JavaScript ──

// ── AUTH ──
let currentUser = null;

function openAuth(view) {
  document.getElementById('authOverlay').classList.add('open');
  switchAuth(view, document.querySelector(view==='login'?'.auth-tab:first-child':'.auth-tab:last-child'));
}
function closeAuth() { document.getElementById('authOverlay').classList.remove('open'); }

function switchAuth(view, btn) {
  document.querySelectorAll('.auth-tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.auth-view').forEach(v=>v.classList.remove('active'));
  document.getElementById(view+'View').classList.add('active');
}

function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value;
  let ok = true;
  if (!email || email.length<5) { showErr('loginEmailErr'); ok=false; } else hideErr('loginEmailErr');
  if (!pass || pass.length<6) { showErr('loginPassErr'); ok=false; } else hideErr('loginPassErr');
  if (!ok) return;
  const name = email.split('@')[0].replace(/[^a-zA-Z]/g,' ').trim() || 'Friend';
  loginUser(name);
}

function doSignup() {
  const first = document.getElementById('signupFirst').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const phone = document.getElementById('signupPhone').value.trim();
  const pass = document.getElementById('signupPass').value;
  let ok = true;
  if (!email.includes('@')) { showErr('signupEmailErr'); ok=false; } else hideErr('signupEmailErr');
  if (!phone || phone.replace(/\D/g,'').length<10) { showErr('signupPhoneErr'); ok=false; } else hideErr('signupPhoneErr');
  if (!pass || pass.length<8) { showErr('signupPassErr'); ok=false; } else hideErr('signupPassErr');
  if (!ok) return;
  loginUser(first || 'Friend');
}

function socialLogin(provider) {
  loginUser(provider+' User');
}

function loginUser(name) {
  currentUser = name;
  closeAuth();
  document.getElementById('navGuest').style.display = 'none';
  const badge = document.getElementById('navUserBadge');
  badge.style.display = 'flex';
  document.getElementById('navUserName').textContent = name;
  document.getElementById('navAvatarIcon').textContent = name.charAt(0).toUpperCase()+'️';
  document.getElementById('greetName').textContent = name;
  const toast = document.getElementById('namaskarToast');
  toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'), 4000);
  document.getElementById('deliveryAddr').textContent = 'Banjara Hills, Hyderabad — 500034';
}

function doLogout() {
  currentUser = null;
  document.getElementById('navGuest').style.display = 'flex';
  document.getElementById('navUserBadge').style.display = 'none';
}

function showErr(id) { document.getElementById(id).classList.add('show'); }
function hideErr(id) { document.getElementById(id).classList.remove('show'); }

// ── CART ──
let cart=[], cartOpen=false, selectedPayMethod='upi', upiVerified=false;

function addToCart(emoji, name, price) {
  const ex = cart.find(i=>i.name===name);
  if (ex) ex.qty++; else cart.push({emoji, name, price, qty:1});
  updateCart();
  if (!cartOpen) toggleCart();
}

function removeFromCart(name) {
  const it = cart.find(i=>i.name===name);
  if (it) { it.qty--; if (it.qty<=0) cart=cart.filter(i=>i.name!==name); }
  updateCart();
}

function getSubtotal() { return cart.reduce((a,i)=>a+i.price*i.qty, 0); }
function getTotal() { return getSubtotal()+5; }

function updateCart() {
  const count = cart.reduce((a,i)=>a+i.qty, 0);
  document.getElementById('cartCount').textContent = count;
  const el = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
  if (!cart.length) {
    el.innerHTML = `<div class="cart-empty"><span class="empty-icon">🍽️</span><p>Your cart is empty.<br>Add something delicious!</p></div>`;
    footer.style.display = 'none';
  } else {
    footer.style.display = 'block';
    el.innerHTML = cart.map(i=>`
      <div class="cart-item">
        <div class="cart-item-emoji">${i.emoji}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${i.name}</div>
          <div class="cart-item-price">₹${i.price*i.qty}</div>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="removeFromCart('${i.name.replace(/'/g,"\\'")}')">−</button>
          <span>${i.qty}</span>
          <button class="qty-btn" onclick="addToCart('${i.emoji}','${i.name.replace(/'/g,"\\'")}',${i.price})">+</button>
        </div>
      </div>`).join('');
    const sub = getSubtotal();
    document.getElementById('cartSummaryBox').innerHTML =
      `${cart.map(i=>`<div class="summary-row"><span>${i.emoji} ${i.name} ×${i.qty}</span><span>₹${i.price*i.qty}</span></div>`).join('')}
       <div class="summary-row"><span>Delivery</span><span style="color:var(--accent3)">FREE</span></div>
       <div class="summary-row"><span>Platform fee</span><span>₹5</span></div>
       <div class="summary-row total"><span>Total</span><span>₹${sub+5}</span></div>`;
  }
}

function toggleCart() {
  cartOpen = !cartOpen;
  document.getElementById('cartDrawer').classList.toggle('open', cartOpen);
  document.getElementById('cartOverlay').classList.toggle('open', cartOpen);
}

// ── PAYMENT ──
function openPayment() {
  if (!cart.length) return;
  if (cartOpen) toggleCart();
  const total = getTotal();
  document.getElementById('modalTotal').textContent = '₹'+total;
  document.getElementById('modalSummaryRows').innerHTML = cart.map(i=>`<div class="summary-row"><span>${i.emoji} ${i.name} ×${i.qty}</span><span>₹${i.price*i.qty}</span></div>`).join('');
  document.getElementById('payFormView').style.display = 'block';
  document.getElementById('paySuccessView').style.display = 'none';
  document.getElementById('paymentModal').classList.add('open');
}

function closePayment() { document.getElementById('paymentModal').classList.remove('open'); }

function selectPay(method, el) {
  selectedPayMethod = method;
  document.querySelectorAll('.pay-method').forEach(m=>m.classList.remove('selected'));
  el.classList.add('selected');
  document.querySelectorAll('.pay-form').forEach(f=>f.classList.remove('visible'));
  document.getElementById({upi:'formUpi', card:'formCard', wallet:'formWallet', cod:'formCod'}[method]).classList.add('visible');
}

// UPI
function selectUpiApp(el, upiHint) {
  document.querySelectorAll('.upi-app-btn').forEach(u=>u.classList.remove('selected'));
  el.classList.add('selected');
  if (upiHint) { document.getElementById('upiId').value = upiHint; }
  upiVerified = false;
  document.getElementById('upiStatus').className = 'upi-status';
}

function verifyUPI() {
  const upi = document.getElementById('upiId').value.trim();
  const statusEl = document.getElementById('upiStatus');
  const btn = document.getElementById('upiCheckBtn');
  if (!upi || !upi.includes('@')) {
    statusEl.textContent = '⚠️ Please enter a valid UPI ID (e.g. name@upi)';
    statusEl.className = 'upi-status fail';
    return;
  }
  btn.textContent = 'Verifying...';
  btn.disabled = true;
  setTimeout(()=>{
    btn.textContent = 'Verify';
    btn.disabled = false;
    if (upi.includes('@') && upi.length>4) {
      statusEl.textContent = '✅ UPI ID verified — '+upi;
      statusEl.className = 'upi-status ok';
      upiVerified = true;
    } else {
      statusEl.textContent = '❌ UPI ID not found. Please check and try again.';
      statusEl.className = 'upi-status fail';
      upiVerified = false;
    }
  }, 1400);
}

// Card
function formatCard(input) {
  let v = input.value.replace(/\D/g,'').substring(0,16);
  input.value = v.replace(/(.{4})/g,'$1 ').trim();
  const first = v.charAt(0);
  document.querySelectorAll('.card-brand').forEach(b=>b.classList.remove('active'));
  if (first==='4') document.getElementById('brandVisa').classList.add('active');
  else if (first==='5') document.getElementById('brandMaster').classList.add('active');
  else if (first==='6') document.getElementById('brandRupay').classList.add('active');
  else if (first==='3') document.getElementById('brandAmex').classList.add('active');
  document.getElementById('cardTypeBadge').textContent = first==='4'?'💳':first==='5'?'💳':first==='6'?'🇮🇳':first==='3'?'🌐':'';
}

function formatExpiry(input) {
  let v = input.value.replace(/\D/g,'').substring(0,4);
  if (v.length>=2) v = v.substring(0,2)+' / '+v.substring(2);
  input.value = v;
}

function selectWallet(el) {
  document.querySelectorAll('.wallet-opt').forEach(w=>w.classList.remove('selected'));
  el.classList.add('selected');
}

function placeOrder() {
  if (selectedPayMethod==='upi') {
    const upi = document.getElementById('upiId').value.trim();
    if (!upi || !upi.includes('@')) {
      document.getElementById('upiStatus').textContent = '⚠️ Please enter and verify your UPI ID first';
      document.getElementById('upiStatus').className = 'upi-status fail';
      return;
    }
  }
  if (selectedPayMethod==='card') {
    const cn = document.getElementById('cardNum').value.replace(/\s/g,'');
    const name = document.getElementById('cardName').value.trim();
    if (cn.length<16) {
      document.getElementById('cardNum').style.borderColor='var(--accent)';
      setTimeout(()=>{ document.getElementById('cardNum').style.borderColor=''; }, 2000);
      return;
    }
    if (!name) {
      document.getElementById('cardName').style.borderColor='var(--accent)';
      setTimeout(()=>{ document.getElementById('cardName').style.borderColor=''; }, 2000);
      return;
    }
  }
  const labels = {upi:'UPI Payment', card:'Credit/Debit Card', wallet:'Digital Wallet', cod:'Cash on Delivery'};
  const etas = ['18 min','22 min','25 min','28 min'];
  document.getElementById('orderId').textContent = Math.floor(1000+Math.random()*9000);
  document.getElementById('payMethodLabel').textContent = labels[selectedPayMethod];
  document.getElementById('paidAmount').textContent = '₹'+getTotal();
  document.getElementById('etaTime').textContent = etas[Math.floor(Math.random()*etas.length)];
  document.getElementById('payFormView').style.display = 'none';
  document.getElementById('paySuccessView').style.display = 'block';
  cart = [];
  updateCart();
  if (currentUser) {
    const t = document.getElementById('namaskarToast');
    document.getElementById('greetName').textContent = currentUser+', your order is confirmed!';
    t.querySelector('span').textContent = '🎉';
    t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'), 4000);
  }
}

function changeAddress() { alert('Address change: Enter new address in the input above.'); }

// ── FOOD FILTER ──
function filterFood(cat, btn) {
  document.querySelectorAll('.filter-tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.food-card').forEach(c=>{
    (cat==='all' || c.dataset.cat===cat) ? c.classList.remove('hidden') : c.classList.add('hidden');
  });
}

function toggleLike(e, el) {
  e.stopPropagation();
  el.textContent = el.textContent==='🤍' ? '❤️' : '🤍';
}

// ── STAR RATING ──
let selectedStar = 0;

function pickStar(n) {
  selectedStar = n;
  document.querySelectorAll('.star-pick').forEach((s,i)=>s.classList.toggle('lit', i<n));
}

function submitRating() {
  if (!selectedStar) { alert('Please pick a star rating first!'); return; }
  const comment = document.getElementById('ratingComment').value.trim() || 'Great experience!';
  const starStr = '★'.repeat(selectedStar)+'☆'.repeat(5-selectedStar);
  document.getElementById('newReviewStars').textContent = starStr;
  document.getElementById('newReviewText').textContent = comment.substring(0,60)+(comment.length>60?'...':'');
  document.getElementById('newReviewSlot').style.display = 'flex';
  document.getElementById('ratingComment').value = '';
  pickStar(0);
  const prev = parseFloat(document.getElementById('avgRatingNum').textContent);
  document.getElementById('avgRatingNum').textContent = Math.min(5,((prev*54291+selectedStar)/54292)).toFixed(1);
  document.getElementById('totalRatings').textContent = 'Based on 54,292 ratings';
  alert('🎉 Thank you for your '+selectedStar+'-star review!');
}

// ── QR CODE (canvas-drawn) ──
function drawQR() {
  const canvas = document.getElementById('qrCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const s = 144;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0,0,s,s);
  const cells = 28, cs = s/cells;

  function finder(ox, oy) {
    ctx.fillStyle = '#1c1c1c';
    ctx.fillRect(ox*cs, oy*cs, 7*cs, 7*cs);
    ctx.fillStyle = '#fff';
    ctx.fillRect((ox+1)*cs, (oy+1)*cs, 5*cs, 5*cs);
    ctx.fillStyle = '#1c1c1c';
    ctx.fillRect((ox+2)*cs, (oy+2)*cs, 3*cs, 3*cs);
  }
  finder(0,0); finder(cells-7,0); finder(0,cells-7);

  ctx.fillStyle = '#1c1c1c';
  const seed = [1,0,1,1,0,1,0,1,1,0,1,0,0,1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,0,0,1,0,1,1,0,0,1,0,1,0,1,1,0,0,1,0,1,0,0,1,1,0,1,0,1,1,0,1,0,1,0,1,1,0];
  for (let r=8; r<cells-8; r++) {
    for (let c=8; c<cells-8; c++) {
      if (seed[(r*cells+c)%64]) ctx.fillRect(c*cs, r*cs, cs*0.8, cs*0.8);
    }
  }

  ctx.fillStyle = '#ff4f1a';
  ctx.beginPath(); ctx.arc(s/2, s/2, 10, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 8px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Z', s/2, s/2);

  ctx.fillStyle = '#1c1c1c';
  for (let i=8; i<cells-8; i+=2) {
    ctx.fillRect(i*cs, 6*cs, cs, cs);
    ctx.fillRect(6*cs, i*cs, cs, cs);
  }
}

// ── AI ASSISTANT ──
let aiOpen = false, micActive = false;

const aiKnowledge = {
  'biryani': '🥘 Try our legendary Hyderabadi Biryani (₹380) from Biryani House — rated 5.0 ⭐ by 12,000+ customers! Authentic dum-cooked with saffron basmati. Ready in 35 min.',
  'pizza': '🍕 Our pizza picks:\n• Margherita Special (₹299) — classic perfection\n• BBQ Chicken Pizza (₹399) — smoky & rich\n• Truffle Mushroom Pizza (₹469) — premium\n\nAll from Pizza Palace, ~20 min.',
  'burger': '🍔 Burger lovers:\n• Smash Burger Deluxe (₹349) — crispy & juicy\n• Club Sandwich XL (₹259) — loaded fresh\n• Shawarma Platter (₹309) — middle eastern\n• Crispy Chicken Tacos (₹279) — spicy!',
  'track': '🛵 Your order is live tracked! Once placed, open the map view to see your rider\'s exact GPS location updating in real time. Average delivery is 20-25 min in Hyderabad.',
  'offer': '🎁 Active offers:\n• ZEST50 — 50% off first 3 orders\n• FREEDELIVERY — Free delivery on ₹299+\n• WELCOME100 — ₹100 off first order\n\nApply at checkout before payment!',
  'veg': '🌱 Vegetarian picks:\n• Paneer Tikka Wrap (₹219) 🫓\n• Pav Bhaji Platter (₹199)\n• Margherita Special (₹299)\n• Mango Passion Smoothie (₹159)\n\nAll veg-certified 🟢',
  'dessert': '🍰 Sweet tooth?\n• Nutella Waffle Stack (₹249)\n• Chocolate Lava Cake (₹229)\n• Kulfi Falooda (₹189)\n• All from Sweet Tooth, 10-15 min away!',
  'drink': '☕ Beverages:\n• Cold Brew Coffee (₹149) — bold & smooth\n• Matcha Latte (₹179) — calming zen\n• Mango Passion Smoothie (₹159) — tropical fresh',
  'sushi': '🍣 Japanese craving?\n• Salmon Roll Platter (₹449) ⭐ 4.9\n• Dragon Roll Set (₹520) — premium\n• Ramen Tonkotsu (₹399) — soul warming',
  'payment': '💳 We accept:\n📲 UPI (GPay, PhonePe, Paytm, BHIM)\n💳 Credit/Debit Cards (Visa, Mastercard, RuPay)\n👛 Wallets (Paytm, Mobikwik, Amazon Pay)\n💵 Cash on Delivery\n\nAll transactions are 256-bit SSL encrypted.',
  'delivery': '⏱ Average delivery: 20-30 min in Hyderabad. We operate 6 AM – 2 AM. Real-time GPS tracking for all orders.',
  'login': '👤 Click "Sign In" or "Join Free" in the top navigation to create or access your account. You can also continue with Google, Facebook, or Apple.',
  'hello': '👋 Namaskar! I\'m ZEST AI, your smart food assistant. I can help with food recommendations, track orders, find deals, or answer any question. What would you like?',
  'namaskar': '🙏 Namaskar to you too! How can I help with your food order today? Ask me about our menu, offers, or track your delivery.',
};

function getAIReply(msg) {
  const m = msg.toLowerCase();
  for (const [key, val] of Object.entries(aiKnowledge)) {
    if (m.includes(key)) return val;
  }
  if (m.includes('hi') || m.includes('hey') || m.includes('hello')) return aiKnowledge['hello'];
  if (m.includes('cheap') || m.includes('budget')) return '💰 Budget picks under ₹200:\n• Pav Bhaji Platter ₹199\n• Paneer Tikka Wrap ₹219\n• Mango Smoothie ₹159\n• Cold Brew Coffee ₹149\n• Kulfi Falooda ₹189';
  if (m.includes('recommend') || m.includes('suggest')) return '⭐ My top picks today:\n1. 🥘 Hyderabadi Biryani ₹380 — 5.0★\n2. 🍣 Salmon Roll ₹449 — 4.9★\n3. 🍕 Truffle Pizza ₹469 — 4.9★\n4. 🍛 Butter Chicken ₹320 — 4.9★';
  return '🤔 I didn\'t quite catch that! You can ask me about:\n• 🍕 Pizza, 🍔 Burgers, 🥘 Biryani, 🍣 Sushi\n• 🎁 Offers & discounts\n• 🛵 Order tracking\n• 💳 Payment methods\n• 🌱 Veg options';
}

function toggleAI() {
  aiOpen = !aiOpen;
  document.getElementById('aiChat').classList.toggle('open', aiOpen);
}

function sendAI() {
  const inp = document.getElementById('aiInput');
  const msg = inp.value.trim();
  if (!msg) return;
  appendMsg(msg, 'user');
  inp.value = '';
  document.getElementById('aiTyping').classList.add('show');
  const msgs = document.getElementById('aiMessages');
  msgs.scrollTop = msgs.scrollHeight;
  setTimeout(()=>{
    document.getElementById('aiTyping').classList.remove('show');
    appendMsg(getAIReply(msg), 'bot');
  }, 900+Math.random()*600);
}

function aiQuick(msg) { document.getElementById('aiInput').value = msg; sendAI(); }

function appendMsg(txt, role) {
  const el = document.createElement('div');
  el.className = 'ai-msg '+role;
  el.textContent = txt;
  document.getElementById('aiMessages').appendChild(el);
  document.getElementById('aiMessages').scrollTop = 9999;
}

// ── MICROPHONE ──
function toggleMic() {
  const btn = document.getElementById('micBtn');
  const fb = document.getElementById('micFeedback');
  if (!micActive) {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SR();
      rec.lang = 'en-IN';
      rec.continuous = false;
      rec.interimResults = false;
      micActive = true;
      btn.classList.add('listening');
      fb.textContent = '🎙 Listening...';
      if (!aiOpen) toggleAI();
      rec.onresult = (e)=>{
        const t = e.results[0][0].transcript;
        document.getElementById('aiInput').value = t;
        fb.textContent = '✅ "'+t+'"';
        sendAI();
        setTimeout(()=>{ fb.textContent=''; }, 3000);
      };
      rec.onerror = ()=>{ fb.textContent='❌ Mic error'; setTimeout(()=>{ fb.textContent=''; }, 2000); };
      rec.onend = ()=>{ micActive=false; btn.classList.remove('listening'); };
      rec.start();
    } else {
      fb.textContent = '⚠️ Voice not supported';
      setTimeout(()=>{ fb.textContent=''; }, 2500);
    }
  } else {
    micActive = false;
    btn.classList.remove('listening');
    fb.textContent = '';
  }
}

// ── SCROLL REVEAL ──
const reveals = document.querySelectorAll('.reveal');
const obs = new IntersectionObserver(es=>{
  es.forEach(e=>{
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      obs.unobserve(e.target);
    }
  });
}, { threshold: .1 });
reveals.forEach(el=>obs.observe(el));

document.querySelectorAll('.cats-grid,.food-grid,.steps-grid,.rest-grid,.reviews-grid').forEach(grid=>{
  grid.querySelectorAll('.reveal').forEach((el,i)=>{ el.style.transitionDelay=(i*.07)+'s'; });
});

// ── INIT ──
window.addEventListener('load', ()=>{
  drawQR();
  document.getElementById('authOverlay').addEventListener('click', function(e) {
    if (e.target===this) closeAuth();
  });
});