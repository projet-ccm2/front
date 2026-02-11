import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';

interface TwitchUser {
    userId: string;
    username: string;
    channel: {
        id: string;
        name: string;
        description: string;
        profileImageUrl: string;
    };
    channelsWhichIsMod: string[];
}

interface AuthContextType {
    user: TwitchUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: () => void;
    logout: () => void;
    completeAuth: (tokens: { accessToken: string; idToken: string; tokenType: string; expiresIn: number; scope: string[]; state: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_SERVICE_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:3000';
const TWITCH_CLIENT_ID = import.meta.env.VITE_TWITCH_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_TWITCH_REDIRECT_URI || globalThis.location.origin;

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [user, setUser] = useState<TwitchUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!user;

    useEffect(() => {
        const savedUser = localStorage.getItem('twitch_user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error('Failed to parse saved user', e);
                localStorage.removeItem('twitch_user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = () => {
        const scope = encodeURIComponent('openid user:read:email'); // Adjust scopes as needed
        const responseType = 'token id_token';
        const state = Math.random().toString(36).substring(7);

        // Store state to verify it later if needed (security best practice)
        sessionStorage.setItem('twitch_auth_state', state);

        const twitchUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${TWITCH_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=${responseType}&scope=${scope}&state=${state}`;

        globalThis.location.href = twitchUrl;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('twitch_user');
        localStorage.removeItem('twitch_tokens');
    };

    const completeAuth = async (tokens: { accessToken: string; idToken: string; tokenType: string; expiresIn: number; scope: string[]; state: string }) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${AUTH_SERVICE_URL}/auth/callback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(tokens),
            });

            if (!response.ok) {
                throw new Error('Failed to authenticate with backend');
            }

            const data = await response.json();
            if (data.success) {
                const fullUser = { ...data.user, userId: data.userId };
                console.log('Successfully authenticated. Twitch User ID:', data.userId);
                setUser(fullUser);
                localStorage.setItem('twitch_user', JSON.stringify(fullUser));
                localStorage.setItem('twitch_tokens', JSON.stringify(tokens));
            } else {
                throw new Error(data.error || 'Authentication failed');
            }
        } catch (error) {
            console.error('Auth error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const value = useMemo(() => ({
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        completeAuth
    }), [user, isAuthenticated, isLoading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
