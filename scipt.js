// --- Base Variables (Original + SDLC) ---
let socket;
const statusDiv = document.getElementById("status");
const taskInput = document.getElementById("task-input");
const startButton = document.getElementById("start-button");
const mainContentArea = document.getElementById("main-content-area");

// MetaGPT Download Area/Link (Original IDs)
const metagptDownloadArea = document.getElementById("download-link-area"); // Original ID
const metagptDownloadLink = document.getElementById(
  "metagpt-zip-download-link"
); // Original ID (with zip)

// SDLC Download Areas & Links
const brdDownloadArea = document.getElementById("brd-download-link-area");
const brdDownloadLink = document.getElementById("brd-download-link");
const srsDownloadArea = document.getElementById("srs-download-link-area");
const srsDownloadLink = document.getElementById("srs-download-link");
const usecaseDownloadArea = document.getElementById(
  "usecase-download-link-area"
);
const usecaseDownloadLink = document.getElementById("usecase-download-link");
// Combine all download areas for easier hiding/showing checks
const allDownloadAreas = [
  metagptDownloadArea,
  brdDownloadArea,
  srsDownloadArea,
  usecaseDownloadArea,
];

// Combined Output Divs
const outputDivs = {
  "system-logs": document.getElementById("output-system-logs"),
  "product-management": document.getElementById("output-product-management"),
  "architecture-design": document.getElementById("output-architecture-design"),
  "project-management": document.getElementById("output-project-management"),
  "code-dev-review": document.getElementById("output-code-dev-review"),
  // SDLC Output Divs
  brd: document.getElementById("output-BRD"),
  srs: document.getElementById("output-SRS"),
  usecase: document.getElementById("output-UseCase"), // Note: UseCase instead of usecase here to match ID
};

// MetaGPT State Variables (Original)
let activePreBlocks = {};
let preBlockCounter = 0;

// --- Card switching logic (Handles all cards/sections) ---
const cards = document.querySelectorAll(".sidebar .card");
const sections = document.querySelectorAll(".content-area .role-section");
let activeSectionId = "section-system-logs"; // Initial active section

cards.forEach((card) => {
  card.addEventListener("click", () => {
    const sectionIdToShow = card.getAttribute("data-section");
    if (sectionIdToShow === activeSectionId) return;

    cards.forEach((c) => c.classList.remove("active"));
    sections.forEach((s) => s.classList.remove("active"));

    card.classList.add("active");
    const sectionElement = document.getElementById(sectionIdToShow);
    if (sectionElement) {
      sectionElement.classList.add("active");
      activeSectionId = sectionIdToShow;
      mainContentArea.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      console.error("Could not find section:", sectionIdToShow);
    }
  });
});

// --- Mapping logic (Original MetaGPT version) ---
function getTargetSectionId(data) {
  const roleName = data.role || "System";
  const type = data.type;

  if (roleName.includes("Engineer")) return "section-code-dev-review";
  if (
    type === "code_start" ||
    type === "code_review_start" ||
    type === "code_line"
  )
    return "section-code-dev-review";
  if (roleName.includes("Product Manager")) return "section-product-management";
  if (roleName.includes("Architect")) return "section-architecture-design";
  if (roleName.includes("Project Manager")) return "section-project-management";

  // Heuristics for content (Original less specific version)
  if (
    type === "content_start" ||
    type === "content_end" ||
    type === "content_line"
  ) {
    const content = data.content || "";
    if (
      content.includes('"Product Goals"') ||
      content.includes('"User Stories"')
    )
      return "section-product-management";
    if (
      content.includes('"File list"') ||
      content.includes('"Data structures and interfaces"')
    )
      return "section-architecture-design";
    if (content.includes('"Task list"') || content.includes('"Logic Analysis"'))
      return "section-project-management";
  }
  return "section-system-logs"; // Default
}

// --- Helper: Replace MetaGPT in strings (Original version) ---
function replaceMetaWithCiklum(text) {
  if (typeof text === "string") {
    return text.replace(/metagpt/gi, "CiklumGPT");
  }
  return text;
}

// --- Helper: Escape HTML ---
function escapeHTML(str) {
  if (typeof str !== "string") {
    console.warn("escapeHTML received non-string:", str);
    str = String(str);
  }
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// --- Helper: Create display elements (Original MetaGPT version from first sample) ---
function createMessageElement(data, originalRole, targetSectionId) {
  let element;
  let displayContent = replaceMetaWithCiklum(data.content);
  let displayFilename = replaceMetaWithCiklum(data.filename);
  let displayAction = replaceMetaWithCiklum(data.action);
  let displayTarget = replaceMetaWithCiklum(data.target);
  let displayOriginalRole = replaceMetaWithCiklum(originalRole);

  let showOriginalRole = false;
  if (
    targetSectionId === "section-code-dev-review" &&
    !displayOriginalRole?.includes("Engineer")
  )
    showOriginalRole = true;
  else if (
    targetSectionId === "section-product-management" &&
    !displayOriginalRole?.includes("Product Manager")
  )
    showOriginalRole = true;
  else if (
    targetSectionId === "section-architecture-design" &&
    !displayOriginalRole?.includes("Architect")
  )
    showOriginalRole = true;
  else if (
    targetSectionId === "section-project-management" &&
    !displayOriginalRole?.includes("Project Manager")
  )
    showOriginalRole = true;
  else if (
    targetSectionId === "section-system-logs" &&
    displayOriginalRole !== "System"
  )
    showOriginalRole = true;
  if (
    displayOriginalRole === "System" &&
    targetSectionId === "section-system-logs"
  )
    showOriginalRole = false;

  const roleSpan = showOriginalRole
    ? ` <span class="original-role">(${escapeHTML(
        displayOriginalRole || "Unknown Role"
      )})</span>`
    : "";

  console.log(data);
  console.log(data.type);

  switch (data.type) {
    case "role_log":
      element = document.createElement("p");
      element.classList.add("role-log-line");
      // Use the raw content which includes the timestamp etc. in the original version
      element.innerHTML = escapeHTML(displayContent) + roleSpan;
      break;
    case "log":
      element = document.createElement("p");
      element.classList.add("log-line");
      element.innerHTML = escapeHTML(displayContent) + roleSpan;
      break;
    case "content_start":
      element = document.createElement("p");
      element.classList.add("content-start");
      element.innerHTML = "[CONTENT]" + roleSpan;
      break;
    case "content_end":
      element = document.createElement("p");
      element.classList.add("content-end");
      element.innerHTML = "[/CONTENT]" + roleSpan;
      break;
    case "code_start":
      element = document.createElement("p");
      element.classList.add("code-start");
      element.innerHTML =
        `## Code: <span class="filename">${escapeHTML(
          displayFilename || "..."
        )}</span>` + roleSpan;
      break;
    case "code_review_start":
      element = document.createElement("p");
      element.classList.add("code-review-start");
      element.innerHTML =
        `## Code Review: <span class="filename">${escapeHTML(
          displayFilename || "..."
        )}</span>` + roleSpan;
      break;
    case "action_log":
      element = document.createElement("p");
      element.classList.add("action-log-line");
      let actionText = `${escapeHTML(displayAction || "Action")}: `;
      if (displayTarget) {
        actionText += `<span class="action-target">${escapeHTML(
          displayTarget
        )}</span>`;
      } else {
        actionText += escapeHTML(displayContent);
      } // Fallback
      element.innerHTML = actionText + roleSpan;
      break;
    default:
      // console.warn(`createMessageElement called with unexpected type: ${data.type}`);
      // element = document.createElement('p');
      // element.classList.add('log-line', 'error');
      // element.innerHTML = `[${escapeHTML(data.type)}] ${escapeHTML(displayContent)}` + roleSpan;
      break;
  }
  return element;
}

// --- Helper: Manage block state (Original MetaGPT version from first sample) ---
function manageBlockState(data, sectionId, outputDiv) {
  const currentBlock = activePreBlocks[sectionId];
  const displayContent = replaceMetaWithCiklum(data.content);

  // Block Start conditions
  if (
    data.type === "content_start" ||
    data.type === "code_start" ||
    data.type === "code_review_start"
  ) {
    // console.log(`%cSTATE SET: Setting activePreBlocks['${sectionId}'] = ${data.type.split('_')[0]}`, 'color: green; font-weight: bold;', JSON.stringify(activePreBlocks));
    delete activePreBlocks[sectionId]; // Clear previous block in this section first
    const pre = document.createElement("pre");
    let blockType = "";
    if (data.type === "content_start") {
      pre.classList.add("content-block");
      blockType = "content";
    } else if (data.type === "code_start") {
      pre.classList.add("code-block");
      blockType = "code";
    } else if (data.type === "code_review_start") {
      pre.classList.add("code-review-block");
      blockType = "review";
    }
    pre.id = `pre-${sectionId}-${preBlockCounter++}`;
    outputDiv.appendChild(pre);
    activePreBlocks[sectionId] = { type: blockType, element: pre };
    return false; // Don't append the marker line itself
  }

  // Block End condition (Content only)
  if (data.type === "content_end") {
    if (currentBlock && currentBlock.type === "content") {
      // console.log(`%cSTATE CLEAR: Deleting activePreBlocks['${sectionId}'] (type: content) on content_end`, 'color: red;', JSON.stringify(activePreBlocks));
      delete activePreBlocks[sectionId];
    } else {
      console.warn(
        `Received content_end for section ${sectionId} but no 'content' block was active.`
      );
    }
    return false; // Don't append marker line
  }

  // Implicit Block End conditions (Code/Review on new block start or role change)
  if (
    data.type === "role_log" ||
    data.type === "content_start" ||
    data.type === "code_start" ||
    data.type === "code_review_start"
  ) {
    if (
      currentBlock &&
      (currentBlock.type === "code" || currentBlock.type === "review")
    ) {
      // console.log(`%cSTATE CLEAR: Implicitly deleting activePreBlocks['${sectionId}'] (type: ${currentBlock.type}) on ${data.type}`, 'color: red;', JSON.stringify(activePreBlocks));
      delete activePreBlocks[sectionId];
    }
    return false; // Let createMessageElement handle the new line
  }

  // Append line to active block
  if (data.type === "content_line" || data.type === "code_line") {
    if (currentBlock) {
      // console.log(`Attempting to append ${data.type} to active block type '${currentBlock.type}' in section '${sectionId}'`);
      const isCorrectType =
        (currentBlock.type === "content" && data.type === "content_line") ||
        ((currentBlock.type === "code" || currentBlock.type === "review") &&
          data.type === "code_line");
      if (isCorrectType) {
        currentBlock.element.textContent += displayContent + "\n";
        if (sectionId === activeSectionId) {
          mainContentArea.scrollTo({
            top: mainContentArea.scrollHeight,
            behavior: "auto",
          });
        }
        return true; // Handled by appending
      } else {
        console.warn(
          `%cTYPE MISMATCH: Received ${data.type} for section ${sectionId}, but active block is ${currentBlock.type}. Ignoring append.`,
          "color: orange;"
        );
        return false; // Don't append, let createMessageElement handle as log
      }
    } else {
      console.error(
        `%cSTATE ERROR: Received ${data.type} for section ${sectionId}, but NO currentBlock found! Line ignored.`,
        "color: orange; font-weight: bold;",
        JSON.stringify(activePreBlocks)
      );
      // This case was problematic in original too, treat as unhandled
      return false; // Let createMessageElement handle as log
    }
  }

  // console.log(`manageBlockState returning false for type: ${data.type}`);
  return false; // Not handled by block state management
}

// --- Main Function to Start Process (Original + SDLC Integration) ---
function startProcess() {
  const task = taskInput.value.trim();
  if (!task) {
    alert("Please enter a project description.");
    return;
  }

  // --- Reset UI (Combined) ---
  statusDiv.textContent = "Initializing...";
  statusDiv.className = "status-message";
  // Clear MetaGPT outputs
  Object.keys(outputDivs)
    .filter((key) => !["brd", "srs", "usecase"].includes(key)) // Exclude SDLC keys
    .forEach((key) => {
      if (outputDivs[key]) outputDivs[key].innerHTML = "";
    });
  // Clear SDLC outputs and reset styles
  ["brd", "srs", "usecase"].forEach((key) => {
    if (outputDivs[key]) {
      outputDivs[key].textContent = "";
      outputDivs[key].classList.remove("loading", "error");
    }
  });

  activePreBlocks = {}; // Reset MetaGPT block state
  preBlockCounter = 0;

  // Hide all download links
  allDownloadAreas.forEach((area) => area.classList.remove("visible"));
  // Reset MetaGPT ZIP link
  metagptDownloadLink.href = "#";
  metagptDownloadLink.removeAttribute("download");
  // Reset SDLC links (redundant with above loop, but safe)
  brdDownloadLink.href = "#";
  brdDownloadLink.removeAttribute("download");
  srsDownloadLink.href = "#";
  srsDownloadLink.removeAttribute("download");
  usecaseDownloadLink.href = "#";
  usecaseDownloadLink.removeAttribute("download");

  startButton.disabled = true;
  taskInput.disabled = true;

  // Reset view to default (System Logs)
  cards.forEach((c) => c.classList.remove("active"));
  sections.forEach((s) => s.classList.remove("active"));
  const defaultCard = document.querySelector(
    '.card[data-section="section-system-logs"]'
  );
  const defaultSection = document.getElementById("section-system-logs");
  if (defaultCard) defaultCard.classList.add("active");
  if (defaultSection) defaultSection.classList.add("active");
  activeSectionId = "section-system-logs";
  mainContentArea.scrollTo({ top: 0 });

  // --- Start MetaGPT via WebSocket (Original Logic) ---
  // const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${wsProtocol}//ladybug-joint-grossly.ngrok-free.app/ws`;
  console.log("Connecting to WebSocket:", wsUrl);
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    socket.close();
    console.log("Closed previous WebSocket connection.");
  }
  socket = new WebSocket(wsUrl);

  socket.onopen = function () {
    statusDiv.textContent =
      "Connection open. Starting CiklumGPT & SDLC Generation..."; // Updated status
    console.log("WebSocket connection opened. Sending task:", task);
    socket.send(task);
  };

  // Assign original handlers
  socket.onmessage = function (event) {
    let data;
    try {
      data = JSON.parse(event.data);
    } catch (e) {
      console.error("Failed to parse JSON:", event.data, e);
      return;
    }

    // console.log(event?.data)

    // <<< Original onmessage Status Update Logic >>>
    // Update status only if process not finished/errored
    // Uses original downloadArea check
    if (
      !statusDiv.classList.contains("process-end") &&
      !statusDiv.classList.contains("error-message") &&
      !metagptDownloadArea.classList.contains("visible")
    ) {
      const displayRole = replaceMetaWithCiklum(data.role || "System");
      // Avoid flicker on block lines (original logic)
      if (data.type !== "content_line" && data.type !== "code_line") {
        statusDiv.textContent = `Running: ${displayRole}...`;
      }
      statusDiv.className = "status-message"; // Reset style
    }
    // <<< End Original Status Update >>>

    // Handle Special Final Messages (Original Logic - checks original downloadArea)
    if (["process_end", "error", "zip_ready"].includes(data.type)) {
      handleFinalMessage(data); // Call original handler
      // Don't return early on zip_ready in combined mode
      // if (data.type === 'error' || data.type === 'zip_ready') return;
    }
    // Handle Regular Messages (Original Logic)
    else {
      const targetSectionId = getTargetSectionId(data);
      const outputDivKey = targetSectionId.replace("section-", "");
      const outputDiv = outputDivs[outputDivKey];
      const originalRole = data.role || "System";
      if (!outputDiv) {
        console.error(`No outputDiv for key: ${outputDivKey}`);
        return;
      }

      let elementToAppend = null;
      const handledByBlockState = manageBlockState(
        data,
        targetSectionId,
        outputDiv
      );

      // Original logic for creating element if not handled by block state
      // OR if it's a type that needs its own element anyway
      if (
        !handledByBlockState ||
        [
          "content_start",
          "content_end",
          "code_start",
          "code_review_start",
          "role_log",
          "action_log",
        ].includes(data.type)
      ) {
        elementToAppend = createMessageElement(
          data,
          originalRole,
          targetSectionId
        );
      }
      // else if (['content_start', 'content_end', 'code_start', 'code_review_start', 'role_log', 'action_log'].includes(data.type)) {
      //      // This part seems redundant with the above in original logic? Keep simpler version.
      //      elementToAppend = createMessageElement(data, originalRole, targetSectionId);
      // }

      if (elementToAppend) {
        outputDiv.appendChild(elementToAppend);
        if (targetSectionId === activeSectionId) {
          mainContentArea.scrollTo({
            top: mainContentArea.scrollHeight,
            behavior: "smooth",
          });
        }
      }
    }
  }; // End socket.onmessage

  socket.onclose = function (event) {
    handleSocketClose(event);
  }; // Assign original handler
  socket.onerror = function (error) {
    handleSocketError(error);
  }; // Assign original handler

  // --- Start SDLC Document Generation (New Part) ---
  streamDocument("Business Requirements Document (BRD)", "BRD", task);
  streamDocument("System Requirements Specification (SRS)", "SRS", task);
  streamDocument("Use Case Document", "UseCase", task); // Use full name
} // end startProcess

// --- Function to Stream SDLC Documents (New Part - Keep As Is) ---
async function streamDocument(docType, outputId, projectDesc) {
  const outputElement = document.getElementById(`output-${outputId}`);
  // Get the correct SDLC download area/link based on outputId
  const downloadArea = document.getElementById(
    `${outputId.toLowerCase()}-download-link-area`
  );
  const downloadLink = document.getElementById(
    `${outputId.toLowerCase()}-download-link`
  );
  const docKey = docType.replace(/ /g, "_").replace(/\//g, "_"); // Match backend key generation

  if (!outputElement || !downloadArea || !downloadLink) {
    console.error(
      `Missing elements for SDLC document: ${docType} (Output ID: ${outputId})`
    );
    return;
  }

  outputElement.textContent = `Generating ${docType}...`;
  outputElement.classList.add("loading");
  outputElement.classList.remove("error");
  downloadArea.classList.remove("visible");
  downloadLink.href = "#";
  downloadLink.removeAttribute("download");

  console.log(`Requesting generation for: ${docType}`);
  try {
    const response = await fetch(
      `https://ladybug-joint-grossly.ngrok-free.app/generate/${encodeURIComponent(
        docType
      )}?project_desc=${encodeURIComponent(projectDesc)}`
    );

    if (!response.ok)
      throw new Error(
        `HTTP error! status: ${response.status} - ${response.statusText}`
      );
    if (!response.body) throw new Error("Response body is null.");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    outputElement.textContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log(`Finished streaming ${docType}.`);
        outputElement.classList.remove("loading");
        const downloadUrl = `/download/sdd/${docKey}`;
        downloadLink.href = downloadUrl;
        downloadLink.setAttribute("download", `${docKey}.docx`);
        downloadArea.classList.add("visible");
        checkCompletionState(); // Check overall completion
        break;
      }
      const chunk = decoder.decode(value, { stream: true });
      outputElement.textContent += chunk;
      if (`section-${outputId.toLowerCase()}` === activeSectionId) {
        mainContentArea.scrollTo({
          top: mainContentArea.scrollHeight,
          behavior: "auto",
        });
      }
    }
  } catch (error) {
    console.error(`Error fetching or streaming ${docType}:`, error);
    outputElement.textContent = `Error generating ${docType}: ${error.message}\n\nCheck console and backend logs. Ensure Groq API key is valid.`;
    outputElement.classList.remove("loading");
    outputElement.classList.add("error");
    if (!statusDiv.classList.contains("error-message")) {
      statusDiv.textContent = `Error during ${docType} generation.`;
      statusDiv.className = "status-message error-message";
    }
    checkCompletionState(); // Check completion even on error
  }
}

// --- Separate handlers for final messages and socket events (Original MetaGPT Handlers) ---
function handleFinalMessage(data) {
  let displayContent = replaceMetaWithCiklum(data.content);
  let displayFilename = replaceMetaWithCiklum(data.filename);

  if (data.type === "process_end") {
    // Original logic: Update status if MetaGPT ZIP not ready
    if (!metagptDownloadArea.classList.contains("visible")) {
      statusDiv.textContent = displayContent || "CiklumGPT process finished.";
      // Don't mark as process-end yet in combined mode
      // statusDiv.className = 'status-message process-end';
      // Don't re-enable button yet
    }
    console.log(
      "MetaGPT process finished signal received (waiting for potential ZIP/SDLC docs)"
    );
  } else if (data.type === "error") {
    // Original error handling
    statusDiv.textContent = `Error: ${displayContent}`;
    statusDiv.className = "status-message error-message";
    Object.keys(activePreBlocks).forEach((id) => delete activePreBlocks[id]);
    // Don't necessarily close socket here in combined mode
    // if (socket && socket.readyState === WebSocket.OPEN) socket.close(1011, "Error occurred");
    console.error("Received error from backend:", displayContent);
    // Don't enable button here, let checkCompletionState handle it
  } else if (data.type === "zip_ready") {
    // Original zip_ready handling
    // Update status only if not already showing error
    if (!statusDiv.classList.contains("error-message")) {
      statusDiv.textContent = "Success! CiklumGPT Project ZIP ready.";
      // Don't mark as fully complete yet
      // statusDiv.className = 'status-message process-end';
    }
    metagptDownloadLink.href = data.download_url;
    metagptDownloadLink.setAttribute(
      "download",
      displayFilename || "ciklumgpt_project.zip"
    );
    metagptDownloadArea.classList.add("visible"); // Use original area ID
    // Don't enable button here, let checkCompletionState handle it
    console.log("MetaGPT ZIP Ready:", data.download_url);
  }
  checkCompletionState(); // Check completion whenever a final message arrives
}

function handleSocketClose(event) {
  // Original handler
  const reason = event.reason ? `, reason=${event.reason}` : "";
  // Update status only if no final message shown and MetaGPT ZIP not ready
  if (
    !statusDiv.classList.contains("process-end") &&
    !statusDiv.classList.contains("error-message") &&
    !metagptDownloadArea.classList.contains("visible")
  ) {
    if (event.wasClean) {
      // statusDiv.textContent = `Connection closed, code=${event.code}${reason}`; // Too verbose
    } else {
      statusDiv.textContent = `Connection died unexpectedly, code=${event.code}${reason}`;
      statusDiv.className = "status-message error-message"; // Mark error on unclean close
    }
  }
  Object.keys(activePreBlocks).forEach((id) => delete activePreBlocks[id]); // Clear blocks
  console.warn("WebSocket connection closed:", event);
  checkCompletionState(); // Check completion when socket closes
}

function handleSocketError(error) {
  // Original handler
  if (!statusDiv.classList.contains("error-message")) {
    // Avoid overwriting specific errors
    statusDiv.textContent = "WebSocket Error! Check console.";
    statusDiv.className = "status-message error-message";
  }
  Object.keys(activePreBlocks).forEach((id) => delete activePreBlocks[id]);
  console.error("WebSocket error:", error);
  checkCompletionState(); // Check completion on error
}

// --- Check Completion State (New Part - Integrated with original handlers) ---
function checkCompletionState() {
  // Check if MetaGPT part is done (ZIP visible or WS closed after process_end/error)
  const metagptZipReady = metagptDownloadArea.classList.contains("visible");
  const wsClosed = !socket || socket.readyState === WebSocket.CLOSED;
  const metagptLikelyDone = metagptZipReady || wsClosed; // Simpler check: if WS closed or zip ready

  // Check if all SDLC docs are done (links visible or areas have error class)
  const brdDone =
    brdDownloadArea.classList.contains("visible") ||
    outputDivs.brd.classList.contains("error");
  const srsDone =
    srsDownloadArea.classList.contains("visible") ||
    outputDivs.srs.classList.contains("error");
  const usecaseDone =
    usecaseDownloadArea.classList.contains("visible") ||
    outputDivs.usecase.classList.contains("error");
  const sdlcAllDone = brdDone && srsDone && usecaseDone;

  // Check for any errors
  const anySdlcError =
    outputDivs.brd.classList.contains("error") ||
    outputDivs.srs.classList.contains("error") ||
    outputDivs.usecase.classList.contains("error");
  const overallError = statusDiv.classList.contains("error-message"); // Check if MetaGPT part had a fatal error

  if (metagptLikelyDone && sdlcAllDone) {
    console.log("All processes appear complete.");
    if (overallError || anySdlcError) {
      if (!overallError) {
        // Set overall error if only SDLC failed
        statusDiv.textContent = "Process finished with SDLC errors.";
        statusDiv.className = "status-message error-message";
      }
    } else {
      // Only set success if no errors occurred
      statusDiv.textContent = "All processes finished. Downloads ready.";
      statusDiv.className = "status-message process-end";
    }
    // Re-enable button once all processes are accounted for (success or fail)
    startButton.disabled = false;
    taskInput.disabled = false;
  } else {
    console.log("Completion check: Not all processes finished yet.", {
      metagptLikelyDone,
      sdlcAllDone,
      anySdlcError,
      overallError,
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const promptInput = document.getElementById("prompt-input");
  const sendBtn = document.getElementById("send-btn");
  const promptButtons = document.querySelectorAll(".prompt-btn");

  // Handle clicking on suggested prompts
  promptButtons.forEach((button) => {
    button.addEventListener("click", function () {
      promptInput.value = this.textContent;
      promptInput.focus();
    });
  });

  // Handle send button click
  sendBtn.addEventListener("click", () => {
    if (promptInput.value.trim() !== "") {
      // Here you would typically send the prompt to your backend
      console.log("Sending prompt:", promptInput.value);

      // For demo purposes, just clear the input
      promptInput.value = "";
    }
  });

  // Handle Enter key press in input
  promptInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && promptInput.value.trim() !== "") {
      // Here you would typically send the prompt to your backend
      console.log("Sending prompt:", promptInput.value);

      // For demo purposes, just clear the input
      promptInput.value = "";
    }
  });
});
