// ==UserScript==
// @name           AI Prompt Testbox (Native Firefox AI)
// @description    Floating textbox for prompt input using native Firefox AI summarization engine
// @include        main
// ==/UserScript==
/**
 * This script creates a floating textbox in the browser window for AI prompt input.
 * When you hit Enter, the textbox is replaced with a loading indicator.
 * The entered prompt is summarized using Firefox's native AI engine.
 * Errors and results are shown in the UI and logged to the console.
 */

(async function() {
  // Utility to remove the current prompt box if it exists
  function removeExistingBox() {
    const existing = document.getElementById('ai-prompt-testbox-box');
    if (existing) existing.remove();
  }

  // Create the floating box
  function createPromptBox() {
    removeExistingBox();
    const box = document.createElement('div');
    box.id = 'ai-prompt-testbox-box';
    box.style.position = 'fixed';
    box.style.top = '20px';
    box.style.right = '20px';
    box.style.zIndex = '99999';
    box.style.background = 'rgba(30,30,40,0.98)';
    box.style.border = '1.5px solid #aaa';
    box.style.borderRadius = '8px';
    box.style.padding = '20px';
    box.style.boxShadow = '0 4px 12px #0009';
    box.style.fontFamily = 'sans-serif';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter prompt, then press Enter...';
    input.style.fontSize = '18px';
    input.style.padding = '8px';
    input.style.width = '340px';
    input.style.borderRadius = '5px';
    input.style.border = '1.5px solid #888';

    // Handle Enter key
    input.addEventListener('keydown', async function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        startLoading(input.value, box);
      }
    });

    box.appendChild(input);

    // Add a close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.title = 'Close';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '6px';
    closeBtn.style.right = '10px';
    closeBtn.style.background = 'transparent';
    closeBtn.style.border = 'none';
    closeBtn.style.fontSize = '22px';
    closeBtn.style.color = '#ddd';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.padding = '0';
    closeBtn.onmouseenter = () => { closeBtn.style.color = '#f55'; };
    closeBtn.onmouseleave = () => { closeBtn.style.color = '#ddd'; };
    closeBtn.onclick = removeExistingBox;
    box.appendChild(closeBtn);

    document.documentElement.appendChild(box);
    input.focus();
  }

  // Transition to loading
  function startLoading(prompt, box) {
    console.log('Prompt submitted:', prompt);
    box.innerHTML = ''; // Clear contents

    const spinner = document.createElement('div');
    spinner.innerHTML = `
      <svg style="display:block;margin:auto;" width="48" height="48" viewBox="0 0 50 50">
        <circle cx="25" cy="25" r="20" fill="none" stroke="#59f" stroke-width="5" 
          stroke-linecap="round" stroke-dasharray="100, 200" transform="rotate(-90 25 25)">
          <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25"
            dur="1s" repeatCount="indefinite"/>
        </circle>
      </svg>
      <span style="display:block;text-align:center;color:#fff;margin-top:10px;">Generating response...</span>
    `;
    box.appendChild(spinner);

    // Call native Firefox AI
    processPromptWithEngine(prompt)
      .then(result => {
        showResult(result, box);
      })
      .catch(err => {
        showError(err, box);
      });
  }

  // Native AI summarization using Firefox's engine
  async function processPromptWithEngine(fullPromptInput) {
    try {
      // Delete all cached models for a clean slate (for debugging)
      // await browser.trial.ml.deleteCachedModels(); // This line is not accessible in user scripts and caused the TypeError

      // Dynamically import the engine (must be in async function scope)
      const { createEngine } = ChromeUtils.importESModule("chrome://global/content/ml/EngineProcess.sys.mjs");
      let engine = await createEngine({
        taskName: "text2text-generation", 
        modelId: "Xenova/LaMini-Flan-T5-248M",
        modelHub: "huggingface",
        engineId: "categorization-engine"
      });
      // Run the AI engine
      let result = await engine.run({ args: [fullPromptInput], options: { max_new_tokens: 100, temputure: 500 } });
      console.log('AI engine result:', result);
      if (result && result[0] && result[0].generated_text) {
        return result[0].generated_text;
      } else if (result && result[0]) {
        return JSON.stringify(result[0]);
      } else {
        return "No response returned.";
      }
    } catch (e) {
      console.error('AI Engine Error:', e);
      throw e;
    }
  }

  function showResult(result, box) {
    console.log('AI result:', result);
    box.innerHTML = ''; // Clear contents

    const resultDiv = document.createElement('div');
    resultDiv.style.color = '#2ef';
    resultDiv.style.fontSize = '17px';
    resultDiv.style.marginBottom = '8px';
    resultDiv.style.wordBreak = 'break-word';
    resultDiv.textContent = result;
    box.appendChild(resultDiv);

    const tryAgainBtn = document.createElement('button');
    tryAgainBtn.id = 'ai-prompt-testbox-tryagain';
    tryAgainBtn.textContent = 'Try Again';
    tryAgainBtn.style.fontSize = '15px';
    tryAgainBtn.style.padding = '2px 10px';
    tryAgainBtn.style.marginRight = '8px';
    tryAgainBtn.onclick = createPromptBox;
    box.appendChild(tryAgainBtn);

    const closeBtn = document.createElement('button');
    closeBtn.id = 'ai-prompt-testbox-close';
    closeBtn.textContent = 'Close';
    closeBtn.style.fontSize = '15px';
    closeBtn.style.padding = '2px 10px';
    closeBtn.onclick = removeExistingBox;
    box.appendChild(closeBtn);
  }

  function showError(err, box) {
    console.error('AI Error:', err);
    box.innerHTML = ''; // Clear contents

    const errorDiv = document.createElement('div');
    errorDiv.style.color = '#f55';
    errorDiv.style.fontSize = '17px';
    errorDiv.style.marginBottom = '8px';
    errorDiv.style.wordBreak = 'break-word';
    errorDiv.textContent = `Error: ${err.message || err}`;
    box.appendChild(errorDiv);

    const retryBtn = document.createElement('button');
    retryBtn.id = 'ai-prompt-testbox-retry';
    retryBtn.textContent = 'Retry';
    retryBtn.style.fontSize = '15px';
    retryBtn.style.padding = '2px 10px';
    retryBtn.style.marginRight = '8px';
    retryBtn.onclick = createPromptBox;
    box.appendChild(retryBtn);

    const closeBtn = document.createElement('button');
    closeBtn.id = 'ai-prompt-testbox-close';
    closeBtn.textContent = 'Close';
    closeBtn.style.fontSize = '15px';
    closeBtn.style.padding = '2px 10px';
    closeBtn.onclick = removeExistingBox;
    box.appendChild(closeBtn);
  }

  // Trigger the prompt box via hotkey (Ctrl+Alt+P) or immediately
  window.addEventListener('keydown', e => {
    if (e.ctrlKey && e.altKey && (e.key === 'p' || e.key === 'P')) {
      createPromptBox();
    }
  });

  // Optionally: Show automatically on script load
  createPromptBox();
})();
