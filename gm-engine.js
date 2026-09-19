/**
 * BREEZUS NFL GM - Unified Engine & Analytics Layer
 */

export const GMEngine = {
  SCARCITY_WEIGHTS: { QB: 0.98, RB: 1.05, WR: 1.02, TE: 1.06, K: 0.82, DEF: 0.86 },

  // Resolves the empty bench bug by computing the exact complement of starters, IR, and taxi
  unpackRoster(roster, allPlayersMap = {}, starterSlots = []) {
    if (!roster) return { starters: [], bench: [], ir: [], taxi: [], allRostered: [] };

    const rawStarters = roster.starters || [];
    const allRosteredIds = roster.players || [];
    const reserveIds = new Set(roster.reserve || []);
    const taxiIds = new Set(roster.taxi || []);
    const starterIdsSet = new Set(rawStarters.filter(id => id && id !== '0'));

    const format = (id) => {
      const p = allPlayersMap[id] || {};
      return {
        id: id,
        name: p.full_name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || `Player ${id}`,
        position: p.position || 'N/A',
        team: p.team || 'FA',
        status: p.status || 'Active',
        injuryStatus: p.injury_status || null,
        age: p.age || '—',
        yearsExp: p.years_exp ?? 0
      };
    };

    const starters = rawStarters.map((playerId, idx) => {
      const slotName = starterSlots[idx] || 'FLEX';
      const playerObj = playerId && playerId !== '0' ? format(playerId) : null;
      return {
        slot: slotName,
        playerId: playerId !== '0' ? playerId : null,
        player: playerObj,
        isStarter: true
      };
    });

    const bench = allRosteredIds
      .filter(id => !starterIdsSet.has(id) && !reserveIds.has(id) && !taxiIds.has(id))
      .map(id => format(id));

    const ir = Array.from(reserveIds).map(id => format(id));
    const taxi = Array.from(taxiIds).map(id => format(id));
    const allRostered = allRosteredIds.map(id => format(id));

    return { starters, bench, ir, taxi, allRostered };
  },

  // Multi-Factor GM Player Rating (0 - 99 scale)
  calculateGMRating(player, stats = {}) {
    if (!player) return null;

    const recentScores = stats.recent_scores && stats.recent_scores.length > 0
      ? stats.recent_scores
      : [stats.season_avg || 10];
    const avgRecent = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const form = Math.min(99, Math.max(35, Math.round((avgRecent / 22) * 100)));

    const snapPct = stats.snap_share ?? 0.65;
    const touchPct = stats.touch_share ?? 0.15;
    const rzTouches = Math.min(stats.redzone_touches ?? 2, 6);
    const opportunity = Math.min(99, Math.max(30, Math.round((snapPct * 45) + (touchPct * 200) + (rzTouches * 4))));

    const oppRank = stats.opponent_rank ?? 16;
    const matchup = Math.round(35 + ((oppRank - 1) / 31) * 64);

    let trend = '→';
    if (recentScores.length >= 2) {
      const delta = recentScores[recentScores.length - 1] - recentScores[0];
      if (delta >= 3.5) trend = '↑';
      else if (delta <= -3.5) trend = '↓';
    }

    const mult = this.SCARCITY_WEIGHTS[player.position] || 1.0;
    const rawOverall = (form * 0.35) + (opportunity * 0.35) + (matchup * 0.30);
    const overall = Math.min(99, Math.max(40, Math.round(rawOverall * mult)));

    return {
      overall,
      breakdown: { form, opportunity, matchup, trend },
      isCalculated: true,
      summary: `${player.position} (${Math.round(snapPct * 100)}% snaps) vs Opp Def #${oppRank}`
    };
  },

  // Lineup Optimizer & Sit/Start Recommendation Solver
  optimizeLineup(starters, bench, ratingsMap = {}, projectionsMap = {}) {
    const recommendations = [];
    let potentialGain = 0;

    starters.forEach(slotItem => {
      if (!slotItem.playerId) return;

      const currentStarter = slotItem.player;
      const currentRating = (ratingsMap[currentStarter.id] || {}).overall || 65;
      const currentProj = projectionsMap[currentStarter.id] || 10.0;

      const eligibleBench = bench.filter(b => {
        if (slotItem.slot === 'FLEX') return ['RB', 'WR', 'TE'].includes(b.position);
        if (slotItem.slot === 'SUPER_FLEX') return ['QB', 'RB', 'WR', 'TE'].includes(b.position);
        return b.position === slotItem.slot;
      });

      eligibleBench.forEach(benchPlayer => {
        const benchRating = (ratingsMap[benchPlayer.id] || {}).overall || 65;
        const benchProj = projectionsMap[benchPlayer.id] || 10.0;
        const ratingDelta = benchRating - currentRating;
        const projDelta = Number((benchProj - currentProj).toFixed(1));

        if (ratingDelta >= 4 || projDelta >= 2.0) {
          recommendations.push({
            slot: slotItem.slot,
            current: currentStarter,
            recommended: benchPlayer,
            currentRating,
            benchRating,
            currentProj,
            benchProj,
            ratingDelta,
            projDelta,
            reason: `${benchPlayer.name} has higher projected volume (+${ratingDelta} GM edge, +${projDelta} pts).`
          });
          potentialGain += Math.max(0, projDelta);
        }
      });
    });

    return {
      recommendations: recommendations.sort((a, b) => b.ratingDelta - a.ratingDelta),
      potentialGain: Number(potentialGain.toFixed(1))
    };
  },

  // Position-by-position Roster Health Breakdown
  analyzeRoster(allPlayers, ratingsMap = {}) {
    const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
    const analysis = {};

    positions.forEach(pos => {
      const group = allPlayers.filter(p => p.position === pos);
      const scores = group.map(p => (ratingsMap[p.id] || {}).overall || 65);
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

      let tier = 'CRITICAL';
      if (avg >= 85) tier = 'ELITE';
      else if (avg >= 78) tier = 'STRONG';
      else if (avg >= 70) tier = 'STABLE';
      else if (avg >= 60) tier = 'VULNERABLE';

      analysis[pos] = {
        count: group.length,
        averageRating: avg,
        tier,
        needsAttention: avg < 72 || (['RB', 'WR'].includes(pos) && group.length < 4),
        players: group
      };
    });

    return analysis;
  },

  // Trade Lab Scarcity & Balance Evaluator
  evaluateTrade(givingIds, receivingIds, rosterIds, allPlayersMap, ratingsMap) {
    const getScore = (id) => (ratingsMap[id] || {}).overall || 65;
    const sentValue = givingIds.reduce((sum, id) => sum + getScore(id), 0);
    const recvValue = receivingIds.reduce((sum, id) => sum + getScore(id), 0);
    const netDelta = recvValue - sentValue;

    const positions = ['QB', 'RB', 'WR', 'TE'];
    const positionDeltas = {};

    positions.forEach(pos => {
      const lost = givingIds.filter(id => (allPlayersMap[id] || {}).position === pos).length;
      const gained = receivingIds.filter(id => (allPlayersMap[id] || {}).position === pos).length;
      positionDeltas[pos] = gained - lost;
    });

    let verdict = 'FAIR / BALANCED';
    if (netDelta >= 5) verdict = 'HIGHLY FAVORABLE';
    else if (netDelta > 1) verdict = 'MODERATELY FAVORABLE';
    else if (netDelta <= -5) verdict = 'HIGHLY UNFAVORABLE';
    else if (netDelta < -1) verdict = 'UNFAVORABLE';

    const gainingStr = Object.keys(positionDeltas).filter(p => positionDeltas[p] > 0).join(', ');
    const losingStr = Object.keys(positionDeltas).filter(p => positionDeltas[p] < 0).join(', ');

    let summary = 'Even asset distribution across positions.';
    if (gainingStr && losingStr) {
      summary = `Bolsters ${gainingStr} depth while trading depth at ${losingStr}.`;
    } else if (gainingStr) {
      summary = `Improves roster depth at ${gainingStr}.`;
    }

    return { sentValue, recvValue, netDelta, verdict, summary, positionDeltas };
  }
};

