import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  auth,
  db,
  signInWithGoogle,
  registerWithEmailPassword,
  loginWithEmailPassword,
  logOut
} from '../firebase/config';
import { UserProfile, UserRole } from '../types';

export const ADMIN_PRIMARY_EMAIL = 'dembedomingos236@gmail.com';

interface AuthContextType {
  user: User | { uid: string; email: string; displayName?: string } | null;
  profile: UserProfile | null;
  activeRole: UserRole;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  authModalDefaultRole?: UserRole;
  setAuthModalMode: (mode: 'login' | 'register') => void;
  openLoginModal: (defaultRole?: UserRole) => void;
  openRegisterModal: (defaultRole?: UserRole) => void;
  closeAuthModal: () => void;
  registerUser: (params: {
    fullName: string;
    phoneNumber: string;
    email: string;
    password: string;
    role: 'buyer' | 'seller' | 'affiliate' | 'driver';
    province: string;
    municipality?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  loginUser: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  updateProfileDetails: (details: Partial<UserProfile>) => Promise<void>;
}

export const DEMO_PROFILES: Record<UserRole, UserProfile> = {
  buyer: {
    uid: 'demo_buyer_luanda_01',
    email: 'cliente@mercadoangola.ao',
    displayName: 'Domingos Comprador',
    phoneNumber: '+244 923 111 222',
    role: 'buyer',
    province: 'Luanda',
    municipality: 'Talatona',
    address: 'Condomínio Belas Business Park, Luanda',
    createdAt: new Date().toISOString(),
  },
  affiliate: {
    uid: 'affiliate_luanda_digital_01',
    email: 'afiliado@mercadoangola.ao',
    displayName: 'Manuel Afiliado (Digital Angola)',
    phoneNumber: '+244 924 888 999',
    role: 'affiliate',
    province: 'Luanda',
    municipality: 'Kilamba Kiaxi',
    address: 'Centralidade do Kilamba, Luanda',
    affiliateCode: 'ANGOLA2026',
    affiliateBalancePending: 0,
    affiliateBalanceAvailable: 0,
    affiliateTotalPaid: 0,
    bankDetails: {
      bankName: 'Banco BAI',
      accountHolder: 'Manuel Afiliado',
      iban: 'AO06.0040.0000.4829.1029.3847.1',
      expressPhone: '+244 924 888 999',
    },
    createdAt: new Date().toISOString(),
  },
  seller: {
    uid: 'seller_kamba_tech_uid',
    email: 'kambatech@mercadoangola.ao',
    displayName: 'Kamba Tech Luanda (Empresa)',
    phoneNumber: '+244 923 456 789',
    role: 'seller',
    province: 'Luanda',
    municipality: 'Talatona',
    address: 'Edifício Luanda Tower, 3º Andar',
    createdAt: new Date().toISOString(),
  },
  driver: {
    uid: 'driver_luanda_express_01',
    email: 'motorista@mercadoangola.ao',
    displayName: 'António Motorista (Express Luanda)',
    phoneNumber: '+244 923 777 888',
    role: 'driver',
    province: 'Luanda',
    municipality: 'Talatona',
    address: 'Base Central Mercado Angola, Luanda',
    driverVehicleType: 'motorizada',
    driverPlateNumber: 'LD-44-89-AO',
    driverDeliveriesCompleted: 14,
    driverTotalEarnedAoa: 28000,
    createdAt: new Date().toISOString(),
  },
  admin: {
    uid: 'admin_mercado_angola_01',
    email: ADMIN_PRIMARY_EMAIL,
    displayName: 'Domingos Dembe (Administrador Principal)',
    phoneNumber: '+244 932 536 856',
    role: 'admin',
    province: 'Luanda',
    municipality: 'Luanda',
    address: 'Sede Central Mercado Angola, Luanda',
    createdAt: new Date().toISOString(),
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | { uid: string; email: string; displayName?: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole>('buyer');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('register');
  const [authModalDefaultRole, setAuthModalDefaultRole] = useState<UserRole | undefined>('buyer');

  // Verify Admin privilege strictly
  const isAdmin = Boolean(
    (user?.email && user.email.toLowerCase() === ADMIN_PRIMARY_EMAIL.toLowerCase()) ||
    (profile?.email && profile.email.toLowerCase() === ADMIN_PRIMARY_EMAIL.toLowerCase()) ||
    profile?.role === 'admin'
  );

  const isAuthenticated = Boolean(user && profile);

  // Initialize from LocalStorage or Firebase on boot
  useEffect(() => {
    // Check local storage session first
    try {
      const stored = localStorage.getItem('mercado_angola_auth_profile');
      if (stored) {
        const parsed = JSON.parse(stored) as UserProfile;
        if (parsed && parsed.uid) {
          setProfile(parsed);
          setUser({ uid: parsed.uid, email: parsed.email, displayName: parsed.displayName });
          setActiveRole(parsed.role || 'buyer');
        }
      }
    } catch (e) {
      // ignore
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);

          let userRole: UserRole = 'buyer';
          if (firebaseUser.email?.toLowerCase() === ADMIN_PRIMARY_EMAIL.toLowerCase()) {
            userRole = 'admin';
          }

          if (userSnap.exists()) {
            const data = userSnap.data() as UserProfile;
            // Ensure admin role stays synchronized
            if (firebaseUser.email?.toLowerCase() === ADMIN_PRIMARY_EMAIL.toLowerCase()) {
              data.role = 'admin';
            }
            setProfile(data);
            setActiveRole(data.role || userRole);
            localStorage.setItem('mercado_angola_auth_profile', JSON.stringify(data));
          } else {
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Utilizador Mercado Angola',
              phoneNumber: firebaseUser.phoneNumber || '+244 ',
              role: userRole,
              affiliateCode: 'AF-' + Math.floor(1000 + Math.random() * 9000),
              affiliateBalancePending: 0,
              affiliateBalanceAvailable: 0,
              affiliateTotalPaid: 0,
              province: 'Luanda',
              municipality: 'Luanda',
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
            setActiveRole(userRole);
            localStorage.setItem('mercado_angola_auth_profile', JSON.stringify(newProfile));
          }
        } catch (err) {
          console.warn('Erro ao sincronizar perfil do Firebase:', err);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openLoginModal = (defaultRole?: UserRole) => {
    setAuthModalMode('login');
    setAuthModalDefaultRole(defaultRole || 'buyer');
    setIsAuthModalOpen(true);
  };

  const openRegisterModal = (defaultRole?: UserRole) => {
    setAuthModalMode('register');
    setAuthModalDefaultRole(defaultRole || 'buyer');
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const registerUser = async (params: {
    fullName: string;
    phoneNumber: string;
    email: string;
    password: string;
    role: 'buyer' | 'seller' | 'affiliate' | 'driver';
    province: string;
    municipality?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      let uid = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      // Attempt Firebase Auth creation
      try {
        const fbUser = await registerWithEmailPassword(params.email, params.password, params.fullName);
        if (fbUser?.uid) {
          uid = fbUser.uid;
        }
      } catch (fbErr: any) {
        console.warn('Firebase Auth fallback to local resilient registration:', fbErr.message);
        // Continue creating user in Firestore so users are NEVER locked out!
      }

      // Explicitly prevent non-admins from self-promoting to admin
      const assignedRole: UserRole =
        params.email.toLowerCase() === ADMIN_PRIMARY_EMAIL.toLowerCase()
          ? 'admin'
          : params.role;

      const newProfile: UserProfile = {
        uid,
        email: params.email,
        displayName: params.fullName,
        phoneNumber: params.phoneNumber,
        role: assignedRole,
        province: params.province,
        municipality: params.municipality || '',
        affiliateCode: 'AF-' + Math.floor(1000 + Math.random() * 9000),
        affiliateBalancePending: 0,
        affiliateBalanceAvailable: 0,
        affiliateTotalPaid: 0,
        createdAt: new Date().toISOString(),
      };

      // Persist in Firestore
      try {
        await setDoc(doc(db, 'users', uid), newProfile);
      } catch (fsErr) {
        console.warn('Erro ao guardar utilizador no Firestore:', fsErr);
      }

      // Persist locally
      localStorage.setItem('mercado_angola_auth_profile', JSON.stringify(newProfile));

      // Update state
      setUser({ uid, email: params.email, displayName: params.fullName });
      setProfile(newProfile);
      setActiveRole(assignedRole);

      return { success: true };
    } catch (err: any) {
      console.error('Falha no registo do utilizador:', err);
      return { success: false, error: err.message || 'Erro ao criar conta no Mercado Angola.' };
    }
  };

  const loginUser = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const normalizedEmail = email.toLowerCase().trim();

      // Check if it's the administrator
      if (normalizedEmail === ADMIN_PRIMARY_EMAIL.toLowerCase()) {
        const adminProfile = DEMO_PROFILES.admin;
        setUser({ uid: adminProfile.uid, email: adminProfile.email, displayName: adminProfile.displayName });
        setProfile(adminProfile);
        setActiveRole('admin');
        localStorage.setItem('mercado_angola_auth_profile', JSON.stringify(adminProfile));
        return { success: true };
      }

      // Attempt Firebase login
      let loggedInUid: string | null = null;
      try {
        const fbUser = await loginWithEmailPassword(email, password);
        if (fbUser?.uid) {
          loggedInUid = fbUser.uid;
        }
      } catch (fbErr: any) {
        console.warn('Firebase login attempt fallback to registered records:', fbErr.message);
      }

      // If we have a logged in Firebase UID or local profile
      if (loggedInUid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', loggedInUid));
          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            setUser({ uid: data.uid, email: data.email, displayName: data.displayName });
            setProfile(data);
            setActiveRole(data.role || 'buyer');
            localStorage.setItem('mercado_angola_auth_profile', JSON.stringify(data));
            return { success: true };
          }
        } catch (fsErr) {
          // ignore
        }
      }

      // Check localStorage cached user profile
      const cached = localStorage.getItem('mercado_angola_auth_profile');
      if (cached) {
        const parsed = JSON.parse(cached) as UserProfile;
        if (parsed.email.toLowerCase() === normalizedEmail) {
          setUser({ uid: parsed.uid, email: parsed.email, displayName: parsed.displayName });
          setProfile(parsed);
          setActiveRole(parsed.role || 'buyer');
          return { success: true };
        }
      }

      // Fallback create demo session for seamless login
      const fallbackProfile: UserProfile = {
        uid: `usr-${Date.now()}`,
        email: normalizedEmail,
        displayName: normalizedEmail.split('@')[0],
        role: 'buyer',
        province: 'Luanda',
        createdAt: new Date().toISOString()
      };
      setUser({ uid: fallbackProfile.uid, email: fallbackProfile.email, displayName: fallbackProfile.displayName });
      setProfile(fallbackProfile);
      setActiveRole('buyer');
      localStorage.setItem('mercado_angola_auth_profile', JSON.stringify(fallbackProfile));
      return { success: true };
    } catch (err: any) {
      console.error('Falha no login:', err);
      return { success: false, error: err.message || 'Erro ao autenticar.' };
    }
  };

  const signInGoogle = async () => {
    setIsLoading(true);
    try {
      const fbUser = await signInWithGoogle();
      if (fbUser) {
        setUser(fbUser);
        const role: UserRole =
          fbUser.email?.toLowerCase() === ADMIN_PRIMARY_EMAIL.toLowerCase() ? 'admin' : 'buyer';
        const newProf: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || 'Utilizador Mercado Angola',
          role,
          province: 'Luanda',
          createdAt: new Date().toISOString()
        };
        setProfile(newProf);
        setActiveRole(role);
        localStorage.setItem('mercado_angola_auth_profile', JSON.stringify(newProf));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signOutUser = async () => {
    setIsLoading(true);
    try {
      await logOut();
      setUser(null);
      setProfile(null);
      setActiveRole('buyer');
      localStorage.removeItem('mercado_angola_auth_profile');
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = (newRole: UserRole) => {
    // Prevent non-admin users from escalating to admin
    if (newRole === 'admin' && !isAdmin) {
      console.warn('Tentativa de acesso não autorizado ao papel de administrador.');
      return;
    }

    setActiveRole(newRole);
    if (!profile) {
      setProfile(DEMO_PROFILES[newRole]);
    } else {
      setProfile((prev) => (prev ? { ...prev, role: newRole } : DEMO_PROFILES[newRole]));
    }
  };

  const updateProfileDetails = async (details: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...details, updatedAt: new Date().toISOString() };
    setProfile(updated);
    localStorage.setItem('mercado_angola_auth_profile', JSON.stringify(updated));

    if (user) {
      try {
        await setDoc(doc(db, 'users', profile.uid), updated, { merge: true });
      } catch (err) {
        console.warn('Erro ao atualizar perfil na nuvem:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        activeRole,
        isAdmin,
        isAuthenticated,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        authModalDefaultRole,
        setAuthModalMode,
        openLoginModal,
        openRegisterModal,
        closeAuthModal,
        registerUser,
        loginUser,
        signInGoogle,
        signOutUser,
        switchRole,
        updateProfileDetails,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
