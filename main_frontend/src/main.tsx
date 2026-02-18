import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// #region agent log
fetch('http://127.0.0.1:7713/ingest/4d1c7866-0c93-4eea-be66-7eaca1b46d80',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ab1550'},body:JSON.stringify({sessionId:'ab1550',location:'main.tsx:entry',message:'main.tsx module loaded',data:{hypothesisId:'H1'},timestamp:Date.now()})}).catch(()=>{});
// #endregion

const rootEl = document.getElementById('root');
const showError = (msg: string) => {
  if (rootEl) {
    rootEl.innerHTML = `<p style="padding:1rem;font-family:monospace;color:#c00;">${msg}</p>`;
  }
};

if (!rootEl) {
  fetch('http://127.0.0.1:7713/ingest/4d1c7866-0c93-4eea-be66-7eaca1b46d80',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ab1550'},body:JSON.stringify({sessionId:'ab1550',location:'main.tsx:noRoot',message:'root element missing',data:{hypothesisId:'H2'},timestamp:Date.now()})}).catch(()=>{});
} else {
  try {
    fetch('http://127.0.0.1:7713/ingest/4d1c7866-0c93-4eea-be66-7eaca1b46d80',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ab1550'},body:JSON.stringify({sessionId:'ab1550',location:'main.tsx:beforeRender',message:'about to render App',data:{hypothesisId:'H3'},timestamp:Date.now()})}).catch(()=>{});
    ReactDOM.createRoot(rootEl).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    showError(`Render error: ${err}`);
  }
}

window.addEventListener('error', (ev) => {
  showError(`Error: ${ev.message} (${ev.filename}:${ev.lineno})`);
});
window.addEventListener('unhandledrejection', (ev) => {
  showError(`Unhandled: ${ev.reason?.message ?? String(ev.reason)}`);
});
