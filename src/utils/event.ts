/* eslint-disable @typescript-eslint/no-explicit-any */
function subscribe(eventName:string, listener:(data:any)=>void) {
  document.addEventListener(eventName, listener);
}

function unsubscribe(eventName:string, listener:(data:any)=>void) {
  document.removeEventListener(eventName, listener);
}

function publish(eventName:string, data:any) {
  const event = new CustomEvent(eventName, { detail: data });
  document.dispatchEvent(event);
}

export { publish, subscribe, unsubscribe};