document.addEventListener(
  'DOMContentLoaded',
  () => {

    /*
     * ======================================================
     * EMAIL COPY LINKS
     * ======================================================
     */

    const emailElements =
      document.querySelectorAll(
        '.ch-val'
      );


    emailElements.forEach(
      (el) => {

        if (
          el.href &&
          el.href.startsWith(
            'mailto:'
          )
        ) {

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

        }

      }
    );


    /*
     * ======================================================
     * CONTACT FORM
     * ======================================================
     */

    const form =
      document.querySelector(
        '.cf'
      );


    if (!form) {

      console.warn(
        'Contact form not found.'
      );

      return;

    }


    /*
     * Inquiry type chips
     */

    const chips =
      form.querySelectorAll(
        '.chip'
      );


    let selectedInquiryType =
      'Sales & Licensing';


    chips.forEach(
      (chip) => {

        chip.addEventListener('click', () => {

          chips.forEach((item) => {
            item.classList.remove('on');
          });

          chip.classList.add('on');

          selectedInquiryType =
            chip.dataset.value ||
            chip.textContent.trim();

          const inquiryTypeInput =
            document.getElementById('inquiry-type');

          if (inquiryTypeInput) {
            inquiryTypeInput.value =
              selectedInquiryType;
          }

        });

      }
    );


    /*
     * ======================================================
     * STATUS MESSAGE
     * ======================================================
     */

    const submitButton =
      form.querySelector(
        '.btn-send'
      );


    const statusElement =
      document.createElement(
        'div'
      );


    statusElement.className =
      'contact-form-status';


    statusElement.setAttribute(
      'role',
      'status'
    );


    statusElement.setAttribute(
      'aria-live',
      'polite'
    );


    submitButton.insertAdjacentElement(
      'afterend',
      statusElement
    );


    function setStatus(
      message,
      type
    ) {

      statusElement.textContent =
        message;

      statusElement.dataset.status =
        type;

    }


    /*
     * ======================================================
     * FORM SUBMISSION
     * ======================================================
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
         * --------------------------------------------------
         * READ FORM
         * --------------------------------------------------
         */

        const name =
          document
            .getElementById(
              'contact-name'
            )
            ?.value
            ?.trim() || '';


        const email =
          document
            .getElementById(
              'contact-email'
            )
            ?.value
            ?.trim() || '';


        const message =
          document
            .getElementById(
              'contact-message'
            )
            ?.value
            ?.trim() || '';


        const website =
          document
            .getElementById(
              'contact-website'
            )
            ?.value
            ?.trim() || '';


        /*
         * --------------------------------------------------
         * HTML5 VALIDATION
         * --------------------------------------------------
         */

        if (
          !form.checkValidity()
        ) {

          form.reportValidity();

          return;

        }


        /*
         * --------------------------------------------------
         * TURNSTILE TOKEN
         * --------------------------------------------------
         */

        const turnstileElement =
          document.querySelector(
            '[name="cf-turnstile-response"]'
          );


        const turnstileToken =
          turnstileElement
            ?.value
            ?.trim() || '';


        if (!turnstileToken) {

          setStatus(
            'Please complete the security verification and try again.',
            'error'
          );

          return;

        }


        /*
         * --------------------------------------------------
         * UI: SENDING
         * --------------------------------------------------
         */

        submitButton.disabled =
          true;


        const originalButtonText =
          submitButton.textContent;


        submitButton.textContent =
          'Sending...';


        setStatus(
          'Sending your message...',
          'sending'
        );


        /*
         * --------------------------------------------------
         * SEND TO CLOUDFLARE WORKER
         * --------------------------------------------------
         *
         * IMPORTANT:
         * Replace this URL with your actual
         * Cloudflare Worker URL.
         *
         * Example:
         *
         * https://contact-api.entechlabs.com
         *
         * or:
         *
         * https://your-worker.your-subdomain.workers.dev
         * --------------------------------------------------
         */

        const WORKER_URL =
          'https://api.entechlabs.com';


        try {

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
                      turnstileToken

                  })
              }
            );


          /*
           * ------------------------------------------------
           * READ RESPONSE
           * ------------------------------------------------
           */

          let result;

          try {

            result =
              await response.json();

          } catch {

            result = {};

          }


          /*
           * ------------------------------------------------
           * WORKER ERROR
           * ------------------------------------------------
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
           * ------------------------------------------------
           * SUCCESS
           *
           * This happens ONLY when:
           *
           * Browser
           *   ↓
           * Worker
           *   ↓
           * Turnstile ✓
           *   ↓
           * Apps Script ✓
           *   ↓
           * GmailApp ✓
           *   ↓
           * HTTP success
           * ------------------------------------------------
           */

          setStatus(
            'Message sent successfully. We will get back to you soon.',
            'success'
          );


          form.reset();


          /*
           * Restore default inquiry type.
           */

          chips.forEach(
            (chip) => {

              chip.classList.remove(
                'on'
              );

            }
          );


          if (chips[0]) {

            chips[0].classList.add(
              'on'
            );

          }


          selectedInquiryType =
            'Sales & Licensing';


          /*
           * Reset Turnstile.
           */

          if (
            window.turnstile
          ) {

            try {

              window.turnstile.reset();

            } catch (error) {

              console.warn(
                'Turnstile reset failed:',
                error
              );

            }

          }


        } catch (error) {

          console.error(
            'Contact form error:',
            error
          );


          setStatus(
            error.message ||
            'We could not send your message. Please try again later.',
            'error'
          );


          /*
           * Turnstile tokens are
           * generally single-use.
           * Reset after a failed submission.
           */

          if (
            window.turnstile
          ) {

            try {

              window.turnstile.reset();

            } catch (resetError) {

              console.warn(
                'Turnstile reset failed:',
                resetError
              );

            }

          }


        } finally {

          submitButton.disabled =
            false;

          submitButton.textContent =
            originalButtonText;

        }

      }
    );

  }
);