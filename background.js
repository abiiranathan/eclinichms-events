chrome.runtime.onInstalled.addListener(async () => {
  console.log("[Eclinic Ext]: SW ready");
});

// Wait for frontend to send us the server to connect to
chrome.runtime.onMessage.addListener(function ({ serverUrl }, sender) {
  const eventSource = new EventSource(`${serverUrl}events`);

  eventSource.onmessage = async function (event) {
    const data = JSON.parse(event.data);

    if (data.channel && data.message) {
      if (Notification.permission === "granted") {
        self.registration.showNotification(data.channel, {
          body:
            data.message + "\nTime: " + new Date(data.time).toLocaleString(),
          icon: "icon.png",
          data: {
            tabId: sender.tab.id,
          },
          tag: data.time,
        });

        const count = await chrome.action.getBadgeText({
          tabId: sender.tab.id,
        });
        const unread = (parseInt(count) || 0) + 1;
        const text = unread == 0 ? "" : unread.toString();
        chrome.action.setBadgeText({ text });
        chrome.action.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
      }
    }

    eventSource.onopen = () => {
      console.log("[Eclinic Ext]: Connect to event source: " + eventSource.url);
    };

    eventSource.onerror = console.error;
  };
});

async function reduceCount(event) {
  const { tabId } = event.notification.data;

  const text = await chrome.action.getBadgeText({ tabId });
  const unread = Math.max((parseInt(text) || 0) - 1, 0);
  const count = unread == 0 ? "" : unread.toString();
  chrome.action.setBadgeText({ text: count });
}

self.addEventListener("notificationclick", async (event) => {
  event.notification.close();
  await reduceCount(event);
});

self.addEventListener("notificationclose", async (event) => {
  await reduceCount(event);
});
