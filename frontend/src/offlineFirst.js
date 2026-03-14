const OFFLINE_QUEUE_KEY = "arogya-offline-queue-v1";
const API_READ_CACHE = "arogya-read-cache-v1";
const OFFLINE_STATUS_EVENT = "arogya-offline-status";

let fetchPatched = false;
let replayInProgress = false;
let nativeFetch = null;
let offlineStatus = {
  online: typeof navigator !== "undefined" ? navigator.onLine : true,
  syncing: false,
  queueSize: 0,
};

const isApiRequest = (urlLike) => {
  const url = new URL(urlLike, window.location.origin);
  return url.origin === window.location.origin && url.pathname.startsWith("/api/");
};

const readQueue = () => {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeQueue = (items) => {
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(items));
  offlineStatus = { ...offlineStatus, queueSize: items.length };
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OFFLINE_STATUS_EVENT, { detail: offlineStatus }));
  }
};

const emitStatus = (partial = {}) => {
  offlineStatus = {
    ...offlineStatus,
    online: typeof navigator !== "undefined" ? navigator.onLine : offlineStatus.online,
    ...partial,
  };
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OFFLINE_STATUS_EVENT, { detail: offlineStatus }));
  }
};

const cacheGetResponse = async (request, response) => {
  if (!("caches" in window)) return;
  const cache = await caches.open(API_READ_CACHE);
  await cache.put(request, response.clone());
};

const getCachedResponse = async (request) => {
  if (!("caches" in window)) return null;
  const cache = await caches.open(API_READ_CACHE);
  return cache.match(request);
};

const requestToQueueItem = async (request) => {
  const headers = {};
  request.headers.forEach((v, k) => {
    headers[k] = v;
  });

  let body = "";
  if (!["GET", "HEAD"].includes(request.method)) {
    try {
      body = await request.clone().text();
    } catch {
      body = "";
    }
  }

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    url: request.url,
    method: request.method,
    headers,
    body,
    queuedAt: new Date().toISOString(),
  };
};

export const replayOfflineQueue = async () => {
  if (replayInProgress) return;
  replayInProgress = true;
  emitStatus({ syncing: true });
  try {
    const queue = readQueue();
    emitStatus({ queueSize: queue.length });
    if (!queue.length) return;
    const pending = [];
    const fetchImpl = nativeFetch || window.fetch.bind(window);
    for (const item of queue) {
      try {
        const res = await fetchImpl(item.url, {
          method: item.method,
          headers: item.headers,
          body: item.body || undefined,
        });
        if (!res.ok && res.status >= 500) {
          pending.push(item);
        }
      } catch {
        pending.push(item);
      }
    }
    writeQueue(pending);
  } finally {
    replayInProgress = false;
    emitStatus({ syncing: false });
  }
};

export const initOfflineFirstNetworking = () => {
  if (fetchPatched || typeof window === "undefined") return;
  fetchPatched = true;
  const originalFetch = window.fetch.bind(window);
  nativeFetch = originalFetch;
  emitStatus({ queueSize: readQueue().length });

  window.fetch = async (input, init) => {
    const request = input instanceof Request ? input : new Request(input, init);
    const method = (request.method || "GET").toUpperCase();
    const apiRequest = isApiRequest(request.url);

    if (!apiRequest) {
      return originalFetch(input, init);
    }

    if (method === "GET") {
      try {
        const response = await originalFetch(input, init);
        if (response.ok) {
          await cacheGetResponse(request, response);
        }
        return response;
      } catch (networkError) {
        const cached = await getCachedResponse(request);
        if (cached) return cached;
        throw networkError;
      }
    }

    try {
      return await originalFetch(input, init);
    } catch {
      const queue = readQueue();
      const item = await requestToQueueItem(request);
      writeQueue([...queue, item]);
      return new Response(
        JSON.stringify({
          queued: true,
          offline: true,
          message: "Request saved offline and will sync automatically.",
        }),
        {
          status: 202,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  };

  window.addEventListener("online", () => {
    emitStatus({ online: true });
    replayOfflineQueue();
  });
  window.addEventListener("offline", () => {
    emitStatus({ online: false });
  });
  void replayOfflineQueue();
};

export const registerServiceWorker = () => {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("Service worker registration failed:", err);
    });
  });
};

export const getOfflineStatus = () => ({
  ...offlineStatus,
  queueSize: readQueue().length,
  online: typeof navigator !== "undefined" ? navigator.onLine : offlineStatus.online,
});

export const subscribeOfflineStatus = (callback) => {
  if (typeof window === "undefined") return () => {};
  const handler = (event) => callback(event.detail || getOfflineStatus());
  window.addEventListener(OFFLINE_STATUS_EVENT, handler);
  callback(getOfflineStatus());
  return () => window.removeEventListener(OFFLINE_STATUS_EVENT, handler);
};
