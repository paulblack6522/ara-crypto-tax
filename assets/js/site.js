/* ==========================================================================
   Ara Tax Services LLC — site.js
   --------------------------------------------------------------------------
   Vanilla JavaScript. No dependencies, no network requests, no analytics,
   no trackers, no cookies. Safe to load on EVERY page, including pages that
   contain none of these components — every lookup is guarded and the script
   exits quietly when an element is absent.

   Provides:
     1. Mobile navigation drawer   (aria-expanded, Escape, scrim, resize reset)
     2. Accordion                  (button + aria-expanded + hidden panel)
     3. Footer copyright year      ([data-current-year])
     4. Modal dialog helper        (opt-in via data attributes)

   Progressive enhancement: if this file fails to load, the navigation links
   are still present in the DOM, accordion panels are still readable (see the
   note in initAccordions), and the form still submits.
   ========================================================================== */

(function () {
  'use strict';

  /* ---------------------------------------------------------------------- */
  /* Helpers                                                                 */
  /* ---------------------------------------------------------------------- */

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var DESKTOP_BREAKPOINT = 1024; /* matches the 64em nav breakpoint in site.css */


  /* ---------------------------------------------------------------------- */
  /* 1. Mobile navigation drawer                                             */
  /* ---------------------------------------------------------------------- */

  function initNav() {
    var toggle = $('[data-nav-toggle]');
    var nav = $('[data-nav]');
    if (!toggle || !nav) { return; }

    var scrim = $('[data-nav-scrim]');
    var closeBtn = $('[data-nav-close]', nav);

    function isOpen() {
      return nav.classList.contains('is-open');
    }

    /* Everything outside the drawer, so it can be made inert while the drawer is open.
       Without this, tabbing past the last drawer item lands on page content that is
       dimmed behind the scrim and takes 25 further Tab presses to escape. */
    function outsideEls() {
      return $all('body > *').filter(function (el) {
        return el !== nav && !el.contains(nav) && el.tagName !== 'SCRIPT';
      });
    }

    function focusablesIn(root) {
      return $all('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])', root)
        .filter(function (el) { return el.offsetWidth > 0 || el.offsetHeight > 0; });
    }

    function open() {
      nav.classList.add('is-open');
      if (scrim) { scrim.classList.add('is-open'); }
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('us-modal-open');   /* reuse the modal scroll lock */
      outsideEls().forEach(function (el) {
        el.setAttribute('inert', '');
        el.setAttribute('aria-hidden', 'true');       /* fallback where inert is unsupported */
      });
      var firstLink = $('a, button', nav);
      if (firstLink) { firstLink.focus(); }
    }

    function close(returnFocus) {
      nav.classList.remove('is-open');
      if (scrim) { scrim.classList.remove('is-open'); }
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('us-modal-open');
      outsideEls().forEach(function (el) {
        el.removeAttribute('inert');
        el.removeAttribute('aria-hidden');
      });
      if (returnFocus) { toggle.focus(); }
    }

    /* Belt and braces for browsers without inert: wrap Tab inside the drawer. */
    nav.addEventListener('keydown', function (event) {
      if (event.key !== 'Tab' || !isOpen()) { return; }
      var items = focusablesIn(nav);
      if (!items.length) { return; }
      var first = items[0];
      var last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    });

    toggle.setAttribute('aria-expanded', 'false');

    toggle.addEventListener('click', function (event) {
      event.preventDefault();
      if (isOpen()) { close(false); } else { open(); }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', function (event) {
        event.preventDefault();
        close(true);
      });
    }

    if (scrim) {
      scrim.addEventListener('click', function () { close(true); });
    }

    document.addEventListener('keydown', function (event) {
      if ((event.key === 'Escape' || event.key === 'Esc') && isOpen()) {
        close(true);
      }
    });

    /* Crossing into the desktop layout must clear the drawer state, or the
       aria-expanded value would describe a control that is no longer shown. */
    window.addEventListener('resize', function () {
      if (window.innerWidth >= DESKTOP_BREAKPOINT && isOpen()) {
        close(false);
      }
    });
  }


  /* ---------------------------------------------------------------------- */
  /* 2. Accordion                                                            */
  /* ---------------------------------------------------------------------- */
  /*
     Expected markup:

       <ul class="us-accordion" data-accordion>
         <li class="us-accordion__item">
           <h3 class="us-accordion__heading">
             <button type="button" class="us-accordion__button"
                     aria-expanded="false" aria-controls="a1">Question</button>
           </h3>
           <div class="us-accordion__content" id="a1" hidden>
             <p>Answer.</p>
           </div>
         </li>
       </ul>

     Author the panels WITHOUT the `hidden` attribute if you want the content
     readable when JavaScript is unavailable; this function collapses them on
     load based on each button's aria-expanded value. Add `data-accordion-open`
     to an item's button to have it start expanded.
     Add `data-accordion-single` to the list to allow only one open panel.
  */

  function initAccordions() {
    var lists = $all('[data-accordion]');
    if (!lists.length) { return; }

    lists.forEach(function (list) {
      var single = list.hasAttribute('data-accordion-single');
      var buttons = $all('.us-accordion__button', list);
      if (!buttons.length) { return; }

      buttons.forEach(function (button) {
        var panelId = button.getAttribute('aria-controls');
        var panel = panelId ? document.getElementById(panelId) : null;
        if (!panel) { return; }

        var startOpen = button.getAttribute('aria-expanded') === 'true' ||
                        button.hasAttribute('data-accordion-open');

        button.setAttribute('aria-expanded', startOpen ? 'true' : 'false');
        if (startOpen) {
          panel.removeAttribute('hidden');
        } else {
          panel.setAttribute('hidden', '');
        }

        button.addEventListener('click', function () {
          var expanded = button.getAttribute('aria-expanded') === 'true';

          if (!expanded && single) {
            buttons.forEach(function (other) {
              if (other === button) { return; }
              var otherId = other.getAttribute('aria-controls');
              var otherPanel = otherId ? document.getElementById(otherId) : null;
              other.setAttribute('aria-expanded', 'false');
              if (otherPanel) { otherPanel.setAttribute('hidden', ''); }
            });
          }

          button.setAttribute('aria-expanded', expanded ? 'false' : 'true');
          if (expanded) {
            panel.setAttribute('hidden', '');
          } else {
            panel.removeAttribute('hidden');
          }
        });
      });
    });
  }


  /* ---------------------------------------------------------------------- */
  /* 3. Footer copyright year                                                */
  /* ---------------------------------------------------------------------- */
  /* Markup: <span data-current-year>2026</span>  — the hard-coded value is
     the fallback and is what a crawler with JS disabled will read.          */

  function initYear() {
    var slots = $all('[data-current-year]');
    if (!slots.length) { return; }
    var year = String(new Date().getFullYear());
    slots.forEach(function (slot) { slot.textContent = year; });
  }


  /* ---------------------------------------------------------------------- */
  /* 4. Modal dialog helper (opt-in)                                         */
  /* ---------------------------------------------------------------------- */
  /*
     Markup:

       <button type="button" data-modal-open="confirm-dialog">Open</button>

       <div class="us-modal-overlay" data-modal id="confirm-dialog" hidden>
         <div class="us-modal" role="dialog" aria-modal="true"
              aria-labelledby="confirm-dialog-title">
           <button type="button" class="us-modal__close" data-modal-close>Close</button>
           <h2 class="us-modal__heading" id="confirm-dialog-title">Heading</h2>
           <div class="us-modal__content">…</div>
         </div>
       </div>

     Call window.AraSite.openModal('confirm-dialog') to open one from your own
     code (for example after a successful form submission).
  */

  var lastFocused = null;

  function focusable(root) {
    return $all(
      'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]),' +
      'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      root
    ).filter(function (el) {
      return el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement;
    });
  }

  function openModal(id) {
    var overlay = document.getElementById(id);
    if (!overlay || !overlay.hasAttribute('data-modal')) { return; }

    lastFocused = document.activeElement;
    overlay.removeAttribute('hidden');
    document.body.classList.add('us-modal-open');

    var dialog = $('.us-modal', overlay) || overlay;
    var targets = focusable(dialog);
    if (targets.length) {
      targets[0].focus();
    } else {
      dialog.setAttribute('tabindex', '-1');
      dialog.focus();
    }
  }

  function closeModal(overlay) {
    if (!overlay) { return; }
    overlay.setAttribute('hidden', '');
    document.body.classList.remove('us-modal-open');
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
    lastFocused = null;
  }

  function initModals() {
    var overlays = $all('[data-modal]');
    var openers = $all('[data-modal-open]');
    if (!overlays.length && !openers.length) { return; }

    openers.forEach(function (opener) {
      opener.addEventListener('click', function (event) {
        event.preventDefault();
        openModal(opener.getAttribute('data-modal-open'));
      });
    });

    overlays.forEach(function (overlay) {
      $all('[data-modal-close]', overlay).forEach(function (closer) {
        closer.addEventListener('click', function (event) {
          event.preventDefault();
          closeModal(overlay);
        });
      });

      /* Click on the backdrop, but not inside the dialog. */
      overlay.addEventListener('click', function (event) {
        if (event.target === overlay) { closeModal(overlay); }
      });

      /* Escape closes; Tab is trapped inside the dialog while it is open. */
      overlay.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' || event.key === 'Esc') {
          closeModal(overlay);
          return;
        }
        if (event.key !== 'Tab') { return; }

        var dialog = $('.us-modal', overlay) || overlay;
        var targets = focusable(dialog);
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
    });
  }


  /* ---------------------------------------------------------------------- */
  /* Boot                                                                    */
  /* ---------------------------------------------------------------------- */

  function init() {
    initNav();
    initAccordions();
    initYear();
    initModals();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Minimal public surface for page-level scripts. */
  window.AraSite = {
    openModal: openModal,
    closeModal: function (id) { closeModal(document.getElementById(id)); }
  };
}());
