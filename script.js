// LaTeX Math Editor - ES Module Version with MathLive
// Converted from React component to pure JavaScript with ES6 imports

import { MathfieldElement } from "mathlive";

// Global variables (replacing React state)
let mathFieldElement = null;
let latexValue = "";
let mathJSON = "";
let isValid = true;
let currentMode = "math";
let showStyleMenu = false;
let showBgMenu = false;
let showExamplesMenu = false;
let showInsertMenu = false;
let showFormulaMenu = false;
let canUndo = false;
let canRedo = false;
let savedExamples = [];
let showSaveDialog = false;
let saveLabel = "";

// Device detection
let isTouchDevice = false;

// Function to detect touch devices
function detectTouchDevice() {
  // Check for touch capability
  const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  // Check for mobile/tablet using user agent (more reliable for actual mobile devices)
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  // Check for pointer: coarse (touch devices)
  const hasCoarsePointer =
    window.matchMedia && window.matchMedia("(pointer: coarse)").matches;

  // Consider it a touch device if any of these conditions are true
  return hasTouch && (isMobile || hasCoarsePointer);
}

// Formül kategorileri ve formüller
const FORMULA_CATEGORIES = [
  {
    title: "İlkokul Formülleri",
    formulas: [
      {
        id: "primary-perimeter-square",
        label: "Kare Çevre",
        latex: "\\text{Çevre}=4a",
      },
      {
        id: "primary-area-square",
        label: "Kare Alan",
        latex: "\\text{Alan}=a^2",
      },
      {
        id: "primary-perimeter-rectangle",
        label: "Dikdörtgen Çevre",
        latex: "\\text{Çevre}=2(a+b)",
      },
      {
        id: "primary-area-rectangle",
        label: "Dikdörtgen Alan",
        latex: "\\text{Alan}=a\\times b",
      },
    ],
  },
  {
    title: "Ortaokul Formülleri",
    formulas: [
      {
        id: "middle-circle-area",
        label: "Daire Alan",
        latex: "\\text{Alan}=\\pi r^2",
      },
      {
        id: "middle-circle-perimeter",
        label: "Daire Çevre",
        latex: "\\text{Çevre}=2\\pi r",
      },
      {
        id: "middle-pythagoras",
        label: "Pisagor Teoremi",
        latex: "a^2+b^2=c^2",
      },
      {
        id: "middle-triangle-area",
        label: "Üçgen Alanı",
        latex: "\\text{Alan}=\\frac{h\\times t}{2}",
      },
    ],
  },
  {
    title: "Lise Formülleri",
    formulas: [
      {
        id: "high-quadratic",
        label: "İkinci Derece Denklem",
        latex: "x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}",
      },
      {
        id: "high-arithmetic-sequence",
        label: "Aritmetik Dizi",
        latex: "a_n=a_1+(n-1)d",
      },
      {
        id: "high-geometric-sequence",
        label: "Geometrik Dizi",
        latex: "a_n=a_1\\times r^{n-1}",
      },
      {
        id: "high-derivative",
        label: "Türev (Kuvvet Kuralı)",
        latex: "\\frac{d}{dx}x^n=nx^{n-1}",
      },
      {
        id: "high-integral",
        label: "İntegral (Kuvvet Kuralı)",
        latex: "\\int x^n dx=\\frac{x^{n+1}}{n+1}+C",
      },
    ],
  },
];

// Default examples array
const defaultExamples = [
  {
    id: "default-1",
    name: "Your Formula",
    latex: String.raw`\sum_{n=1}^{\infty}\frac{1}{n^2}=\frac{\pi^2}{6}\text{ değerinin 3 e bölümünden kalan son değeri \underline{tam olarak nedir?}}`,
  },
  {
    id: "default-2",
    name: "Quadratic Formula",
    latex: String.raw`x=\frac{-b\pm\sqrt{b^2 - 4ac}}{2a}\text{ formülünün sonucu \underline{tam say\i} değeri olarak nedir?}`,
  },
  {
    id: "default-3",
    name: "Integral",
    latex: String.raw`\int_0^{\infty}e^{-x}dx=1\text{'e eşit ise bu formülün sonucunda birden den farkl\i kaç senaryo olabilir.}`,
  },
  {
    id: "default-4",
    name: "Sum",
    latex: String.raw`\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}`,
  },
  {
    id: "default-5",
    name: "Matrix",
    latex: String.raw`\begin{pmatrix} a & b \\ c & d \end{pmatrix}`,
  },
];

// Utility Functions
function convertToLatexValue(rawLatex) {
  const processedLatex = String.raw`${rawLatex}`.replace(/\$\$/g, "").trim();
  latexValue = processedLatex;
  return processedLatex;
}

function extractMathFormulas(latex) {
  const mathParts = [];
  let currentPart = "";
  let inText = false;
  let braceCount = 0;

  for (let i = 0; i < latex.length; i++) {
    if (latex.slice(i, i + 6) === "\\text{") {
      inText = true;
      braceCount = 1;
      i += 5;
      continue;
    }

    if (inText) {
      if (latex[i] === "{") braceCount++;
      if (latex[i] === "}") braceCount--;
      if (braceCount === 0) {
        inText = false;
        if (currentPart.trim()) {
          mathParts.push(currentPart.trim());
          currentPart = "";
        }
      }
      continue;
    }

    currentPart += latex[i];
    if (!inText && latex[i] === " " && currentPart.trim()) {
      mathParts.push(currentPart.trim());
      currentPart = "";
    }
  }

  if (currentPart.trim()) {
    mathParts.push(currentPart.trim());
  }

  return mathParts.join(" ");
}

// Export functions
async function exportAsPNG(mathOnly = false) {
  if (!latexValue.trim()) {
    alert("Please enter a LaTeX expression first.");
    return;
  }

  try {
    const previewContainers = document.querySelectorAll(
      ".bg-white.rounded-lg.shadow-lg.p-6"
    );
    let previewContainer = null;

    for (const container of previewContainers) {
      const heading = container.querySelector("h2");
      if (heading && heading.textContent.includes("Live Preview")) {
        previewContainer = container;
        break;
      }
    }

    if (!previewContainer) {
      alert(
        "Preview not found. Please make sure the LaTeX expression is valid."
      );
      return;
    }

    const formulaElement = previewContainer.querySelector(
      ".kate-preview-component"
    );
    if (!formulaElement) {
      alert(
        "Could not find rendered formula. Please check your LaTeX expression."
      );
      return;
    }

    const contentToExport = mathOnly
      ? extractMathFormulas(latexValue)
      : latexValue;

    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.padding = "20px";
    container.style.backgroundColor = "white";
    container.style.width = "fit-content";
    container.style.minWidth = "500px";
    container.style.margin = "0";
    container.style.fontSize = "16px";
    document.body.appendChild(container);

    const styleSheet = `
      .katex {
        font: normal 1.21em KaTeX_Main, Times New Roman, serif;
        line-height: 1.2;
        text-indent: 0;
        text-rendering: auto;
      }
      .katex-display {
        display: block;
        margin: 1em 0;
        text-align: center;
      }
      .katex .base {
        position: relative;
        white-space: nowrap;
        width: min-content;
      }
      .katex .strut {
        display: inline-block;
      }
      .katex .mord {
        font-family: KaTeX_Main;
      }
      .katex .mfrac {
        display: inline-block;
        
      }
      .katex .sqrt {
        display: inline-block;
      }
    `;

    const style = document.createElement("style");
    style.textContent = styleSheet;
    container.appendChild(style);

    const formulaContainer = document.createElement("div");
    formulaContainer.style.padding = "20px";
    formulaContainer.style.margin = "0";
    container.appendChild(formulaContainer);

    // Render using KaTeX if available
    if (window.katex) {
      katex.render(contentToExport, formulaContainer, {
        displayMode: true,
        throwOnError: false,
        output: "html",
        trust: true,
        strict: false,
        macros: {
          "\\RR": "\\mathbb{R}",
          "\\NN": "\\mathbb{N}",
          "\\ZZ": "\\mathbb{Z}",
          "\\CC": "\\mathbb{C}",
          "\\QQ": "\\mathbb{Q}",
        },
      });
    } else {
      formulaContainer.innerHTML = contentToExport;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Use html2canvas if available
    if (window.html2canvas) {
      const canvas = await html2canvas(container, {
        backgroundColor: "white",
        scale: 3,
        logging: true,
        useCORS: true,
        allowTaint: true,
      });

      canvas.toBlob(
        (blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = mathOnly
            ? `math-only-${Date.now()}.png`
            : `full-question-${Date.now()}.png`;
          link.click();

          setTimeout(() => {
            URL.revokeObjectURL(url);
            document.body.removeChild(container);
          }, 100);
        },
        "image/png",
        1.0
      );
    }
  } catch (error) {
    console.error("PNG export error:", error);
    alert("Error exporting PNG. Please check your LaTeX expression.");
  }
}

// Mode change functions
function handleModeChange(newMode) {
  currentMode = newMode;

  if (mathFieldElement) {
    try {
      // Determine virtual keyboard mode based on device type
      const vkMode = isTouchDevice ? "onfocus" : "manual";

      // Use MathLive's proper mode switching API
      if (newMode === "text") {
        mathFieldElement.defaultMode = "text";
        mathFieldElement.setOptions({
          virtualKeyboardMode: vkMode,
          smartFence: false,
          smartMode: false,
        });
      } else if (newMode === "latex") {
        mathFieldElement.defaultMode = "math";
        mathFieldElement.setOptions({
          virtualKeyboardMode: vkMode,
          smartFence: true,
          smartMode: true,
        });
      } else if (newMode === "math") {
        mathFieldElement.defaultMode = "math";
        mathFieldElement.setOptions({
          virtualKeyboardMode: vkMode,
          smartFence: true,
          smartMode: true,
        });
      }

      // Switch to the specified mode immediately using switchMode method
      if (mathFieldElement.switchMode) {
        if (newMode === "text") {
          mathFieldElement.switchMode("text");
        } else if (newMode === "latex") {
          mathFieldElement.switchMode("latex");
        } else {
          mathFieldElement.switchMode("math");
        }
      } else {
        // Fallback to executeCommand
        if (newMode === "text") {
          mathFieldElement.executeCommand("switchMode", "text");
        } else if (newMode === "latex") {
          mathFieldElement.executeCommand("switchMode", "latex");
        } else {
          mathFieldElement.executeCommand("switchMode", "math");
        }
      }
    } catch (error) {}
  }
  updateModeButtons();
}

function updateModeButtons() {
  const textBtn = document.getElementById("text-mode-btn");
  const mathBtn = document.getElementById("math-mode-btn");
  const latexBtn = document.getElementById("latex-mode-btn");

  // Reset all buttons to inactive state
  [textBtn, mathBtn, latexBtn].forEach((btn) => {
    if (btn) {
      btn.classList.remove("bg-blue-100", "text-blue-600");
      btn.classList.add("hover:bg-gray-100");
      btn.classList.remove("text-gray-600");
    }
  });

  // Set active button based on current mode
  let activeBtn = null;
  if (currentMode === "text") {
    activeBtn = textBtn;
  } else if (currentMode === "math") {
    activeBtn = mathBtn;
  } else if (currentMode === "latex") {
    activeBtn = latexBtn;
  }

  if (activeBtn) {
    activeBtn.classList.add("bg-blue-100", "text-blue-600");
    activeBtn.classList.remove("hover:bg-gray-100");
  }
}

// Function to check MathLive's current mode and update toolbar
function checkAndUpdateMode() {
  if (!mathFieldElement) return;

  let detectedMode = null;

  // Try different ways to get the current mode from MathLive
  try {
    // Try various API methods to get current mode
    if (mathFieldElement.mode !== undefined) {
      const actualMode = mathFieldElement.mode;
      if (actualMode === "text") {
        detectedMode = "text";
      } else if (actualMode === "latex") {
        detectedMode = "latex";
      } else {
        detectedMode = "math";
      }
    } else if (mathFieldElement.getOption) {
      // Try to detect from options
      const virtualKeyboardMode = mathFieldElement.getOption(
        "virtualKeyboardMode"
      );
      const defaultMode = mathFieldElement.getOption("defaultMode");

      if (defaultMode === "text") {
        detectedMode = "text";
      } else if (virtualKeyboardMode === "manual") {
        detectedMode = "latex"; // Likely latex mode
      } else {
        detectedMode = "math"; // Likely math mode
      }
    }
  } catch (error) {
    // Don't update if we can't detect the mode
    return;
  }

  // If we detected a mode and it's different from current, update
  if (detectedMode && currentMode !== detectedMode) {
    currentMode = detectedMode;
    updateModeButtons();
  }
}

// Undo/Redo functions
function handleUndo() {
  if (mathFieldElement) {
    try {
      mathFieldElement.executeCommand("undo");
    } catch (error) {}
  }
}

function handleRedo() {
  if (mathFieldElement) {
    try {
      mathFieldElement.executeCommand("redo");
    } catch (error) {}
  }
}

// Save functions
function handleSaveFormula() {
  if (!latexValue.trim()) {
    alert("Please enter a LaTeX expression first.");
    return;
  }
  showSaveDialog = true;
  document.getElementById("save-dialog").style.display = "flex";
}

function confirmSaveFormula() {
  const labelInput = document.getElementById("save-label-input");
  const label = labelInput.value.trim();

  if (!label) {
    alert("Please enter a label for your formula.");
    return;
  }

  const newExample = {
    id: `saved-${Date.now()}`,
    name: label,
    latex: latexValue,
    timestamp: new Date().toISOString(),
  };

  savedExamples.push(newExample);
  labelInput.value = "";
  showSaveDialog = false;
  document.getElementById("save-dialog").style.display = "none";

  // Examples menu will be refreshed automatically when opened
}

function deleteExample(id) {
  savedExamples = savedExamples.filter((example) => example.id !== id);

  // Examples menu will be refreshed automatically when opened
}

// KaTeX Preview Functions (converted from KaTeXPreview.js React component)
function renderKaTeXPreview(
  element,
  latex,
  displayMode = true,
  className = ""
) {
  if (!element) return;

  // Clear previous content
  element.innerHTML = "";

  // Add className if provided
  if (className) {
    element.className = className;
  }

  // Handle empty latex
  if (!latex || latex.trim() === "") {
    element.innerHTML =
      '<div class="text-gray-400 italic">LaTeX expression will appear here...</div>';
    return;
  }

  try {
    // Replace \placeholder{} with a visible placeholder
    const processedLatex = latex.replace(
      /\\placeholder\{\}/g,
      "\\rule{1em}{1em}"
    );

    // Set container style
    element.style.width = "100%";
    element.style.overflowWrap = "break-word";

    // Render with KaTeX
    if (window.katex) {
      katex.render(processedLatex, element, {
        displayMode: displayMode,
        throwOnError: false,
        output: "html",
        trust: true,
        strict: false,
        macros: {
          "\\RR": "\\mathbb{R}",
          "\\NN": "\\mathbb{N}",
          "\\ZZ": "\\mathbb{Z}",
          "\\CC": "\\mathbb{C}",
          "\\QQ": "\\mathbb{Q}",
        },
      });
    } else {
      // Fallback if KaTeX is not loaded
      element.innerHTML = `<div class="text-orange-500 font-mono text-sm">KaTeX not loaded: ${processedLatex}</div>`;
    }
  } catch (error) {
    // Error handling - show raw LaTeX with error styling
    element.innerHTML = `
      <div class="text-red-500 font-mono text-sm p-2 bg-red-50 rounded border border-red-200">
        <div class="text-xs text-red-600 mb-1">Render Error:</div>
        ${latex}
      </div>
    `;
    console.warn("KaTeX rendering error:", error);
  }
}

// Wrapper function for easier use
function updateKaTeXPreview(latex) {
  const previewElement = document.getElementById("latex-preview");
  if (previewElement) {
    renderKaTeXPreview(
      previewElement,
      latex,
      true, // displayMode
      "kate-preview-component min-h-[60px] w-full py-4 text-center"
    );
  }
}

// Update functions
function updateLatexOutput() {
  const latexTextarea = document.getElementById("latex-output");
  if (latexTextarea) {
    latexTextarea.value = latexValue;
  }

  // Update MathJSON
  try {
    const customMathJSON = [`'${latexValue}'`];
    mathJSON = JSON.stringify(customMathJSON);
    isValid = true;
  } catch (error) {
    mathJSON = "Invalid LaTeX expression";
    isValid = false;
  }

  const mathJsonOutput = document.getElementById("mathjson-output");
  if (mathJsonOutput) {
    mathJsonOutput.textContent = mathJSON;
  }

  const statusIndicator = document.getElementById("status-indicator");
  const statusText = document.getElementById("status-text");
  const mathJsonContainer = document.getElementById("mathjson-container");

  if (statusIndicator && statusText && mathJsonContainer) {
    if (isValid) {
      statusIndicator.className = "w-3 h-3 rounded-full mr-2 bg-green-500";
      statusText.textContent = "Valid Expression";
      statusText.className = "text-sm font-medium text-green-800";
      mathJsonContainer.className =
        "p-4 rounded-lg border bg-green-50 border-green-200";
    } else {
      statusIndicator.className = "w-3 h-3 rounded-full mr-2 bg-red-500";
      statusText.textContent = "Invalid Expression";
      statusText.className = "text-sm font-medium text-red-800";
      mathJsonContainer.className =
        "p-4 rounded-lg border bg-red-50 border-red-200";
    }
  }

  // Update preview
  updatePreview();
}

function updatePreview() {
  // Use the new KaTeX preview function
  updateKaTeXPreview(latexValue);
}

// Menu functions
function toggleMenu(menuName) {
  // Close all menus first
  showStyleMenu = false;
  showBgMenu = false;
  showExamplesMenu = false;
  showInsertMenu = false;
  showFormulaMenu = false;

  // Toggle the requested menu
  switch (menuName) {
    case "style":
      showStyleMenu = !showStyleMenu;
      break;
    case "bg":
      showBgMenu = !showBgMenu;
      break;
    case "examples":
      showExamplesMenu = !showExamplesMenu;
      break;
    case "insert":
      showInsertMenu = !showInsertMenu;
      break;
    case "formula":
      showFormulaMenu = !showFormulaMenu;
      break;
  }

  updateMenuVisibility();
}

function updateMenuVisibility() {
  const styleMenu = document.getElementById("style-menu");
  const bgMenu = document.getElementById("bg-menu");
  const examplesMenu = document.getElementById("examples-menu");
  const insertMenu = document.getElementById("insert-menu");
  const formulaMenu = document.getElementById("formula-menu");

  if (styleMenu) styleMenu.style.display = showStyleMenu ? "block" : "none";
  if (bgMenu) bgMenu.style.display = showBgMenu ? "block" : "none";
  if (examplesMenu) {
    examplesMenu.style.display = showExamplesMenu ? "block" : "none";
    if (showExamplesMenu) {
      populateExamplesMenu();
    }
  }
  if (insertMenu) insertMenu.style.display = showInsertMenu ? "block" : "none";
  if (formulaMenu) {
    formulaMenu.style.display = showFormulaMenu ? "block" : "none";
    if (showFormulaMenu) {
      populateFormulaMenu();
    }
  }
}

function populateExamplesMenu() {
  const defaultExamplesList = document.getElementById("default-examples-list");
  const savedExamplesSection = document.getElementById(
    "saved-examples-section"
  );
  const savedExamplesList = document.getElementById("saved-examples-list");
  const examplesSeparator = document.getElementById("examples-separator");

  if (!defaultExamplesList) return;

  // Clear existing content
  defaultExamplesList.innerHTML = "";
  if (savedExamplesList) savedExamplesList.innerHTML = "";

  // Hide saved examples section since we're showing everything in one list
  if (savedExamplesSection) {
    savedExamplesSection.style.display = "none";
  }
  if (examplesSeparator) {
    examplesSeparator.style.display = "none";
  }

  // Combine all examples into one list (saved first, then default)
  const allExamples = [...savedExamples, ...defaultExamples];

  allExamples.forEach((example) => {
    const exampleDiv = document.createElement("div");
    exampleDiv.className =
      "w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors duration-150 cursor-pointer";
    exampleDiv.textContent = example.name;
    exampleDiv.dataset.exampleId = example.id;

    // Use addEventListener for better reliability
    exampleDiv.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      selectExample(example.id);
    });

    defaultExamplesList.appendChild(exampleDiv);
  });
}

function populateFormulaMenu() {
  const formulaList = document.getElementById("formula-list");

  if (!formulaList) return;

  // Clear existing content
  formulaList.innerHTML = "";

  // Create grouped formulas with category headers
  FORMULA_CATEGORIES.forEach((category) => {
    // Create category header
    const categoryHeader = document.createElement("div");
    categoryHeader.className =
      "sticky top-0 z-10 bg-gradient-to-r from-blue-50 to-white px-4 py-2 border-b border-gray-200";
    categoryHeader.innerHTML = `<div class="font-semibold text-sm text-blue-800">${category.title}</div>`;
    formulaList.appendChild(categoryHeader);

    // Add formulas for this category
    category.formulas.forEach((formula) => {
      const formulaDiv = document.createElement("div");
      formulaDiv.className =
        "w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors duration-150 cursor-pointer";
      formulaDiv.textContent = formula.label;
      formulaDiv.dataset.latex = formula.latex;

      // Use addEventListener for better reliability
      formulaDiv.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        insertFormula(formula.latex);
      });

      formulaList.appendChild(formulaDiv);
    });
  });
}

// Examples menu is now handled by toggleMenu("examples")

function selectExample(exampleId) {
  const allExamples = [...savedExamples, ...defaultExamples];
  const selectedExample = allExamples.find(
    (example) => example.id === exampleId
  );

  if (!selectedExample) {
    console.error("No example found with ID:", exampleId);
    return;
  }

  if (!mathFieldElement) {
    console.error("mathFieldElement is not initialized");
    return;
  }

  try {
    // Method 1: Clear and set using value property
    mathFieldElement.value = "";

    // Small delay to ensure clear is complete
    setTimeout(() => {
      mathFieldElement.value = selectedExample.latex;

      // Check if value was set correctly
      if (mathFieldElement.value !== selectedExample.latex) {
        // Method 2: Clear and use insert
        mathFieldElement.value = "";
        mathFieldElement.insert(selectedExample.latex);
      }

      // Update global variable
      latexValue = selectedExample.latex;

      // Manually trigger input event to ensure all handlers are called
      const inputEvent = new Event("input", { bubbles: true });
      mathFieldElement.dispatchEvent(inputEvent);

      // Also call updateLatexOutput directly to ensure displays are updated
      updateLatexOutput();

      // Focus the mathfield to show the change
      mathFieldElement.focus();
    }, 10);

    // Close examples menu immediately
    showExamplesMenu = false;
    updateMenuVisibility();
  } catch (error) {
    console.error("Error loading example:", error);
  }
}

// Color application functions
function applyColor(color) {
  if (mathFieldElement) {
    try {
      mathFieldElement.executeCommand("applyStyle", { color: color });
      toggleMenu("style");
    } catch (error) {
      console.error("Color application error:", error);
    }
  }
}

function applyBackgroundColor(color) {
  if (mathFieldElement) {
    try {
      mathFieldElement.executeCommand("applyStyle", { backgroundColor: color });
      toggleMenu("bg");
    } catch (error) {
      console.error("Background color application error:", error);
    }
  }
}

// Insert functions
function insertSymbol(command) {
  if (mathFieldElement) {
    try {
      mathFieldElement.executeCommand(["insert", command]);
      toggleMenu("insert");
    } catch (error) {
      console.error("Insert symbol error:", error);
    }
  }
}

function insertFormula(latex) {
  if (mathFieldElement) {
    try {
      mathFieldElement.insert(latex);
      // Close formula menu after insertion
      showFormulaMenu = false;
      updateMenuVisibility();
    } catch (error) {
      console.error("Insert formula error:", error);
    }
  }
}

// Initialization function with programmatic MathfieldElement creation
function initializeMathLive() {
  // Detect device type first
  isTouchDevice = detectTouchDevice();
  console.log(
    `Device detection: ${
      isTouchDevice
        ? "Touch Device (Mobile/Tablet)"
        : "Non-Touch Device (Desktop)"
    }`
  );

  // Create MathfieldElement programmatically
  mathFieldElement = new MathfieldElement();

  // Determine virtual keyboard mode based on device type
  const vkMode = isTouchDevice ? "onfocus" : "manual";

  // Configure the mathfield with options based on current mode
  if (currentMode === "text") {
    mathFieldElement.setOptions({
      virtualKeyboardMode: vkMode,
      smartFence: false,
      smartMode: false,
      defaultMode: "text",
    });
  } else if (currentMode === "latex") {
    mathFieldElement.setOptions({
      virtualKeyboardMode: vkMode,
      smartFence: true,
      smartMode: true,
      defaultMode: "math",
    });
  } else {
    // math mode (default)
    mathFieldElement.setOptions({
      virtualKeyboardMode: vkMode,
      smartFence: true,
      smartMode: true,
      defaultMode: "math",
    });
  }

  // Set CSS classes and styling
  mathFieldElement.className =
    "w-full min-h-[80px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none";
  mathFieldElement.id = "math-field";

  // Find the container and replace the existing math-field element
  const existingElement = document.getElementById("math-field");
  if (existingElement && existingElement.parentNode) {
    existingElement.parentNode.replaceChild(mathFieldElement, existingElement);
  } else {
    console.error("Could not find existing math-field element to replace");
    return;
  }

  // Use default initial value
  const initialLatex = convertToLatexValue(
    String.raw`x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}\text{ formülünün sonucu \underline{tam say\i} değeri olarak nedir?}`
  );

  // Set initial value
  try {
    mathFieldElement.value = initialLatex;

    // Update displays
    updateLatexOutput();
  } catch (error) {
    console.error("Error setting initial value:", error);
  }

  // Listen for changes
  mathFieldElement.addEventListener("input", (event) => {
    try {
      // Get value from MathLive element
      latexValue = mathFieldElement.value || "";

      updateLatexOutput();

      // Note: Mode changes should be handled by mode-change event
      // Checking mode on every input can cause performance issues
    } catch (error) {
      console.error("Error in input event handler:", error);
    }
  });

  // Listen to focus/blur events
  mathFieldElement.addEventListener("focus", () => {
    // Check mode when focused in case it changed from context menu
    checkAndUpdateMode();
  });

  mathFieldElement.addEventListener("blur", () => {});

  // Listen for selection changes (but don't check mode on every selection change to avoid errors)
  mathFieldElement.addEventListener("selection-change", () => {
    // Only check mode periodically, not on every selection change
    // Mode-change event should handle most cases
  });

  // Listen to mode changes from MathLive
  mathFieldElement.addEventListener("mode-change", (event) => {
    try {
      if (!event.detail || !event.detail.mode) {
        return;
      }

      const mathLiveMode = event.detail.mode;

      // Map MathLive modes to our internal modes
      let detectedMode;

      if (mathLiveMode === "text") {
        detectedMode = "text";
      } else if (mathLiveMode === "latex") {
        detectedMode = "latex";
      } else if (mathLiveMode === "math") {
        detectedMode = "math";
      } else {
        // For any other mode, try to determine from context
        detectedMode = "math"; // Default fallback
      }

      // Always update to reflect MathLive's internal state

      currentMode = detectedMode;
      updateModeButtons();
    } catch (error) {
      console.error("Error in mode-change event handler:", error);
    }
  });

  // Set initial mode after all event listeners are attached
  if (mathFieldElement.switchMode) {
    if (currentMode === "text") {
      mathFieldElement.switchMode("text");
    } else if (currentMode === "latex") {
      mathFieldElement.switchMode("latex");
    } else {
      mathFieldElement.switchMode("math");
    }
  } else {
    // Fallback to executeCommand
    if (currentMode === "text") {
      mathFieldElement.executeCommand("switchMode", "text");
    } else if (currentMode === "latex") {
      mathFieldElement.executeCommand("switchMode", "latex");
    } else {
      mathFieldElement.executeCommand("switchMode", "math");
    }
  }

  // Initialize mode buttons to reflect current mode
  updateModeButtons();

  // Add manual virtual keyboard control for desktop devices
  if (!isTouchDevice) {
    // Listen for virtual keyboard toggle button clicks on desktop
    mathFieldElement.addEventListener("virtual-keyboard-toggle", () => {
      try {
        if (window.mathVirtualKeyboard) {
          if (window.mathVirtualKeyboard.visible) {
            window.mathVirtualKeyboard.hide();
          } else {
            window.mathVirtualKeyboard.show();
          }
        }
      } catch (error) {
        console.warn("Could not toggle virtual keyboard:", error);
      }
    });
  }
}

// Event handlers setup
function setupEventHandlers() {
  // Mode buttons
  document
    .getElementById("text-mode-btn")
    ?.addEventListener("click", () => handleModeChange("text"));
  document
    .getElementById("math-mode-btn")
    ?.addEventListener("click", () => handleModeChange("math"));
  document
    .getElementById("latex-mode-btn")
    ?.addEventListener("click", () => handleModeChange("latex"));

  // Toolbar buttons
  document
    .getElementById("style-btn")
    ?.addEventListener("click", () => toggleMenu("style"));
  document
    .getElementById("bg-btn")
    ?.addEventListener("click", () => toggleMenu("bg"));
  document
    .getElementById("save-btn")
    ?.addEventListener("click", handleSaveFormula);
  document
    .getElementById("examples-btn")
    ?.addEventListener("click", () => toggleMenu("examples"));
  document
    .getElementById("insert-btn")
    ?.addEventListener("click", () => toggleMenu("insert"));
  document
    .getElementById("formula-btn")
    ?.addEventListener("click", () => toggleMenu("formula"));

  document
    .getElementById("export-full-btn")
    ?.addEventListener("click", () => exportAsPNG(false));
  document
    .getElementById("export-math-btn")
    ?.addEventListener("click", () => exportAsPNG(true));
  document.getElementById("undo-btn")?.addEventListener("click", handleUndo);
  document.getElementById("redo-btn")?.addEventListener("click", handleRedo);

  // LaTeX textarea
  const latexTextarea = document.getElementById("latex-output");
  if (latexTextarea) {
    latexTextarea.addEventListener("input", (e) => {
      const newValue = e.target.value;
      const processedValue = newValue.replace(/\$\$/g, "").trim();
      latexValue = processedValue;

      if (mathFieldElement) {
        try {
          mathFieldElement.value = processedValue;
        } catch (error) {
          console.error("Error updating math field:", error);
        }
      }

      updateLatexOutput();
    });
  }

  // Save dialog
  document.getElementById("save-cancel-btn")?.addEventListener("click", () => {
    document.getElementById("save-dialog").style.display = "none";
    document.getElementById("save-label-input").value = "";
  });

  document
    .getElementById("save-confirm-btn")
    ?.addEventListener("click", confirmSaveFormula);

  document
    .getElementById("save-label-input")
    ?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        confirmSaveFormula();
      } else if (e.key === "Escape") {
        document.getElementById("save-dialog").style.display = "none";
        document.getElementById("save-label-input").value = "";
      }
    });

  // Color buttons
  document.querySelectorAll(".color-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const color = btn.dataset.color;
      applyColor(color);
    });
  });

  document.querySelectorAll(".bg-color-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const color = btn.dataset.color;
      applyBackgroundColor(color);
    });
  });

  // Insert buttons
  document.querySelectorAll(".insert-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const command = btn.dataset.command;
      insertSymbol(command);
    });
  });

  // Formula buttons are now handled dynamically in populateFormulaMenu()

  // Close menus when clicking outside
  document.addEventListener("mousedown", (event) => {
    const menus = document.querySelectorAll(".menu-dropdown");
    let clickedInsideMenu = false;

    menus.forEach((menu) => {
      if (menu.contains(event.target)) {
        clickedInsideMenu = true;
      }
    });

    const menuButtons = document.querySelectorAll(".menu-btn");
    menuButtons.forEach((button) => {
      if (button.contains(event.target)) {
        clickedInsideMenu = true;
      }
    });

    // Check if clicked on examples button specifically
    const examplesBtn = document.getElementById("examples-btn");
    if (examplesBtn && examplesBtn.contains(event.target)) {
      clickedInsideMenu = true;
    }

    if (!clickedInsideMenu) {
      showStyleMenu = false;
      showBgMenu = false;
      showExamplesMenu = false;
      showInsertMenu = false;
      showFormulaMenu = false;
      updateMenuVisibility();
    }
  });
}

// DOM Content Loaded with ES Module Import
document.addEventListener("DOMContentLoaded", () => {
  // MathLive is already imported, directly initialize
  initializeMathLive();
  setupEventHandlers();
});
