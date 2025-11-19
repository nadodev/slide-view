import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { RemoteSession } from '@/types';

type UIState = {
    // State
    showQRCode: boolean;
    remoteSession: RemoteSession | null;
    isConnecting: boolean;
    transitionKey: number;

    // Actions
    setShowQRCode: (show: boolean) => void;
    toggleQRCode: () => void;
    setRemoteSession: (session: RemoteSession | null) => void;
    setIsConnecting: (connecting: boolean) => void;
    incrementTransitionKey: () => void;
    resetUI: () => void;
};

export const useUIStore = create<UIState>()(
    devtools(
        (set) => ({
            // Initial state
            showQRCode: false,
            remoteSession: null,
            isConnecting: false,
            transitionKey: 0,

            // Actions
            setShowQRCode: (show) => set({ showQRCode: show }),

            toggleQRCode: () => set((state) => ({
                showQRCode: !state.showQRCode
            })),

            setRemoteSession: (session) => set({ remoteSession: session }),

            setIsConnecting: (connecting) => set({ isConnecting: connecting }),

            incrementTransitionKey: () => set((state) => ({
                transitionKey: state.transitionKey + 1
            })),

            resetUI: () => set({
                showQRCode: false,
                remoteSession: null,
                isConnecting: false,
                transitionKey: 0,
            }),
        }),
        { name: 'UIStore' }
    )
);
