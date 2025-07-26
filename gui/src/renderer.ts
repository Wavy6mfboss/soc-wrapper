/* bundle the CSS */
import "./index.css";

const runBtn   = document.getElementById("run-btn") as HTMLButtonElement;
const goalIn   = document.getElementById("goal-input") as HTMLInputElement;
const logArea  = document.getElementById("log") as HTMLTextAreaElement;

runBtn.addEventListener("click", async () => {
  const goal = goalIn.value.trim();
  if (!goal) return;

  logArea.value += `\n> ${goal}\n`;

  try {
    const out = await window.electronAPI.runGoal(goal);
    logArea.value += out + "\n";
  } catch (err: any) {
    logArea.value += `ERROR: ${err.message ?? err}\n`;
  }
});
