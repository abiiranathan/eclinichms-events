const serverUrl = new URL("http://localhost:8089");
window.serverUrl = serverUrl;

window.onload = async () => {
  if (
    window.location.host == serverUrl.host &&
    window.location.protocol == serverUrl.protocol
  ) {
    Notification.requestPermission().then(async (permission) => {
      if (permission !== "granted") return;

      console.log("Notification permission is granted");
      await chrome.runtime.sendMessage({ serverUrl: serverUrl.href });
    });
  }
};
