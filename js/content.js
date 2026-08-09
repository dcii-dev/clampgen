(function () {
  "use strict";

  /**
   * Builds the FAQ accordion from the parsed JSON data.
   * @param {Array<{question: string, answer: string}>} data
   * @param {HTMLElement} container
   */
  function renderFaq(data, container) {
    const fragment = document.createDocumentFragment();

    data.forEach((item, index) => {
      const details = document.createElement("details");
      details.className = "faq__item";

      if (index === 0) {
        details.open = true;
      }

      const summary = document.createElement("summary");
      summary.className = "faq__question";
      summary.textContent = item.question;

      const answer = document.createElement("p");
      answer.className = "faq__answer";
      answer.textContent = item.answer;

      details.appendChild(summary);
      details.appendChild(answer);
      fragment.appendChild(details);
    });

    container.appendChild(fragment);
  }

  /**
   * Injects FAQPage JSON-LD schema into the document head.
   * @param {Array<{question: string, answer: string}>} data
   */
  function injectFaqSchema(data) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: data.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }

  /**
   * Fetches FAQ data and renders the accordion.
   */
  function loadContent() {
    const container = document.getElementById("faq-accordion");
    if (!container) return;

    fetch("./data/faq.json")
      .then((response) => {
        if (!response.ok) throw new Error("FAQ data unavailable.");
        return response.json();
      })
      .then((data) => {
        renderFaq(data, container);
        injectFaqSchema(data);
      })
      .catch(() => {
        // Silently fail — FAQ is supplementary content, not critical UI.
      });
  }

  if (document.readyState === "complete") {
    loadContent();
  } else {
    window.addEventListener("load", loadContent, { once: true });
  }
})();
