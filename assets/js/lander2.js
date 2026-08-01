/* ==========================================================================
   Ara Tax Services LLC — lander2.js
   --------------------------------------------------------------------------
   The short qualifying form + callback booking on lander-2.html. Loaded only
   by that page.

   Vanilla JavaScript. No dependencies, no network requests, no analytics, no
   trackers, no cookies. Nothing in this file sends anything anywhere.

   Provides:
     1. Callback slots   — five rolling "next available" times, anchored to the
                           firm's business hours (Mon-Fri, 09:00-17:00 Pacific)
                           and DISPLAYED in the visitor's own timezone.
     2. "Another time"   — reveals a native date + time when chosen.
     3. Validation       — inline errors, aria-invalid, focus move, error summary.
     4. Submit           — preventDefault always; opens the confirmation modal via
                           the shared window.AraSite.openModal. Nothing is sent.

   A real deployment replaces the submit handler with a POST to the firm's own
   server over HTTPS, and MUST NOT log the payload. See README.md.
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

  /* value(ISO) -> friendly label, for the confirmation message. */
  var slotLabels = {};


  /* ---------------------------------------------------------------------- */
  /* 1. Callback slots                                                       */
  /* ---------------------------------------------------------------------- */

  /* Wall-clock parts of an instant in a given IANA timezone. */
  function partsIn(date, tz) {
    var fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', weekday: 'short'
    });
    var out = {};
    fmt.formatToParts(date).forEach(function (p) { out[p.type] = p.value; });
    var h = parseInt(out.hour, 10);
    if (h === 24) { h = 0; }              /* some engines report 24 at midnight */
    return { y: +out.year, mo: +out.month, d: +out.day, h: h,
             mi: parseInt(out.minute, 10), wd: out.weekday };
  }

  var WEEKDAYS = { Mon: 1, Tue: 1, Wed: 1, Thu: 1, Fri: 1 };

  function isFirmHour(date) {
    var p = partsIn(date, FIRM_TZ);
    return WEEKDAYS[p.wd] === 1 && p.h >= 9 && p.h < 17;   /* 09:00 .. 16:30 start */
  }

  function visitorTz() {
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return tz || 'your local time';
    } catch (e) { return 'your local time'; }
  }

  /* Day label in the VISITOR's timezone: Today / Tomorrow / "Mon, Aug 3". */
  function dayLabel(date) {
    var today = new Date();
    var tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    var d = date.toLocaleDateString([], { year: 'numeric', month: 'numeric', day: 'numeric' });
    if (d === today.toLocaleDateString([], { year: 'numeric', month: 'numeric', day: 'numeric' })) {
      return 'Today';
    }
    if (d === tomorrow.toLocaleDateString([], { year: 'numeric', month: 'numeric', day: 'numeric' })) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function timeLabel(date) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  function nextSlots() {
    var slots = [];
    var start = new Date(Date.now() + BUFFER_MS);
    start = new Date(Math.ceil(start.getTime() / STEP_MS) * STEP_MS);  /* to next :00/:30 */
    var t = start.getTime();
    var guard = 0;
    while (slots.length < SLOT_COUNT && guard < 24 * 60 * 2 * 14 / 30) { /* ~2 weeks */
      var d = new Date(t);
      if (isFirmHour(d)) { slots.push(d); }
      t += STEP_MS;
      guard += 1;
    }
    return slots;
  }

  function renderSlots() {
    var grid = $('[data-slotgrid]', form);
    if (!grid) { return; }

    var slots = nextSlots();
    /* Clear any fallback content (e.g. the noscript note is only for no-JS). */
    grid.innerHTML = '';

    slots.forEach(function (date, i) {
      var iso = date.toISOString();
      var day = dayLabel(date);
      var time = timeLabel(date);
      slotLabels[iso] = day + ' at ' + time + ' (' + visitorTz() + ')';

      var wrap = document.createElement('div');
      wrap.className = 'us-slot';

      var input = document.createElement('input');
      input.className = 'us-slot__input';
      input.type = 'radio';
      input.name = 'callback_slot';
      input.id = 'slot-' + i;
      input.value = iso;
      input.setAttribute('data-slot', '');

      var label = document.createElement('label');
      label.className = 'us-slot__label';
      label.setAttribute('for', 'slot-' + i);
      label.innerHTML = '<span class="us-slot__time"></span><span class="us-slot__day"></span>';
      label.querySelector('.us-slot__time').textContent = time;
      label.querySelector('.us-slot__day').textContent = day;

      wrap.appendChild(input);
      wrap.appendChild(label);
      grid.appendChild(wrap);
    });

    /* Timezone note, now that we know the zone. */
    var tzNote = $('[data-tz]', form);
    var tzName = $('[data-tz-name]', form);
    if (tzNote && tzName) {
      tzName.textContent = visitorTz();
      tzNote.removeAttribute('hidden');
    }

    /* Choosing a real slot hides the "another time" panel; choosing "another
       time" reveals it. They are one radio group, so selection is exclusive. */
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

    /* Do not let a past date be chosen in the free-time picker. */
    if (dateInput) {
      var now = new Date();
      var iso = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0');
      dateInput.setAttribute('min', iso);
    }
  }


  /* ---------------------------------------------------------------------- */
  /* 2. Validation (same contract as the intake form)                        */
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
    return controls.length ? controls[0] : null;
  }

  function problemWith(group) {
    var name = group.getAttribute('data-name');
    var required = group.hasAttribute('data-required');
    var message = group.getAttribute('data-error') || 'This field is required.';
    var controls = controlsOf(group);
    if (!controls.length) { return null; }
    var first = controls[0];

    /* The callback group: a slot must be chosen; if "Another time" is chosen,
       the date and time must be filled in. */
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

  function validateAll() {
    var groups = $all('[data-field]', form).filter(function (g) { return !g.hasAttribute('hidden'); });
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
    if (!count) {
      summary.setAttribute('hidden', '');
      return true;
    }
    summaryText.textContent = count === 1
      ? 'There is 1 answer to complete before you can send this.'
      : 'There are ' + count + ' answers to complete before you can send this.';
    summary.removeAttribute('hidden');

    if (firstBad && firstBad.control) {
      try { firstBad.control.focus({ preventScroll: true }); }
      catch (e) { firstBad.control.focus(); }
      /* Scroll the error message, not the group: a group taller than the
         viewport would otherwise push the message off the top of the screen. */
      var errEl = firstBad.group.querySelector('.us-error-message') || firstBad.group;
      if (errEl.scrollIntoView) { errEl.scrollIntoView({ block: 'center' }); }
    }
    return false;
  }


  /* ---------------------------------------------------------------------- */
  /* 3. Submit — demo only, nothing leaves the page                          */
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
          : dt.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
        return ': ' + nice + ' (' + visitorTz() + ')';
      }
      return '';
    }
    var label = slotLabels[chosen.value];
    return label ? ': ' + label : '';
  }

  function submit() {
    if (!validateAll()) { return; }
    var when = $('[data-confirm-when]');
    if (when) { when.textContent = chosenWhen(); }
    if (window.AraSite && typeof window.AraSite.openModal === 'function') {
      window.AraSite.openModal('callback-confirm');
    }
  }

  var sendBtn = $('[data-callback-send]', form);
  if (sendBtn) { sendBtn.addEventListener('click', submit); }

  /* Enter inside a text field must never submit natively. */
  form.addEventListener('submit', function (event) { event.preventDefault(); });


  /* ---------------------------------------------------------------------- */
  /* Boot                                                                    */
  /* ---------------------------------------------------------------------- */

  renderSlots();
}());
