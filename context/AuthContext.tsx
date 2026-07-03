import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

interface AuthContextType {
  user: User | null;
  role: string | null;
  approvalStatus: string | null;
  driverData: any | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  approvalStatus: null,
  driverData: null,
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
  const [driverData, setDriverData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribeUser: (() => void) | null = null;
    let unsubscribeDriver: (() => void) | null = null;

    const cleanup = () => {
      if (unsubscribeUser) unsubscribeUser();
      if (unsubscribeDriver) unsubscribeDriver();
    };

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      cleanup();

      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Listen to user document in real-time
        unsubscribeUser = onSnapshot(doc(db, 'users', firebaseUser.uid), (userDoc) => {
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setRole(userData.role);

            // If user is a driver, listen to their driver document
            if (userData.role === 'driver') {
              if (unsubscribeDriver) unsubscribeDriver(); // prevent multiple listeners
              
              unsubscribeDriver = onSnapshot(doc(db, 'drivers', firebaseUser.uid), (driverDoc) => {
                if (driverDoc.exists()) {
                  setApprovalStatus(driverDoc.data().approvalStatus);
                  setDriverData(driverDoc.data());
                } else {
                  setApprovalStatus('pending');
                  setDriverData(null);
                }
                setIsLoading(false);
              }, (error) => {
                console.error("Error fetching driver data:", error);
                setIsLoading(false);
              });
            } else {
              if (unsubscribeDriver) { unsubscribeDriver(); unsubscribeDriver = null; }
              setApprovalStatus(null);
              setDriverData(null);
              setIsLoading(false);
            }
          } else {
            // User doc doesn't exist
            setRole(null);
            setApprovalStatus(null);
            setDriverData(null);
            setIsLoading(false);
          }
        }, (error) => {
          console.error("Error fetching user role data:", error);
          setIsLoading(false);
        });
      } else {
        setUser(null);
        setRole(null);
        setApprovalStatus(null);
        setDriverData(null);
        setIsLoading(false);
      }
    });

    return () => {
      cleanup();
      unsubscribeAuth();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, approvalStatus, driverData, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
