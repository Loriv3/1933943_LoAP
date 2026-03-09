import { useEffect, useRef, useState } from "react";

export const enum WebsocketStatus {
    Connecting,
    Connected,
    Disconnecting,
    Disconnected,
}

export const useWebSocket = (
    url: string | URL,
    callback: (data: string) => void,
    retryDelay: number | null = 1000
) => {
    const [status, setStatus] = useState(WebsocketStatus.Connecting);

    type ActiveConnection = {
        websocket: WebSocket | null;
        url: string | URL;
        callback: (data: string) => void;
        retryDelay: number | null;
        retryTimeout: number | null;
        retryHandler: () => void;
        retryTimeoutExpiration: Date | null;
    };

    type NextConnection = {
        url: string | URL;
        callback: (data: string) => void;
        retryDelay: number | null;
    };

    const activeConnection = useRef<ActiveConnection | null>(null);
    const nextConnection = useRef<NextConnection | null>(null);

    const createWebSocket = (
        url: string | URL,
        callback: (data: string) => void,
        onOpen: () => void,
        onClose: () => void
    ) => {
        const websocket = new WebSocket(url);
        websocket.onopen = () => {
            onOpen();
        };
        websocket.onmessage = (e) => {
            callback(e.data);
        };
        websocket.onerror = (e) => {
            console.error("Socket error: ", e);
        };
        websocket.onclose = () => {
            onClose();
        };
        return websocket;
    };

    const initNew = ({ url, callback, retryDelay }: NextConnection) => {
        const connection: ActiveConnection = {
            websocket: null!,
            url,
            callback,
            retryDelay,
            retryTimeout: null,
            retryHandler: null!,
            retryTimeoutExpiration: null,
        };

        const opened = () => {
            setStatus(WebsocketStatus.Connected);
        };

        const scheduleRetry = () => {
            setStatus(WebsocketStatus.Disconnected);
            connection.websocket = null;
            if (nextConnection.current) {
                initNew(nextConnection.current);
                nextConnection.current = null;
            }
            if (!activeConnection.current) return;
            if (connection.retryDelay) {
                connection.retryTimeout = setTimeout(() => {
                    connection.retryTimeout = null;
                    connection.retryTimeoutExpiration = null;
                    setStatus(WebsocketStatus.Connecting);
                    connection.websocket = createWebSocket(
                        url,
                        (data) => connection.callback(data),
                        opened,
                        scheduleRetry
                    );
                }, connection.retryDelay);
                connection.retryTimeoutExpiration = new Date(
                    new Date().getTime() + connection.retryDelay
                );
            }
        };
        connection.retryHandler = scheduleRetry;

        setStatus(WebsocketStatus.Connecting);
        connection.websocket = createWebSocket(
            url,
            callback,
            opened,
            scheduleRetry
        );
        activeConnection.current = connection;
    };

    const destroy = () => {
        if (!activeConnection.current) return false;
        if (activeConnection.current.websocket) {
            activeConnection.current.websocket.close();
            setStatus(WebsocketStatus.Disconnecting);
            return true;
        } else if (activeConnection.current.retryTimeout !== null) {
            clearTimeout(activeConnection.current.retryTimeout);
            return false;
        } else {
            return false;
        }
    };

    const init = (newConnection: NextConnection) => {
        if (nextConnection.current || destroy()) {
            nextConnection.current = newConnection;
        } else {
            initNew(newConnection);
        }
    };

    useEffect(() => {
        if (
            !activeConnection.current ||
            url !== activeConnection.current.url ||
            nextConnection.current
        ) {
            init({ url, callback, retryDelay });
        } else {
            if (callback !== activeConnection.current.callback) {
                activeConnection.current.callback = callback;
            }
            if (retryDelay !== activeConnection.current.retryDelay) {
                if (activeConnection.current.retryTimeout) {
                    clearTimeout(activeConnection.current.retryTimeout);
                    if (retryDelay) {
                        const timeToPrevious =
                            activeConnection.current.retryTimeoutExpiration!.getTime() -
                            new Date().getTime();
                        const newTimeoutExpiration =
                            timeToPrevious +
                            retryDelay -
                            activeConnection.current.retryDelay!;
                        activeConnection.current.retryTimeout = setTimeout(
                            activeConnection.current.retryHandler,
                            newTimeoutExpiration
                        );
                        activeConnection.current.retryTimeoutExpiration =
                            new Date(
                                new Date().getTime() + newTimeoutExpiration
                            );
                    } else {
                        activeConnection.current.retryTimeout = null;
                        activeConnection.current.retryTimeoutExpiration = null;
                    }
                }
                activeConnection.current.retryDelay = retryDelay;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url, callback, retryDelay]);

    useEffect(() => {
        return () => {
            nextConnection.current = null;
            destroy();
        };
    }, []);

    return status;
};
