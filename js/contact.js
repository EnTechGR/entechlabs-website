/*
 * ============================================================
 * ENTECH LABS — CONTACT FORM
 * ============================================================
 *
 * The contact section is loaded dynamically by main.js.
 *
 * Therefore this script MUST NOT assume that #contact-form
 * exists when DOMContentLoaded fires.
 *
 * main.js dispatches:
 *
 *     sectionsLoaded
 *
 * after the sections have been inserted into the DOM.
 *
 * We initialize the contact functionality only after that.
 * ============================================================
 */

(() => {

  'use strict';


  /*
   * ============================================================
   * CONFIGURATION
   * ============================================================
   */

  const WORKER_URL =
    'https://api.entechlabs.com';

  const TURNSTILE_SITE_KEY =
    '0x4AAAAAAEkQSDCdzsLE1A8n';

  const TURNSTILE_ACTION =
    'contact';


  /*
   * ============================================================
   * STATE
   * ============================================================
   */

  let initialized = false;
  let turnstileWidgetId = null;
  let turnstileToken = '';


  /*
   * ============================================================
   * STATUS
   * ============================================================
   */

  function setStatus(form, message, type) {

    const statusElement =
      form.querySelector('#contact-status') ||
      form.querySelector('.contact-form-status');

    if (!statusElement) {
      console.warn(
        'Contact status element not found.'
      );
      return;
    }

    statusElement.textContent =
      message;

    statusElement.dataset.status =
      type || '';

    statusElement.className =
      `contact-status ${type || ''}`.trim();
  }


  /*
   * ============================================================
   * EMAIL COPY LINKS
   * ============================================================
   */

  function initializeEmailLinks() {

    const emailElements =
      document.querySelectorAll(
        '.ch-val'
      );

    emailElements.forEach((el) => {

      /*
       * Prevent attaching the handler more than once
       * if sections are reloaded.
       */

      if (
        el.dataset.emailCopyInitialized ===
        'true'
      ) {
        return;
      }

      if (
        !el.href ||
        !el.href.startsWith('mailto:')
      ) {
        return;
      }

      el.dataset.emailCopyInitialized =
        'true';


      el.addEventListener(
        'click',
        async (e) => {

          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();


          const emailToCopy =
            el.href
              .replace(
                'mailto:',
                ''
              )
              .trim();


          const originalEmail =
            el.textContent;


          if (
            el.dataset.copying ===
            'true'
          ) {
            return;
          }


          try {

            await navigator
              .clipboard
              .writeText(
                emailToCopy
              );


            el.dataset.copying =
              'true';


            el.textContent =
              'EMAIL COPIED TO CLIPBOARD';


            el.classList.add(
              'copied'
            );


            setTimeout(
              () => {

                el.textContent =
                  originalEmail;

                el.classList.remove(
                  'copied'
                );

                delete el.dataset
                  .copying;

              },
              2000
            );


          } catch (err) {

            console.error(
              'Copy failed:',
              err
            );


            el.textContent =
              'FAILED TO COPY';


            setTimeout(
              () => {

                el.textContent =
                  originalEmail;

              },
              2000
            );

          }

        },
        true
      );

    });

  }


  /*
   * ============================================================
   * TURNSTILE
   * ============================================================
   */

  function initializeTurnstile(form) {

    const container =
      form.querySelector(
        '.cf-turnstile'
      );


    if (!container) {

      console.error(
        'Turnstile container not found.'
      );

      return;

    }


    /*
     * Avoid rendering the same widget twice.
     */

    if (
      turnstileWidgetId !== null
    ) {

      return;

    }


    /*
     * Wait for the Turnstile API.
     */

    if (
      !window.turnstile
    ) {

      console.warn(
        'Turnstile API not ready yet. Retrying...'
      );


      setTimeout(
        () => {
          initializeTurnstile(form);
        },
        250
      );


      return;

    }


    /*
     * Explicit Turnstile rendering.
     */

    window.turnstile.ready(
      () => {

        /*
         * The form might have been replaced while
         * Turnstile was loading.
         */

        if (
          !document.body.contains(form)
        ) {

          console.warn(
            'Contact form is no longer in the document.'
          );

          return;

        }


        /*
         * Don't render if another initialization
         * happened while waiting.
         */

        if (
          turnstileWidgetId !== null
        ) {

          return;

        }


        try {

          turnstileWidgetId =
            window.turnstile.render(
              container,
              {

                sitekey:
                  TURNSTILE_SITE_KEY,

                action:
                  TURNSTILE_ACTION,


                callback:
                  (token) => {

                    turnstileToken =
                      token;

                    console.log(
                      'Turnstile verification successful.'
                    );

                  },


                'expired-callback':
                  () => {

                    turnstileToken =
                      '';

                    console.warn(
                      'Turnstile token expired.'
                    );

                  },


                'error-callback':
                  (errorCode) => {

                    turnstileToken =
                      '';

                    console.error(
                      'Turnstile error:',
                      errorCode
                    );

                  }

              }
            );


          console.log(
            'Turnstile initialized. Widget ID:',
            turnstileWidgetId
          );


        } catch (error) {

          console.error(
            'Failed to initialize Turnstile:',
            error
          );

        }

      }
    );

  }


  /*
   * ============================================================
   * RESET TURNSTILE
   * ============================================================
   */

  function resetTurnstile() {

    turnstileToken =
      '';


    if (
      window.turnstile &&
      turnstileWidgetId !== null
    ) {

      try {

        window.turnstile.reset(
          turnstileWidgetId
        );

      } catch (error) {

        console.warn(
          'Turnstile reset failed:',
          error
        );

      }

    }

  }


  /*
   * ============================================================
   * GET TURNSTILE TOKEN
   * ============================================================
   */

  function getTurnstileToken() {

    /*
     * Prefer the callback token.
     */

    if (
      turnstileToken
    ) {

      return turnstileToken;

    }


    /*
     * Fallback to the Turnstile API.
     */

    if (
      window.turnstile &&
      turnstileWidgetId !== null
    ) {

      try {

        const token =
          window.turnstile.getResponse(
            turnstileWidgetId
          );


        if (token) {
          return token.trim();
        }

      } catch (error) {

        console.warn(
          'Could not retrieve Turnstile token:',
          error
        );

      }

    }


    /*
     * Final fallback for compatibility.
     */

    const hiddenInput =
      document.querySelector(
        '[name="cf-turnstile-response"]'
      );


    return (
      hiddenInput?.value?.trim() ||
      ''
    );

  }


  /*
   * ============================================================
   * INITIALIZE CONTACT FORM
   * ============================================================
   */

  function initializeContactForm() {

    /*
     * The sections can be reloaded by the router.
     * Reset the initialization state so the new form
     * can be initialized.
     */

    initialized =
      false;

    turnstileWidgetId =
      null;

    turnstileToken =
      '';


    const form =
      document.getElementById(
        'contact-form'
      );


    /*
     * This should now exist because main.js has
     * already dispatched "sectionsLoaded".
     */

    if (!form) {

      console.warn(
        'Contact form not found after sectionsLoaded.'
      );

      return;

    }


    initialized =
      true;


    console.log(
      'Contact form initialized.'
    );


    /*
     * ========================================================
     * INQUIRY TYPE CHIPS
     * ========================================================
     */

    const chips =
      form.querySelectorAll(
        '.chip'
      );


    let selectedInquiryType =
      'Sales & Licensing';


    const inquiryTypeInput =
      form.querySelector(
        '#inquiry-type'
      );


    chips.forEach(
      (chip) => {

        chip.addEventListener(
          'click',
          () => {

            chips.forEach(
              (item) => {

                item.classList.remove(
                  'on'
                );

              }
            );


            chip.classList.add(
              'on'
            );


            selectedInquiryType =
              chip.dataset.value ||
              chip.textContent.trim();


            if (
              inquiryTypeInput
            ) {

              inquiryTypeInput.value =
                selectedInquiryType;

            }

          }
        );

      }
    );


    /*
     * ========================================================
     * SUBMIT BUTTON
     * ========================================================
     */

    const submitButton =
      form.querySelector(
        '#contact-submit'
      );


    if (!submitButton) {

      console.error(
        'Contact submit button not found.'
      );

      return;

    }


    /*
     * Use the status element already present
     * in contact.html.
     */

    const statusElement =
      form.querySelector(
        '#contact-status'
      );


    if (statusElement) {

      statusElement.className =
        'contact-status';

    }


    /*
     * ========================================================
     * FORM SUBMISSION
     * ========================================================
     */

    form.addEventListener(
      'submit',
      async (event) => {

        event.preventDefault();


        /*
         * Prevent double submission.
         */

        if (
          submitButton.disabled
        ) {

          return;

        }


        /*
         * ----------------------------------------------------
         * HTML5 VALIDATION
         * ----------------------------------------------------
         */

        if (
          !form.checkValidity()
        ) {

          form.reportValidity();

          return;

        }


        /*
         * ----------------------------------------------------
         * READ FORM VALUES
         * ----------------------------------------------------
         */

        const name =
          form.querySelector(
            '#contact-name'
          )
            ?.value
            ?.trim() ||
          '';


        const email =
          form.querySelector(
            '#contact-email'
          )
            ?.value
            ?.trim() ||
          '';


        const message =
          form.querySelector(
            '#contact-message'
          )
            ?.value
            ?.trim() ||
          '';


        const website =
          form.querySelector(
            '#contact-website'
          )
            ?.value
            ?.trim() ||
          '';


        /*
         * ----------------------------------------------------
         * HONEYPOT
         * ----------------------------------------------------
         *
         * The Worker also validates this server-side.
         * We don't display anything to the visitor.
         * ----------------------------------------------------
         */

        if (website) {

          console.warn(
            'Honeypot field populated.'
          );

          return;

        }


        /*
         * ----------------------------------------------------
         * TURNSTILE
         * ----------------------------------------------------
         */

        const token =
          getTurnstileToken();


        if (!token) {

          setStatus(
            form,
            'Please complete the security verification and try again.',
            'error'
          );

          return;

        }


        /*
         * ----------------------------------------------------
         * UI — SENDING
         * ----------------------------------------------------
         */

        submitButton.disabled =
          true;


        const originalButtonText =
          submitButton.textContent;


        submitButton.textContent =
          'Sending...';


        setStatus(
          form,
          'Sending your message...',
          'sending'
        );


        /*
         * ----------------------------------------------------
         * SEND TO CLOUDFLARE WORKER
         * ----------------------------------------------------
         */

        try {

          console.log(
            'Submitting contact form to:',
            WORKER_URL
          );


          const response =
            await fetch(
              WORKER_URL,
              {
                method: 'POST',

                headers: {
                  'Content-Type':
                    'application/json'
                },

                body:
                  JSON.stringify({

                    name,

                    email,

                    inquiry_type:
                      selectedInquiryType,

                    message,

                    website,

                    turnstile_token:
                      token

                  })

              }
            );


          /*
           * --------------------------------------------------
           * READ RESPONSE
           * --------------------------------------------------
           */

          let result =
            {};


          try {

            result =
              await response.json();

          } catch {

            result =
              {};

          }


          console.log(
            'Worker response:',
            response.status,
            result
          );


          /*
           * --------------------------------------------------
           * WORKER ERROR
           * --------------------------------------------------
           */

          if (
            !response.ok ||
            result.success !== true
          ) {

            throw new Error(
              result.error ||
              'Unable to send your message.'
            );

          }


          /*
           * --------------------------------------------------
           * SUCCESS
           * --------------------------------------------------
           */

          setStatus(
            form,
            'Message sent successfully. We will get back to you soon.',
            'success'
          );


          /*
           * Reset form fields.
           */

          form.reset();


          /*
           * Restore inquiry type.
           */

          chips.forEach(
            (chip) => {

              chip.classList.remove(
                'on'
              );

            }
          );


          if (
            chips[0]
          ) {

            chips[0].classList.add(
              'on'
            );

          }


          selectedInquiryType =
            'Sales & Licensing';


          if (
            inquiryTypeInput
          ) {

            inquiryTypeInput.value =
              'Sales & Licensing';

          }


          /*
           * Turnstile tokens are single-use.
           */

          resetTurnstile();


        } catch (error) {

          console.error(
            'Contact form error:',
            error
          );


          setStatus(
            form,
            error.message ||
            'We could not send your message. Please try again later.',
            'error'
          );


          /*
           * A failed Turnstile submission should
           * receive a fresh token.
           */

          resetTurnstile();


        } finally {

          submitButton.disabled =
            false;

          submitButton.textContent =
            originalButtonText;

        }

      }
    );


    /*
     * ========================================================
     * INITIALIZE TURNSTILE AFTER FORM EXISTS
     * ========================================================
     */

    initializeTurnstile(
      form
    );

  }


  /*
   * ============================================================
   * SECTIONS LOADED EVENT
   * ============================================================
   *
   * main.js dispatches this AFTER it inserts the sections.
   * ============================================================
   */

  window.addEventListener(
    'sectionsLoaded',
    () => {

      console.log(
        'sectionsLoaded received by contact.js'
      );


      initializeEmailLinks();

      initializeContactForm();

    }
  );


  /*
   * ============================================================
   * INITIAL PAGE LOAD
   * ============================================================
   *
   * In case sectionsLoaded was dispatched before this script
   * was ready, check once after DOMContentLoaded.
   * ============================================================
   */

  document.addEventListener(
    'DOMContentLoaded',
    () => {

      /*
       * If main.js has already loaded the sections,
       * initialize immediately.
       */

      if (
        document.getElementById(
          'contact-form'
        )
      ) {

        console.log(
          'Contact form already exists at DOMContentLoaded.'
        );


        initializeEmailLinks();

        initializeContactForm();

      }

    }
  );


})();