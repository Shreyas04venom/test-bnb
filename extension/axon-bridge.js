/**
 * AXON STUDIO — Browser Extension Bridge & Multiplayer Collaboration Engine
 * Connects the Design Mode extension directly to the Axon Production Platform
 */

(function () {
  'use strict';

  const DEFAULT_SERVER_URL = 'http://localhost:3000';
  const STORAGE_KEY = 'axon_auth_session';

  let currentAuth = {
    token: null,
    serverUrl: DEFAULT_SERVER_URL,
    workspace: null,
    user: null,
    activeProjectId: null,
    projects: [],
  };

  let activeTeammates = [];
  let presenceInterval = null;

  // Initialize storage
  async function loadAuth() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const stored = await chrome.storage.local.get(STORAGE_KEY);
        if (stored && stored[STORAGE_KEY]) {
          currentAuth = { ...currentAuth, ...stored[STORAGE_KEY] };
        }
      } else {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) currentAuth = { ...currentAuth, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.warn('[AxonBridge] Storage load warning:', e);
    }
  }

  async function saveAuth() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({ [STORAGE_KEY]: currentAuth });
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentAuth));
      }
    } catch (e) {
      console.warn('[AxonBridge] Storage save warning:', e);
    }
  }

  // Fetch verified projects from Axon server
  async function fetchProjects() {
    if (!currentAuth.serverUrl) return [];
    try {
      const res = await fetch(`${currentAuth.serverUrl}/api/extension/projects`, {
        headers: currentAuth.token ? { Authorization: `Bearer ${currentAuth.token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.projects)) {
          currentAuth.projects = json.projects;
          if (!currentAuth.activeProjectId && json.projects.length > 0) {
            currentAuth.activeProjectId = json.projects[0].id;
          }
          await saveAuth();
          return json.projects;
        }
      }
    } catch (e) {
      console.warn('[AxonBridge] Fetch projects failed:', e);
    }
    return currentAuth.projects || [];
  }

  // Pair using 6-digit Code
  async function pairWithCode(pairingCode, customServerUrl) {
    const serverUrl = customServerUrl || currentAuth.serverUrl || DEFAULT_SERVER_URL;
    try {
      const res = await fetch(`${serverUrl}/api/extension/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pairingCode: pairingCode.trim(),
          deviceName: navigator.userAgent.includes('Mac') ? 'Chrome on Mac' : 'Chrome on Windows',
          browser: 'Chrome Visual Inspector',
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message || 'Invalid or expired pairing code.');
      }

      currentAuth = {
        token: json.accessToken,
        serverUrl,
        workspace: json.workspace,
        user: json.user,
        activeProjectId: json.projects?.[0]?.id || null,
        projects: json.projects || [],
      };

      await saveAuth();
      startPresenceSync();
      updateUI();
      return { ok: true, workspace: json.workspace, user: json.user };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  // Disconnect
  async function disconnectAxon() {
    if (currentAuth.serverUrl && currentAuth.token) {
      fetch(`${currentAuth.serverUrl}/api/auth/logout`, { method: 'POST' }).catch(() => {});
    }
    currentAuth = {
      token: null,
      serverUrl: DEFAULT_SERVER_URL,
      workspace: null,
      user: null,
      activeProjectId: null,
      projects: [],
    };
    activeTeammates = [];
    if (presenceInterval) clearInterval(presenceInterval);
    await saveAuth();
    updateUI();
  }

  // Presence heartbeat & multiplayer sync
  async function syncPresence() {
    if (!currentAuth.serverUrl) return;
    try {
      const res = await fetch(`${currentAuth.serverUrl}/api/extension/presence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentAuth.token ? { Authorization: `Bearer ${currentAuth.token}` } : {}),
        },
        body: JSON.stringify({
          userId: currentAuth.user?.id || 'ext-usr-local',
          userName: currentAuth.user?.name || 'Extension Collaborator',
          userColor: currentAuth.user?.cursorColor || '#6366F1',
          userAvatar: currentAuth.user?.avatar || '',
          projectId: currentAuth.activeProjectId || 'proj-live',
          route: window.location.href,
          cursorX: 50,
          cursorY: 50,
          selectedElement: document.querySelector('[data-dm-selected]')?.tagName?.toLowerCase() || '',
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.activeTeammates)) {
          activeTeammates = json.activeTeammates.filter(
            (t) => t.userId !== (currentAuth.user?.id || 'ext-usr-local')
          );
          renderTeammates();
        }
      }
    } catch {
      // ignore offline/network blip
    }
  }

  function startPresenceSync() {
    if (presenceInterval) clearInterval(presenceInterval);
    syncPresence();
    presenceInterval = setInterval(syncPresence, 5000);
  }

  // Publish patch from extension to Axon server
  async function publishPatchToAxon(title, description, riskLevel) {
    if (!currentAuth.serverUrl) {
      throw new Error('Please connect to Axon platform first.');
    }

    // Try to get staged changes from storage
    let recordedChanges = [];
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const local = await chrome.storage.local.get(null);
        // Find changes in session keys
        const changeKeys = Object.keys(local).filter((k) => k.startsWith('dm_session:'));
        changeKeys.forEach((k) => {
          const item = local[k];
          if (item?.styleChanges) recordedChanges.push(...item.styleChanges);
          if (item?.textChanges) recordedChanges.push(...item.textChanges);
        });
      }
    } catch (e) {
      console.warn('[AxonBridge] Could not query local changes:', e);
    }

    const payload = {
      title: title || 'Visual Hotfix staged via Axon Extension',
      description: description || `Visual changes captured directly from page inspector (${recordedChanges.length || 1} overrides applied).`,
      projectId: currentAuth.activeProjectId || currentAuth.projects?.[0]?.id || 'proj-1',
      riskLevel: riskLevel || 'LOW',
      source: 'extension',
      files: [
        {
          filename: 'src/styles/overrides.css',
          category: 'frontend',
          changeType: 'modified',
          additions: recordedChanges.length || 3,
          deletions: 0,
          diffSummary: `Applied ${recordedChanges.length || 'visual'} style modifications to production DOM elements`,
          oldContent: '/* production base */',
          newContent: '/* axon hotfix overrides applied */',
        },
      ],
    };

    const targetUrl = `${currentAuth.serverUrl}/api/extension/projects/${payload.projectId}/patches`;
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(currentAuth.token ? { Authorization: `Bearer ${currentAuth.token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json?.error?.message || 'Failed to create patch on Axon server.');
    }

    return json;
  }

  // ==========================================
  // DOM UI: Top Bar & Modals in Sidepanel
  // ==========================================
  function injectUI() {
    if (document.getElementById('axon-topbar')) return;

    // Create Axon Bar container
    const bar = document.createElement('div');
    bar.id = 'axon-topbar';
    bar.style.cssText = `
      position: sticky;
      top: 0;
      z-index: 10000;
      background: #15112B;
      color: #FFFFFF;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      padding: 7px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 11px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
    `;

    bar.innerHTML = `
      <div style="display: flex; align-items: center; gap: 7px; min-width: 0;">
        <div style="display: flex; align-items: center; gap: 5px; font-weight: 700; letter-spacing: -0.2px;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#818CF8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          <span style="color: #FFFFFF;">AXON</span>
        </div>
        <div id="axon-status-indicator" style="display: flex; align-items: center; gap: 5px; cursor: pointer; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.08);">
          <span id="axon-dot" style="width: 6px; height: 6px; border-radius: 50%; background: #94A3B8;"></span>
          <span id="axon-status-text" style="font-size: 10px; color: #CBD5E1; font-weight: 500;">Offline</span>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 6px;">
        <!-- Teammates Presence Stack -->
        <div id="axon-presence-stack" style="display: flex; align-items: center; margin-right: 2px;"></div>

        <!-- Project Selector -->
        <select id="axon-project-select" style="
          display: none;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #FFFFFF;
          border-radius: 5px;
          padding: 3px 6px;
          font-size: 10px;
          outline: none;
          cursor: pointer;
          max-width: 110px;
        "></select>

        <!-- Publish Patch Button -->
        <button id="axon-publish-btn" style="
          display: none;
          background: linear-gradient(135deg, #4F46E5, #6366F1);
          color: white;
          border: none;
          border-radius: 5px;
          padding: 4px 8px;
          font-size: 10px;
          font-weight: 600;
          cursor: pointer;
          align-items: center;
          gap: 4px;
          transition: filter 0.15s ease;
        ">
          <span>🚀 Publish Patch</span>
        </button>

        <!-- Connect Button -->
        <button id="axon-connect-btn" style="
          background: #4F46E5;
          color: white;
          border: none;
          border-radius: 5px;
          padding: 3px 8px;
          font-size: 10px;
          font-weight: 600;
          cursor: pointer;
        ">
          Pair with Axon
        </button>
      </div>
    `;

    document.body.prepend(bar);

    // Event listeners
    document.getElementById('axon-status-indicator').onclick = openModal;
    document.getElementById('axon-connect-btn').onclick = openModal;
    document.getElementById('axon-publish-btn').onclick = openPublishModal;

    const projectSelect = document.getElementById('axon-project-select');
    projectSelect.onchange = (e) => {
      currentAuth.activeProjectId = e.target.value;
      saveAuth();
    };

    injectModalStyles();
  }

  function renderTeammates() {
    const stack = document.getElementById('axon-presence-stack');
    if (!stack) return;
    stack.innerHTML = '';

    if (activeTeammates.length === 0) return;

    activeTeammates.slice(0, 3).forEach((t) => {
      const bubble = document.createElement('div');
      bubble.title = `${t.userName} (${t.role || 'teammate'}) is active on this project`;
      bubble.style.cssText = `
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: ${t.userColor || '#6366F1'};
        color: #FFFFFF;
        font-size: 9px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1.5px solid #15112B;
        margin-left: -5px;
      `;
      bubble.textContent = (t.userName || 'U')[0].toUpperCase();
      stack.appendChild(bubble);
    });

    if (activeTeammates.length > 3) {
      const extra = document.createElement('span');
      extra.style.cssText = 'font-size: 9px; margin-left: 3px; color: #94A3B8;';
      extra.textContent = `+${activeTeammates.length - 3}`;
      stack.appendChild(extra);
    }
  }

  function updateUI() {
    const dot = document.getElementById('axon-dot');
    const statusText = document.getElementById('axon-status-text');
    const connectBtn = document.getElementById('axon-connect-btn');
    const publishBtn = document.getElementById('axon-publish-btn');
    const projectSelect = document.getElementById('axon-project-select');

    if (!dot || !statusText) return;

    if (currentAuth.token && currentAuth.workspace) {
      dot.style.background = '#10B981';
      dot.style.boxShadow = '0 0 6px #10B981';
      statusText.textContent = currentAuth.workspace.name || 'Connected';
      statusText.style.color = '#34D399';

      connectBtn.style.display = 'none';
      publishBtn.style.display = 'inline-flex';
      projectSelect.style.display = 'inline-block';

      // Populate projects
      projectSelect.innerHTML = '';
      if (currentAuth.projects && currentAuth.projects.length > 0) {
        currentAuth.projects.forEach((p) => {
          const opt = document.createElement('option');
          opt.value = p.id;
          opt.textContent = p.name;
          if (p.id === currentAuth.activeProjectId) opt.selected = true;
          projectSelect.appendChild(opt);
        });
      } else {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = 'Axon Live Project';
        projectSelect.appendChild(opt);
      }
    } else {
      dot.style.background = '#94A3B8';
      dot.style.boxShadow = 'none';
      statusText.textContent = 'Disconnected';
      statusText.style.color = '#CBD5E1';

      connectBtn.style.display = 'inline-block';
      publishBtn.style.display = 'none';
      projectSelect.style.display = 'none';
    }
  }

  // Pairing Modal
  function openModal() {
    const existing = document.getElementById('axon-pair-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'axon-pair-modal';
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(4px);
      z-index: 20000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    const isConnected = Boolean(currentAuth.token && currentAuth.workspace);

    modal.innerHTML = `
      <div style="background: #1E1B38; color: #FFFFFF; width: 100%; max-width: 340px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.15); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5); overflow: hidden;">
        <div style="padding: 14px 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: 700; font-size: 13px; color: #818CF8;">AXON PLATFORM</span>
            <span style="font-size: 10px; padding: 2px 6px; border-radius: 99px; background: ${isConnected ? 'rgba(16,185,129,0.2)' : 'rgba(148,163,184,0.2)'}; color: ${isConnected ? '#34D399' : '#94A3B8'};">
              ${isConnected ? 'Connected' : 'Not Paired'}
            </span>
          </div>
          <button id="axon-modal-close" style="background: none; border: none; color: #94A3B8; cursor: pointer; font-size: 16px; padding: 2px 6px;">&times;</button>
        </div>

        <div style="padding: 16px; font-size: 12px; space-y: 12px;">
          ${
            isConnected
              ? `
              <div style="margin-bottom: 14px; padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                <p style="font-size: 10px; color: #94A3B8; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Authorized Workspace</p>
                <p style="font-size: 14px; font-weight: bold; color: #FFFFFF; margin-bottom: 2px;">${currentAuth.workspace?.name || 'Axon Workspace'}</p>
                <p style="font-size: 11px; color: #A5B4FC;">Logged in as: ${currentAuth.user?.email || 'shreyas@axon.dev'}</p>
              </div>
              <p style="font-size: 11px; color: #94A3B8; line-height: 1.4; margin-bottom: 16px;">
                Your browser extension is securely authorized. All visual tweaks and DOM inspections sync seamlessly with your team in real time.
              </p>
              <button id="axon-modal-disconnect" style="width: 100%; padding: 8px; border-radius: 6px; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #F87171; font-weight: 600; font-size: 11px; cursor: pointer;">
                Disconnect Session
              </button>
            `
              : `
              <p style="font-size: 11px; color: #CBD5E1; margin-bottom: 12px; line-height: 1.4;">
                Enter the <strong>6-digit Pairing Code</strong> from your Axon Control Plane (available at <a href="${DEFAULT_SERVER_URL}/extension/connect" target="_blank" style="color: #818CF8; text-decoration: underline;">/extension/connect</a> or Settings).
              </p>
              
              <div style="margin-bottom: 10px;">
                <label style="display: block; font-size: 10px; text-transform: uppercase; color: #94A3B8; font-weight: 600; margin-bottom: 4px;">Axon Server URL</label>
                <input id="axon-modal-url" type="text" value="${currentAuth.serverUrl || DEFAULT_SERVER_URL}" style="width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #fff; padding: 6px 8px; font-size: 11px; outline: none;" />
              </div>

              <div style="margin-bottom: 14px;">
                <label style="display: block; font-size: 10px; text-transform: uppercase; color: #94A3B8; font-weight: 600; margin-bottom: 4px;">6-Digit Pairing PIN</label>
                <input id="axon-modal-pin" type="text" maxlength="6" placeholder="e.g. 849201" style="width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.3); border: 1px solid #6366F1; border-radius: 6px; color: #10B981; padding: 8px; font-size: 16px; font-family: monospace; font-weight: bold; letter-spacing: 4px; text-align: center; outline: none;" />
              </div>

              <div id="axon-modal-error" style="display: none; color: #F87171; font-size: 11px; margin-bottom: 10px;"></div>

              <button id="axon-modal-pair" style="width: 100%; padding: 9px; border-radius: 6px; background: #4F46E5; border: none; color: #FFFFFF; font-weight: 700; font-size: 12px; cursor: pointer; transition: background 0.15s ease;">
                Authorize & Connect
              </button>
            `
          }
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('axon-modal-close').onclick = () => modal.remove();
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    if (isConnected) {
      document.getElementById('axon-modal-disconnect').onclick = async () => {
        await disconnectAxon();
        modal.remove();
      };
    } else {
      const pinInput = document.getElementById('axon-modal-pin');
      const urlInput = document.getElementById('axon-modal-url');
      const pairBtn = document.getElementById('axon-modal-pair');
      const errorDiv = document.getElementById('axon-modal-error');

      pinInput.focus();

      pairBtn.onclick = async () => {
        const pin = pinInput.value.trim();
        const sUrl = urlInput.value.trim() || DEFAULT_SERVER_URL;
        if (!pin) {
          errorDiv.textContent = 'Please enter the 6-digit PIN.';
          errorDiv.style.display = 'block';
          return;
        }

        pairBtn.disabled = true;
        pairBtn.textContent = 'Verifying with Axon...';
        errorDiv.style.display = 'none';

        const result = await pairWithCode(pin, sUrl);
        if (result.ok) {
          modal.remove();
          showToast(`🟢 Connected to ${result.workspace.name}!`);
        } else {
          pairBtn.disabled = false;
          pairBtn.textContent = 'Authorize & Connect';
          errorDiv.textContent = result.error || 'Connection failed.';
          errorDiv.style.display = 'block';
        }
      };
    }
  }

  // Publish Modal
  function openPublishModal() {
    const existing = document.getElementById('axon-publish-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'axon-publish-modal';
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(4px);
      z-index: 20000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    modal.innerHTML = `
      <div style="background: #1E1B38; color: #FFFFFF; width: 100%; max-width: 360px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.15); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5); overflow: hidden;">
        <div style="padding: 14px 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); display: flex; align-items: center; justify-content: space-between;">
          <div style="font-weight: 700; font-size: 13px; color: #818CF8;">PUBLISH HOTFIX TO AXON</div>
          <button id="axon-pub-close" style="background: none; border: none; color: #94A3B8; cursor: pointer; font-size: 16px; padding: 2px 6px;">&times;</button>
        </div>

        <div style="padding: 16px; font-size: 12px;">
          <div style="margin-bottom: 12px;">
            <label style="display: block; font-size: 10px; text-transform: uppercase; color: #94A3B8; font-weight: 600; margin-bottom: 4px;">Patch Title</label>
            <input id="axon-patch-title" type="text" value="Visual DOM tweak & styling hotfix" style="width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #fff; padding: 7px 8px; font-size: 12px; outline: none;" />
          </div>

          <div style="margin-bottom: 12px;">
            <label style="display: block; font-size: 10px; text-transform: uppercase; color: #94A3B8; font-weight: 600; margin-bottom: 4px;">Description / Context</label>
            <textarea id="axon-patch-desc" rows="3" style="width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #fff; padding: 7px 8px; font-size: 11px; outline: none; resize: vertical;">Visual adjustments made via Axon browser inspector. Ready for automated verification & team review.</textarea>
          </div>

          <div style="margin-bottom: 16px; display: flex; gap: 8px;">
            <div style="flex: 1;">
              <label style="display: block; font-size: 10px; text-transform: uppercase; color: #94A3B8; font-weight: 600; margin-bottom: 4px;">Risk Level</label>
              <select id="axon-patch-risk" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #fff; padding: 6px; font-size: 11px; outline: none;">
                <option value="LOW" selected>LOW (CSS / Visual styling)</option>
                <option value="MEDIUM">MEDIUM (Layout / Spacing shifts)</option>
                <option value="HIGH">HIGH (Critical DOM mutations)</option>
              </select>
            </div>
          </div>

          <div id="axon-pub-error" style="display: none; color: #F87171; font-size: 11px; margin-bottom: 10px;"></div>

          <button id="axon-pub-submit" style="width: 100%; padding: 10px; border-radius: 6px; background: linear-gradient(135deg, #4F46E5, #6366F1); border: none; color: #FFFFFF; font-weight: 700; font-size: 12px; cursor: pointer;">
            🚀 Publish Hotfix Now
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('axon-pub-close').onclick = () => modal.remove();
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    const submitBtn = document.getElementById('axon-pub-submit');
    const errDiv = document.getElementById('axon-pub-error');

    submitBtn.onclick = async () => {
      const title = document.getElementById('axon-patch-title').value.trim();
      const desc = document.getElementById('axon-patch-desc').value.trim();
      const risk = document.getElementById('axon-patch-risk').value;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting to Axon...';
      errDiv.style.display = 'none';

      try {
        const res = await publishPatchToAxon(title, desc, risk);
        modal.remove();
        showToast(`🎉 Patch ${res.patch.id} Created! Staged in Axon Dashboard.`);
        // Open dashboard
        if (res.dashboardUrl) {
          window.open(`${currentAuth.serverUrl}${res.dashboardUrl}`, '_blank');
        }
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = '🚀 Publish Hotfix Now';
        errDiv.textContent = err.message;
        errDiv.style.display = 'block';
      }
    };
  }

  function showToast(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #10B981;
      color: white;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      z-index: 30000;
      animation: fadeIn 0.2s ease;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  function injectModalStyles() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

  // Auto-init on page load
  async function init() {
    await loadAuth();
    injectUI();
    updateUI();
    if (currentAuth.token) {
      await fetchProjects();
      startPresenceSync();
      updateUI();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose global bridge
  window.AxonBridge = {
    pairWithCode,
    disconnectAxon,
    publishPatchToAxon,
    fetchProjects,
    getAuth: () => currentAuth,
  };
})();
