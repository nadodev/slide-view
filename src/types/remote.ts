// Global type definitions for Remote Control
export type RemoteSession = {
    sessionId: string;
    qrUrl: string;
    isConnected: boolean;
    remoteClients: number;
};

export type RemoteCommand = {
    command: 'next' | 'previous' | 'goto' | 'scroll' | 'scroll-sync' | 'presenter' | 'focus';
    slideIndex?: number;
    scrollDirection?: 'up' | 'down';
    scrollPosition?: number;
    toggle?: boolean;
    fromClient?: string;
};
