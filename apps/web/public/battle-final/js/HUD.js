/**
 * ============================================================
 * GALAXY ONLINE 2 - BATTLE HUD
 * Complete DOM-based HUD overlay for Phaser/Canvas games
 * Theme: Dark Space Sci-Fi with Glassmorphism
 * ============================================================
 */

/**
 * SVG Star icon for reuse across the HUD
 */
const STAR_SVG = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;

/**
 * Main BattleHUD class - manages all HUD elements
 */
class BattleHUD {
  /**
   * @param {Object} options - Configuration options
   * @param {HTMLElement} options.container - Parent container (game canvas parent)
   * @param {boolean} options.showLog - Whether to show battle log panel
   * @param {boolean} options.showControls - Whether to show controls bar
   */
  constructor(options = {}) {
    this.container = options.container || document.body;
    this._callbacks = {};
    this._isPaused = false;
    this._speed = 1;
    this._auto = false;
    this._round = 1;
    this._attacker = { name: '', level: 1, stars: 0, hp: 0, maxHp: 0 };
    this._defender = { name: '', level: 1, stars: 0, hp: 0, maxHp: 0 };
    this._logEntries = [];
    this._maxLogEntries = 100;
    this._elements = {};
    this._tooltipTimer = null;

    this._init();
  }

  /* ============================================================
     INITIALIZATION
     ============================================================ */

  /**
   * Initialize HUD - create DOM structure
   * @private
   */
  _init() {
    this._createContainer();
    this._createTopBar();
    this._createCenterDisplay();
    this._createBuffsRow();
    this._createControlsBar();
    this._createLogPanel();
    this._createOverlays();
    this._bindEvents();
    this._createCornerDecorations();
  }

  /**
   * Create main HUD container
   * @private
   */
  _createContainer() {
    this._hudEl = document.createElement('div');
    this._hudEl.id = 'go2-battle-hud';
    this._hudEl.style.width = '100%';
    this._hudEl.style.height = '100%';
    this._hudEl.style.position = 'absolute';
    this._hudEl.style.top = '0';
    this._hudEl.style.left = '0';
    this.container.appendChild(this._hudEl);
  }

  /**
   * Create corner decorations (sci-fi corners)
   * @private
   */
  _createCornerDecorations() {
    const tl = document.createElement('div');
    tl.className = 'hud-corner-tl';
    const tr = document.createElement('div');
    tr.className = 'hud-corner-tr';
    this._hudEl.appendChild(tl);
    this._hudEl.appendChild(tr);
  }

  /* ============================================================
     TOP BAR - ATTACKER & DEFENDER
     ============================================================ */

  /**
   * Create the top bar with both player sides
   * @private
   */
  _createTopBar() {
    const topBar = document.createElement('div');
    topBar.className = 'hud-top-bar';

    // Attacker side (left)
    this._attackerEl = this._createPlayerSide('attacker');
    topBar.appendChild(this._attackerEl);

    // Defender side (right)
    this._defenderEl = this._createPlayerSide('defender');
    topBar.appendChild(this._defenderEl);

    this._hudEl.appendChild(topBar);
    this._elements.topBar = topBar;
  }

  /**
   * Create a player side panel (attacker or defender)
   * @private
   * @param {string} side - 'attacker' or 'defender'
   * @returns {HTMLElement}
   */
  _createPlayerSide(side) {
    const isAttacker = side === 'attacker';
    const el = document.createElement('div');
    el.className = `hud-player-side ${side}`;

    // Portrait
    const portraitWrap = document.createElement('div');
    portraitWrap.className = 'hud-portrait-wrap';

    const portrait = document.createElement('div');
    portrait.className = 'hud-portrait';
    const initials = document.createElement('span');
    initials.className = 'initials';
    initials.textContent = '??';
    portrait.appendChild(initials);

    const portraitRing = document.createElement('div');
    portraitRing.className = 'hud-portrait-ring';
    portraitWrap.appendChild(portrait);
    portraitWrap.appendChild(portraitRing);

    // Player info
    const info = document.createElement('div');
    info.className = 'hud-player-info';

    const nameEl = document.createElement('div');
    nameEl.className = 'hud-player-name';
    nameEl.textContent = 'Unknown';

    const levelEl = document.createElement('div');
    levelEl.className = 'hud-player-level';
    levelEl.textContent = 'Lv.1';

    const starsRow = document.createElement('div');
    starsRow.className = 'hud-stars-row';

    // HP Section
    const hpSection = document.createElement('div');
    hpSection.className = 'hud-hp-section';

    const hpBarContainer = document.createElement('div');
    hpBarContainer.className = 'hud-hp-bar-container';

    const hpBarFill = document.createElement('div');
    hpBarFill.className = `hud-hp-bar-fill ${side}`;
    hpBarFill.style.width = '100%';

    const hpText = document.createElement('div');
    hpText.className = 'hud-hp-text';
    hpText.textContent = '0 / 0';

    hpBarContainer.appendChild(hpBarFill);
    hpBarContainer.appendChild(hpText);
    hpSection.appendChild(hpBarContainer);

    // HP Legend
    const hpLegend = document.createElement('div');
    hpLegend.className = 'hud-hp-legend';
    hpLegend.innerHTML = '<span>HP</span><span>Shield</span>';
    hpSection.appendChild(hpLegend);

    info.appendChild(nameEl);
    info.appendChild(levelEl);
    info.appendChild(starsRow);
    info.appendChild(hpSection);

    el.appendChild(portraitWrap);
    el.appendChild(info);

    // Store references
    this._elements[`${side}Name`] = nameEl;
    this._elements[`${side}Level`] = levelEl;
    this._elements[`${side}Stars`] = starsRow;
    this._elements[`${side}Portrait`] = portrait;
    this._elements[`${side}PortraitInitials`] = initials;
    this._elements[`${side}HPBar`] = hpBarFill;
    this._elements[`${side}HPText`] = hpText;
    this._elements[`${side}HPSection`] = hpSection;

    return el;
  }

  /**
   * Create center round display
   * @private
   */
  _createCenterDisplay() {
    const center = document.createElement('div');
    center.className = 'hud-center-display';

    const emblem = document.createElement('div');
    emblem.className = 'hud-round-emblem';

    const emblemOuter = document.createElement('div');
    emblemOuter.className = 'hud-emblem-outer';

    const emblemInner = document.createElement('div');
    emblemInner.className = 'hud-emblem-inner';

    const emblemRing = document.createElement('div');
    emblemRing.className = 'hud-emblem-ring';

    const roundLabel = document.createElement('div');
    roundLabel.className = 'hud-round-label';
    roundLabel.textContent = 'RONDA';

    const roundNumber = document.createElement('div');
    roundNumber.className = 'hud-round-number';
    roundNumber.textContent = '1';

    emblem.appendChild(emblemOuter);
    emblem.appendChild(emblemInner);
    emblem.appendChild(emblemRing);
    emblem.appendChild(roundLabel);
    emblem.appendChild(roundNumber);
    center.appendChild(emblem);

    // Battle timer
    const timer = document.createElement('div');
    timer.className = 'hud-timer';
    timer.textContent = '00:00';
    this._elements.timer = timer;

    this._hudEl.appendChild(center);
    this._hudEl.appendChild(timer);

    this._elements.roundLabel = roundLabel;
    this._elements.roundNumber = roundNumber;
    this._elements.centerDisplay = center;
  }

  /**
   * Create buffs/skills row below HP bars
   * @private
   */
  _createBuffsRow() {
    const buffsRow = document.createElement('div');
    buffsRow.className = 'hud-buffs-row';

    const leftGroup = document.createElement('div');
    leftGroup.className = 'hud-buffs-group left';

    const rightGroup = document.createElement('div');
    rightGroup.className = 'hud-buffs-group right';

    buffsRow.appendChild(leftGroup);
    buffsRow.appendChild(rightGroup);

    this._hudEl.appendChild(buffsRow);
    this._elements.buffsLeft = leftGroup;
    this._elements.buffsRight = rightGroup;
  }

  /* ============================================================
     CONTROLS BAR
     ============================================================ */

  /**
   * Create bottom controls bar with circular buttons
   * @private
   */
  _createControlsBar() {
    const controlsBar = document.createElement('div');
    controlsBar.className = 'hud-controls-bar';

    // Auto button
    this._btnAuto = this._createButton({
      className: 'hud-btn-auto',
      icon: '&#9654;',
      tooltip: 'Auto Battle',
      onClick: () => this._handleAutoClick()
    });

    // Speed button
    this._btnSpeed = this._createButton({
      className: 'hud-btn-speed',
      label: 'x1',
      tooltip: 'Battle Speed',
      onClick: () => this._handleSpeedClick()
    });

    // Separator
    const sep1 = document.createElement('div');
    sep1.className = 'hud-btn-separator';

    // Pause button
    this._btnPause = this._createButton({
      className: 'hud-btn-pause',
      icon: '&#9208;',
      tooltip: 'Pause',
      onClick: () => this._handlePauseClick()
    });

    // Info button
    this._btnInfo = this._createButton({
      className: 'hud-btn-info',
      icon: '&#8505;',
      tooltip: 'Battle Info',
      onClick: () => this._handleInfoClick()
    });

    // Log button
    this._btnLog = this._createButton({
      className: 'hud-btn-log',
      icon: '&#128203;',
      tooltip: 'Battle Log',
      onClick: () => this._handleLogClick()
    });

    // Separator
    const sep2 = document.createElement('div');
    sep2.className = 'hud-btn-separator';

    // Exit button
    this._btnExit = this._createButton({
      className: 'hud-btn-exit danger',
      icon: '&#10005;',
      tooltip: 'Exit Battle',
      onClick: () => this._handleExitClick()
    });

    controlsBar.appendChild(this._btnAuto);
    controlsBar.appendChild(this._btnSpeed);
    controlsBar.appendChild(sep1);
    controlsBar.appendChild(this._btnPause);
    controlsBar.appendChild(this._btnInfo);
    controlsBar.appendChild(this._btnLog);
    controlsBar.appendChild(sep2);
    controlsBar.appendChild(this._btnExit);

    this._hudEl.appendChild(controlsBar);
    this._elements.controlsBar = controlsBar;

    // Speed indicator
    const speedInd = document.createElement('div');
    speedInd.className = 'hud-speed-indicator';
    speedInd.textContent = 'x1';
    this._elements.speedIndicator = speedInd;
    this._hudEl.appendChild(speedInd);
  }

  /**
   * Create a circular control button
   * @private
   * @param {Object} opts - Button options
   * @returns {HTMLElement}
   */
  _createButton(opts) {
    const btn = document.createElement('button');
    btn.className = `hud-btn interactive ${opts.className || ''}`;
    btn.type = 'button';

    if (opts.icon) {
      const span = document.createElement('span');
      span.className = 'btn-icon';
      span.innerHTML = opts.icon;
      btn.appendChild(span);
    }

    if (opts.label) {
      const span = document.createElement('span');
      span.className = 'btn-label';
      span.textContent = opts.label;
      btn.appendChild(span);
    }

    if (opts.tooltip) {
      btn.title = opts.tooltip;
    }

    btn.addEventListener('click', opts.onClick);

    // Hover sound effect placeholder
    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'all 0.2s ease';
    });

    return btn;
  }

  /* ============================================================
     BATTLE LOG PANEL
     ============================================================ */

  /**
   * Create battle log panel (bottom-left)
   * @private
   */
  _createLogPanel() {
    const panel = document.createElement('div');
    panel.className = 'hud-log-panel';

    // Header
    const header = document.createElement('div');
    header.className = 'hud-log-header';

    const title = document.createElement('span');
    title.className = 'hud-log-title';
    title.textContent = 'Battle Log';

    const controls = document.createElement('div');
    controls.className = 'hud-log-controls';

    const clearBtn = document.createElement('button');
    clearBtn.className = 'hud-log-btn interactive';
    clearBtn.innerHTML = '&#128465;';
    clearBtn.title = 'Clear Log';
    clearBtn.addEventListener('click', () => this.clearLog());

    const collapseBtn = document.createElement('button');
    collapseBtn.className = 'hud-log-btn interactive';
    collapseBtn.innerHTML = '&#8211;';
    collapseBtn.title = 'Collapse';
    collapseBtn.addEventListener('click', () => {
      content.classList.toggle('hud-hidden');
    });

    controls.appendChild(clearBtn);
    controls.appendChild(collapseBtn);
    header.appendChild(title);
    header.appendChild(controls);

    // Content
    const content = document.createElement('div');
    content.className = 'hud-log-content';

    panel.appendChild(header);
    panel.appendChild(content);

    this._hudEl.appendChild(panel);
    this._elements.logPanel = panel;
    this._elements.logContent = content;
  }

  /* ============================================================
     OVERLAYS (Pause, Dialogs, Banners)
     ============================================================ */

  /**
   * Create overlay containers for pause, dialogs, etc.
   * @private
   */
  _createOverlays() {
    // Pause overlay (hidden by default)
    this._pauseOverlay = document.createElement('div');
    this._pauseOverlay.className = 'hud-pause-overlay hud-hidden';

    const pauseIcon = document.createElement('div');
    pauseIcon.className = 'pause-icon';
    pauseIcon.innerHTML = '&#9208;';

    const pauseText = document.createElement('div');
    pauseText.className = 'pause-text';
    pauseText.textContent = 'PAUSED';

    const pauseSub = document.createElement('div');
    pauseSub.className = 'pause-sub';
    pauseSub.textContent = 'Click to resume';

    this._pauseOverlay.appendChild(pauseIcon);
    this._pauseOverlay.appendChild(pauseText);
    this._pauseOverlay.appendChild(pauseSub);

    this._pauseOverlay.addEventListener('click', () => {
      this._handlePauseClick();
    });

    this._hudEl.appendChild(this._pauseOverlay);

    // Info panel (hidden by default)
    this._infoPanel = null;
  }

  /* ============================================================
     EVENT BINDING
     ============================================================ */

  /**
   * Bind global keyboard events
   * @private
   */
  _bindEvents() {
    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          this._handlePauseClick();
          break;
        case '1':
          this.setSpeed(1);
          break;
        case '2':
          this.setSpeed(2);
          break;
        case '4':
          this.setSpeed(4);
          break;
        case 'a':
        case 'A':
          this._handleAutoClick();
          break;
        case 'Escape':
          if (this._infoPanel) {
            this._closeInfoPanel();
          } else {
            this._handleExitClick();
          }
          break;
      }
    });
  }

  /* ============================================================
     PUBLIC API - TOP BAR
     ============================================================ */

  /**
   * Set attacker data
   * @param {string} name - Player name
   * @param {number} level - Player level
   * @param {number} stars - Number of stars (0-9)
   * @param {number} hp - Current HP
   * @param {number} maxHp - Maximum HP
   */
  setAttacker(name, level, stars, hp, maxHp) {
    this._attacker = { name, level, stars, hp, maxHp };
    this._updatePlayerDisplay('attacker', name, level, stars, hp, maxHp);
  }

  /**
   * Set defender data
   * @param {string} name - Player name
   * @param {number} level - Player level
   * @param {number} stars - Number of stars (0-9)
   * @param {number} hp - Current HP
   * @param {number} maxHp - Maximum HP
   */
  setDefender(name, level, stars, hp, maxHp) {
    this._defender = { name, level, stars, hp, maxHp };
    this._updatePlayerDisplay('defender', name, level, stars, hp, maxHp);
  }

  /**
   * Update a player side display
   * @private
   */
  _updatePlayerDisplay(side, name, level, stars, hp, maxHp) {
    // Name
    this._elements[`${side}Name`].textContent = name;

    // Level
    this._elements[`${side}Level`].textContent = `Lv.${level}`;

    // Initials
    const initials = name
      .split(/[\s_]+/)
      .map(w => w[0]?.toUpperCase())
      .filter(Boolean)
      .slice(0, 2)
      .join('') || '??';
    this._elements[`${side}PortraitInitials`].textContent = initials;

    // Stars
    this._setStars(side, stars);

    // HP
    this.updateHP(side, hp, maxHp);
  }

  /**
   * Render star icons
   * @private
   */
  _setStars(side, count) {
    const container = this._elements[`${side}Stars`];
    container.innerHTML = '';
    const maxStars = Math.min(Math.max(count, 0), 9);
    for (let i = 0; i < maxStars; i++) {
      const star = document.createElement('span');
      star.className = 'hud-star';
      star.innerHTML = STAR_SVG;
      container.appendChild(star);
    }
  }

  /**
   * Set current round number
   * @param {number} round - Round number
   */
  setRound(round) {
    this._round = round;
    this._elements.roundLabel.textContent = 'RONDA';
    this._elements.roundNumber.textContent = round.toString();
  }

  /**
   * Update HP bar for a side
   * @param {string} side - 'attacker' or 'defender'
   * @param {number} current - Current HP value
   * @param {number} max - Maximum HP value
   */
  updateHP(side, current, max) {
    const hpBar = this._elements[`${side}HPBar`];
    const hpText = this._elements[`${side}HPText`];

    const pct = max > 0 ? Math.max(0, (current / max) * 100) : 0;
    hpBar.style.width = `${pct}%`;
    hpText.textContent = `${this._formatNumber(current)} / ${this._formatNumber(max)}`;

    // Update stored data
    if (side === 'attacker') {
      this._attacker.hp = current;
      this._attacker.maxHp = max;
    } else {
      this._defender.hp = current;
      this._defender.maxHp = max;
    }
  }

  /* ============================================================
     PUBLIC API - CONTROLS
     ============================================================ */

  /**
   * Set paused state
   * @param {boolean} paused - Whether battle is paused
   */
  setPaused(paused) {
    this._isPaused = paused;
    this._btnPause.classList.toggle('active', paused);
    this._pauseOverlay.classList.toggle('hud-hidden', !paused);
  }

  /**
   * Set battle speed
   * @param {number} speed - Speed multiplier (1, 2, or 4)
   */
  setSpeed(speed) {
    const validSpeed = [1, 2, 4].includes(speed) ? speed : 1;
    this._speed = validSpeed;
    const label = `x${validSpeed}`;
    this._btnSpeed.querySelector('.btn-label').textContent = label;
    this._elements.speedIndicator.textContent = label;
  }

  /**
   * Set auto battle state
   * @param {boolean} auto - Whether auto battle is enabled
   */
  setAuto(auto) {
    this._auto = auto;
    this._btnAuto.classList.toggle('active', auto);
  }

  /**
   * Toggle log panel visibility
   */
  toggleLog() {
    this._elements.logPanel.classList.toggle('hud-hidden');
  }

  /**
   * Show log panel
   */
  showLog() {
    this._elements.logPanel.classList.remove('hud-hidden');
  }

  /**
   * Hide log panel
   */
  hideLog() {
    this._elements.logPanel.classList.add('hud-hidden');
  }

  /* ============================================================
     PUBLIC API - BATTLE LOG
     ============================================================ */

  /**
   * Add a message to the battle log
   * @param {string} message - Message text
   * @param {string} type - Message type: 'system'|'damage'|'critical'|'heal'|'round'|'kill'
   * @param {Object} options - Additional options
   * @param {boolean} options.showTime - Whether to prepend timestamp
   */
  addLog(message, type = 'system', options = {}) {
    const entry = document.createElement('div');
    entry.className = `hud-log-entry ${type}`;

    // Timestamp
    if (options.showTime !== false) {
      const time = document.createElement('span');
      time.className = 'log-time';
      time.textContent = this._getTimestamp();
      entry.appendChild(time);
    }

    // Type prefix
    const prefixes = {
      round: '[Ronda]',
      damage: '[Daño]',
      critical: '[Crítico]',
      heal: '[Cura]',
      kill: '[Eliminado]',
      system: '[Sistema]'
    };

    if (prefixes[type]) {
      const prefix = document.createElement('span');
      prefix.className = 'log-prefix';
      prefix.textContent = prefixes[type];
      entry.appendChild(prefix);
    }

    // Message text
    const text = document.createElement('span');
    text.textContent = message;
    entry.appendChild(text);

    this._elements.logContent.appendChild(entry);

    // Store entry
    this._logEntries.push({ message, type, time: Date.now() });

    // Trim log if too long
    if (this._logEntries.length > this._maxLogEntries) {
      this._logEntries.shift();
      if (this._elements.logContent.firstChild) {
        this._elements.logContent.removeChild(this._elements.logContent.firstChild);
      }
    }

    // Auto-scroll to bottom
    this._elements.logContent.scrollTop = this._elements.logContent.scrollHeight;

    return entry;
  }

  /**
   * Clear all log entries
   */
  clearLog() {
    this._logEntries = [];
    this._elements.logContent.innerHTML = '';
  }

  /**
   * Get formatted timestamp
   * @private
   */
  _getTimestamp() {
    const now = new Date();
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    return `${m}:${s}`;
  }

  /**
   * Format number with thousands separator
   * @private
   */
  _formatNumber(num) {
    return Math.round(num).toLocaleString('en-US');
  }

  /* ============================================================
     PUBLIC API - BUFFS / SKILLS
     ============================================================ */

  /**
   * Add a buff/skill icon to a side
   * @param {string} side - 'left' (attacker) or 'right' (defender)
   * @param {string} icon - Icon character/HTML
   * @param {string} type - 'skill' or 'buff'
   * @param {string} tooltip - Tooltip text
   * @param {number} cooldown - Cooldown percentage (0-100)
   * @returns {HTMLElement} The buff element
   */
  addBuff(side, icon, type = 'buff', tooltip = '', cooldown = 0) {
    const container = side === 'left' ? this._elements.buffsLeft : this._elements.buffsRight;

    const buffEl = document.createElement('div');
    buffEl.className = `hud-buff-icon ${type}`;
    buffEl.innerHTML = icon;
    buffEl.style.position = 'relative';

    if (tooltip) {
      buffEl.title = tooltip;
    }

    if (cooldown > 0) {
      const cd = document.createElement('div');
      cd.className = 'buff-cooldown';
      cd.style.height = `${cooldown}%`;
      buffEl.appendChild(cd);
    }

    container.appendChild(buffEl);
    return buffEl;
  }

  /**
   * Remove all buffs from a side
   * @param {string} side - 'left' or 'right'
   */
  clearBuffs(side) {
    const container = side === 'left' ? this._elements.buffsLeft : this._elements.buffsRight;
    container.innerHTML = '';
  }

  /**
   * Remove a specific buff element
   * @param {HTMLElement} buffEl - Buff element to remove
   */
  removeBuff(buffEl) {
    if (buffEl && buffEl.parentNode) {
      buffEl.parentNode.removeChild(buffEl);
    }
  }

  /* ============================================================
     PUBLIC API - ANIMATIONS
     ============================================================ */

  /**
   * Pulse HP bar animation
   * @param {string} side - 'attacker' or 'defender'
   */
  pulseHPBar(side) {
    const hpBar = this._elements[`${side}HPBar`];
    const portrait = this._elements[`${side}Portrait`];

    // Remove existing animation class
    hpBar.classList.remove('pulse');
    portrait.classList.remove('pulse');

    // Force reflow
    void hpBar.offsetWidth;

    // Add animation
    hpBar.classList.add('pulse');
    portrait.classList.add('pulse');

    // Remove after animation completes
    setTimeout(() => {
      hpBar.classList.remove('pulse');
      portrait.classList.remove('pulse');
    }, 1000);
  }

  /**
   * Flash damage effect on screen
   * @param {string} side - 'attacker' or 'defender'
   * @param {number} amount - Damage amount
   */
  flashDamage(side, amount) {
    // Screen flash
    const flash = document.createElement('div');
    flash.className = 'hud-damage-flash';
    flash.style.left = side === 'attacker' ? '0' : '50%';
    flash.style.width = '50%';
    this._hudEl.appendChild(flash);

    setTimeout(() => {
      if (flash.parentNode) flash.parentNode.removeChild(flash);
    }, 500);

    // HP bar pulse
    this.pulseHPBar(side);

    // Damage floater
    this._showDamageFloater(side, amount);
  }

  /**
   * Show damage number floating up
   * @private
   */
  _showDamageFloater(side, amount) {
    const floater = document.createElement('div');
    floater.className = 'hud-damage-floater damage';
    floater.textContent = `-${this._formatNumber(amount)}`;

    // Position near the respective HP bar
    const hpSection = this._elements[`${side}HPSection`];
    const rect = hpSection.getBoundingClientRect();
    const hudRect = this._hudEl.getBoundingClientRect();

    floater.style.left = `${rect.left - hudRect.left + rect.width / 2 - 30}px`;
    floater.style.top = `${rect.top - hudRect.top - 10}px`;

    this._hudEl.appendChild(floater);

    setTimeout(() => {
      if (floater.parentNode) floater.parentNode.removeChild(floater);
    }, 1200);
  }

  /**
   * Show healing floater
   * @param {string} side - 'attacker' or 'defender'
   * @param {number} amount - Heal amount
   */
  showHeal(side, amount) {
    const floater = document.createElement('div');
    floater.className = 'hud-damage-floater heal';
    floater.textContent = `+${this._formatNumber(amount)}`;

    const hpSection = this._elements[`${side}HPSection`];
    const rect = hpSection.getBoundingClientRect();
    const hudRect = this._hudEl.getBoundingClientRect();

    floater.style.left = `${rect.left - hudRect.left + rect.width / 2 + 10}px`;
    floater.style.top = `${rect.top - hudRect.top - 10}px`;

    this._hudEl.appendChild(floater);

    setTimeout(() => {
      if (floater.parentNode) floater.parentNode.removeChild(floater);
    }, 1200);
  }

  /**
   * Show critical hit floater
   * @param {string} side - 'attacker' or 'defender'
   * @param {number} amount - Damage amount
   */
  showCritical(side, amount) {
    const floater = document.createElement('div');
    floater.className = 'hud-damage-floater critical';
    floater.textContent = `CRIT -${this._formatNumber(amount)}!`;

    const hpSection = this._elements[`${side}HPSection`];
    const rect = hpSection.getBoundingClientRect();
    const hudRect = this._hudEl.getBoundingClientRect();

    floater.style.left = `${rect.left - hudRect.left + rect.width / 2 - 50}px`;
    floater.style.top = `${rect.top - hudRect.top - 20}px`;

    this._hudEl.appendChild(floater);

    // Screen shake
    this._hudEl.classList.add('hud-shake');
    setTimeout(() => {
      this._hudEl.classList.remove('hud-shake');
      if (floater.parentNode) floater.parentNode.removeChild(floater);
    }, 1200);
  }

  /**
   * Show round start banner
   * @param {number} round - Round number
   * @param {number} duration - How long to show (ms)
   */
  showRoundBanner(round, duration = 2000) {
    // Remove existing banner
    if (this._roundBanner) {
      this._roundBanner.classList.add('hiding');
      setTimeout(() => {
        if (this._roundBanner && this._roundBanner.parentNode) {
          this._roundBanner.parentNode.removeChild(this._roundBanner);
        }
      }, 400);
    }

    const banner = document.createElement('div');
    banner.className = 'hud-round-banner';

    const text = document.createElement('div');
    text.className = 'hud-banner-text';
    text.textContent = `RONDA ${round}`;

    const sub = document.createElement('div');
    sub.className = 'hud-banner-sub';
    sub.textContent = 'COMIENZA';

    banner.appendChild(text);
    banner.appendChild(sub);

    this._hudEl.appendChild(banner);
    this._roundBanner = banner;

    // Add log entry
    this.addLog(`Ronda ${round} comienza`, 'round');

    // Auto-hide
    setTimeout(() => {
      banner.classList.add('hiding');
      setTimeout(() => {
        if (banner.parentNode) banner.parentNode.removeChild(banner);
        if (this._roundBanner === banner) {
          this._roundBanner = null;
        }
      }, 400);
    }, duration);
  }

  /**
   * Show screen shake effect
   * @param {number} duration - Duration in ms
   */
  shakeScreen(duration = 400) {
    this._hudEl.classList.add('hud-shake');
    setTimeout(() => {
      this._hudEl.classList.remove('hud-shake');
    }, duration);
  }

  /* ============================================================
     CALLBACK HANDLERS
     ============================================================ */

  /**
   * @private
   */
  _handleAutoClick() {
    this._auto = !this._auto;
    this._btnAuto.classList.toggle('active', this._auto);
    this._emit('auto', this._auto);
  }

  /**
   * @private
   */
  _handlePauseClick() {
    this._isPaused = !this._isPaused;
    this.setPaused(this._isPaused);
    this._emit('pause', this._isPaused);
  }

  /**
   * @private
   */
  _handleSpeedClick() {
    const speeds = [1, 2, 4];
    const currentIdx = speeds.indexOf(this._speed);
    const nextIdx = (currentIdx + 1) % speeds.length;
    this.setSpeed(speeds[nextIdx]);
    this._emit('speed', this._speed);
  }

  /**
   * @private
   */
  _handleInfoClick() {
    this._toggleInfoPanel();
  }

  /**
   * @private
   */
  _handleLogClick() {
    this.toggleLog();
  }

  /**
   * @private
   */
  _handleExitClick() {
    this._showExitDialog();
  }

  /* ============================================================
     CALLBACK REGISTRATION
     ============================================================ */

  /**
   * Register callback for auto button click
   * @param {Function} callback - (enabled) => void
   */
  onAutoClick(callback) {
    this._callbacks.auto = callback;
  }

  /**
   * Register callback for pause button click
   * @param {Function} callback - (paused) => void
   */
  onPauseClick(callback) {
    this._callbacks.pause = callback;
  }

  /**
   * Register callback for speed button click
   * @param {Function} callback - (speed) => void
   */
  onSpeedClick(callback) {
    this._callbacks.speed = callback;
  }

  /**
   * Register callback for exit button click
   * @param {Function} callback - () => void
   */
  onExitClick(callback) {
    this._callbacks.exit = callback;
  }

  /**
   * Register callback for info button click
   * @param {Function} callback - () => void
   */
  onInfoClick(callback) {
    this._callbacks.info = callback;
  }

  /**
   * Emit event to registered callback
   * @private
   */
  _emit(event, data) {
    if (typeof this._callbacks[event] === 'function') {
      try {
        this._callbacks[event](data);
      } catch (e) {
        console.error(`HUD callback error for event "${event}":`, e);
      }
    }
  }

  /* ============================================================
     INFO PANEL
     ============================================================ */

  /**
   * Toggle info panel visibility
   * @private
   */
  _toggleInfoPanel() {
    if (this._infoPanel) {
      this._closeInfoPanel();
    } else {
      this._openInfoPanel();
    }
  }

  /**
   * Open info panel with battle statistics
   * @private
   */
  _openInfoPanel() {
    const panel = document.createElement('div');
    panel.className = 'hud-info-panel';

    // Header
    const header = document.createElement('div');
    header.className = 'hud-info-header';

    const title = document.createElement('span');
    title.className = 'hud-info-title';
    title.textContent = 'BATTLE INFO';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'hud-info-close interactive';
    closeBtn.innerHTML = '&#10005;';
    closeBtn.addEventListener('click', () => this._closeInfoPanel());

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Body
    const body = document.createElement('div');
    body.className = 'hud-info-body';

    // Attacker section
    body.appendChild(this._createInfoSection('Attacker', [
      { label: 'Name', value: this._attacker.name || 'Unknown' },
      { label: 'Level', value: `Lv.${this._attacker.level || 1}` },
      { label: 'HP', value: `${this._formatNumber(this._attacker.hp || 0)} / ${this._formatNumber(this._attacker.maxHp || 0)}` },
      { label: 'Stars', value: `${this._attacker.stars || 0} / 9` }
    ]));

    // Defender section
    body.appendChild(this._createInfoSection('Defender', [
      { label: 'Name', value: this._defender.name || 'Unknown' },
      { label: 'Level', value: `Lv.${this._defender.level || 1}` },
      { label: 'HP', value: `${this._formatNumber(this._defender.hp || 0)} / ${this._formatNumber(this._defender.maxHp || 0)}` },
      { label: 'Stars', value: `${this._defender.stars || 0} / 9` }
    ]));

    // Battle section
    body.appendChild(this._createInfoSection('Battle', [
      { label: 'Current Round', value: this._round },
      { label: 'Speed', value: `x${this._speed}` },
      { label: 'Auto', value: this._auto ? 'ON' : 'OFF' },
      { label: 'Log Entries', value: this._logEntries.length }
    ]));

    panel.appendChild(header);
    panel.appendChild(body);

    this._hudEl.appendChild(panel);
    this._infoPanel = panel;
  }

  /**
   * Create an info section for the info panel
   * @private
   */
  _createInfoSection(sectionTitle, rows) {
    const section = document.createElement('div');
    section.className = 'info-section';

    const title = document.createElement('div');
    title.className = 'info-section-title';
    title.textContent = sectionTitle;
    section.appendChild(title);

    rows.forEach(row => {
      const rowEl = document.createElement('div');
      rowEl.className = 'info-row';

      const label = document.createElement('span');
      label.className = 'info-label';
      label.textContent = row.label;

      const value = document.createElement('span');
      value.className = 'info-value';
      value.textContent = row.value;

      rowEl.appendChild(label);
      rowEl.appendChild(value);
      section.appendChild(rowEl);
    });

    return section;
  }

  /**
   * Close info panel
   * @private
   */
  _closeInfoPanel() {
    if (this._infoPanel && this._infoPanel.parentNode) {
      this._infoPanel.parentNode.removeChild(this._infoPanel);
      this._infoPanel = null;
    }
  }

  /* ============================================================
     EXIT DIALOG
     ============================================================ */

  /**
   * Show exit confirmation dialog
   * @private
   */
  _showExitDialog() {
    if (this._exitDialog) return;

    const overlay = document.createElement('div');
    overlay.className = 'hud-dialog-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'hud-dialog';

    const title = document.createElement('div');
    title.className = 'hud-dialog-title';
    title.textContent = 'Exit Battle?';

    const msg = document.createElement('div');
    msg.className = 'hud-dialog-msg';
    msg.textContent = 'Are you sure you want to leave the battle? Progress will be lost.';

    const buttons = document.createElement('div');
    buttons.className = 'hud-dialog-buttons';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'hud-dialog-btn interactive';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => this._closeExitDialog());

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'hud-dialog-btn confirm interactive';
    confirmBtn.textContent = 'Exit';
    confirmBtn.addEventListener('click', () => {
      this._closeExitDialog();
      this._emit('exit');
    });

    buttons.appendChild(cancelBtn);
    buttons.appendChild(confirmBtn);

    dialog.appendChild(title);
    dialog.appendChild(msg);
    dialog.appendChild(buttons);
    overlay.appendChild(dialog);

    this._hudEl.appendChild(overlay);
    this._exitDialog = overlay;
  }

  /**
   * Close exit dialog
   * @private
   */
  _closeExitDialog() {
    if (this._exitDialog && this._exitDialog.parentNode) {
      this._exitDialog.parentNode.removeChild(this._exitDialog);
      this._exitDialog = null;
    }
  }

  /* ============================================================
     TIMER
     ============================================================ */

  /**
   * Update battle timer display
   * @param {number} seconds - Elapsed seconds
   */
  setTimer(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    this._elements.timer.textContent = `${m}:${s}`;
  }

  /* ============================================================
     UTILITY / STATE
     ============================================================ */

  /**
   * Show the entire HUD
   */
  show() {
    this._hudEl.style.display = '';
    this._hudEl.style.opacity = '1';
  }

  /**
   * Hide the entire HUD
   */
  hide() {
    this._hudEl.style.opacity = '0';
  }

  /**
   * Completely destroy the HUD and remove all elements
   */
  destroy() {
    if (this._hudEl && this._hudEl.parentNode) {
      this._hudEl.parentNode.removeChild(this._hudEl);
    }
    this._callbacks = {};
    this._logEntries = [];
    this._elements = {};
  }

  /**
   * Get current state
   * @returns {Object}
   */
  getState() {
    return {
      isPaused: this._isPaused,
      speed: this._speed,
      auto: this._auto,
      round: this._round,
      attacker: { ...this._attacker },
      defender: { ...this._defender },
      logCount: this._logEntries.length
    };
  }

  /* ============================================================
     BATCH UPDATE
     ============================================================ */

  /**
   * Update HUD from a state object (useful for syncing with game)
   * @param {Object} state - State object with attacker, defender, round, etc.
   */
  updateFromState(state) {
    if (state.attacker) {
      const a = state.attacker;
      this.setAttacker(a.name, a.level, a.stars, a.hp, a.maxHp);
    }
    if (state.defender) {
      const d = state.defender;
      this.setDefender(d.name, d.level, d.stars, d.hp, d.maxHp);
    }
    if (state.round !== undefined) {
      this.setRound(state.round);
    }
    if (state.speed !== undefined) {
      this.setSpeed(state.speed);
    }
    if (state.paused !== undefined) {
      this.setPaused(state.paused);
    }
    if (state.auto !== undefined) {
      this.setAuto(state.auto);
    }
    if (state.timer !== undefined) {
      this.setTimer(state.timer);
    }
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BattleHUD;
}
if (typeof window !== 'undefined') {
  window.BattleHUD = BattleHUD;
}
