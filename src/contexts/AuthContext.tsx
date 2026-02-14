import React, { createContext, useContext, useEffect, useState } from "react";
import { User, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInWithGoogle: async () => { },
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                // User is signed in
                setUser(currentUser);
                setLoading(false);
            } else {
                // No user is signed in, try anonymous auth
                console.log("No user found, attempting anonymous sign-in...");
                signInAnonymously(auth)
                    .then((result) => {
                        console.log("Signed in anonymously as:", result.user.uid);
                        setUser(result.user);
                    })
                    // Fallback to MOCK USER if anonymous auth is not enabled in Firebase Console
                    .catch((error) => {
                        console.error("Anonymous auth failed, using MOCK user:", error);
                        setUser({
                            uid: "local-dev-user",
                            email: "demo@promptmaster.local",
                            displayName: "Modo Personal",
                            emailVerified: true,
                            isAnonymous: true,
                            metadata: {},
                            providerData: [],
                            refreshToken: "",
                            tenantId: null,
                            delete: async () => { },
                            getIdToken: async () => "mock-token",
                            getIdTokenResult: async () => ({} as any),
                            reload: async () => { },
                            toJSON: () => ({}),
                            phoneNumber: null,
                            photoURL: null,
                            providerId: 'firebase', // Added to satisfy User interface partially
                        } as unknown as User); // Force cast to User to bypass strict checks
                    })
                    .finally(() => {
                        setLoading(false);
                    });
            }
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google", error);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            // Optionally auto-sign in anonymously again immediately?
            // For now, standard logout.
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const value = {
        user,
        loading,
        signInWithGoogle,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
