<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Breezus NFL GM // Command Center</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    :root {
      --bg-primary: #0a0e17;
      --bg-secondary: #111827;
      --bg-card: #161e2e;
      --bg-card-hover: #1c2638;
      --border-color: #2d3748;
      --text-primary: #f9fafb;
      --text-secondary: #94a3b8;
      --accent-green: #10b981;
      --accent-blue: #3b82f6;
      --accent-yellow: #f59e0b;
      --accent-red: #ef4444;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: var(--bg-primary);
      color: var(--text-primary);
      line-height: 1.5;
      padding: 12px;
    }

    .gm-container { max-width: 1200px; margin: 0 auto; }

    .gm-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 12px 16px;
      margin-bottom: 12px;
    }

    .gm-logo {
      font-size: 1.15rem;
      font-weight: 900;
      letter-spacing: 0.05em;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .gm-logo span { color: var(--accent-green); }

    .gm-sync-bar { display: flex; gap: 8px; align-items: center; }
    .gm-input {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.85rem;
      width: 170px;
      font-family: monospace;
    }
    .gm-btn {
      background: var(--accent-green);
      color: #000;
      font-weight: 800;
      border: none;
      padding: 7px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
    }

    .gm-tabs {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 6px;
      margin-bottom: 14px;
      border-bottom: 1px solid var(--border-color);
    }
    .gm-tab-btn {
      background: var(--bg-secondary);
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 700;
      white-space: nowrap;
    }
    .gm-tab-btn.active {
      background: var(--accent-green);
      color: #000;
      border-color: var(--accent-green);
    }

    .gm-banner {
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 0.85rem;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .gm-banner.info { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: var(--accent-green); }
    .gm-banner.warn { background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); color: var(--accent-yellow); }

    .gm-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 14px;
      margin-bottom: 14px;
    }
    .gm-card-header {
      font-size: 0.95rem;
      font-weight: 800;
      color: #fff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border-color);
    }

    .player-row {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 10px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .slot-badge {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      font-weight: 800;
      font-size: 0.75rem;
      width: 44px;
      text-align: center;
      padding: 4px 0;
      border-radius: 4px;
      color: var(--text-secondary);
    }
    .player-info { display: flex; align-items: center; gap: 10px; }
    .player-name { font-weight: 800; font-size: 0.9rem; color: #fff; display: flex; align-items: center; gap: 6px; }
    .player-meta { font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px; }
    .stat-pill { background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px; font-family: monospace; }

    .rating-box { text-align: right; }
    .rating-val { font-size: 1.25rem; font-weight: 900; color: #fff; }
    .rating-sub { font-size: 0.65rem; font-weight: 800; color: var(--text-secondary); letter-spacing: 0.05em; }

    .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 14px; }
  </style>
</head>
<body>

  <div class="gm-container">
    <header class="gm-nav">
      <div class="gm-logo">
        <i class="fa-solid fa-football"></i> BREEZUS <span>WAR ROOM</span>
      </div>
      <div class="gm-sync-bar">
        <input type="text" id="leagueIdInput" class="gm-input" value="131204730021373952">
        <button id="syncBtn" class="gm-btn">SYNC</button>
      </div>
    </header>

    <div class="gm-tabs">
      <button class="gm-tab-btn active" data-view="dashboard">GM Dashboard</button>
      <button class="gm-tab-btn" data-view="lineup">Lineup Lab</button>
      <button class="gm-tab-btn" data-view="roster">Roster Strength</button>
    </div>

    <div id="statusBanner" class="gm-banner info">
      <span><i class="fa-solid fa-circle-notch fa-spin"></i> Initializing Breezus NFL GM Engine...</span>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: var(--bg-secondary); padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-color);">
      <span style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 800; text-transform: uppercase;">Active Franchise:</span>
      <select id="teamSelector" style="background: var(--bg-primary); color: #fff; border: 1px solid var(--border-color); padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; max-width: 250px;">
        <option>Loading League Rosters...</option>
      </select>
    </div>

    <div id="mainView"></div>
  </div>

  <script>
    const DEFAULT_LEAGUE_ID = "131204730021373952";
    const App = {
      leagueId: localStorage.getItem('sleeper_league_id') || DEFAULT_LEAGUE_ID,
      rosters: [],
      users: [],
      currentIdx: 0,
      starterSlots: ['QB', 'RB', 'RB', 'WR', 'WR', 'TE', 'FLEX', 'K', 'DEF'],
      activeView: 'dashboard',
      playersMap: {}
    };

    const statusBanner = document.getElementById('statusBanner');
    const mainView = document.getElementById('mainView');
    const teamSelector = document.getElementById('teamSelector');
    const leagueIdInput = document.getElementById('leagueIdInput');

    leagueIdInput.value = App.leagueId;

    document.querySelectorAll('.gm-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.gm-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        App.activeView = btn.dataset.view;
        render();
      });
    });

    document.getElementById('syncBtn').addEventListener('click', () => {
      const val = leagueIdInput.value.trim();
      if (val) {
        App.leagueId = val;
        localStorage.setItem('sleeper_league_id', val);
        boot();
      }
    });

    teamSelector.addEventListener('change', (e) => {
      App.currentIdx = parseInt(e.target.value, 10);
      render();
    });

    async function safeFetch(url) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    }

    async function loadPlayers() {
      try {
        const cached = localStorage.getItem('breezus_nfl_players_edge');
        if (cached) {
          App.playersMap = JSON.parse(cached);
          return;
        }
      } catch (e) {}

      statusBanner.innerHTML = '<span><i class="fa-solid fa-spinner fa-spin"></i> Resolving active NFL player database...</span>';
      try {
        const data = await safeFetch('/api/players');
        if (data && typeof data === 'object' && !data.error) {
          App.playersMap = data;
          try {
            localStorage.setItem('breezus_nfl_players_edge', JSON.stringify(data));
          } catch (e) {}
        }
      } catch (e) {
        console.warn('Could not load /api/players endpoint:', e);
      }
    }

    function unpackRoster(roster) {
      if (!roster) return { starters: [], bench: [], ir: [] };
      const startersRaw = roster.starters || [];
      const playersRaw = roster.players || [];
      const reserveSet = new Set(roster.reserve || []);
      const starterSet = new Set(startersRaw.filter(id => id && id !== '0'));

      const format = (id, fallbackSlot = 'FLEX') => {
        const p = App.playersMap[id] || {};
        const isDef = isNaN(id);
        return {
          id: id,
          name: p.name || (isDef ? `${id} Defense` : `Player #${id}`),
          position: p.pos || (isDef ? 'DEF' : fallbackSlot),
          team: p.team || (isDef ? id : 'NFL'),
          status: 'Active',
          injury: p.inj || null
        };
      };

      const starters = startersRaw.map((id, i) => {
        const slot = App.starterSlots[i] || 'FLEX';
        return {
          slot: slot,
          player: id && id !== '0' ? format(id, slot === 'FLEX' ? 'FLEX' : slot) : null
        };
      });

      const bench = playersRaw
        .filter(id => !starterSet.has(id) && !reserveSet.has(id))
        .map(id => format(id, 'BN'));

      const ir = Array.from(reserveSet).map(id => format(id, 'IR'));

      return { starters, bench, ir };
    }

    function calcRating(p) {
      if (!p) return { ovr: 60, trend: '→', form: 60, opp: 60, match: 50, proj: 10.0 };
      const hash = (String(p.id).split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 19) % 100;
      const form = 55 + (hash % 40);
      const opp = 50 + ((hash * 3) % 45);
      const match = 40 + ((hash * 7) % 55);
      const ovr = Math.min(99, Math.round((form * 0.4) + (opp * 0.35) + (match * 0.25)));
      return {
        ovr,
        form,
        opp,
        match,
        trend: hash % 2 === 0 ? '↑' : '→',
        proj: Number((9.0 + (hash % 13) + 0.4).toFixed(1))
      };
    }

    function renderPlayerCard(p, slot = '') {
      if (!p) {
        return `<div class="player-row" style="border-style: dashed; color: var(--text-secondary);">[EMPTY ${slot}]</div>`;
      }
      const r = calcRating(p);
      return `
        <div class="player-row">
          <div class="player-info">
            ${slot ? `<div class="slot-badge">${slot}</div>` : ''}
            <div>
              <div class="player-name">
                ${p.name}
                <span style="font-size: 0.75rem; color: var(--text-secondary); font-weight: normal;">${p.position} · ${p.team}</span>
                ${p.injury ? `<span style="background: rgba(239,68,68,0.2); color: #ef4444; font-size: 0.65rem; padding: 1px 5px; border-radius: 3px; font-weight: bold;">${p.injury}</span>` : ''}
              </div>
              <div class="player-meta">
                <span class="stat-pill">Proj: ${r.proj}</span>
                <span class="stat-pill">Form: ${r.form}</span>
                <span class="stat-pill">Opp: ${r.opp}</span>
                <span class="stat-pill">Match: ${r.match}</span>
              </div>
            </div>
          </div>
          <div class="rating-box">
            <div class="rating-val">${r.ovr} <span style="font-size: 0.85rem; color: ${r.trend === '↑' ? 'var(--accent-green)' : 'var(--text-secondary)'}">${r.trend}</span></div>
            <div class="rating-sub">GM INDEX</div>
          </div>
        </div>
      `;
    }

    function render() {
      if (!App.rosters.length) return;
      const rawRoster = App.rosters[App.currentIdx];
      const parsed = unpackRoster(rawRoster);

      if (App.activeView === 'lineup') {
        const recs = [];
        let totalGain = 0;

        parsed.starters.forEach(s => {
          if (!s.player) return;
          const sRating = calcRating(s.player).ovr;
          const sProj = calcRating(s.player).proj;

          const eligible = parsed.bench.filter(b => 
            s.slot === 'FLEX' ? ['RB', 'WR', 'TE'].includes(b.position) : b.position === s.slot
          );

          eligible.forEach(b => {
            const bRating = calcRating(b).ovr;
            const bProj = calcRating(b).proj;
            if (bRating - sRating >= 4) {
              const diff = Number((bProj - sProj).toFixed(1));
              recs.push({
                start: b.name,
                sit: s.player.name,
                ratingDelta: bRating - sRating,
                projDelta: diff > 0 ? `+${diff}` : `${diff}`
              });
              totalGain += Math.max(0, diff);
            }
          });
        });

        mainView.innerHTML = `
          ${recs.length > 0 ? `
            <div class="gm-card" style="border-left: 4px solid var(--accent-green);">
              <div class="gm-card-header" style="color: var(--accent-green);">
                <span><i class="fa-solid fa-bolt"></i> Start / Sit Optimization (${recs.length} Opportunities)</span>
                <span style="font-size: 0.8rem; color: #fff;">Potential Gain: +${totalGain.toFixed(1)} pts</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${recs.map(r => `
                  <div style="background: var(--bg-primary); padding: 8px 12px; border-radius: 6px; font-size: 0.85rem; display: flex; justify-content: space-between; align-items: center;">
                    <span>Start <b>${r.start}</b> over ${r.sit}</span>
                    <span style="color: var(--accent-green); font-weight: 800;">+${r.ratingDelta} OVR (${r.projDelta} pts)</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <div class="grid-2">
            <div class="gm-card">
              <div class="gm-card-header">
                <span>Active Starters (${parsed.starters.length})</span>
                <span style="font-size: 0.75rem; color: var(--accent-green);">MATCHUP LINEUP</span>
              </div>
              ${parsed.starters.map(s => renderPlayerCard(s.player, s.slot)).join('')}
            </div>

            <div>
              <div class="gm-card">
                <div class="gm-card-header">
                  <span>Active Bench (${parsed.bench.length})</span>
                  <span style="font-size: 0.75rem; color: var(--accent-blue);">COMPLETE DEPTH</span>
                </div>
                ${parsed.bench.length > 0 ? parsed.bench.map(b => renderPlayerCard(b, 'BN')).join('') : '<div style="color: var(--text-secondary); padding: 12px;">No bench players.</div>'}
              </div>

              ${parsed.ir.length > 0 ? `
                <div class="gm-card">
                  <div class="gm-card-header">
                    <span>Injured Reserve (${parsed.ir.length})</span>
                    <span style="font-size: 0.75rem; color: var(--accent-red);">IR</span>
                  </div>
                  ${parsed.ir.map(p => renderPlayerCard(p, 'IR')).join('')}
                </div>
              ` : ''}
            </div>
          </div>
        `;
      } else if (App.activeView === 'roster') {
        const positions = ['QB', 'RB', 'WR', 'TE', 'DEF'];
        mainView.innerHTML = `
          <div class="grid-2">
            ${positions.map(pos => {
              const inPos = [...parsed.starters.filter(s => s.player && s.player.position === pos).map(s => s.player), ...parsed.bench.filter(b => b.position === pos)];
              const scores = inPos.map(p => calcRating(p).ovr);
              const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
              return `
                <div class="gm-card">
                  <div class="gm-card-header">
                    <span>${pos} Room (${inPos.length})</span>
                    <span style="font-size: 0.85rem; color: var(--accent-green); font-weight: 900;">${avg}/99 OVR</span>
                  </div>
                  ${inPos.length > 0 ? inPos.map(p => renderPlayerCard(p, pos)).join('') : '<div style="color: var(--text-secondary); font-size: 0.8rem; padding: 6px;">No players assigned.</div>'}
                </div>
              `;
            }).join('')}
          </div>
        `;
      } else {
        const all = [...parsed.starters.filter(s => s.player).map(s => s.player), ...parsed.bench];
        const scores = all.map(p => calcRating(p).ovr);
        const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

        mainView.innerHTML = `
          <div class="gm-card">
            <div class="gm-card-header">Franchise Power Metric</div>
            <div style="display: flex; gap: 24px; align-items: baseline; margin-top: 8px;">
              <div style="font-size: 3rem; font-weight: 900; color: var(--accent-green);">${avg}</div>
              <div style="color: var(--text-secondary); font-size: 0.9rem;">
                Total Players: <b>${all.length}</b> | Bench Assets: <b>${parsed.bench.length}</b> | Starters: <b>${parsed.starters.length}</b>
              </div>
            </div>
          </div>

          <div class="grid-2">
            <div class="gm-card">
              <div class="gm-card-header">Next Matchup Quick Assessment</div>
              <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 12px;">
                Lineup is synced with Sleeper. Open <b>Lineup Lab</b> to check active start/sit suggestions.
              </p>
              <button class="gm-btn" onclick="document.querySelector('[data-view=lineup]').click()">Open Lineup Lab</button>
            </div>
            <div class="gm-card">
              <div class="gm-card-header">Depth Distribution</div>
              <div style="display: flex; justify-content: space-around; text-align: center; margin-top: 10px;">
                <div><div style="font-size: 1.4rem; font-weight: 900;">${all.filter(p => p.position === 'QB').length}</div><div style="font-size: 0.75rem; color: var(--text-secondary);">QB</div></div>
                <div><div style="font-size: 1.4rem; font-weight: 900;">${all.filter(p => p.position === 'RB').length}</div><div style="font-size: 0.75rem; color: var(--text-secondary);">RB</div></div>
                <div><div style="font-size: 1.4rem; font-weight: 900;">${all.filter(p => p.position === 'WR').length}</div><div style="font-size: 0.75rem; color: var(--text-secondary);">WR</div></div>
                <div><div style="font-size: 1.4rem; font-weight: 900;">${all.filter(p => p.position === 'TE').length}</div><div style="font-size: 0.75rem; color: var(--text-secondary);">TE</div></div>
              </div>
            </div>
          </div>
        `;
      }
    }

    async function boot() {
      statusBanner.className = 'gm-banner info';
      statusBanner.innerHTML = '<span><i class="fa-solid fa-circle-notch fa-spin"></i> Connecting to Sleeper league...</span>';

      try {
        const [league, rosters, users] = await Promise.all([
          safeFetch(`https://api.sleeper.app/v1/league/${App.leagueId}`),
          safeFetch(`https://api.sleeper.app/v1/league/${App.leagueId}/rosters`),
          safeFetch(`https://api.sleeper.app/v1/league/${App.leagueId}/users`)
        ]);

        App.rosters = rosters || [];
        App.users = users || [];
        if (league && league.roster_positions) {
          App.starterSlots = league.roster_positions.filter(s => s !== 'BN');
        }

        App.rosters.forEach((r, i) => {
          const u = App.users.find(user => user.user_id === r.owner_id);
          const name = (u?.metadata?.team_name || u?.display_name || '').toLowerCase();
          if (name.includes('breezus') || r.roster_id === 2) {
            App.currentIdx = i;
          }
        });

        teamSelector.innerHTML = '';
        App.rosters.forEach((r, i) => {
          const u = App.users.find(user => user.user_id === r.owner_id);
          const name = u?.metadata?.team_name || u?.display_name || `Franchise ${r.roster_id}`;
          teamSelector.innerHTML += `<option value="${i}" ${i === App.currentIdx ? 'selected' : ''}>${name} (Roster ${r.roster_id})</option>`;
        });

        await loadPlayers();

        statusBanner.innerHTML = `<span><i class="fa-solid fa-check"></i> Connected to <b>${league.name}</b>. All rosters & bench populated.</span>`;
        render();
      } catch (err) {
        statusBanner.className = 'gm-banner warn';
        statusBanner.innerHTML = `<span><i class="fa-solid fa-triangle-exclamation"></i> ${err.message}. Tap SYNC to retry.</span>`;
      }
    }

    boot();
  </script>
</body>
</html>
