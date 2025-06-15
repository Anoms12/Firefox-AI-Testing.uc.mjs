# Firefox-AI-Testing.uc.mjs
An AI research project to try and make Firefox's native AI easier to use in autoconfig scripts

## How it works
```
  // Native AI summarization using Firefox's engine
  async function processPromptWithEngine(fullPromptInput) {
    try {
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
```

Define fullPromptInput and you can send prompts to the AI, we currently just have a textbox on the browser that you can enter prompts into.

## What's next?
We would like to find the compatible models so we can find the best one for each senario.

# TESTED ON NIGHTLY
