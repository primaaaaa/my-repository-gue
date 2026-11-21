/**
 * ContactComponent.js
 * Manages the hanging lanyard ID badge pendulum physics,
 * playful gentle sway on hover, one-click email copy functionality,
 * and the 3D Voxel Printer interactive CV dispensing experience.
 */

import { PrinterComponent } from './PrinterComponent.js';

export class ContactComponent {
  constructor(skinGenerator, isMobileDevice = false) {
    this.isMobileDevice = isMobileDevice;
    this.isPrinterOpen = false;
    this.hasDroppedIn = false;
    this.printerComponent = null;

    this.initEventListeners();
    this.initCardInteractions();
    this.initPrinter();
  }

  triggerDropAndSway() {
    const rig = document.getElementById('lanyardRig');
    const pendulum = document.getElementById('lanyardPendulum');

    // 1. Trigger vertical drop-in transition (menyembul dari atas)
    if (rig) {
      rig.classList.remove('is-retracting');
      rig.classList.remove('is-dropping-in');
      rig.classList.remove('is-dropped');
      void rig.offsetWidth; // Force DOM reflow to restart keyframe
      rig.classList.add('is-dropping-in');

      setTimeout(() => {
        if (!this.isPrinterOpen && rig) {
          rig.classList.remove('is-dropping-in');
          rig.classList.add('is-dropped');
        }
      }, 1400);
    }

    // 2. Simultaneously trigger dynamic pendulum sway
    if (pendulum) {
      pendulum.classList.remove('is-swinging');
      void pendulum.offsetWidth;
      pendulum.classList.add('is-swinging');
    }
  }

  triggerSway() {
    const pendulum = document.getElementById('lanyardPendulum');
    if (pendulum) {
      pendulum.classList.remove('is-swinging');
      void pendulum.offsetWidth;
      pendulum.classList.add('is-swinging');
      setTimeout(() => {
        if (pendulum) pendulum.classList.remove('is-swinging');
      }, 2200);
    }
  }

  triggerPlaceCard() {
    this.triggerSway();
  }

  initEventListeners() {
    const stage = document.getElementById('contactStage') || document.getElementById('lanyardRig');
    if (!stage) return;

    // Trigger entrance drop-in ONLY ONCE when user actually scrolls to the contact section
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !this.hasDroppedIn && !this.isPrinterOpen) {
          this.hasDroppedIn = true;
          this.triggerDropAndSway();
          observer.disconnect(); // Disconnect immediately so it NEVER replays on scroll
        }
      }, { threshold: 0.28 });
      observer.observe(stage);
    } else {
      this.triggerDropAndSway();
    }
  }

  initCardInteractions() {
    const card = document.getElementById('pixelBusinessCard');
    const pendulum = document.getElementById('lanyardPendulum');
    const copyBtn = document.getElementById('btnCopyEmail');

    // 1. Natural Click to trigger interactive physics swing
    if (card) {
      card.addEventListener('click', (e) => {
        // If clicking outside interactive pills, give it a subtle playful sway
        if (!e.target.closest('a') && !e.target.closest('button') && !this.isPrinterOpen) {
          this.triggerPlaceCard();
        }
      });
    }

    // 2. Click to Copy Email with Feedback Toast
    if (copyBtn) {
      copyBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = copyBtn.getAttribute('data-email') || 'primayudhistira040@gmail.com';

        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(email);
          } else {
            const ta = document.createElement('textarea');
            ta.value = email;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
          }

          copyBtn.classList.add('is-copied');
          const badge = document.getElementById('emailCopyBadge');
          if (badge) {
            badge.innerHTML = `
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            `;
          }

          setTimeout(() => {
            copyBtn.classList.remove('is-copied');
            if (badge) {
              badge.innerHTML = `
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              `;
            }
          }, 2200);
        } catch (err) {
          console.error('Failed to copy email:', err);
        }
      });
    }
  }

  initPrinter() {
    // 3D Voxel Printer Component
    this.printerComponent = new PrinterComponent({
      isMobileDevice: this.isMobileDevice,
      onPrintComplete: () => {
        // After CV print is finished and file downloaded, restore lanyard
        this.restoreLanyard();
      },
      onDismiss: () => {
        this.restoreLanyard();
      }
    });

    // Trigger button below lanyard
    const btnPrintCV = document.getElementById('btnPrintCV');
    if (btnPrintCV) {
      btnPrintCV.addEventListener('click', (e) => {
        e.preventDefault();
        this.retractLanyardAndOpenPrinter();
      });
    }

    // Back button in printer stage
    const btnPrinterBack = document.getElementById('btnPrinterBack');
    if (btnPrinterBack) {
      btnPrinterBack.addEventListener('click', (e) => {
        e.preventDefault();
        this.restoreLanyard();
      });
    }
  }

  retractLanyardAndOpenPrinter() {
    if (this.isPrinterOpen) return;
    this.isPrinterOpen = true;

    const contactSec = document.getElementById('contact');
    if (contactSec) {
      contactSec.classList.add('is-printer-active');
      // Smoothly scroll to the top of the contact section so the 3D printer is in full view
      contactSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    const rig = document.getElementById('lanyardRig');
    const printerStage = document.getElementById('printerStage');

    // 1. Animate lanyard retracting upward tucked under white section above
    if (rig) {
      rig.classList.remove('is-dropping-in');
      rig.classList.add('is-retracting');
    }

    // 2. Transition in the 3D printer stage and collapse lanyard rig from document layout
    setTimeout(() => {
      if (rig) {
        rig.style.display = 'none';
      }
      if (printerStage) {
        printerStage.style.display = 'flex';
        printerStage.setAttribute('aria-hidden', 'false');
        void printerStage.offsetWidth;
        printerStage.classList.add('is-visible');
      }
      if (this.printerComponent) {
        this.printerComponent.show();
      }
    }, 280);
  }

  restoreLanyard() {
    if (!this.isPrinterOpen) return;
    this.isPrinterOpen = false;

    const contactSec = document.getElementById('contact');
    if (contactSec) contactSec.classList.remove('is-printer-active');

    const rig = document.getElementById('lanyardRig');
    const printerStage = document.getElementById('printerStage');

    // 1. Transition out printer stage
    if (printerStage) {
      printerStage.classList.remove('is-visible');
    }

    if (this.printerComponent) {
      this.printerComponent.hide();
    }

    // 2. Restore lanyard rig to layout, retract printer, and drop lanyard back in
    setTimeout(() => {
      if (printerStage) {
        printerStage.style.display = 'none';
        printerStage.setAttribute('aria-hidden', 'true');
      }

      if (rig) {
        rig.style.display = '';
        rig.classList.remove('is-retracting');
        this.triggerDropAndSway();
      }
    }, 260);
  }

  resize() {
    if (this.isPrinterOpen && this.printerComponent) {
      this.printerComponent.resize();
    }
  }

  render(delta, time, mouseNDC, raycaster, isVisible) {
    if (this.isPrinterOpen && this.printerComponent && isVisible) {
      this.printerComponent.render(delta, time);
    }
  }
}
