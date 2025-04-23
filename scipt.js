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
