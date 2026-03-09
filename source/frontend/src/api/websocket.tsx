import { useEffect, useRef } from "react";

export const useWebSocket = (
    url: string | URL,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback: (data: string) => void,
    retryDelay: number | null = null
) => {
    const activeWebSocket = useRef<WebSocket | null>(null);
    const activeRetryDelay = useRef<number | null>(null);
    const activeRetryTimeout = useRef<number | null>(null);

    const retry = (url: string | URL) => {
        if (activeRetryDelay.current) {
            activeRetryTimeout.current = setTimeout(() => {
                init(url);
            }, activeRetryDelay.current);
        }
    };

    const init = (url: string | URL) => {
        const websocket = new WebSocket(url);
        websocket.onopen = () => {};
        websocket.onclose = () => {
            if (activeWebSocket.current !== websocket) return;
            activeWebSocket.current = null;
            retry(url);
        };
        websocket.onmessage = (e) => {
            callback(e.data);
        };
        websocket.onerror = (e) => {
            console.error("Socket error: ", e);
        };
        activeWebSocket.current = websocket;
    };

    const destroy = () => {
        activeRetryDelay.current = null;
        if (activeRetryTimeout.current) {
            clearTimeout(activeRetryTimeout.current);
        }
        if (!activeWebSocket.current) return;
        activeWebSocket.current.close();
        activeWebSocket.current = null;
    };

    useEffect(() => {
        destroy();
        init(url);
        return () => destroy();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url]);

    useEffect(() => {
        if (!activeWebSocket.current) return;
        activeWebSocket.current.onmessage = (e) => {
            callback(e.data);
        };
    }, [callback]);

    useEffect(() => {
        if (!activeWebSocket.current) return;
        activeWebSocket.current.onmessage = (e) => {
            callback(e.data);
        };
    }, [callback]);

    useEffect(() => {
        activeRetryDelay.current = retryDelay;
    }, [retryDelay]);
};
