(() => {
  "use strict";

  // I know, this code is crap. My domain is Lua, not JS :)
  // If you know about js, I would appreciate it if you could make a PR to improve this code <3
  const state = { displayValue: "0", firstOperand: null, operator: null, overwrite: true };
  const $display = document.getElementById("display");
  const $pendingOp = document.getElementById("pendingOp");
  const $calc = document.querySelector(".calc");
  const $topbar = $calc.querySelector(".topbar");

  const toNumber = str => +str.replace(",", ".");
  const formatDisplay = n => isFinite(n) ? n.toLocaleString("es-ES", { maximumFractionDigits: 10 }).replace(".", ",") : "∞";
  const setDisplay = val => ($display.textContent = state.displayValue = String(val));
  const showPending = op => $pendingOp.textContent = { add: "+", subtract: "−", multiply: "×", divide: "÷" }[op] || "";

  const operate = (a, b, op) => {
    const dec = n => (n.toString().split(".")[1] || "").length;
    const factor = Math.pow(10, Math.max(dec(a), dec(b)));
    switch (op) {
      case "add": return (a * factor + b * factor) / factor;
      case "subtract": return (a * factor - b * factor) / factor;
      case "multiply": return (a * factor) * (b * factor) / (factor * factor);
      case "divide": return b === 0 ? Infinity : a / b;
      default: return b;
    }
  };

  const clearAll = () => { state.displayValue = "0"; state.firstOperand = state.operator = null; setDisplay("0"); showPending(null); };
  const inputDigit = d => state.overwrite || state.displayValue === "0" ? (setDisplay(d), state.overwrite = false) : setDisplay(state.displayValue + d);
  const inputDecimal = () => !state.displayValue.includes(",") && (setDisplay(state.displayValue + ","), state.overwrite = false);
  const toggleSign = () => setDisplay(state.displayValue.startsWith("-") ? state.displayValue.slice(1) : "-" + state.displayValue);
  const backspace = () => setDisplay(state.displayValue.length > 1 ? state.displayValue.slice(0, -1) : "0");
  const percent = () => setDisplay(formatDisplay(toNumber(state.displayValue) / 100)) || (state.overwrite = true);

  const setOperator = op => {
    const val = toNumber(state.displayValue);
    if (state.firstOperand == null) state.firstOperand = val;
    else if (state.operator && !state.overwrite) {
      state.firstOperand = operate(state.firstOperand, val, state.operator);
      setDisplay(formatDisplay(state.firstOperand));
    }
    state.operator = op;
    state.overwrite = true;
    showPending(op);
  };

  const equals = () => {
    if (state.operator) {
      const result = operate(state.firstOperand, toNumber(state.displayValue), state.operator);
      setDisplay(formatDisplay(result));
      state.firstOperand = result;
    }
    state.overwrite = true;
    showPending(null);
  };

  $calc.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;
    btn.dataset.digit ? inputDigit(btn.dataset.digit) :
    btn.dataset.op ? setOperator(btn.dataset.op) :
    btn.dataset.action === "decimal" ? inputDecimal() :
    btn.dataset.action === "sign" ? toggleSign() :
    btn.dataset.action === "percent" ? percent() :
    btn.dataset.action === "equals" ? equals() :
    btn.dataset.action === "clear" ? clearAll() :
    btn.dataset.action === "clear-entry" ? setDisplay("0") :
    btn.dataset.action === "backspace" ? backspace() : null;
  });

  window.addEventListener("keydown", e => e.key === "Escape" && fetch("https://samy_calculator/close", { method: "POST" }));

  clearAll();

  let drag = false, offsetX = 0, offsetY = 0;
  $topbar.addEventListener("mousedown", e => {
    drag = true;
    const r = $calc.getBoundingClientRect();
    offsetX = e.clientX - r.left;
    offsetY = e.clientY - r.top;
    Object.assign($calc.style, { position: "absolute", zIndex: 9999 });
    e.preventDefault();
  });
  document.addEventListener("mousemove", e => drag && Object.assign($calc.style, { left: `${e.clientX - offsetX}px`, top: `${e.clientY - offsetY}px` }));
  document.addEventListener("mouseup", () => drag = false);

  if (!window.calculatorListenerAttached) {
    window.calculatorListenerAttached = true;
    const calculatorListener = ({ data }) => {
      if (!data || data.type !== 'calculator') return;

      if (data.action === "open") document.body.classList.add("active");
      if (data.action === "close") document.body.classList.remove("active");
    };
    window.addEventListener('message', calculatorListener);
    window.addEventListener('beforeunload', () => window.removeEventListener('message', calculatorListener));
  }
})();
