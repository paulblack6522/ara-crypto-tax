/* ==========================================================================
   Ara Tax Services LLC — lander2.js
   --------------------------------------------------------------------------
   The short qualifying form + callback booking on index.html. Loaded only by
   that page. (It was lander-2.html until 2026-08-05, when the long intake
   wizard was retired and this lander became the home page.)

   Vanilla JavaScript. No dependencies, no network requests, no analytics, no
   trackers, no cookies. Nothing in this file sends anything anywhere.

   Provides:
     1. Timezone           — the VISITOR chooses a US zone (Eastern / Central /
                             Mountain / Pacific). Nothing is auto-detected.
     2. Callback slots      — five rolling "next available" times, anchored to the
                             firm's business hours (Mon-Fri, 09:00-17:00 Pacific)
                             and shown in the zone the visitor picked.
     3. "Another time"     — reveals a native date + time when chosen.
     3b. "Other: please specify" on the exchanges/wallets question — reveals a
                             free-text box, required while it is ticked.
     4. "Call me now"      — an immediate-callback request: a green "assigning a
                             preparer" waiting overlay that resolves to a plain
                             confirmation. It does NOT place a live call in the
                             browser; a real deployment wires it to the firm's
                             telephony / click-to-call and drives the connected
                             state from there.
     5. Validation         — inline errors, aria-invalid, focus move, error summary.
     6. Submit             — preventDefault always; opens the confirmation modal.
                             Nothing is sent.

   A real deployment replaces the submit and call-now handlers with a POST to the
   firm's own server over HTTPS, and MUST NOT log the payload. See README.md.
   ========================================================================== */

(function () {
  'use strict';

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  var form = document.getElementById('callback-form');
  if (!form) { return; }

  var FIRM_TZ = 'America/Los_Angeles';   /* San Ramon, California */
  var BUFFER_MS = 2 * 60 * 60 * 1000;    /* earliest offered slot is 2h out */
  var STEP_MS = 30 * 60 * 1000;          /* :00 / :30 */
  var SLOT_COUNT = 5;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /* US display zones. The visitor picks one; nothing is detected. */
  var ZONES = {
    ET: { label: 'Eastern (ET)',  iana: 'America/New_York' },
    CT: { label: 'Central (CT)',  iana: 'America/Chicago' },
    MT: { label: 'Mountain (MT)', iana: 'America/Denver' },
    PT: { label: 'Pacific (PT)',  iana: 'America/Los_Angeles' }
  };

  var slotInstants = [];          /* fixed Date instants for the five slots */
  var slotLabels = {};            /* iso -> friendly label in the chosen zone */

  function zoneKey() {
    var sel = $('[data-tz-select]', form);
    var k = sel ? sel.value : 'ET';
    return ZONES[k] ? k : 'ET';
  }
  function zone() { return ZONES[zoneKey()]; }


  /* ---------------------------------------------------------------------- */
  /* 1. Callback slots                                                       */
  /* ---------------------------------------------------------------------- */

  function partsIn(date, tz) {
    var fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', weekday: 'short'
    });
    var out = {};
    fmt.formatToParts(date).forEach(function (p) { out[p.type] = p.value; });
    var h = parseInt(out.hour, 10);
    if (h === 24) { h = 0; }
    return { y: +out.year, mo: +out.month, d: +out.day, h: h,
             mi: parseInt(out.minute, 10), wd: out.weekday };
  }

  var WEEKDAYS = { Mon: 1, Tue: 1, Wed: 1, Thu: 1, Fri: 1 };

  function isFirmHour(date) {
    var p = partsIn(date, FIRM_TZ);
    return WEEKDAYS[p.wd] === 1 && p.h >= 9 && p.h < 17;   /* 09:00 .. 16:30 start */
  }

  /* Day label in the CHOSEN zone: Today / Tomorrow / "Mon, Aug 3". */
  function dayLabel(date, tz) {
    var opt = { timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric' };
    var today = new Date();
    var tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    var d = date.toLocaleDateString('en-US', opt);
    if (d === today.toLocaleDateString('en-US', opt)) { return 'Today'; }
    if (d === tomorrow.toLocaleDateString('en-US', opt)) { return 'Tomorrow'; }
    return date.toLocaleDateString('en-US', { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric' });
  }
  function timeLabel(date, tz) {
    return date.toLocaleTimeString('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' });
  }

  function computeInstants() {
    var slots = [];
    var start = new Date(Date.now() + BUFFER_MS);
    start = new Date(Math.ceil(start.getTime() / STEP_MS) * STEP_MS);
    var t = start.getTime();
    var guard = 0;
    while (slots.length < SLOT_COUNT && guard < 24 * 60 * 14 / 30) { /* ~2 weeks of 30-min steps */
      var d = new Date(t);
      if (isFirmHour(d)) { slots.push(d); }
      t += STEP_MS;
      guard += 1;
    }
    return slots;
  }

  /* Build the slot radios once. Labels are (re)written by relabelSlots(). */
  function buildSlots() {
    var grid = $('[data-slotgrid]', form);
    if (!grid) { return; }
    slotInstants = computeInstants();
    grid.innerHTML = '';
    slotInstants.forEach(function (date, i) {
      var wrap = document.createElement('div');
      wrap.className = 'us-slot';
      var input = document.createElement('input');
      input.className = 'us-slot__input';
      input.type = 'radio';
      input.name = 'callback_slot';
      input.id = 'slot-' + i;
      input.value = date.toISOString();
      input.setAttribute('data-slot', '');
      var label = document.createElement('label');
      label.className = 'us-slot__label';
      label.setAttribute('for', 'slot-' + i);
      label.innerHTML = '<span class="us-slot__time"></span><span class="us-slot__day"></span>';
      wrap.appendChild(input);
      wrap.appendChild(label);
      grid.appendChild(wrap);
    });
  }

  /* Rewrite every slot's visible label + the label map for the chosen zone. */
  function relabelSlots() {
    var z = zone();
    slotLabels = {};
    $all('[data-slot]', form).forEach(function (input, i) {
      var date = slotInstants[i];
      var day = dayLabel(date, z.iana);
      var time = timeLabel(date, z.iana);
      slotLabels[input.value] = day + ' at ' + time + ' ' + zoneKey();
      var label = input.nextElementSibling;
      label.querySelector('.us-slot__time').textContent = time;
      label.querySelector('.us-slot__day').textContent = day;
    });
    var tzNote = $('[data-tz]', form);
    var tzName = $('[data-tz-name]', form);
    if (tzNote && tzName) {
      tzName.textContent = z.label;
      tzNote.removeAttribute('hidden');
    }
  }

  function initSlots() {
    buildSlots();
    relabelSlots();

    var whenPanel = $('[data-when]', form);
    var otherRadio = $('[data-slot-other]', form);
    var dateInput = $('[data-when-date]', form);

    function syncWhen() {
      if (!whenPanel || !otherRadio) { return; }
      if (otherRadio.checked) {
        whenPanel.removeAttribute('hidden');
        if (dateInput) { dateInput.focus(); }
      } else {
        whenPanel.setAttribute('hidden', '');
      }
    }
    $all('input[name="callback_slot"]', form).forEach(function (r) {
      r.addEventListener('change', syncWhen);
    });

    var tzSelect = $('[data-tz-select]', form);
    if (tzSelect) { tzSelect.addEventListener('change', relabelSlots); }

    if (dateInput) {
      var now = new Date();
      dateInput.setAttribute('min',
        now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0'));
    }
  }


  /* ---------------------------------------------------------------------- */
  /* 1b. "Other: please specify" on the exchanges / wallets question          */
  /* ---------------------------------------------------------------------- */
  /* Ticking the last option reveals a free-text box, the same way "Another
     time" reveals a date and time. The box is only required while the option
     is ticked; unticking it clears the text so a stale value cannot be sent. */

  function initVenueOther() {
    var box = $('[data-venue-other]', form);
    var panel = $('[data-venue-otherpanel]', form);
    var text = $('[data-venue-othertext]', form);
    if (!box || !panel) { return; }

    function sync(focusIt) {
      if (box.checked) {
        panel.removeAttribute('hidden');
        if (focusIt && text) { text.focus(); }
      } else {
        panel.setAttribute('hidden', '');
        if (text) { text.value = ''; }
      }
    }

    box.addEventListener('change', function () { sync(true); });
    sync(false);   /* respects a value restored by the browser on a back/refresh */
  }


  /* ---------------------------------------------------------------------- */
  /* 2. Validation                                                           */
  /* ---------------------------------------------------------------------- */

  var errorSeq = 0;
  function controlsOf(group) { return $all('input, select, textarea', group); }
  function isChoice(c) { return c.type === 'checkbox' || c.type === 'radio'; }

  function describedBy(el, errorId, add) {
    if (!el) { return; }
    if (!el.hasAttribute('data-db-base')) {
      el.setAttribute('data-db-base', el.getAttribute('aria-describedby') || '');
    }
    var base = el.getAttribute('data-db-base');
    var value = add ? (base ? base + ' ' + errorId : errorId) : base;
    if (value) { el.setAttribute('aria-describedby', value); }
    else { el.removeAttribute('aria-describedby'); }
  }

  function clearError(group) {
    if (!group) { return; }
    group.classList.remove('us-form-group--error');
    var message = $('.us-error-message', group);
    if (message) {
      describedBy($('[data-group]', group), message.id, false);
      message.parentNode.removeChild(message);
    }
    controlsOf(group).forEach(function (c) {
      c.removeAttribute('aria-invalid');
      c.classList.remove('us-input--error', 'us-select--error', 'us-textarea--error');
      if (message) { describedBy(c, message.id, false); }
    });
  }

  function showError(group, text) {
    clearError(group);
    errorSeq += 1;
    var id = 'lander-error-' + errorSeq;
    var message = document.createElement('span');
    message.className = 'us-error-message';
    message.id = id;
    message.textContent = text;
    group.classList.add('us-form-group--error');
    var fieldset = $('[data-group]', group);
    var controls = controlsOf(group);
    if (fieldset) {
      var list = $('[data-choice-list]', fieldset);
      if (list) { fieldset.insertBefore(message, list); }
      else { fieldset.appendChild(message); }
      describedBy(fieldset, id, true);
      controls.forEach(function (c) { c.setAttribute('aria-invalid', 'true'); });
    } else if (controls.length) {
      var first = controls[0];
      first.parentNode.insertBefore(message, first);
      first.setAttribute('aria-invalid', 'true');
      first.classList.add(first.tagName === 'TEXTAREA' ? 'us-textarea--error' : 'us-input--error');
      describedBy(first, id, true);
    }
    /* A group may name the control that should take focus for this particular
       error (see the "Other: please specify" case). Otherwise it is the first. */
    var focusSel = group.getAttribute('data-error-focus');
    var preferred = focusSel ? $(focusSel, group) : null;
    return preferred || (controls.length ? controls[0] : null);
  }

  function problemWith(group) {
    var name = group.getAttribute('data-name');
    var required = group.hasAttribute('data-required');
    var message = group.getAttribute('data-error') || 'This field is required.';
    var controls = controlsOf(group);
    if (!controls.length) { return null; }
    var first = controls[0];

    /* At least one venue ticked; and if "Other" is ticked, it has to be named.
       Checked before the generic choice branch, because this group mixes
       checkboxes with a text input. */
    if (name === 'venues') {
      group.removeAttribute('data-error-focus');
      var ticked = $all('input[name="venues"]', group).filter(function (c) { return c.checked; });
      if (!ticked.length) { return message; }
      var otherBox = $('[data-venue-other]', group);
      var otherText = $('[data-venue-othertext]', group);
      if (otherBox && otherBox.checked && (!otherText || !(otherText.value || '').trim())) {
        /* Send focus to the box they have to fill in, not back to the first tickbox. */
        group.setAttribute('data-error-focus', '[data-venue-othertext]');
        return 'Name the other exchange or wallet, or untick Other.';
      }
      return null;
    }

    if (name === 'callback_slot') {
      var chosen = $all('input[name="callback_slot"]', group).filter(function (r) { return r.checked; })[0];
      if (!chosen) { return message; }
      if (chosen.value === 'other') {
        var d = $('[data-when-date]', form);
        var t = $('[data-when-time]', form);
        if (!d || !t || !d.value || !t.value) { return 'Enter a date and time for your call.'; }
      }
      return null;
    }
    if (isChoice(first)) {
      var any = controls.some(function (c) { return c.checked; });
      if (required && !any) { return message; }
      return null;
    }
    var value = (first.value || '').trim();
    if (required && !value) { return message; }
    if (first.type === 'email' && value && !EMAIL_RE.test(value)) {
      return 'Enter an email address in the form name@example.com.';
    }
    return null;
  }

  function summaryEl() {
    var el = $('[data-form-summary]', form);
    if (el) { return el; }
    el = document.createElement('div');
    el.className = 'us-alert us-alert--error';
    el.setAttribute('data-form-summary', '');
    el.setAttribute('role', 'alert');
    el.setAttribute('hidden', '');
    el.innerHTML = '<div class="us-alert__body"><p class="us-alert__text" data-form-summary-text></p></div>';
    form.insertBefore(el, form.firstChild);
    return el;
  }

  /* skip: array of data-name values not to validate (e.g. the slot, for Call me now) */
  function validateAll(skip) {
    skip = skip || [];
    var groups = $all('[data-field]', form).filter(function (g) {
      return !g.hasAttribute('hidden') && skip.indexOf(g.getAttribute('data-name')) === -1;
    });
    var firstBad = null;
    var count = 0;
    groups.forEach(function (group) {
      var problem = problemWith(group);
      if (problem) {
        count += 1;
        var control = showError(group, problem);
        if (!firstBad) { firstBad = { control: control, group: group }; }
      } else {
        clearError(group);
      }
    });
    var summary = summaryEl();
    var summaryText = $('[data-form-summary-text]', summary);
    if (!count) { summary.setAttribute('hidden', ''); return true; }
    summaryText.textContent = count === 1
      ? 'There is 1 answer to complete before you can send this.'
      : 'There are ' + count + ' answers to complete before you can send this.';
    summary.removeAttribute('hidden');
    if (firstBad && firstBad.control) {
      try { firstBad.control.focus({ preventScroll: true }); }
      catch (e) { firstBad.control.focus(); }
      var errEl = firstBad.group.querySelector('.us-error-message') || firstBad.group;
      if (errEl.scrollIntoView) { errEl.scrollIntoView({ block: 'center' }); }
    }
    return false;
  }


  /* ---------------------------------------------------------------------- */
  /* 3. Scheduled submit — demo only, nothing leaves the page                */
  /* ---------------------------------------------------------------------- */

  function chosenWhen() {
    var chosen = $all('input[name="callback_slot"]', form).filter(function (r) { return r.checked; })[0];
    if (!chosen) { return ''; }
    if (chosen.value === 'other') {
      var d = $('[data-when-date]', form);
      var t = $('[data-when-time]', form);
      if (d && t && d.value && t.value) {
        var dt = new Date(d.value + 'T' + t.value);
        var nice = isNaN(dt.getTime())
          ? (d.value + ' at ' + t.value)
          : dt.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
        return ': ' + nice + ' ' + zoneKey();
      }
      return '';
    }
    var label = slotLabels[chosen.value];
    return label ? ': ' + label : '';
  }

  function phoneValue() {
    var el = $('#cb-phone', form);
    return el ? (el.value || '').trim() : '';
  }

  function submit() {
    if (!validateAll()) { return; }
    var when = $('[data-confirm-when]');
    if (when) { when.textContent = chosenWhen(); }
    if (window.AraSite && typeof window.AraSite.openModal === 'function') {
      window.AraSite.openModal('callback-confirm');
    }
  }


  /* ---------------------------------------------------------------------- */
  /* 4. "Call me now" — immediate-callback request                           */
  /* ---------------------------------------------------------------------- */
  /* The waiting overlay is a placeholder for a real telephony / click-to-call
     back end. In this build no call is placed; after a short "assigning" wait it
     resolves to a plain confirmation that a preparer will call the number given.
     It never claims a live call has connected. */

  var callTimer = null;

  function initCallNow() {
    var overlay = document.getElementById('calling');
    var btn = $('[data-call-now]', form);
    if (!overlay || !btn) { return; }

    var waitBlock = $('[data-calling-wait]', overlay);
    var doneBlock = $('[data-calling-done]', overlay);
    var donePhone = $('[data-calling-phone]', overlay);
    var doneClose = $('[data-calling-doneclose]', overlay);

    function resetToWait() {
      if (callTimer) { window.clearTimeout(callTimer); callTimer = null; }
      if (waitBlock) { waitBlock.removeAttribute('hidden'); }
      if (doneBlock) { doneBlock.setAttribute('hidden', ''); }
    }

    btn.addEventListener('click', function () {
      /* Everything except the scheduled slot must be there so we can call them. */
      if (!validateAll(['callback_slot'])) { return; }
      resetToWait();
      if (donePhone) { donePhone.textContent = phoneValue(); }
      if (window.AraSite && typeof window.AraSite.openModal === 'function') {
        window.AraSite.openModal('calling');
      }
      /* Simulate the request being queued, then reveal the honest confirmation. */
      callTimer = window.setTimeout(function () {
        if (waitBlock) { waitBlock.setAttribute('hidden', ''); }
        if (doneBlock) { doneBlock.removeAttribute('hidden'); }
        if (doneClose && typeof doneClose.focus === 'function') { doneClose.focus(); }
      }, 3500);
    });

    /* If the visitor cancels/closes mid-wait, stop the timer and re-arm. */
    $all('[data-modal-close]', overlay).forEach(function (c) {
      c.addEventListener('click', resetToWait);
    });
    overlay.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.key === 'Esc') { resetToWait(); }
    });
  }


  /* ---------------------------------------------------------------------- */
  /* Wiring                                                                  */
  /* ---------------------------------------------------------------------- */

  var sendBtn = $('[data-callback-send]', form);
  if (sendBtn) { sendBtn.addEventListener('click', submit); }
  form.addEventListener('submit', function (event) { event.preventDefault(); });

  initSlots();
  initVenueOther();
  initCallNow();
}());
