/**
 * ====================================================================
 * NOMAD: UNIFIED MENU & SETTINGS ENGINE
 * Single Source of Truth for About, Switch Cockpit, Utilities & Credits
 * 
 * Proprietary & Created by BostonyFX
 * File: /js/nomad-menu.js
 * ====================================================================
 */

(function(root) {
  'use strict';

  // Determine current cockpit context from URL path or body dataset
  function getCockpitContext() {
    if (document.body && document.body.dataset && document.body.dataset.cockpit) {
      return document.body.dataset.cockpit;
    }
    const path = (window.location.pathname || '').toLowerCase();
    const search = (window.location.search || '').toLowerCase();
    if (path.includes('digit') || search.includes('digit') || document.querySelector('.digit-layout, #block-philosophy, #clock-time, #digit-app')) {
      return 'digit';
    }
    if (path.includes('roadtrip') || search.includes('roadtrip')) {
      return 'roadtrip';
    }
    if (path.includes('hyperspace') || search.includes('hyperspace')) {
      return 'hyperspace';
    }
    if (path.includes('launch') || search.includes('launch') || document.querySelector('.launcher-frame, .cockpits-stack, #card-hud-hyperspace')) {
      return 'launcher';
    }
    if (path.includes('nomad_suite')) {
      if (document.getElementById('speed-bubble') || document.getElementById('map-card')) {
        return 'hyperspace';
      }
      return 'launcher';
    }
    if (path.endsWith('/') || path.endsWith('index.html')) {
      // Check if root index is acting as hyperspace or launcher
      if (document.getElementById('speed-bubble') || document.getElementById('map-card')) {
        return 'hyperspace';
      }
      return 'launcher';
    }
    return 'launcher';
  }

  // Explicit helper to navigate strictly to Launch Control Home
  function returnToNomadLauncher(e) {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }
    if (typeof window !== 'undefined') {
      window.location.href = 'index.html';
    }
  }
  root.returnToNomadLauncher = returnToNomadLauncher;
  if (typeof window !== 'undefined') {
    window.returnToNomadLauncher = returnToNomadLauncher;
  }

  const COCKPIT_META = {
    hyperspace: {
      name: 'NOMAD: Hyperspace',
      badge: 'Kinetic Telemetry • User Guide & Features',
      guideAnchor: 'features.html#hyperspace',
      accentColor: '#ff0055',
      desc: 'Kinetic vector canvas with floating telemetry.'
    },
    roadtrip: {
      name: 'NOMAD: RoadTrip',
      badge: 'Highway Panoramic • User Guide & Features',
      guideAnchor: 'features.html#roadtrip',
      accentColor: '#00f3ff',
      desc: 'High-contrast street level mapping accuracy.'
    },
    digit: {
      name: 'NOMAD: DIGIT',
      badge: 'Tactical Monospace Telemetry Matrix',
      guideAnchor: 'features.html#digit',
      accentColor: '#30d158',
      desc: 'Military monospace ASCII matrix &amp; high-density telemetry.'
    },
    launcher: {
      name: 'NOMAD: Avionics Suite',
      badge: 'Launch Control Home',
      guideAnchor: 'features.html',
      accentColor: '#00f3ff',
      desc: 'Central mission control for the 3 distinct NOMAD cockpits and shared sensory visualizers.'
    }
  };

  // Inject unified CSS stylesheet once
  function ensureMenuStyles() {
    if (document.getElementById('nomad-menu-unified-style')) return;
    const style = document.createElement('style');
    style.id = 'nomad-menu-unified-style';
    style.textContent = `
      #about-modal.nomad-unified-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        height: 100dvh;
        background: rgba(5, 8, 17, 0.88);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.22s ease;
        padding: 16px;
        box-sizing: border-box;
      }
      #about-modal.nomad-unified-modal.active {
        opacity: 1;
        pointer-events: auto;
      }
      #about-modal .nomad-modal-box {
        background: #121826;
        border: 1.5px solid rgba(0, 243, 255, 0.35);
        border-radius: 18px;
        padding: 14px 14px 12px 14px;
        width: 100%;
        max-width: 480px;
        max-height: min(92dvh, 760px);
        height: auto;
        text-align: center;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.85), 0 0 24px rgba(0, 243, 255, 0.18);
        transform: scale(0.96);
        transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
        display: flex;
        flex-direction: column;
        gap: 8px;
        box-sizing: border-box;
        position: relative;
        overflow: hidden;
      }
      #about-modal .nomad-modal-header-fixed {
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
        text-align: center;
        padding-right: 28px;
        position: relative;
      }
      #about-modal .nomad-modal-x {
        position: absolute;
        top: 12px;
        right: 12px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.18);
        color: #94a3b8;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        font-size: 0.90rem;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.15s ease;
        z-index: 10;
      }
      #about-modal .nomad-modal-x:hover {
        background: rgba(255, 0, 79, 0.25);
        border-color: #ff004f;
        color: #ffffff;
      }
      #about-modal .modal-title-link {
        text-decoration: none;
        color: inherit;
        display: block;
        margin-bottom: 2px;
      }
      #about-modal .modal-title {
        font-size: 1.25rem;
        font-weight: 800;
        color: #38bdf8;
        letter-spacing: 0.5px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      #about-modal .modal-features-hint {
        font-size: 0.72rem;
        color: #94a3b8;
        font-family: 'JetBrains Mono', monospace;
        letter-spacing: 0.04em;
        margin-top: 2px;
      }
      #about-modal .modal-author {
        font-size: 0.82rem;
        color: #cbd5e1;
        font-family: 'JetBrains Mono', monospace;
      }
      #about-modal .modal-author a {
        color: #f59e0b;
        text-decoration: underline;
        font-weight: 700;
      }
      #about-modal .modal-body {
        font-size: 0.78rem;
        color: #94a3b8;
        line-height: 1.45;
        text-align: left;
        background: rgba(0, 0, 0, 0.35);
        padding: 9px 12px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      #about-modal .modal-cockpit-section {
        background: rgba(15, 23, 42, 0.60);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 10px;
        padding: 9px;
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      #about-modal .modal-cockpit-header {
        font-size: 0.64rem;
        font-weight: 700;
        color: #64748b;
        letter-spacing: 0.08em;
        font-family: 'JetBrains Mono', monospace;
      }
      #about-modal .modal-cockpit-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 6px;
      }
      #about-modal .modal-cockpit-btn {
        padding: 7px 4px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.10);
        border-radius: 8px;
        color: #94a3b8;
        font-size: 0.68rem;
        font-weight: 700;
        text-decoration: none;
        font-family: 'JetBrains Mono', monospace;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s ease;
      }
      #about-modal .modal-cockpit-btn.is-active {
        background: rgba(0, 243, 255, 0.12);
        border-color: #00f3ff;
        color: #00f3ff;
        box-shadow: 0 0 10px rgba(0, 243, 255, 0.25);
      }
      #about-modal .modal-cockpit-btn.is-active.btn-hyperspace {
        background: rgba(255, 0, 85, 0.14);
        border-color: #ff0055;
        color: #ff0055;
        box-shadow: 0 0 12px rgba(255, 0, 85, 0.35);
      }
      #about-modal .modal-cockpit-btn.is-active.btn-roadtrip {
        background: rgba(0, 243, 255, 0.14);
        border-color: #00f3ff;
        color: #00f3ff;
        box-shadow: 0 0 12px rgba(0, 243, 255, 0.30);
      }
      #about-modal .modal-cockpit-btn.is-active.btn-digit {
        background: rgba(48, 209, 88, 0.14);
        border-color: #30d158;
        color: #30d158;
        box-shadow: 0 0 12px rgba(48, 209, 88, 0.30);
      }
      #about-modal .modal-home-launcher-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        width: 100%;
        padding: 8px 10px;
        background: linear-gradient(90deg, rgba(0, 243, 255, 0.10), rgba(255, 183, 3, 0.10));
        border: 1px solid rgba(0, 243, 255, 0.35);
        border-radius: 8px;
        color: #f8fafc;
        font-size: 0.72rem;
        font-weight: 700;
        font-family: 'JetBrains Mono', monospace;
        letter-spacing: 0.04em;
        text-decoration: none;
        transition: all 0.15s ease;
        box-sizing: border-box;
      }
      #about-modal .modal-home-launcher-btn:hover {
        background: linear-gradient(90deg, rgba(0, 243, 255, 0.22), rgba(255, 183, 3, 0.22));
        border-color: #00f3ff;
        color: #ffffff;
        box-shadow: 0 0 12px rgba(0, 243, 255, 0.25);
      }
      #about-modal .modal-default-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-size: 0.66rem;
        color: #94a3b8;
        cursor: pointer;
        font-family: 'JetBrains Mono', monospace;
      }
      #about-modal .modal-action-stack {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      #about-modal .modal-btn-row {
        display: block;
        width: 100%;
        padding: 9px 12px;
        border-radius: 10px;
        font-size: 0.78rem;
        font-weight: 800;
        font-family: 'JetBrains Mono', monospace;
        text-decoration: none;
        text-align: center;
        cursor: pointer;
        box-sizing: border-box;
        transition: all 0.15s ease;
      }
      #about-modal .modal-vis-btn {
        background: linear-gradient(90deg, rgba(255, 0, 127, 0.18), rgba(0, 212, 255, 0.18));
        border: 1.5px solid #ff007f;
        color: #ffffff;
      }
      #about-modal .modal-stats-btn {
        background: rgba(255, 176, 0, 0.10);
        border: 1.5px solid #ffb000;
        color: #ffb000;
      }
      #about-modal .modal-guide-btn {
        background: rgba(56, 189, 248, 0.10);
        border: 1.5px solid #38bdf8;
        color: #38bdf8;
      }
      #about-modal .modal-audio-btn {
        background: rgba(0, 243, 255, 0.08);
        border: 1.5px solid #00f3ff;
        color: #ffffff;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      #about-modal .modal-scanner-btn {
        background: rgba(48, 209, 88, 0.10);
        border: 1.5px solid #30d158;
        color: #ffffff;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      #about-modal .modal-scanner-btn:hover {
        background: rgba(48, 209, 88, 0.20);
        box-shadow: 0 0 10px rgba(48, 209, 88, 0.3);
      }
      /* Modal Navigation Tabs */
      #about-modal .nomad-modal-tabs {
        flex-shrink: 0;
        display: flex;
        gap: 6px;
        background: rgba(0, 0, 0, 0.45);
        padding: 4px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.10);
        margin: 2px 0 2px 0;
      }
      #about-modal .nomad-modal-tab {
        flex: 1;
        padding: 8px 10px;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 7px;
        color: #94a3b8;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.68rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.15s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        letter-spacing: 0.03em;
        user-select: none;
      }
      #about-modal .nomad-modal-tab:hover {
        color: #f1f5f9;
        background: rgba(255, 255, 255, 0.05);
      }
      #about-modal .nomad-modal-tab.active {
        background: rgba(0, 243, 255, 0.14);
        border: 1px solid rgba(0, 243, 255, 0.45);
        color: #00f3ff;
        box-shadow: 0 0 10px rgba(0, 243, 255, 0.15);
      }
      #about-modal .nomad-modal-tab.tab-storage.active {
        background: rgba(16, 185, 129, 0.14);
        border: 1px solid rgba(16, 185, 129, 0.50);
        color: #10b981;
        box-shadow: 0 0 10px rgba(16, 185, 129, 0.15);
      }
      #about-modal .modal-tab-panel {
        display: none;
        flex-direction: column;
        gap: 10px;
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        overscroll-behavior: contain;
        -webkit-overflow-scrolling: touch;
        padding: 4px 4px 28px 2px;
      }
      #about-modal .modal-tab-panel.active {
        display: flex;
      }
      #about-modal .nomad-modal-footer-fixed {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        padding-top: 6px;
        margin-top: 2px;
      }
      #about-modal .credits-storage-jump-banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: linear-gradient(90deg, rgba(16, 185, 129, 0.12), rgba(255, 0, 79, 0.10));
        border: 1px solid rgba(16, 185, 129, 0.35);
        border-radius: 8px;
        padding: 7px 10px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.64rem;
        color: #cbd5e1;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      #about-modal .credits-storage-jump-banner:hover {
        border-color: #10b981;
        background: linear-gradient(90deg, rgba(16, 185, 129, 0.20), rgba(255, 0, 79, 0.16));
        color: #ffffff;
      }

      /* Storage Console & Action Cards */
      #about-modal .modal-storage-console {
        display: flex;
        flex-direction: column;
        gap: 10px;
        text-align: left;
      }
      #about-modal .storage-card {
        background: rgba(0, 0, 0, 0.40);
        border: 1.5px solid rgba(255, 255, 255, 0.12);
        border-radius: 12px;
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        cursor: pointer;
        transition: all 0.18s ease;
      }
      #about-modal .storage-card:active {
        transform: scale(0.99);
      }
      #about-modal .storage-card.card-zip {
        border-color: #10b981;
        background: rgba(16, 185, 129, 0.08);
      }
      #about-modal .storage-card.card-zip:hover {
        background: rgba(16, 185, 129, 0.15);
        box-shadow: 0 0 16px rgba(16, 185, 129, 0.28);
      }
      #about-modal .storage-card.card-purge {
        border-color: #ff004f;
        background: rgba(255, 0, 79, 0.08);
      }
      #about-modal .storage-card.card-purge:hover {
        background: rgba(255, 0, 79, 0.15);
        box-shadow: 0 0 16px rgba(255, 0, 79, 0.28);
      }
      #about-modal .storage-card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.70rem;
        font-weight: 800;
        letter-spacing: 0.04em;
      }
      #about-modal .storage-card-desc {
        font-size: 0.63rem;
        color: #94a3b8;
        line-height: 1.35;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      #about-modal .storage-action-row {
        display: flex;
        flex-direction: column;
        gap: 7px;
        margin-top: 3px;
      }
      #about-modal .btn-storage-action {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        width: 100%;
        padding: 10px 12px;
        border-radius: 8px;
        font-family: 'JetBrains Mono', monospace;
        text-decoration: none;
        box-sizing: border-box;
        cursor: pointer;
        transition: all 0.15s ease;
        border: 1.5px solid transparent;
      }
      #about-modal .btn-storage-action:active {
        transform: scale(0.98);
      }
      #about-modal .btn-storage-download {
        background: rgba(16, 185, 129, 0.14);
        border-color: #10b981;
        color: #10b981;
        box-shadow: 0 0 12px rgba(16, 185, 129, 0.20);
      }
      #about-modal .btn-storage-download:hover {
        background: rgba(16, 185, 129, 0.25);
        box-shadow: 0 0 18px rgba(16, 185, 129, 0.38);
        color: #ffffff;
      }
      #about-modal .btn-storage-purge {
        background: rgba(255, 0, 79, 0.14);
        border-color: #ff004f;
        color: #ff004f;
        box-shadow: 0 0 12px rgba(255, 0, 79, 0.20);
      }
      #about-modal .btn-storage-purge:hover {
        background: rgba(255, 0, 79, 0.25);
        box-shadow: 0 0 18px rgba(255, 0, 79, 0.38);
        color: #ffffff;
      }
      #about-modal .storage-btn-title {
        font-size: 0.74rem;
        font-weight: 800;
        letter-spacing: 0.03em;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      #about-modal .storage-btn-sub {
        font-size: 0.58rem;
        font-weight: 400;
        opacity: 0.85;
        margin-top: 2px;
        line-height: 1.3;
      }
      #about-modal .storage-telemetry-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
        margin-top: 4px;
        padding-top: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }
      #about-modal .storage-telem-cell {
        background: rgba(0, 0, 0, 0.30);
        padding: 6px 8px;
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.06);
        font-family: 'JetBrains Mono', monospace;
      }
      #about-modal .storage-telem-lbl {
        font-size: 0.52rem;
        color: #64748b;
        letter-spacing: 0.05em;
      }
      #about-modal .storage-telem-val {
        font-size: 0.62rem;
        color: #00f3ff;
        font-weight: 700;
        margin-top: 2px;
      }

      /* Maintenance Drawer (Cockpits) */
      #about-modal .modal-maintenance-drawer {
        margin-top: 6px;
        margin-bottom: 4px;
        border: 1.5px solid rgba(16, 185, 129, 0.35);
        border-radius: 10px;
        background: rgba(0, 0, 0, 0.40);
        overflow: hidden;
      }
      #about-modal .modal-maintenance-summary {
        padding: 8px 11px;
        font-size: 0.68rem;
        font-weight: 800;
        font-family: 'JetBrains Mono', monospace;
        color: #10b981;
        cursor: pointer;
        user-select: none;
        list-style: none;
        display: flex;
        align-items: center;
        justify-content: space-between;
        letter-spacing: 0.04em;
        background: rgba(16, 185, 129, 0.08);
        transition: all 0.15s ease;
      }
      #about-modal .modal-maintenance-summary:hover {
        background: rgba(16, 185, 129, 0.16);
        color: #ffffff;
      }
      #about-modal .modal-maintenance-summary::-webkit-details-marker {
        display: none;
      }
      #about-modal .modal-maintenance-content {
        padding: 9px 10px 10px;
        display: flex;
        flex-direction: column;
        gap: 7px;
        border-top: 1px solid rgba(16, 185, 129, 0.18);
        background: rgba(0, 0, 0, 0.25);
      }
      #about-modal .modal-close-btn {
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #94a3b8;
        padding: 7px 22px;
        border-radius: 8px;
        font-size: 0.78rem;
        font-family: 'JetBrains Mono', monospace;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      #about-modal .modal-close-btn:hover {
        border-color: #ffffff;
        color: #ffffff;
      }
      #about-modal .modal-bottom-version {
        font-size: 0.65rem;
        font-family: 'JetBrains Mono', monospace;
        color: #00d4ff;
        margin-top: 2px;
        letter-spacing: 0.06em;
      }

      /* ========================================================
         BILL OF MATERIALS, CREDITS & TONE GENERATOR SPEC STYLES
         ======================================================== */
      #about-modal .modal-credits-wrap {
        display: flex;
        flex-direction: column;
        gap: 8px;
        text-align: left;
        margin-top: 2px;
      }
      #about-modal .credits-intro-pill {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.60rem;
        font-family: 'JetBrains Mono', monospace;
        font-weight: 800;
        color: #38bdf8;
        background: rgba(56, 189, 248, 0.08);
        border: 1px solid rgba(56, 189, 248, 0.25);
        padding: 5px 9px;
        border-radius: 6px;
        letter-spacing: 0.06em;
      }
      #about-modal .credits-group {
        background: rgba(0, 0, 0, 0.38);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 10px;
        padding: 9px 11px;
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      #about-modal .credits-group-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.66rem;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        padding-bottom: 4px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }
      #about-modal .credits-tag {
        font-size: 0.56rem;
        padding: 1px 5px;
        border-radius: 4px;
        font-weight: 700;
        letter-spacing: 0.04em;
      }
      #about-modal .credits-item-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      #about-modal .credits-item {
        display: flex;
        flex-direction: column;
        gap: 2px;
        font-family: 'JetBrains Mono', monospace;
      }
      #about-modal .credits-item-title-row {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 6px;
      }
      #about-modal .credits-item-name {
        font-size: 0.70rem;
        font-weight: 700;
        color: #f1f5f9;
      }
      #about-modal .credits-item-name a {
        color: #38bdf8;
        text-decoration: none;
      }
      #about-modal .credits-item-name a:hover {
        text-decoration: underline;
      }
      #about-modal .credits-item-license {
        font-size: 0.56rem;
        color: #64748b;
        letter-spacing: 0.04em;
      }
      #about-modal .credits-item-desc {
        font-size: 0.62rem;
        color: #94a3b8;
        line-height: 1.35;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      #about-modal .synth-waveforms {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 3px;
      }
      #about-modal .synth-waveform-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 0.56rem;
        font-family: 'JetBrains Mono', monospace;
        padding: 2px 5px;
        border-radius: 4px;
        background: rgba(48, 209, 88, 0.10);
        border: 1px solid rgba(48, 209, 88, 0.28);
        color: #30d158;
      }
      /* Cockpit Credits Drawer */
      #about-modal .modal-credits-drawer {
        margin-top: 4px;
        border: 1px solid rgba(56, 189, 248, 0.25);
        border-radius: 8px;
        background: rgba(0, 0, 0, 0.35);
        overflow: hidden;
      }
      #about-modal .modal-credits-summary {
        padding: 8px 10px;
        font-size: 0.68rem;
        font-weight: 800;
        font-family: 'JetBrains Mono', monospace;
        color: #38bdf8;
        cursor: pointer;
        user-select: none;
        list-style: none;
        display: flex;
        align-items: center;
        justify-content: space-between;
        letter-spacing: 0.04em;
        background: rgba(56, 189, 248, 0.08);
        transition: all 0.15s ease;
      }
      #about-modal .modal-credits-summary:hover {
        background: rgba(56, 189, 248, 0.16);
        color: #ffffff;
      }
      #about-modal .modal-credits-summary::-webkit-details-marker {
        display: none;
      }
      #about-modal .modal-credits-drawer-content {
        padding: 8px 8px 10px;
        border-top: 1px solid rgba(56, 189, 248, 0.15);
      }
    `;
    document.head.appendChild(style);
  }

  // Comprehensive Bill of Materials, Open-Source Technologies, APIs & Tone Generator Specs
  function buildCreditsHTML() {
    return `
      <div class="modal-credits-wrap">
        <div class="credits-intro-pill">
          <span>⚡ ZERO-DEPENDENCY AVIONICS ARCHITECTURE</span>
          <span style="opacity: 0.7;">BILL OF MATERIALS</span>
        </div>

        <!-- 1. CARTOGRAPHY, VECTOR TILES & GEOCODING -->
        <div class="credits-group">
          <div class="credits-group-header">
            <span style="color: #00f3ff;">🗺️ Cartography &amp; Vector Engine</span>
            <span class="credits-tag" style="background: rgba(0, 243, 255, 0.15); color: #00f3ff; border: 1px solid rgba(0, 243, 255, 0.3);">MAPS &amp; TILES</span>
          </div>
          <div class="credits-item-list">
            <div class="credits-item">
              <div class="credits-item-title-row">
                <span class="credits-item-name"><a href="https://maplibre.org/" target="_blank" rel="noopener noreferrer">MapLibre GL JS</a> <span style="font-size:0.62rem; color:#64748b;">v4.7.1</span></span>
                <span class="credits-item-license">BSD-3-Clause</span>
              </div>
              <div class="credits-item-desc">Hardware-accelerated WebGL vector map engine driving dynamic 60fps tile rendering, 3D pitch, continuous camera rotation, and terrain projection.</div>
            </div>

            <div class="credits-item">
              <div class="credits-item-title-row">
                <span class="credits-item-name"><a href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer">OpenStreetMap (OSM)</a></span>
                <span class="credits-item-license">ODbL Open Data</span>
              </div>
              <div class="credits-item-desc">Worldwide community cartographic database supplying road networks, waterways, terrain landmarks, and building footprints.</div>
            </div>

            <div class="credits-item">
              <div class="credits-item-title-row">
                <span class="credits-item-name"><a href="https://openfreemap.org/" target="_blank" rel="noopener noreferrer">OpenFreeMap</a></span>
                <span class="credits-item-license">Public Infrastructure</span>
              </div>
              <div class="credits-item-desc">Free, open-source vector tile server delivering styled OSM planet tiles in <em>Liberty</em>, <em>Bright</em>, and <em>Dark</em> with zero telemetry.</div>
            </div>

            <div class="credits-item">
              <div class="credits-item-title-row">
                <span class="credits-item-name"><a href="https://photon.komoot.io/" target="_blank" rel="noopener noreferrer">Komoot Photon API</a> &amp; <a href="https://nominatim.org/" target="_blank" rel="noopener noreferrer">Nominatim</a></span>
                <span class="credits-item-license">Apache 2.0 / GPL</span>
              </div>
              <div class="credits-item-desc">High-speed reverse geocoding and location search engines converting GPS coordinates into live street, city, and waypoint nomenclature.</div>
            </div>

            <div class="credits-item">
              <div class="credits-item-title-row">
                <span class="credits-item-name"><a href="https://www.bigdatacloud.com/" target="_blank" rel="noopener noreferrer">BigDataCloud</a> &amp; <a href="https://www.geojs.io/" target="_blank" rel="noopener noreferrer">GeoJS</a></span>
                <span class="credits-item-license">Client APIs</span>
              </div>
              <div class="credits-item-desc">Client-side administrative locality boundaries and low-latency IP geolocation initial bootstrap prior to hardware GPS satellite acquisition.</div>
            </div>
          </div>
        </div>

        <!-- 2. SENSORS & ATMOSPHERIC TELEMETRY -->
        <div class="credits-group">
          <div class="credits-group-header">
            <span style="color: #ffb703;">📡 Sensors, Telemetry &amp; Weather</span>
            <span class="credits-tag" style="background: rgba(255, 183, 3, 0.15); color: #ffb703; border: 1px solid rgba(255, 183, 3, 0.3);">REALTIME TELEMETRY</span>
          </div>
          <div class="credits-item-list">
            <div class="credits-item">
              <div class="credits-item-title-row">
                <span class="credits-item-name"><a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo Weather API</a></span>
                <span class="credits-item-license">CC BY 4.0</span>
              </div>
              <div class="credits-item-desc">Open-access meteorological forecast API providing barometric pressure (hPa), ambient temperature (&deg;F/&deg;C), UV index, humidity, and atmospheric weather codes.</div>
            </div>

            <div class="credits-item">
              <div class="credits-item-title-row">
                <span class="credits-item-name">W3C Geolocation API</span>
                <span class="credits-item-license">W3C Web Standard</span>
              </div>
              <div class="credits-item-desc">Continuous satellite GPS stream (<code>watchPosition</code>) computing live ground speed, heading bearing, altitude, and horizontal accuracy circles.</div>
            </div>

            <div class="credits-item">
              <div class="credits-item-title-row">
                <span class="credits-item-name">DeviceOrientation &amp; Motion</span>
                <span class="credits-item-license">Hardware Sensors</span>
              </div>
              <div class="credits-item-desc">Tri-axis physical gyroscopes, accelerometer sensor fusion, and tilt vectors for artificial horizon stabilization and 3D cockpit perspective.</div>
            </div>
          </div>
        </div>

        <!-- 3. WEB TONE GENERATOR & AUDIO SYNTHESIS -->
        <div class="credits-group">
          <div class="credits-group-header">
            <span style="color: #30d158;">🔊 Acoustic Synthesizer &amp; Web Tone Generators</span>
            <span class="credits-tag" style="background: rgba(48, 209, 88, 0.15); color: #30d158; border: 1px solid rgba(48, 209, 88, 0.3);">ZERO-SAMPLE SYNTH</span>
          </div>
          <div class="credits-item-list">
            <div class="credits-item">
              <div class="credits-item-title-row">
                <span class="credits-item-name">Web Audio API (<code>AudioContext</code>)</span>
                <span class="credits-item-license">Pure Code Synthesis</span>
              </div>
              <div class="credits-item-desc">Zero audio sample files, MP3s, or audio downloads. 100% mathematical procedural runtime sound generation engineered directly in code.</div>
              <div class="synth-waveforms">
                <span class="synth-waveform-pill">&sim; SINE (440&ndash;880Hz Radar Ping)</span>
                <span class="synth-waveform-pill">&#9109; SQUARE (120&ndash;240Hz Scanner Tick)</span>
                <span class="synth-waveform-pill">&#9651; TRIANGLE (55&ndash;110Hz Sub-Bass)</span>
                <span class="synth-waveform-pill">&#8896; SAWTOOTH (Avionics Drone)</span>
              </div>
            </div>

            <div class="credits-item">
              <div class="credits-item-title-row">
                <span class="credits-item-name">Dynamic Envelopes &amp; Velocity Pitch Modulation</span>
                <span class="credits-item-license">Parametric DSP</span>
              </div>
              <div class="credits-item-desc">Exponential ADSR gain shaping, anti-click micro-ramps, and dynamic range compression. Pitch frequencies dynamically modulate based on real-time vehicle GPS ground speed.</div>
            </div>
          </div>
        </div>

        <!-- 4. TYPOGRAPHY & CRT ENGINEERING -->
        <div class="credits-group">
          <div class="credits-group-header">
            <span style="color: #38bdf8;">🔤 Typography &amp; Terminal Engineering</span>
            <span class="credits-tag" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3);">FONTS &amp; CRT</span>
          </div>
          <div class="credits-item-list">
            <div class="credits-item">
              <div class="credits-item-title-row">
                <span class="credits-item-name"><a href="https://www.jetbrains.com/lp/mono/" target="_blank" rel="noopener noreferrer">JetBrains Mono</a></span>
                <span class="credits-item-license">OFL License</span>
              </div>
              <div class="credits-item-desc">Developer-focused monospace typeface designed for alphanumeric coordinates, hex readouts, and high-density telemetry data.</div>
            </div>

            <div class="credits-item">
              <div class="credits-item-title-row">
                <span class="credits-item-name"><a href="https://floriankarsten.com/space-grotesk" target="_blank" rel="noopener noreferrer">Space Grotesk</a></span>
                <span class="credits-item-license">OFL by Florian Karsten</span>
              </div>
              <div class="credits-item-desc">Geometric display sans-serif typeface used for aerospace cockpit headers, brand badges, and navigation HUD titles.</div>
            </div>

            <div class="credits-item">
              <div class="credits-item-title-row">
                <span class="credits-item-name">DEC VT220 Terminal CRT Matrix</span>
                <span class="credits-item-license">Retro Emulation</span>
              </div>
              <div class="credits-item-desc">Phosphor green persistence glow, CSS raster scanline shaders, and diagnostic telemetry matrix for the Geek Stats subsystem.</div>
            </div>
          </div>
        </div>

        <!-- 5. PHILOSOPHY & JOURNEY FEEDS -->
        <div class="credits-group">
          <div class="credits-group-header">
            <span style="color: #e2e8f0;">📜 Philosophy &amp; Journey Feeds</span>
            <span class="credits-tag" style="background: rgba(226, 232, 240, 0.12); color: #e2e8f0; border: 1px solid rgba(255, 255, 255, 0.2);">WISDOM APIS</span>
          </div>
          <div class="credits-item-list">
            <div class="credits-item">
              <div class="credits-item-title-row">
                <span class="credits-item-name"><a href="https://stoic.tekloon.net/" target="_blank" rel="noopener noreferrer">Stoic API</a></span>
                <span class="credits-item-license">Public API</span>
              </div>
              <div class="credits-item-desc">Ancient meditative reflections from Marcus Aurelius, Seneca, and Epictetus integrated into Road Trip and Digit travel feeds.</div>
            </div>

            <div class="credits-item">
              <div class="credits-item-title-row">
                <span class="credits-item-name">Quotable &amp; DummyJSON Quotes</span>
                <span class="credits-item-license">Public Endpoints</span>
              </div>
              <div class="credits-item-desc">Contextual voyage aphorisms for mindful cross-country driving journeys.</div>
            </div>
          </div>
        </div>

        <!-- 6. OFFLINE STORAGE & ARCHIVAL -->
        <div class="credits-group">
          <div class="credits-group-header">
            <span style="color: #10b981;">💾 Offline Architecture &amp; Archival</span>
            <span class="credits-tag" style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3);">PWA &amp; ZIP</span>
          </div>
          <div class="credits-item-list">
            <div class="credits-item">
              <div class="credits-item-title-row">
                <span class="credits-item-name">Service Worker &amp; Cache Storage API</span>
                <span class="credits-item-license">W3C Web Standard</span>
              </div>
              <div class="credits-item-desc">Zero-cloud offline map tile caching, font caching, and app shell persistence for autonomous flight without cellular connectivity.</div>
            </div>

            <div class="credits-item">
              <div class="credits-item-title-row">
                <span class="credits-item-name"><a href="https://stuk.github.io/jszip/" target="_blank" rel="noopener noreferrer">JSZip Engine</a></span>
                <span class="credits-item-license">MIT License</span>
              </div>
              <div class="credits-item-desc">Client-side file compression creating the offline standalone suite archive.</div>
            </div>
          </div>
        </div>

      </div>
    `;
  }

  // Storage Console with Download ZIP and Armed Purge Cache actions
  function buildStorageConsoleHTML() {
    return `
      <div class="modal-storage-console">
        <div class="storage-card card-zip" onclick="window.executeUnifiedZipDownload(event)" title="Tap to download standalone ZIP archive">
          <div class="storage-card-header">
            <span style="color: #10b981;">📦 STANDALONE SUITE ARCHIVE (.ZIP)</span>
            <span class="credits-tag" style="background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid #10b981;">1-TAP DOWNLOAD</span>
          </div>
          <div class="storage-card-desc">
            Downloads complete standalone offline codebase (1.3 MB) containing all 3 cockpits (Digit, Road Trip, Hyperspace), CRT visualizers, vector graphics &amp; offline maps.
          </div>
          <div class="storage-action-row">
            <button type="button" class="btn-storage-action btn-storage-download" id="btn-modal-download-zip" onclick="window.executeUnifiedZipDownload(event)">
              <span class="storage-btn-title" id="lbl-zip-btn-title">📦 DOWNLOAD SUITE ARCHIVE (.ZIP)</span>
              <span class="storage-btn-sub" id="lbl-zip-btn-sub">Tap here to download standalone 1.3 MB nomad_suite.zip</span>
            </button>
          </div>
        </div>

        <div class="storage-card card-purge" id="storage-purge-card" onclick="window.executeUnifiedPurge(event)" title="Tap to purge cache and reload">
          <div class="storage-card-header">
            <span style="color: #ff004f;">⚠️ HARDWARE CACHE PURGE &amp; RELOAD</span>
            <span class="credits-tag" style="background: rgba(255, 0, 79, 0.2); color: #ff004f; border: 1px solid #ff004f;">1-TAP REBOOT</span>
          </div>
          <div class="storage-card-desc">
            Unregisters service workers, purges disk &amp; memory cache, flushes stale code, and fetches fresh server files. (Blackbox flight logs preserved).
          </div>
          <div class="storage-action-row" id="purge-action-container">
            <button type="button" class="btn-storage-action btn-storage-purge" id="btn-modal-purge-cache" onclick="window.executeUnifiedPurge(event)">
              <span class="storage-btn-title" id="lbl-purge-btn-title">⚠️ PURGE CACHE &amp; HARD RELOAD (NOW)</span>
              <span class="storage-btn-sub" id="lbl-purge-btn-sub">Tap to instantly flush caches, drop service workers &amp; clean reboot</span>
            </button>
          </div>
        </div>

        <div class="storage-card" style="border-color: rgba(0, 243, 255, 0.25);">
          <div class="storage-card-header">
            <span style="color: #00f3ff;">📊 STORAGE &amp; OFFLINE TELEMETRY</span>
            <span class="credits-tag" style="background: rgba(0, 243, 255, 0.12); color: #00f3ff; border: 1px solid rgba(0, 243, 255, 0.3);">STATUS</span>
          </div>
          <div class="storage-telemetry-grid">
            <div class="storage-telem-cell">
              <div class="storage-telem-lbl">SERVICE WORKER</div>
              <div class="storage-telem-val">${('serviceWorker' in navigator) ? 'ACTIVE / READY' : 'UNAVAILABLE'}</div>
            </div>
            <div class="storage-telem-cell">
              <div class="storage-telem-lbl">CACHE STORAGE</div>
              <div class="storage-telem-val">${('caches' in window) ? 'W3C CACHE API' : 'LOCAL ONLY'}</div>
            </div>
            <div class="storage-telem-cell">
              <div class="storage-telem-lbl">OFFLINE ARCHIVE</div>
              <div class="storage-telem-val" style="color: #10b981;">NOMAD_SUITE.ZIP</div>
            </div>
            <div class="storage-telem-cell">
              <div class="storage-telem-lbl">BLACKBOX LOGS</div>
              <div class="storage-telem-val" style="color: #10b981;">SAFEGUARDED</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Switch between Tabs
  window.switchNomadModalTab = function(tabId) {
    const tabs = document.querySelectorAll('#about-modal .nomad-modal-tab');
    tabs.forEach(t => {
      const match = t.getAttribute('data-tab') === tabId;
      t.classList.toggle('active', match);
    });
    const panels = document.querySelectorAll('#about-modal .modal-tab-panel');
    panels.forEach(p => {
      const match = p.getAttribute('data-panel') === tabId;
      p.classList.toggle('active', match);
    });
  };

  // Generate and render the unified modal HTML
  function renderUnifiedMenuHTML(initialTab = null) {
    const context = getCockpitContext();
    const meta = COCKPIT_META[context] || COCKPIT_META.launcher;
    const creator = window.NOMAD_CREATOR || {
      name: 'BostonyFX',
      url: 'https://www.instagram.com/tony_bostony/'
    };
    const version = window.NOMAD_VERSION || 'v4.10152026.1650';

    let overlay = document.getElementById('about-modal');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'about-modal';
      document.body.appendChild(overlay);
    }
    const wasActive = overlay.classList.contains('active');
    overlay.className = 'modal-overlay nomad-unified-modal' + (wasActive ? ' active' : '');
    overlay.onclick = function(e) {
      if (e.target === overlay) window.closeAboutModal(e);
    };

    const isCockpit = (context !== 'launcher');
    const selectedTab = initialTab || (isCockpit ? 'cockpit' : 'credits');

    // ========================================================
    // SCENARIO 1: LAUNCH CONTROL / HOMEPAGE CONTEXT
    // Dedicate the modal directly to CREDITS, ATTRIBUTIONS & STORAGE TOOLS.
    // ========================================================
    if (!isCockpit) {
      overlay.innerHTML = `
        <div class="nomad-modal-box" onclick="event.stopPropagation()">
          <div class="nomad-modal-header-fixed">
            <button type="button" class="nomad-modal-x" onclick="window.closeAboutModal(event)" title="Close Settings">✕</button>

            <!-- Top Title Link to User Guide -->
            <a href="features.html" class="modal-title-link" title="View Full Documentation &amp; Features">
              <div class="modal-title" style="color: #38bdf8;">NOMAD: Avionics Suite ↗</div>
              <div class="modal-features-hint">SYSTEM ARCHITECTURE &amp; BILL OF MATERIALS</div>
            </a>

            <!-- Unified Creator Attribution -->
            <div class="modal-author">
              Crafted &amp; Architected by <a href="${creator.url || 'https://www.instagram.com/tony_bostony/'}" target="_blank" rel="noopener noreferrer">${creator.name}</a>
            </div>

            <!-- Mission & Architecture Statement -->
            <div class="modal-body" style="margin-top: 4px;">
              NOMAD is an independent, zero-dependency avionics navigation suite engineered for high-altitude telemetry, tactical cartography, and offline readiness.
            </div>
          </div>

          <!-- Top Segmented Tabs: Instantly visible at top of modal -->
          <div class="nomad-modal-tabs">
            <button type="button" class="nomad-modal-tab ${selectedTab !== 'storage' ? 'active' : ''}" data-tab="credits" onclick="window.switchNomadModalTab('credits')">
              <span>📜 CREDITS &amp; APIS</span>
            </button>
            <button type="button" class="nomad-modal-tab tab-storage ${selectedTab === 'storage' ? 'active' : ''}" data-tab="storage" onclick="window.switchNomadModalTab('storage')">
              <span>⚙️ STORAGE &amp; UTILITIES</span>
            </button>
          </div>

          <!-- TAB PANEL 1: CREDITS & BILL OF MATERIALS -->
          <div class="modal-tab-panel ${selectedTab !== 'storage' ? 'active' : ''}" data-panel="credits" id="modal-panel-credits">
            <!-- Shortcut Jump Banner -->
            <div class="credits-storage-jump-banner" onclick="window.switchNomadModalTab('storage')" title="Jump to Download ZIP &amp; Purge Cache">
              <span>⚙️ Looking for <strong>Download ZIP</strong> or <strong>Purge Cache</strong>?</span>
              <span style="color: #10b981; font-weight: 800; font-size: 0.60rem;">VIEW STORAGE TOOLS ➔</span>
            </div>

            <!-- Comprehensive Bill of Materials -->
            ${buildCreditsHTML()}
          </div>

          <!-- TAB PANEL 2: DEDICATED STORAGE CONSOLE (Buttons front and center!) -->
          <div class="modal-tab-panel ${selectedTab === 'storage' ? 'active' : ''}" data-panel="storage" id="modal-panel-storage">
            ${buildStorageConsoleHTML()}
          </div>

          <!-- Fixed Footer -->
          <div class="nomad-modal-footer-fixed">
            <button type="button" class="modal-close-btn" onclick="window.closeAboutModal(event)" style="margin: 0; padding: 6px 16px;">Close</button>
            <div class="modal-bottom-version nomad-version" id="nomad-modal-version">${version}</div>
          </div>
        </div>
      `;
      return;
    }

    // ========================================================
    // SCENARIO 2: ACTIVE COCKPIT CONTEXT (Hyperspace, Road Trip, Digit)
    // 3 Clean Segmented Tabs: [ 📟 COCKPIT & FX ] [ ⚙️ STORAGE & PURGE ] [ 📜 CREDITS & APIS ]
    // Zero cutoffs, guaranteed scrolling, and prominent buttons!
    // ========================================================
    const defaultBoot = localStorage.getItem('nomad_default_cockpit') || 'hyperspace';
    const isDefault = (defaultBoot === context);

    const switcherHTML = `
      <div class="modal-cockpit-section">
        <div class="modal-cockpit-header">COCKPITS &amp; LAUNCH CONTROL</div>
        <div class="modal-cockpit-grid">
          <a href="hyperspace.html" class="modal-cockpit-btn btn-hyperspace ${context === 'hyperspace' ? 'is-active' : ''}">
            🚀 HYPERSPACE
          </a>
          <a href="roadtrip.html" class="modal-cockpit-btn btn-roadtrip ${context === 'roadtrip' ? 'is-active' : ''}">
            🚗 ROAD TRIP
          </a>
          <a href="digit.html" class="modal-cockpit-btn btn-digit ${context === 'digit' ? 'is-active' : ''}">
            📟 DIGIT
          </a>
        </div>
        <a href="index.html" class="modal-home-launcher-btn" title="Return to Launch Control Home" onclick="window.returnToNomadLauncher && window.returnToNomadLauncher(event)">
          <span>🛰️ LAUNCH CONTROL (HOME) ↗</span>
        </a>
        <div class="modal-default-cockpit-wrap">
          <label class="modal-default-toggle">
            <input type="checkbox" id="chk-default-cockpit" ${isDefault ? 'checked' : ''} onchange="window.toggleUnifiedDefaultBoot('${context}')" />
            <span>★ Set ${meta.name.replace('NOMAD: ', '')} as Default Boot Cockpit</span>
          </label>
        </div>
      </div>
    `;

    // Audio and Kinetic Scanner toggle rows for DIGIT
    let audioHTML = '';
    let scannerHTML = '';
    if (context === 'digit') {
      const isSoundOn = (window.digitSoundEnabled !== false);
      const activeTheme = (typeof window.getCurrentNomadTheme === 'function' && window.getCurrentNomadTheme().name) || 'MATRIX';
      audioHTML = `
        <div class="digit-quick-hud-bar" style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px; padding:12px 14px; background:linear-gradient(135deg, rgba(0, 243, 255, 0.10), rgba(245, 158, 11, 0.10)); border:1.5px solid rgba(0, 243, 255, 0.5); border-radius:14px; box-shadow: 0 4px 18px rgba(0,0,0,0.5);">
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.68rem; font-weight:800; color:#00f3ff; letter-spacing:0.08em;">
            <span>⚡ DIGIT QUICK CONTROLS</span>
            <span style="font-size:0.58rem; padding:2px 6px; border-radius:4px; background:rgba(0, 243, 255, 0.2); color:#fff; font-weight:700;">HUD ACTIVE</span>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
            <button id="btn-audio-modal" type="button" class="modal-btn-row modal-audio-btn" onclick="window.toggleUnifiedAudio && window.toggleUnifiedAudio()" title="Toggle Avionics Audio" style="margin:0; padding:12px 10px; border-radius:10px; justify-content:space-between; background:rgba(0, 243, 255, 0.18); border:1.5px solid rgba(0, 243, 255, 0.6); cursor:pointer;">
              <span style="font-size:0.78rem; font-weight:800; letter-spacing:0.04em;">🔊 AUDIO</span>
              <span id="audio-modal-status" style="font-weight:900; color:#00f3ff; font-size:0.75rem; padding:2px 8px; border-radius:6px; background:rgba(0, 243, 255, 0.25);">${isSoundOn ? 'ON' : 'OFF'}</span>
            </button>
            <button id="btn-theme-modal" type="button" class="modal-btn-row" onclick="if (window.cycleNomadTheme) { const t = window.cycleNomadTheme(); const el = document.getElementById('lbl-theme-modal-name'); if (el) el.textContent = (t.name || 'THEME').split(' ')[0] + ' ⟳'; }" title="Cycle Color Theme" style="margin:0; padding:12px 10px; border-radius:10px; justify-content:space-between; background:rgba(245, 158, 11, 0.18); border:1.5px solid rgba(245, 158, 11, 0.6); cursor:pointer;">
              <span style="font-size:0.78rem; font-weight:800; letter-spacing:0.04em;">🎨 THEME</span>
              <span id="lbl-theme-modal-name" style="font-weight:900; color:#f59e0b; font-size:0.72rem; padding:2px 8px; border-radius:6px; background:rgba(245, 158, 11, 0.25);">${activeTheme.split(' ')[0]} ⟳</span>
            </button>
          </div>
        </div>
      `;

      const rawScanMode = localStorage.getItem('nomad_digit_scan_mode') || 'cascade';
      const scanMode = rawScanMode.toUpperCase();
      const currentTarget = localStorage.getItem('nomad_digit_scan_target') || 'lines';
      const scanTarget = currentTarget === 'lines' ? '10-STEP LINE CYCLE' : '5-STEP FULL OUTLINE';
      scannerHTML = `
        <div class="modal-scanner-console" style="display:flex; flex-direction:column; gap:8px; margin-bottom:8px; padding:10px 12px; background:rgba(0, 243, 255, 0.05); border:1.5px solid rgba(0, 243, 255, 0.28); border-radius:12px;">
          <div style="font-size:0.64rem; font-weight:800; color:#00f3ff; letter-spacing:0.08em; display:flex; justify-content:space-between; align-items:center;">
            <span>⚡ KINETIC OUTLINE SCANNER &amp; FX</span>
            <span style="font-size:0.56rem; padding:2px 6px; border-radius:4px; background:rgba(0, 243, 255, 0.18); border:1px solid rgba(0, 243, 255, 0.4); color:#fff; font-weight:700;">HUD ACTIVE</span>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px;">
            <button id="btn-suite-mode-cycle" type="button" class="modal-btn-row modal-scanner-btn" onclick="window.cycleUnifiedScanMode(event)" title="Cycle Scan Mode: Cascade ➔ Bounce ➔ Off" style="background: rgba(0, 243, 255, 0.12); border: 1px solid rgba(0, 243, 255, 0.45); padding: 8px 8px; border-radius: 8px; flex-direction: column; align-items: flex-start; gap: 2px;">
              <span style="font-size: 0.54rem; color: #94a3b8; font-weight: 700; letter-spacing: 0.06em;">FLOW PATTERN</span>
              <strong id="lbl-suite-scan-mode" style="color: #00f3ff; font-size: 0.72rem; letter-spacing: 0.04em;">${scanMode} ⟳</strong>
            </button>
            <button id="btn-suite-target-toggle" type="button" class="modal-btn-row modal-scanner-btn" onclick="window.toggleUnifiedScanTarget(event)" title="Toggle Geometry: 10-Step Lines vs 5-Step Full Outline" style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.45); padding: 8px 8px; border-radius: 8px; flex-direction: column; align-items: flex-start; gap: 2px;">
              <span style="font-size: 0.54rem; color: #94a3b8; font-weight: 700; letter-spacing: 0.06em;">GEOMETRY</span>
              <strong id="lbl-suite-scan-target" style="color: #10b981; font-size: 0.70rem; letter-spacing: 0.04em;">${currentTarget === 'lines' ? '10-LINES ⇄' : '5-FULL ⇄'}</strong>
            </button>
          </div>

          <button id="btn-scanner-modal-row" type="button" class="modal-btn-row modal-scanner-btn" onclick="if (window.closeAboutModal) window.closeAboutModal(); setTimeout(() => { if (window.openDigitScannerModal) window.openDigitScannerModal(); }, 60);" title="Open Full Kinetic Scanner &amp; Cadence Settings" style="background: linear-gradient(135deg, rgba(0, 243, 255, 0.18), rgba(245, 158, 11, 0.18)); border: 1.5px solid rgba(0, 243, 255, 0.55); color: #fff; padding: 10px 12px; border-radius: 8px; justify-content: space-between;">
            <span style="display:flex; align-items:center; gap:6px; font-weight:700; font-size:0.75rem;">⚡ ALL SCANNER &amp; SPEED SETTINGS</span>
            <span id="scanner-modal-status" style="font-weight: 800; color: #ffb703; font-size: 0.68rem; border: 1px solid rgba(255, 183, 3, 0.5); padding: 3px 8px; border-radius: 6px; background: rgba(255, 183, 3, 0.18);">OPEN ➔</span>
          </button>
        </div>
      `;
    }

    overlay.innerHTML = `
      <div class="nomad-modal-box" onclick="event.stopPropagation()">
        <!-- FIXED HEADER (Always accessible) -->
        <div class="nomad-modal-header-fixed">
          <button type="button" class="nomad-modal-x" onclick="window.closeAboutModal(event)" title="Close Settings">✕</button>

          <!-- Top Link to Documentation -->
          <a href="${meta.guideAnchor}" class="modal-title-link" title="View Features &amp; Guide">
            <div class="modal-title" style="color: ${meta.accentColor};">${meta.name} ↗</div>
            <div class="modal-features-hint">${meta.badge}</div>
          </a>

          <!-- Unified Creator Credit -->
          <div class="modal-author">
            by <a href="${creator.url || 'https://www.instagram.com/tony_bostony/'}" target="_blank" rel="noopener noreferrer" style="color: #f59e0b; font-weight: 700; text-decoration: none;">${creator.name}</a>
          </div>
        </div>

        <!-- Cockpit Segmented Tabs (Never cut off; easy navigation) -->
        <div class="nomad-modal-tabs">
          <button type="button" class="nomad-modal-tab ${selectedTab === 'cockpit' ? 'active' : ''}" data-tab="cockpit" onclick="window.switchNomadModalTab('cockpit')">
            <span>📟 COCKPIT &amp; FX</span>
          </button>
          <button type="button" class="nomad-modal-tab tab-storage ${selectedTab === 'storage' ? 'active' : ''}" data-tab="storage" onclick="window.switchNomadModalTab('storage')">
            <span>⚙️ STORAGE &amp; PURGE</span>
          </button>
          <button type="button" class="nomad-modal-tab ${selectedTab === 'credits' ? 'active' : ''}" data-tab="credits" onclick="window.switchNomadModalTab('credits')">
            <span>📜 CREDITS</span>
          </button>
        </div>

        <!-- TAB PANEL 1: COCKPIT & FX CONTROLS (SCROLLABLE WITH ZERO CUTOFFS) -->
        <div class="modal-tab-panel ${selectedTab === 'cockpit' ? 'active' : ''}" data-panel="cockpit" id="modal-panel-cockpit">
          <!-- Prominent Quick Controls for DIGIT (Audio & Theme right at top!) -->
          ${context === 'digit' ? audioHTML : ''}

          <!-- Cockpit Description -->
          <div class="modal-body">
            ${meta.desc}
          </div>

          <!-- Cockpit Switcher Section -->
          ${switcherHTML}

          <!-- Action Buttons Stack (Cockpit Context) -->
          <div class="modal-action-stack">
            ${scannerHTML}
            ${context !== 'digit' ? audioHTML : ''}
            <a href="visualizer.html?from=${context}" class="modal-btn-row modal-vis-btn">✨ VISUALIZER ARCADE ↗</a>
            <a href="geek-stats.html?from=${context}" class="modal-btn-row modal-stats-btn">&gt; GEEK STATS (VT220) _</a>
          </div>

          <!-- Shortcut Jump Banner to Storage Tab -->
          <div class="credits-storage-jump-banner" onclick="window.switchNomadModalTab('storage')" title="Jump to Download ZIP &amp; Purge Cache" style="margin-top: 4px;">
            <span>⚙️ Need <strong>Download ZIP</strong> or <strong>Purge Cache</strong>?</span>
            <span style="color: #10b981; font-weight: 800; font-size: 0.60rem;">VIEW STORAGE TOOLS ➔</span>
          </div>
        </div>

        <!-- TAB PANEL 2: SYSTEM STORAGE & HARDWARE PURGE (SCROLLABLE) -->
        <div class="modal-tab-panel ${selectedTab === 'storage' ? 'active' : ''}" data-panel="storage" id="modal-panel-storage">
          ${buildStorageConsoleHTML()}
        </div>

        <!-- TAB PANEL 3: CREDITS, APIS & BILL OF MATERIALS (SCROLLABLE) -->
        <div class="modal-tab-panel ${selectedTab === 'credits' ? 'active' : ''}" data-panel="credits" id="modal-panel-credits">
          ${buildCreditsHTML()}
        </div>

        <!-- FIXED FOOTER (Always visible at bottom, never cut off) -->
        <div class="nomad-modal-footer-fixed">
          <button type="button" class="modal-close-btn" onclick="window.closeAboutModal(event)" style="margin: 0; padding: 6px 16px;">Close</button>
          <div class="modal-bottom-version nomad-version" id="nomad-modal-version">${version}</div>
        </div>
      </div>
    `;
  }

  // Toggle default boot cockpit
  window.toggleUnifiedDefaultBoot = function(cockpitId) {
    const chk = document.getElementById('chk-default-cockpit');
    const isChecked = chk && chk.checked;
    const target = isChecked ? cockpitId : 'hyperspace';
    localStorage.setItem('nomad_default_cockpit', target);
    if (window.NomadCockpitEngine && typeof window.NomadCockpitEngine.setDefaultCockpitId === 'function') {
      window.NomadCockpitEngine.setDefaultCockpitId(target);
    }
    if (typeof window.showToast === 'function') {
      window.showToast(isChecked ? `★ ${cockpitId.toUpperCase()} SET AS DEFAULT BOOT` : `★ DEFAULT BOOT RESET`);
    }
  };

  // Toggle audio in DIGIT
  window.toggleUnifiedAudio = function() {
    window.digitSoundEnabled = !(window.digitSoundEnabled !== false);
    const label = document.getElementById('audio-modal-status');
    if (label) {
      label.textContent = window.digitSoundEnabled ? 'ON' : 'OFF';
      label.style.color = window.digitSoundEnabled ? '#00f3ff' : '#64748b';
    }
    if (typeof window.handleAudioClick === 'function') {
      window.handleAudioClick();
    }
    if (typeof window.showToast === 'function') {
      window.showToast(window.digitSoundEnabled ? 'AVIONICS AUDIO: ON' : 'AVIONICS AUDIO: OFF');
    }
  };

  // Cycle kinetic scan mode with audio, haptic, and HUD synchronization
  window.cycleUnifiedScanMode = function(e) {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    try {
      if (typeof window.playTone === 'function') window.playTone(1600);
      if ('vibrate' in navigator) navigator.vibrate(35);
    } catch (_) {}

    if (typeof window.cycleDigitScanMode === 'function') {
      window.cycleDigitScanMode();
    } else {
      const modes = ['cascade', 'bounce', 'off'];
      const cur = localStorage.getItem('nomad_digit_scan_mode') || 'cascade';
      const next = modes[(modes.indexOf(cur) + 1) % modes.length];
      localStorage.setItem('nomad_digit_scan_mode', next);
    }

    const newMode = (localStorage.getItem('nomad_digit_scan_mode') || 'cascade').toUpperCase();
    const lbl = document.getElementById('lbl-suite-scan-mode');
    if (lbl) lbl.textContent = `${newMode} ⟳`;
    if (typeof window.showToast === 'function') {
      window.showToast(`⚡ SCANNER FLOW: ${newMode}`);
    }
  };

  // Toggle kinetic scan target (10-Step Top/Bottom Lines vs 5-Step Full Outline)
  window.toggleUnifiedScanTarget = function(e) {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    try {
      if (typeof window.playTone === 'function') window.playTone(1400);
      if ('vibrate' in navigator) navigator.vibrate(40);
    } catch (_) {}

    if (typeof window.toggleDigitScanTarget === 'function') {
      window.toggleDigitScanTarget();
    } else {
      const cur = localStorage.getItem('nomad_digit_scan_target') || 'lines';
      const next = (cur === 'lines') ? 'full' : 'lines';
      localStorage.setItem('nomad_digit_scan_target', next);
    }

    const newTarget = localStorage.getItem('nomad_digit_scan_target') || 'lines';
    const lbl = document.getElementById('lbl-suite-scan-target');
    if (lbl) lbl.textContent = (newTarget === 'lines') ? '10-LINES ⇄' : '5-FULL ⇄';
    if (typeof window.showToast === 'function') {
      window.showToast(newTarget === 'lines' 
        ? '⚡ SCANNER: 10-STEP LINE CYCLE (TOP ➔ BTM BARS)' 
        : '⚡ SCANNER: 5-STEP FULL BLOCK OUTLINE');
    }
  };

  // Standalone ZIP Download execution with immediate direct download and user feedback
  window.executeUnifiedZipDownload = function(e) {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    try {
      if (typeof window.playTone === 'function') window.playTone(1760);
      if ('vibrate' in navigator) navigator.vibrate(50);
    } catch (_) {}

    const titleEl = document.getElementById('lbl-zip-btn-title');
    const subEl = document.getElementById('lbl-zip-btn-sub');
    if (titleEl) titleEl.textContent = '⏳ DOWNLOADING NOMAD_SUITE.ZIP...';
    if (subEl) subEl.textContent = 'Transferring package to device downloads...';

    if (typeof window.showToast === 'function') {
      window.showToast('📦 DOWNLOADING NOMAD_SUITE.ZIP (1.3 MB)...');
    }

    // Direct browser navigation triggers the browser download manager cleanly without popup blocker issues
    window.location.href = '/api/download-zip';

    setTimeout(() => {
      if (titleEl) titleEl.textContent = '📦 DOWNLOAD SUITE ARCHIVE (.ZIP)';
      if (subEl) subEl.textContent = 'Tap here to download standalone 1.3 MB nomad_suite.zip';
    }, 4500);
  };

  // Immediate Deep purge & hard reload: 100% client-side in-place reboot (works on GitHub Pages & AI Studio)
  window.executeUnifiedPurge = function(e) {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    try {
      if (typeof window.playTone === 'function') window.playTone(880);
      if ('vibrate' in navigator) navigator.vibrate([80, 50, 80]);
    } catch (_) {}

    const titleEl = document.getElementById('lbl-purge-btn-title');
    const subEl = document.getElementById('lbl-purge-btn-sub');
    if (titleEl) titleEl.textContent = '⚠️ PURGING ALL CACHES & REBOOTING NOW...';
    if (subEl) subEl.textContent = 'Unregistering workers, clearing disk cache & fetching fresh server build...';

    if (typeof window.showToast === 'function') {
      window.showToast('⚠️ PURGING ALL CACHES & REBOOTING NOW...');
    }

    setTimeout(async () => {
      try {
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          for (const reg of regs) {
            try { if (reg.active) reg.active.postMessage({ type: 'FORCE_PURGE' }); } catch (_) {}
            await reg.unregister();
          }
        }
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map(k => caches.delete(k)));
        }
        // Preserve critical flight and collision detection telemetry database & default cockpit
        const savedBlackbox = localStorage.getItem('nomad_blackbox_log');
        const savedDefault = localStorage.getItem('nomad_default_cockpit');
        localStorage.clear();
        sessionStorage.clear();
        if (savedBlackbox) {
          localStorage.setItem('nomad_blackbox_log', savedBlackbox);
        }
        if (savedDefault) {
          localStorage.setItem('nomad_default_cockpit', savedDefault);
        }
      } catch (err) {
        console.warn('Purge notice:', err);
      }

      // Revert to 100% Client-Side In-Place Reload:
      // Stay on the current page with a cache-busting timestamp query parameter.
      // Never navigate to a server-side /purge path or directory.
      try {
        const cleanUrl = new URL(window.location.href);
        if (cleanUrl.pathname.includes('/purge')) {
          cleanUrl.pathname = cleanUrl.pathname.replace(/\/purge\/?/g, '/');
          if (!cleanUrl.pathname || cleanUrl.pathname === '/') {
            cleanUrl.pathname = '/index.html';
          }
        }
        cleanUrl.searchParams.set('purge', Date.now().toString());
        window.location.replace(cleanUrl.toString());
      } catch (_) {
        window.location.reload(true);
      }
    }, 250);
  };

  // Open modal (accepts optional initial tab: 'cockpit', 'storage', or 'credits')
  window.openAboutModal = function(initialTab = null) {
    ensureMenuStyles();
    renderUnifiedMenuHTML(initialTab);
    const modal = document.getElementById('about-modal');
    if (modal) {
      modal.classList.add('active');
    }
  };

  // Close modal
  window.closeAboutModal = function(e) {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    const modal = document.getElementById('about-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  };

  // Escape key listener
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      window.closeAboutModal();
    }
  });

  // Export
  root.NomadMenuEngine = {
    open: window.openAboutModal,
    close: window.closeAboutModal,
    render: renderUnifiedMenuHTML
  };

})(window);
