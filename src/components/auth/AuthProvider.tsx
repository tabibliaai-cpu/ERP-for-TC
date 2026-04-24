import React, { createContext, useContext, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
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
  const { setUser, setLoading, setAppView } = useAuthStore();
  const { setCurrentTenant } = useAppStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
          const normalizedEmail = firebaseUser.email?.toLowerCase().trim();
          const isSuperAdminEmail = normalizedEmail === 'dasucosmos@gmail.com' || normalizedEmail === 'rajesh@sibbc.org' || normalizedEmail === 'rajesh@sibbc.com';
          const isSuperAdminPhone = firebaseUser.phoneNumber === '+919858866667';
          
          // ─── SUPER ADMIN: Instant Bypass ───
          if (isSuperAdminEmail || isSuperAdminPhone) {
             setUser({
               uid: firebaseUser.uid,
               email: firebaseUser.email,
               phoneNumber: firebaseUser.phoneNumber,
               tenantId: 'covenant-hq',
               role: 'super_admin',
               isSubscribed: true,
               onboardingComplete: true,
               institutionId: 'covenant-hq',
             });
             
             setCurrentTenant({
                id: 'covenant-hq',
                name: 'Covenant Headquarters',
                institutionType: 'Seminary'
             });

             setAppView('app');

             setDoc(doc(db, 'users', firebaseUser.uid), {
                email: firebaseUser.email || null,
                role: 'super_admin',
                tenantId: 'covenant-hq',
                displayName: (normalizedEmail === 'rajesh@sibbc.org' || normalizedEmail === 'rajesh@sibbc.com') ? 'Rajesh (Governance)' : 'Principal Governance'
             }, { merge: true }).catch(console.error);

             setLoading(false);
             return;
          }

          // ─── NORMAL USER FLOW: Gatekeeper Logic ───
          try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);
            let userData = userDoc.data();

            // Account Reclamation by Email
            if (!userData && firebaseUser.email) {
              try {
                const q = query(collection(db, 'users'), where('email', '==', firebaseUser.email));
                const querySnapshot = await getDocs(q);
                
                if (!querySnapshot.empty) {
                  const provisionedDoc = querySnapshot.docs[0];
                  const provisionedData = provisionedDoc.data();
                  
                  await setDoc(userDocRef, {
                    ...provisionedData,
                    uid: firebaseUser.uid,
                    updatedAt: serverTimestamp()
                  });
                  
                  await deleteDoc(provisionedDoc.ref);
                  userData = provisionedData;
                }
              } catch (reclaimError) {
                console.warn("Reclamation query blocked or failed", reclaimError);
              }
            }

            // ─── GATE 1: Check if user has any profile at all ───
            if (!userData) {
              // First time user — create a minimal profile and show public site
              await setDoc(userDocRef, {
                email: firebaseUser.email,
                displayName: firebaseUser.email?.split('@')[0],
                role: 'pending',
                createdAt: serverTimestamp(),
                isSubscribed: false,
                onboardingComplete: false,
              }, { merge: true });

              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                phoneNumber: firebaseUser.phoneNumber,
                tenantId: null,
                role: 'pending',
                isSubscribed: false,
                onboardingComplete: false,
              });

              setAppView('public');
              setLoading(false);
              return;
            }

            // ─── GATE 2: Check subscription ───
            const isSubscribed = userData.isSubscribed === true || 
                                 userData.role === 'admin' || 
                                 userData.role === 'faculty' || 
                                 userData.role === 'teacher' || 
                                 userData.role === 'student';

            if (!isSubscribed) {
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                phoneNumber: firebaseUser.phoneNumber,
                tenantId: userData.tenantId || null,
                role: userData.role || 'pending',
                isSubscribed: false,
                onboardingComplete: false,
                institutionId: userData.institutionId || null,
              });
              setAppView('public'); // → Redirect to pricing
              setLoading(false);
              return;
            }

            // ─── GATE 3: Check onboarding completion ───
            const onboardingComplete = userData.onboardingComplete === true;
            const hasInstitution = !!userData.tenantId || !!userData.institutionId;

            if (!onboardingComplete || !hasInstitution) {
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                phoneNumber: firebaseUser.phoneNumber,
                tenantId: userData.tenantId || null,
                role: userData.role || 'admin',
                isSubscribed: true,
                onboardingComplete: false,
                institutionId: userData.institutionId || null,
              });
              setAppView('onboarding'); // → Show wizard
              setLoading(false);
              return;
            }

            // ─── GATE 4: Full Access ───
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              phoneNumber: firebaseUser.phoneNumber,
              tenantId: userData.tenantId || null,
              role: userData.role || null,
              isSubscribed: true,
              onboardingComplete: true,
              institutionId: userData.institutionId || userData.tenantId || null,
            });

            setAppView('app'); // → Full dashboard

            // Load tenant data
            const tenantId = userData.tenantId || userData.institutionId;
            if (tenantId) {
               try {
                  const tenantDoc = await getDoc(doc(db, 'institutions', tenantId));
                  if (!tenantDoc.exists()) {
                    // Fallback to tenants collection
                    const altTenantDoc = await getDoc(doc(db, 'tenants', tenantId));
                    const tenantData = altTenantDoc.data();
                    if (tenantData) {
                      setCurrentTenant({
                        id: tenantId,
                        name: tenantData.name,
                        institutionType: tenantData.institutionType || 'Theological Institution',
                      });
                    }
                  } else {
                    const tenantData = tenantDoc.data();
                    setCurrentTenant({
                      id: tenantId,
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
            setAppView('public');
          }
      } else {
        setUser(null);
        setCurrentTenant(null);
        setAppView('public');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading, setCurrentTenant, setAppView]);

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
}
