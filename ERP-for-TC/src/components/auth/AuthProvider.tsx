import React, { createContext, useContext, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  collection, 
  serverTimestamp,
  query,
  where,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { useAuthStore, useAppStore } from '../../store/useStore';

const AuthContext = createContext({});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();
  const { setCurrentTenant } = useAppStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
          // 1. MASTER KEY LAYER - Instant Bypass
          const normalizedEmail = firebaseUser.email?.toLowerCase().trim();
          const isSuperAdminEmail = normalizedEmail === 'dasucosmos@gmail.com' || normalizedEmail === 'rajesh@sibbc.org' || normalizedEmail === 'rajesh@sibbc.com';
          const isSuperAdminPhone = firebaseUser.phoneNumber === '+919858866667';
          
          if (isSuperAdminEmail || isSuperAdminPhone) {
             // Immediately grant application state Access
             setUser({
               uid: firebaseUser.uid,
               email: firebaseUser.email,
               phoneNumber: firebaseUser.phoneNumber,
               tenantId: 'covenant-hq',
               role: 'super_admin'
             });
             
             setCurrentTenant({
                id: 'covenant-hq',
                name: 'Covenant Headquarters',
                institutionType: 'Seminary'
             });
             
             // Do the database sync asynchronously so DB errors cannot block UI
             setDoc(doc(db, 'users', firebaseUser.uid), {
                email: firebaseUser.email || null,
                role: 'super_admin',
                tenantId: 'covenant-hq',
                displayName: (normalizedEmail === 'rajesh@sibbc.org' || normalizedEmail === 'rajesh@sibbc.com') ? 'Rajesh (Governance)' : 'Principal Governance'
             }, { merge: true }).catch(console.error);

             setLoading(false);
             return; // EXITS HERE. Never hits the risky queries below.
          }

          // 2. Normal User Flow
          try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);
            let userData = userDoc.data();

            // Account Reclamation by Email - Wrapped in try/catch to prevent blocking
            if (!userData && firebaseUser.email) {
              try {
                // First try to look up document named by email (SuperAdmin creates them this way if uid unavailable)
                const fallbackDocRef = doc(db, 'users', firebaseUser.email);
                let provisionedDoc = await getDoc(fallbackDocRef);
                let provisionedData = provisionedDoc.data();

                // If not found, try query
                if (!provisionedData) {
                  const q = query(collection(db, 'users'), where('email', '==', firebaseUser.email));
                  const querySnapshot = await getDocs(q);
                  if (!querySnapshot.empty) {
                    provisionedDoc = querySnapshot.docs[0] as any;
                    provisionedData = provisionedDoc.data();
                  }
                }
                
                if (provisionedData) {
                  await setDoc(userDocRef, {
                    ...provisionedData,
                    uid: firebaseUser.uid,
                    updatedAt: serverTimestamp()
                  });
                  
                  if (provisionedDoc.ref.id !== userDocRef.id) {
                    await deleteDoc(provisionedDoc.ref);
                  }
                  userData = provisionedData;
                }
              } catch (reclaimError) {
                console.warn("Reclamation query blocked or failed", reclaimError);
              }
            }
             
            const actualTenantId = userData?.tenantId || userData?.institutionId || null;
             
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              phoneNumber: firebaseUser.phoneNumber,
              tenantId: actualTenantId,
              role: userData?.role || null,
            });
             
            if (actualTenantId) {
               try {
                  // Check institutions collection first as we migrated to it
                  let tenantDoc = await getDoc(doc(db, 'institutions', actualTenantId));
                  if (!tenantDoc.exists()) {
                    tenantDoc = await getDoc(doc(db, 'tenants', actualTenantId));
                  }
                  
                  const tenantData = tenantDoc.data();
                  if (tenantData) {
                    setCurrentTenant({
                      id: actualTenantId,
                      name: tenantData.name,
                      institutionType: tenantData.institutionType || 'Theological Institution',
                    });
                  }
               } catch (tenantError) {
                  console.warn("Tenant load failed", tenantError);
               }
            }
          } catch (error) {
            console.error("Error fetching user profile:", error);
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              tenantId: null,
              role: null,
            });
          }
      } else {
        setUser(null);
        setCurrentTenant(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading, setCurrentTenant]);

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
}
