/**
 * gm-app-v59-readability.js
 * Readability & Contrast Hotfix for Lineup Analyser and GM Dashboard.
 * Ensures readable typography and proper card contrast.
 */

(function () {
  const css = `
    /* Readability & Contrast Enhancements */
    body, .gm-container, #app-content {
      color: #f1f5f9 !important;
    }

    .gm-card {
      background-color: #161e2e !important;
      border: 1px solid #2d3748 !important;
      color: #f1f5f9 !important;
    }

    .gm-card-header {
      color: #ffffff !important;
      font-weight: 700 !important;
      border-bottom: 1px solid #2d3748 !important;
      padding-bottom: 8px !important;
    }

    /* Player card text contrast */
    .player-card, .lineup-slot, .roster-slot {
      background-color: #1e293b !important;
      border: 1px solid #334155 !important;
      color: #f8fafc !important;
    }

    .player-name, .slot-player-name {
      color: #ffffff !important;
      font-weight: 700 !important;
    }

    .player-meta, .slot-meta, .text-secondary {
      color: #94a3b8 !important;
    }

    /* Badge & rating readability */
    .badge, .rating-badge, .tier-badge {
      font-weight: 700 !important;
    }

    .badge-green, .tier-elite {
      background-color: rgba(16, 185, 129, 0.2) !important;
      color: #34d399 !important;
      border: 1px solid #059669 !important;
    }

    .badge-yellow, .tier-starter {
      background-color: rgba(245, 158, 11, 0.2) !important;
      color: #fbbf24 !important;
      border: 1px solid #d97706 !important;
    }

    .badge-red, .tier-bench {
      background-color: rgba(239, 68, 68, 0.2) !important;
      color: #f87171 !important;
      border: 1px solid #dc2626 !important;
    }

    /* Selectors & inputs */
    select, input {
      background-color: #0f172a !important;
      border: 1px solid #334155 !important;
      color: #ffffff !important;
    }
  `;

  const head = document.head || document.getElementsByTagName('head')[0];
  const style = document.createElement('style');
  style.id = 'gm-v59-contrast-styles';
  style.type = 'text/css';
  style.appendChild(document.createTextNode(css));
  head.appendChild(style);

  console.log("Loaded gm-app-v59 readability contrast styles.");
})();
