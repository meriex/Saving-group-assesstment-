// Savings Group simulation app
(function(){
  const MAX_MEMBERS = 12;
  const tiers = {
    tier1: {label:'Tier 1', amount:10000, rate:0.05},
    tier2: {label:'Tier 2', amount:20000, rate:0.10},
    tier3: {label:'Tier 3', amount:30000, rate:0.20}
  };

  // State
  let members = [];

  // DOM
  const regForm = document.getElementById('regForm');
  const nameInput = document.getElementById('name');
  const tierSelect = document.getElementById('tier');
  const amountInput = document.getElementById('amount');
  const regMsg = document.getElementById('regMsg');
  const membersTableBody = document.querySelector('#membersTable tbody');
  const memberCount = document.getElementById('memberCount');
  const totalPrincipalEl = document.getElementById('totalPrincipal');
  const totalInterestEl = document.getElementById('totalInterest');
  const overallTotalEl = document.getElementById('overallTotal');
  const simulateBtn = document.getElementById('simulateWeek');
  const maxMembersEl = document.getElementById('maxMembers');

  maxMembersEl.textContent = MAX_MEMBERS;

  function formatN(value){
    return '₦' + Number(value).toLocaleString('en-NG', {maximumFractionDigits:2});
  }

  function computeWeeklyInterest(principal, rate){
    return principal * rate;
  }

  function updateTotals(){
    const totalPrincipal = members.reduce((s,m)=>s+m.principal,0);
    const totalAccum = members.reduce((s,m)=>s+m.accumulatedInterest,0);
    totalPrincipalEl.textContent = formatN(totalPrincipal);
    totalInterestEl.textContent = formatN(totalAccum);
    overallTotalEl.textContent = formatN(totalPrincipal + totalAccum);
    memberCount.textContent = members.length;

    // disable registration if full
    const joinBtn = document.getElementById('joinBtn');
    if(members.length >= MAX_MEMBERS){
      joinBtn.disabled = true;
      regMsg.textContent = 'Group is full. Wait for a slot to open.';
    } else {
      joinBtn.disabled = false;
      regMsg.textContent = '';
    }
  }

  function renderMembers(){
    membersTableBody.innerHTML = '';
    members.forEach(m=>{
      const tr = document.createElement('tr');
      const tierObj = tiers[m.tier];

      tr.innerHTML = `
        <td>${m.name}</td>
        <td>${tierObj.label} (${formatN(tierObj.amount)})</td>
        <td>${formatN(m.principal)}</td>
        <td>${formatN(computeWeeklyInterest(m.principal, tierObj.rate))}</td>
        <td>${formatN(m.accumulatedInterest)}</td>
        <td>${m.weeks}</td>
        <td>
          <button class="smallBtn withdrawBtn" data-id="${m.id}">Withdraw</button>
          <button class="smallBtn removeBtn" data-id="${m.id}">Remove</button>
          <button class="smallBtn replaceBtn" data-id="${m.id}">Replace</button>
        </td>
      `;

      // attach withdraw handler
      const withdrawBtn = tr.querySelector('.withdrawBtn');
      if(withdrawBtn) withdrawBtn.addEventListener('click', ()=>withdrawMember(m.id));

      // attach remove handler (admin remove without payout)
      const removeBtn = tr.querySelector('.removeBtn');
      if(removeBtn) removeBtn.addEventListener('click', ()=>removeMember(m.id));

      // attach replace handler
      const replaceBtn = tr.querySelector('.replaceBtn');
      if(replaceBtn) replaceBtn.addEventListener('click', ()=>showReplaceModal(m.id));

      membersTableBody.appendChild(tr);
    });
  }

  function addMember(name, tierKey, amount){
    if(members.length >= MAX_MEMBERS) return false;
    const member = {
      id: Date.now() + Math.floor(Math.random()*1000),
      name: name.trim(),
      tier: tierKey,
      principal: Number(amount),
      accumulatedInterest: 0,
      weeks: 0
    };
    members.push(member);
    saveState();
    updateUI();
    return true;
  }

  function withdrawMember(id){
    const idx = members.findIndex(m=>m.id===id);
    if(idx === -1) return;
    const m = members[idx];
    const totalReturn = m.principal + m.accumulatedInterest;
    if(!confirm(`${m.name} will withdraw ${formatN(totalReturn)} and leave the group. Continue?`)) return;
    members.splice(idx,1);
    saveState();
    updateUI();
    alert(`${m.name} withdrew ${formatN(totalReturn)} and their slot is now open.`);
  }

  // Admin remove (no payout) — immediate removal
  function removeMember(id){
    const idx = members.findIndex(m=>m.id===id);
    if(idx === -1) return;
    const m = members[idx];
    if(!confirm(`Remove ${m.name} from the group without payout? This will NOT return funds. Continue?`)) return;
    members.splice(idx,1);
    saveState();
    updateUI();
    alert(`${m.name} has been removed from the group.`);
  }

  // Replace modal wiring
  const replaceModal = document.getElementById('replaceModal');
  const replaceForm = document.getElementById('replaceForm');
  const replaceIdInput = document.getElementById('replaceId');
  const replaceNameInput = document.getElementById('replaceName');
  const replaceTierSelect = document.getElementById('replaceTier');
  const replaceAmountInput = document.getElementById('replaceAmount');
  const cancelReplaceBtn = document.getElementById('cancelReplace');

  function showReplaceModal(id){
    const idx = members.findIndex(m=>m.id===id);
    if(idx === -1) return;
    const m = members[idx];
    replaceIdInput.value = id;
    replaceNameInput.value = '';
    // preselect the same tier as the member being replaced
    replaceTierSelect.value = m.tier || '';
    replaceAmountInput.value = m.principal || '';
    replaceModal.classList.remove('hidden');
    replaceModal.setAttribute('aria-hidden', 'false');
    replaceNameInput.focus();
  }

  function hideReplaceModal(){
    replaceModal.classList.add('hidden');
    replaceModal.setAttribute('aria-hidden', 'true');
    replaceForm.reset();
  }

  replaceTierSelect.addEventListener('change', ()=>{
    const tier = replaceTierSelect.value;
    if(tier && tiers[tier]){
      replaceAmountInput.value = tiers[tier].amount;
    } else {
      replaceAmountInput.value = '';
    }
  });

  cancelReplaceBtn.addEventListener('click', ()=>{ hideReplaceModal(); });

  replaceForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const id = Number(replaceIdInput.value);
    const name = replaceNameInput.value.trim();
    const tierKey = replaceTierSelect.value;
    const amount = Number(replaceAmountInput.value);

    if(!name){ alert('Enter a name.'); return; }
    if(!tierKey){ alert('Select a tier.'); return; }
    if(Number.isNaN(amount) || amount <= 0){ alert('Enter a valid amount.'); return; }
    if(!validateTierAmount(tierKey, amount)){
      alert('Amount must match the selected tier amount.');
      return;
    }

    const idx = members.findIndex(m=>m.id===id);
    if(idx === -1){ alert('Member to replace not found.'); hideReplaceModal(); return; }

    // create new member and replace at same index
    const newMember = {
      id: Date.now() + Math.floor(Math.random()*1000),
      name: name,
      tier: tierKey,
      principal: Number(amount),
      accumulatedInterest: 0,
      weeks: 0
    };

    members[idx] = newMember;
    saveState();
    updateUI();
    hideReplaceModal();
    alert(`${name} has replaced the previous member in that slot.`);
  });

  function simulateWeek(){
    if(members.length===0){ alert('No members to simulate.'); return; }
    members.forEach(m=>{
      const tier = tiers[m.tier];
      const weekly = computeWeeklyInterest(m.principal, tier.rate);
      m.accumulatedInterest += weekly;
      m.weeks += 1;
    });
    saveState();
    updateUI();
    alert('A week has been simulated: weekly interest added to each member.');
  }

  function validateTierAmount(tierKey, amount){
    if(!tierKey) return false;
    const req = tiers[tierKey].amount;
    return Number(amount) === Number(req);
  }

  function updateUI(){
    renderMembers();
    updateTotals();
  }

  // persistence (localStorage)
  function saveState(){
    try{ localStorage.setItem('savings_members', JSON.stringify(members)); }catch(e){}
  }
  function loadState(){
    try{
      const raw = localStorage.getItem('savings_members');
      if(raw) members = JSON.parse(raw);
    }catch(e){ members = []; }
  }

  // UI wiring
  tierSelect.addEventListener('change', ()=>{
    const tier = tierSelect.value;
    if(tier && tiers[tier]){
      amountInput.value = tiers[tier].amount;
    } else {
      amountInput.value = '';
    }
  });

  document.getElementById('clearBtn').addEventListener('click', ()=>{
    regForm.reset();
    amountInput.value = '';
    regMsg.textContent = '';
  });

  regForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = nameInput.value.trim();
    const tierKey = tierSelect.value;
    const amount = Number(amountInput.value);

    if(!name){ regMsg.textContent = 'Please enter a name.'; return; }
    if(!tierKey){ regMsg.textContent = 'Please select a tier.'; return; }
    if(Number.isNaN(amount) || amount <= 0){ regMsg.textContent = 'Enter a valid amount.'; return; }
    if(!validateTierAmount(tierKey, amount)){
      regMsg.textContent = `Amount does not match the required amount for ${tiers[tierKey].label}.`;
      return;
    }

    const ok = addMember(name, tierKey, amount);
    if(!ok){ regMsg.textContent = 'Group is full.'; return; }
    regMsg.style.color = 'green';
    regMsg.textContent = `${name} joined successfully.`;
    regForm.reset();
    amountInput.value = '';
    setTimeout(()=>{ regMsg.textContent = ''; regMsg.style.color = ''; }, 2200);
  });

  simulateBtn.addEventListener('click', simulateWeek);

  // init
  loadState();
  updateUI();

  // expose for debugging (not necessary but helpful in dev)
  window.SavingsApp = {members, addMember, simulateWeek, withdrawMember};
})();
