/* ==========================================================================
   Ara Tax Services LLC — wizard.js
   --------------------------------------------------------------------------
   The five-step intake form on file.html. Loaded only by that page.

   Vanilla JavaScript. No dependencies, no network requests, no analytics, no
   trackers, no cookies. Nothing in this file sends anything anywhere.

   Provides:
     1. Step show / hide           (class + [hidden], both set together)
     2. Step indicator             (segments, counter, heading, live region)
     3. Per-step validation        (inline errors, aria-invalid, focus move)
     4. Conditional fields         (shown only when their trigger answer is given)
     5. Progress in sessionStorage (survives a refresh, cleared on submit)
     6. Submit                     (preventDefault always, modal + inline notice)

   If this file fails to load, every step is still in the DOM and readable, and
   the page carries a <noscript> note with the phone number and email address.
   ========================================================================== */

(function () {
  'use strict';

  var STORAGE_KEY = 'ara-intake-v1';
  var STEP_COUNT = 5;

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var form = $('[data-wizard]');
  if (!form) { return; }

  var steps = $all('.us-wizard-step', form);
  if (steps.length !== STEP_COUNT) { return; }

  var indicator = $('[data-step-indicator]', form);
  var segments = indicator ? $all('[data-segment]', indicator) : [];
  var stepNumberEl = $('[data-step-number]', form);
  var stepTitleEl = $('[data-step-title]', form);
  var summaryEl = $('[data-wizard-summary]', form);
  var summaryTextEl = $('[data-wizard-summary-text]', form);
  var backBtn = $('[data-wizard-back]', form);
  var nextBtn = $('[data-wizard-next]', form);
  var submitBtn = $('[data-wizard-submit]', form);
  var confirmation = document.getElementById('intake-confirmation');

  var stepTitles = steps.map(function (step, index) {
    var seg = segments[index];
    var label = seg ? $('.us-step-indicator__segment-label', seg) : null;
    return label ? label.textContent.trim() : ('Step ' + (index + 1));
  });

  var current = 1;
  var errorSeq = 0;


  /* ---------------------------------------------------------------------- */
  /* Small helpers                                                           */
  /* ---------------------------------------------------------------------- */

  function show(el) {
    if (!el) { return; }
    el.removeAttribute('hidden');
  }

  function hide(el) {
    if (!el) { return; }
    el.setAttribute('hidden', '');
  }

  function controlsOf(group) {
    return $all('input, select, textarea', group);
  }

  function isChoice(control) {
    return control.type === 'checkbox' || control.type === 'radio';
  }

  function errorClassFor(control) {
    if (control.tagName === 'SELECT') { return 'us-select--error'; }
    if (control.tagName === 'TEXTAREA') { return 'us-textarea--error'; }
    return 'us-input--error';
  }

  /* aria-describedby has to gain the error id without losing the hint id. The
     original value is parked on the element the first time it is touched. */
  function describedBy(el, errorId, add) {
    if (!el) { return; }
    if (!el.hasAttribute('data-db-base')) {
      el.setAttribute('data-db-base', el.getAttribute('aria-describedby') || '');
    }
    var base = el.getAttribute('data-db-base');
    var value = add ? (base ? base + ' ' + errorId : errorId) : base;
    if (value) {
      el.setAttribute('aria-describedby', value);
    } else {
      el.removeAttribute('aria-describedby');
    }
  }


  /* ---------------------------------------------------------------------- */
  /* 1. Errors                                                               */
  /* ---------------------------------------------------------------------- */

  function clearError(group) {
    if (!group) { return; }
    group.classList.remove('us-form-group--error');

    var message = $('.us-error-message', group);
    if (message) {
      var groupFieldset = $('[data-group]', group);
      describedBy(groupFieldset, message.id, false);
      message.parentNode.removeChild(message);
    }

    controlsOf(group).forEach(function (control) {
      control.removeAttribute('aria-invalid');
      control.classList.remove('us-input--error', 'us-select--error', 'us-textarea--error');
      if (message) { describedBy(control, message.id, false); }
    });
  }

  function showError(group, text) {
    clearError(group);
    errorSeq += 1;

    var id = 'wizard-error-' + errorSeq;
    var message = document.createElement('span');
    message.className = 'us-error-message';
    message.id = id;
    message.textContent = text;

    group.classList.add('us-form-group--error');

    var groupFieldset = $('[data-group]', group);
    var controls = controlsOf(group);

    if (groupFieldset) {
      var list = $('[data-choice-list]', groupFieldset);
      if (list) {
        groupFieldset.insertBefore(message, list);
      } else {
        groupFieldset.appendChild(message);
      }
      describedBy(groupFieldset, id, true);
      controls.forEach(function (control) {
        control.setAttribute('aria-invalid', 'true');
      });
    } else if (controls.length) {
      var control = controls[0];
      control.parentNode.insertBefore(message, control);
      control.setAttribute('aria-invalid', 'true');
      control.classList.add(errorClassFor(control));
      describedBy(control, id, true);
    }

    return controls.length ? controls[0] : null;
  }


  /* ---------------------------------------------------------------------- */
  /* 2. Validation                                                           */
  /* ---------------------------------------------------------------------- */

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function groupsOf(step) {
    return $all('[data-field]', step).filter(function (group) {
      return !group.hasAttribute('hidden');
    });
  }

  function problemWith(group) {
    var controls = controlsOf(group);
    if (!controls.length) { return null; }

    var required = group.hasAttribute('data-required');
    var message = group.getAttribute('data-error') || 'This field is required.';
    var first = controls[0];

    if (isChoice(first)) {
      var anyChecked = controls.some(function (control) { return control.checked; });
      if (required && !anyChecked) { return message; }
      return null;
    }

    var value = (first.value || '').trim();

    if (required && !value) { return message; }

    if (first.type === 'email' && value && !EMAIL_RE.test(value)) {
      return 'Enter an email address in the form name@example.com.';
    }

    return null;
  }

  /* Validates one step. Returns true when the step is clean. */
  function validateStep(index) {
    var step = steps[index - 1];
    var groups = groupsOf(step);
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

    if (!count) {
      hide(summaryEl);
      return true;
    }

    if (summaryEl && summaryTextEl) {
      summaryTextEl.textContent = count === 1
        ? 'There is 1 answer to complete on this step.'
        : 'There are ' + count + ' answers to complete on this step.';
      show(summaryEl);
    }

    if (firstBad && firstBad.control) {
      try {
        firstBad.control.focus({ preventScroll: true });
      } catch (e) {
        firstBad.control.focus();
      }
      /* Scroll the error message itself, never the whole group: step 3's activity
         list is 1168px tall at 360px against a 740px viewport, so centring the group
         put the message above y=0 and the reader saw no error at all. */
      var errEl = firstBad.group.querySelector('.us-error-message') || firstBad.group;
      if (errEl.scrollIntoView) {
        errEl.scrollIntoView({ block: 'center' });
      }
    }

    return false;
  }


  /* ---------------------------------------------------------------------- */
  /* 3. Step display                                                         */
  /* ---------------------------------------------------------------------- */

  function updateIndicator() {
    segments.forEach(function (segment, index) {
      var number = index + 1;
      var state = $('[data-segment-state]', segment);

      segment.classList.remove('us-step-indicator__segment--current');
      segment.classList.remove('us-step-indicator__segment--complete');
      segment.removeAttribute('aria-current');

      if (number < current) {
        segment.classList.add('us-step-indicator__segment--complete');
        if (state) { state.textContent = 'completed'; }
      } else if (number === current) {
        segment.classList.add('us-step-indicator__segment--current');
        segment.setAttribute('aria-current', 'step');
        if (state) { state.textContent = 'current step'; }
      } else if (state) {
        state.textContent = 'not started';
      }
    });

    /* The header reads "Step N of 5 — <name>". Each step's own legend already
       carries the same sentence for assistive technology and is where focus
       lands, so there is no live region here to announce it a second time. */
    if (stepNumberEl) { stepNumberEl.textContent = String(current); }
    if (stepTitleEl) { stepTitleEl.textContent = stepTitles[current - 1]; }
  }

  /* Both the class and the attribute are set. site.css carries
     [hidden] { display: none !important; } and a matching rule for
     .us-wizard-step.is-hidden, so an author display rule cannot leave a
     panel on screen. */
  function paintSteps() {
    steps.forEach(function (step, index) {
      var isCurrent = (index + 1) === current;
      step.classList.toggle('is-hidden', !isCurrent);
      if (isCurrent) {
        step.removeAttribute('hidden');
      } else {
        step.setAttribute('hidden', '');
      }
    });
  }

  function paintButtons() {
    if (backBtn) {
      if (current > 1) { show(backBtn); } else { hide(backBtn); }
    }
    if (nextBtn) {
      if (current < STEP_COUNT) { show(nextBtn); } else { hide(nextBtn); }
    }
    if (submitBtn) {
      if (current === STEP_COUNT) { show(submitBtn); } else { hide(submitBtn); }
    }
  }

  function scrollToForm() {
    var top = form.getBoundingClientRect().top + (window.pageYOffset || 0) - 24;
    window.scrollTo(0, top < 0 ? 0 : top);
  }

  function goTo(number, options) {
    var opts = options || {};
    if (number < 1) { number = 1; }
    if (number > STEP_COUNT) { number = STEP_COUNT; }

    current = number;
    paintSteps();
    paintButtons();
    updateIndicator();

    if (!opts.silent) {
      hide(summaryEl);
      scrollToForm();
      /* The step's own legend, not a legend belonging to a nested group. */
      var legend = $(':scope > fieldset > legend', steps[current - 1]);
      if (legend) {
        try {
          legend.focus({ preventScroll: true });
        } catch (e) {
          legend.focus();
        }
      }
    }

    save();
  }


  /* ---------------------------------------------------------------------- */
  /* 4. Conditional fields                                                   */
  /* ---------------------------------------------------------------------- */

  function conditionMet(group) {
    var name = group.getAttribute('data-show-when');
    var values = (group.getAttribute('data-show-values') || '').split('|');
    var inputs = $all('[name="' + name + '"]', form);
    var met = false;

    inputs.forEach(function (input) {
      if (isChoice(input)) {
        if (input.checked && values.indexOf(input.value) !== -1) { met = true; }
      } else if (values.indexOf(input.value) !== -1) {
        met = true;
      }
    });

    return met;
  }

  function syncConditionals() {
    $all('[data-show-when]', form).forEach(function (group) {
      if (conditionMet(group)) {
        show(group);
      } else {
        if (!group.hasAttribute('hidden')) {
          controlsOf(group).forEach(function (control) {
            if (isChoice(control)) {
              control.checked = false;
            } else {
              control.value = '';
            }
          });
        }
        clearError(group);
        hide(group);
      }
    });
  }


  /* ---------------------------------------------------------------------- */
  /* 5. sessionStorage                                                       */
  /* ---------------------------------------------------------------------- */
  /* Answers are held in this browser tab only, so a refresh does not wipe the
     form. Nothing is written to a cookie, to localStorage, or to a server.   */

  function collect() {
    var values = {};
    $all('input, select, textarea', form).forEach(function (control) {
      var name = control.name;
      if (!name) { return; }
      if (control.type === 'checkbox') {
        if (!values[name]) { values[name] = []; }
        if (control.checked) { values[name].push(control.value); }
      } else if (control.type === 'radio') {
        if (control.checked) { values[name] = control.value; }
      } else {
        values[name] = control.value;
      }
    });
    return values;
  }

  function save() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        step: current,
        values: collect()
      }));
    } catch (e) {
      /* Private browsing or a full quota. The form still works. */
    }
  }

  function clearSaved() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      /* nothing to do */
    }
  }

  function restore() {
    var raw = null;
    try {
      raw = sessionStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return false;
    }
    if (!raw) { return false; }

    var data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      return false;
    }
    if (!data || typeof data !== 'object' || !data.values) { return false; }

    $all('input, select, textarea', form).forEach(function (control) {
      var name = control.name;
      if (!name || !Object.prototype.hasOwnProperty.call(data.values, name)) { return; }
      var stored = data.values[name];
      if (control.type === 'checkbox') {
        control.checked = Array.isArray(stored) && stored.indexOf(control.value) !== -1;
      } else if (control.type === 'radio') {
        control.checked = (stored === control.value);
      } else if (typeof stored === 'string') {
        control.value = stored;
      }
    });

    syncConditionals();

    var step = parseInt(data.step, 10);
    if (!isNaN(step) && step >= 1 && step <= STEP_COUNT) {
      goTo(step, { silent: true });
    }
    return true;
  }


  /* ---------------------------------------------------------------------- */
  /* 6. Confirmation modal                                                   */
  /* ---------------------------------------------------------------------- */
  /* site.js already ships an accessible modal (focus trap, Escape, backdrop
     click, background scroll lock, focus returned to the trigger) and binds
     every [data-modal-close] inside the dialog. This only opens it. The
     fallback below runs only if site.js is unavailable, so the two never
     bind the same element twice. */

  var fallbackBound = false;
  var fallbackLastFocus = null;

  function fallbackFocusable(root) {
    return $all('a[href], button:not([disabled]), input:not([disabled]), ' +
      'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', root);
  }

  function fallbackClose(overlay) {
    hide(overlay);
    document.body.classList.remove('us-modal-open');
    if (fallbackLastFocus && fallbackLastFocus.focus) { fallbackLastFocus.focus(); }
    fallbackLastFocus = null;
  }

  function fallbackOpen(id) {
    var overlay = document.getElementById(id);
    if (!overlay) { return; }
    var dialog = $('.us-modal', overlay) || overlay;

    if (!fallbackBound) {
      fallbackBound = true;
      $all('[data-modal-close]', overlay).forEach(function (closer) {
        closer.addEventListener('click', function (event) {
          event.preventDefault();
          fallbackClose(overlay);
        });
      });
      overlay.addEventListener('click', function (event) {
        if (event.target === overlay) { fallbackClose(overlay); }
      });
      overlay.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' || event.key === 'Esc') {
          fallbackClose(overlay);
          return;
        }
        if (event.key !== 'Tab') { return; }
        var targets = fallbackFocusable(dialog);
        if (!targets.length) { return; }
        var first = targets[0];
        var last = targets[targets.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      });
    }

    fallbackLastFocus = document.activeElement;
    show(overlay);
    document.body.classList.add('us-modal-open');
    var focusables = fallbackFocusable(dialog);
    if (focusables.length) { focusables[0].focus(); }
  }

  function openConfirmation() {
    if (window.AraSite && typeof window.AraSite.openModal === 'function') {
      window.AraSite.openModal('intake-confirm');
    } else {
      fallbackOpen('intake-confirm');
    }
  }


  /* ---------------------------------------------------------------------- */
  /* 7. Events                                                               */
  /* ---------------------------------------------------------------------- */

  if (nextBtn) {
    nextBtn.addEventListener('click', function (event) {
      event.preventDefault();
      if (!validateStep(current)) { return; }
      goTo(current + 1);
    });
  }

  if (backBtn) {
    /* Back never validates. */
    backBtn.addEventListener('click', function (event) {
      event.preventDefault();
      goTo(current - 1);
    });
  }

  /* An error message is never removed while the reader is mid-gesture. Taking
     one out of the flow moves everything below it, and `change` fires on blur
     — so clearing an error the moment a field is corrected would shift the
     next control out from under a mouse button that is already down, and the
     click would land on nothing. Errors are re-evaluated on Continue and on
     Submit, where the reader is expecting the page to change. */
  form.addEventListener('change', function () {
    syncConditionals();
    save();
  });

  form.addEventListener('input', function () {
    save();
  });

  /* Enter inside a single-line field moves the wizard on rather than firing an
     implicit submit from a step that is not the last one. */
  form.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter') { return; }
    var target = event.target;
    if (!target || target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON') { return; }
    if (target.tagName !== 'INPUT' && target.tagName !== 'SELECT') { return; }
    if (current < STEP_COUNT) {
      event.preventDefault();
      if (nextBtn) { nextBtn.click(); }
    }
  });

  /* ------------------------------------------------------------------------
     DEMO BUILD — THIS HANDLER SENDS NOTHING.

     preventDefault() is unconditional: there is no form action, no fetch, no
     XHR, no third-party endpoint, and no analytics call anywhere in this file.
     The answers exist only in this browser tab and are deleted from
     sessionStorage the moment the confirmation is shown.

     A REAL DEPLOYMENT REPLACES THE BODY OF THIS HANDLER WITH A SERVER POST,
     and that deployment must:
       * be served over HTTPS only, with HSTS;
       * post to a first-party endpoint on the firm's own domain;
       * treat the payload as tax return information from the first keystroke
         — do not log it, do not put it in an access log, an error report, an
         APM trace or a plain-text email;
       * keep the same rule the form is built on: no Social Security number,
         ITIN, EIN, date of birth, seed phrase, private key, exchange
         password, API key, bank or card detail, or document upload is ever
         collected here;
       * carry a CSRF token and server-side validation, because client-side
         validation is a convenience and never a control.
     ------------------------------------------------------------------------ */
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    /* Clear any marker left behind on a step the reader has moved away from. */
    steps.forEach(function (step) {
      groupsOf(step).forEach(clearError);
    });

    var firstBad = 0;
    for (var number = 1; number <= STEP_COUNT; number += 1) {
      var problems = groupsOf(steps[number - 1]).some(function (group) {
        return problemWith(group) !== null;
      });
      if (problems) { firstBad = number; break; }
    }

    if (firstBad) {
      if (firstBad !== current) { goTo(firstBad); }
      validateStep(firstBad);
      return;
    }

    clearSaved();
    show(confirmation);
    openConfirmation();
  });


  /* ---------------------------------------------------------------------- */
  /* Boot                                                                    */
  /* ---------------------------------------------------------------------- */

  function init() {
    syncConditionals();
    if (!restore()) {
      goTo(1, { silent: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
