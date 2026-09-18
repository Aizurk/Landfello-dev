import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updatePassword,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { auth, db, storage } from "@/lib/firebase";

export type AccountType = "investor" | "agent";

interface UserProfile {
  accountType: AccountType;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  licenseNumber?: string;
  companyName?: string;
  specialties?: string[];
  yearsExp?: number;
  serviceAreas?: string[];
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signup: (email: string, password: string, accountType: AccountType, profileData?: Partial<UserProfile>) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfilePicture: (imageFile: File) => Promise<string>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  changeEmail: (currentPassword: string, newEmail: string) => Promise<void>;
  deactivateAccount: (currentPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from Firestore
  const fetchUserProfile = async (user: User) => {
    try {
      if (!db) {
        console.warn("Firestore not initialized, defaulting to investor");
        setUserProfile({ accountType: "investor" });
        return;
      }
      
      // Retry logic to handle Firestore eventual consistency
      // If profile was just created, it might not be immediately available
      let userDoc = null;
      const maxRetries = 3;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const fetchPromise = getDoc(doc(db, "users", user.uid));
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Fetch timeout")), 5000)
          );
          
          userDoc = await Promise.race([fetchPromise, timeoutPromise]);
          
          if (userDoc.exists()) {
            const profileData = userDoc.data() as UserProfile;
            console.log("✅ Profile fetched from Firestore:", profileData);
            setUserProfile(profileData);
            return; // Success, exit function
          }
          
          // If document doesn't exist and this is not the last attempt, wait and retry
          if (attempt < maxRetries) {
            console.log(`⏳ Profile not found (attempt ${attempt}/${maxRetries}), waiting 1 second before retry...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
        } catch (fetchError: any) {
          console.error(`Error fetching profile (attempt ${attempt}):`, fetchError);
          if (attempt < maxRetries && !fetchError.message?.includes("timeout")) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          throw fetchError;
        }
      }
      
      // If we get here, profile doesn't exist after all retries
      // Don't create a default profile - just set a local default
      // The profile should have been created during signup, so if it's missing,
      // it's likely a timing issue and will be available on next check
      console.warn("⚠️ Profile not found in Firestore after retries. Using local default (investor).");
      console.warn("⚠️ If you just signed up, this might be a timing issue. Profile will sync on next login.");
      setUserProfile({ accountType: "investor" });
      
    } catch (error: any) {
      console.error("Error fetching user profile:", error);
      // If it's an offline error, default to investor and continue
      if (error.message?.includes("offline") || error.message?.includes("timeout")) {
        console.warn("Firestore offline or timeout, defaulting to investor");
      }
      setUserProfile({ accountType: "investor" });
    }
  };

  async function signup(
    email: string,
    password: string,
    accountType: AccountType,
    profileData?: Partial<UserProfile>
  ) {
    try {
      console.log("🚀 ========== SIGNUP PROCESS STARTED ==========");
      console.log("📧 Email:", email);
      console.log("👤 Account Type:", accountType);
      console.log("📋 Profile Data:", profileData);
      
      if (!accountType || (accountType !== "agent" && accountType !== "investor")) {
        console.error("❌ INVALID ACCOUNT TYPE:", accountType);
        throw new Error(`Invalid account type: ${accountType}. Must be "agent" or "investor".`);
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("✅ User created in Firebase Auth:", user.uid);

      // Create user profile in Firestore
      // Build profile object - only include fields that exist (no undefined values)
      const profile: any = {
        accountType: accountType, // Explicitly set accountType
      };
      
      console.log("🔍 Step 1: Base profile created with accountType:", profile.accountType);
      
      // Add basic fields if provided
      if (profileData?.firstName) profile.firstName = profileData.firstName;
      if (profileData?.lastName) profile.lastName = profileData.lastName;
      if (profileData?.phoneNumber) profile.phoneNumber = profileData.phoneNumber;
      
      // Only include agent-specific fields for agents
      if (accountType === "agent") {
        console.log("👔 Agent account detected - adding agent-specific fields");
        if (profileData?.licenseNumber) {
          profile.licenseNumber = profileData.licenseNumber;
          console.log("✅ License number added:", profileData.licenseNumber);
        }
        if (profileData?.companyName) {
          profile.companyName = profileData.companyName;
          console.log("✅ Company name added:", profileData.companyName);
        }
      }
      // For investors, licenseNumber and companyName are not included at all

      console.log("📝 Final profile object to save:", JSON.stringify(profile, null, 2));
      console.log("🔍 Verifying accountType in profile:", profile.accountType);
      
      // Check if db is available
      if (!db) {
        throw new Error("Firestore database is not initialized. Please check your Firebase configuration.");
      }
      
      // Try to save to Firestore with retry logic
      let savedToFirestore = false;
      const maxRetries = 3;
      
      // Verify db is available
      if (!db) {
        console.error("❌ Firestore db is null or undefined!");
        throw new Error("Firestore database is not initialized. Please check your Firebase configuration.");
      }
      
      console.log("📝 Profile to save:", JSON.stringify(profile, null, 2));
      console.log("👤 User UID:", user.uid);
      console.log("📂 Document path: users/" + user.uid);
      
      let lastError: any = null;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🔄 Attempting Firestore write (attempt ${attempt}/${maxRetries})...`);
          
          // Create document reference and save - no enableNetwork, no timeout wrapper
          const docRef = doc(db, "users", user.uid);
          console.log("📄 Document reference created:", docRef.path);
          
          // Direct write - if it fails, we'll catch the real error
          await setDoc(docRef, profile, { merge: false });
          console.log("✅ Profile saved successfully to Firestore!");
          
          // Give Firestore a moment to propagate the write (eventual consistency)
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Verify it was saved by reading it back
          const verifyDoc = await getDoc(docRef);
          if (verifyDoc.exists()) {
            const verifiedData = verifyDoc.data();
            console.log("✅ Verification: Document exists in Firestore:", verifiedData);
            // Double-check the accountType was saved correctly
            if (verifiedData.accountType !== accountType) {
              console.error(`⚠️ WARNING: Account type mismatch! Expected: ${accountType}, Got: ${verifiedData.accountType}`);
              // Try to fix it
              await setDoc(docRef, { accountType }, { merge: true });
              console.log("🔄 Attempted to fix account type mismatch");
            }
          } else {
            console.warn("⚠️ Verification: Document does not exist after save!");
          }
          
          savedToFirestore = true;
          break; // Success, exit retry loop
        } catch (firestoreError: any) {
          lastError = firestoreError;
          console.error(`❌ Firestore save error (attempt ${attempt}):`, firestoreError);
          console.error("Error code:", firestoreError?.code);
          console.error("Error message:", firestoreError?.message);
          console.error("Full error:", firestoreError);
          
          // Check if it's a permissions error - don't retry this
          if (firestoreError?.code === "permission-denied") {
            console.error("🚫 PERMISSION DENIED - Check Firestore security rules!");
            throw new Error("Permission denied. Please check your Firestore security rules to allow writes to /users/{userId}.");
          }
          
          // If this is the last attempt, we'll throw the last error below
          if (attempt < maxRetries) {
            // Wait before retrying (exponential backoff)
            const delay = attempt * 1000; // 1s, 2s, 3s
            console.log(`⏳ Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      // If all retries failed, throw the last error (not a generic timeout message)
      if (!savedToFirestore && lastError) {
        throw lastError;
      }
      
      // Always set profile locally so user can continue
      console.log("💾 Setting profile in local state:", profile);
      setUserProfile(profile as UserProfile);
      
      if (!savedToFirestore) {
        console.error("❌❌❌ CRITICAL: Profile was NOT saved to Firestore!");
        console.error("❌ The account was created but the profile data was not saved.");
        console.error("❌ This means the accountType will not be correct in the database.");
        console.error("❌ Most likely cause: Firestore security rules are blocking the write.");
        console.error("❌ Please check your Firestore security rules in Firebase Console.");
        throw new Error("Failed to save profile to Firestore. This is usually due to Firestore security rules. Please check your Firebase Console → Firestore Database → Rules and ensure authenticated users can write to /users/{userId}. The account was created but the profile needs to be saved manually.");
      }
      
      console.log("✅ ========== SIGNUP PROCESS COMPLETED SUCCESSFULLY ==========");
      console.log("✅ Account created with accountType:", accountType);
    } catch (error: any) {
      console.error("Signup error:", error);
      throw error; // Re-throw to let the UI handle it
    }
  }

  async function login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Check if profile exists, if not create default investor profile
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        console.log("Profile not found for logged-in user, creating default investor profile");
        await setDoc(doc(db, "users", user.uid), {
          accountType: "investor" as AccountType,
        });
        setUserProfile({ accountType: "investor" });
      }
    } catch (error) {
      console.error("Error checking/creating profile on login:", error);
      // Continue anyway - fetchUserProfile will handle it
    }
    
    return userCredential;
  }

  function logout() {
    return signOut(auth);
  }

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    // Check if user profile exists, if not create default investor profile
    const userDoc = await getDoc(doc(db, "users", result.user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, "users", result.user.uid), {
        accountType: "investor" as AccountType,
      });
    }
    return result;
  }

  function resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email);
  }

  async function updateProfilePicture(imageFile: File): Promise<string> {
    if (!currentUser) {
      throw new Error("No user logged in");
    }

    try {
      // Create a reference to the profile picture in Firebase Storage
      const storageRef = ref(storage, `profile-pictures/${currentUser.uid}`);
      
      // Upload the file
      await uploadBytes(storageRef, imageFile);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        photoURL: downloadURL,
      });
      
      // Update Firestore profile
      if (db) {
        const userDocRef = doc(db, "users", currentUser.uid);
        await updateDoc(userDocRef, {
          photoURL: downloadURL,
        });
      }
      
      // Refresh the user profile
      await refreshUserProfile();
      
      return downloadURL;
    } catch (error: any) {
      console.error("Error updating profile picture:", error);
      throw new Error(`Failed to update profile picture: ${error.message}`);
    }
  }

  async function refreshUserProfile() {
    if (!currentUser) return;
    await fetchUserProfile(currentUser);
  }

  async function updateProfile(updates: Partial<UserProfile>) {
    if (!currentUser) {
      throw new Error("No user logged in");
    }

    if (!db) {
      throw new Error("Firestore database is not initialized");
    }

    // Validate that agent-specific fields are only updated by agents
    const agentOnlyFields = ['companyName', 'licenseNumber', 'specialties', 'yearsExp', 'serviceAreas'];
    const hasAgentFields = agentOnlyFields.some(field => field in updates && updates[field as keyof UserProfile] !== undefined);
    
    if (hasAgentFields && userProfile?.accountType !== "agent") {
      throw new Error("Only real estate agents can update agent-specific profile fields.");
    }

    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, updates);
      
      // Update local state
      if (userProfile) {
        setUserProfile({ ...userProfile, ...updates });
      }
      
      // Refresh to ensure consistency
      await refreshUserProfile();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      throw new Error(`Failed to update profile: ${error.message}`);
    }
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    if (!currentUser || !currentUser.email) {
      throw new Error("No user logged in");
    }

    try {
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, newPassword);
    } catch (error: any) {
      console.error("Error changing password:", error);
      if (error.code === "auth/wrong-password") {
        throw new Error("Current password is incorrect");
      } else if (error.code === "auth/weak-password") {
        throw new Error("New password is too weak. Please use at least 6 characters");
      } else if (error.code === "auth/requires-recent-login") {
        throw new Error("Please log out and log back in before changing your password");
      }
      throw new Error(`Failed to change password: ${error.message}`);
    }
  }

  async function changeEmail(currentPassword: string, newEmail: string) {
    if (!currentUser || !currentUser.email) {
      throw new Error("No user logged in");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      throw new Error("Please enter a valid email address");
    }

    try {
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Update email
      await updateEmail(currentUser, newEmail);

      // Update email in Firestore if db is available
      if (db) {
        const userDocRef = doc(db, "users", currentUser.uid);
        await updateDoc(userDocRef, { email: newEmail });
      }
    } catch (error: any) {
      console.error("Error changing email:", error);
      if (error.code === "auth/wrong-password") {
        throw new Error("Current password is incorrect");
      } else if (error.code === "auth/email-already-in-use") {
        throw new Error("This email is already in use by another account");
      } else if (error.code === "auth/invalid-email") {
        throw new Error("Please enter a valid email address");
      } else if (error.code === "auth/requires-recent-login") {
        throw new Error("Please log out and log back in before changing your email");
      }
      throw new Error(`Failed to change email: ${error.message}`);
    }
  }

  async function deactivateAccount(currentPassword: string) {
    if (!currentUser || !currentUser.email) {
      throw new Error("No user logged in");
    }

    try {
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Delete user data from Firestore
      if (db) {
        const userDocRef = doc(db, "users", currentUser.uid);
        await deleteDoc(userDocRef);
      }

      // Delete profile picture from Storage if it exists
      if (storage && currentUser.photoURL) {
        try {
          const storageRef = ref(storage, `profile-pictures/${currentUser.uid}`);
          await deleteObject(storageRef);
        } catch (storageError: any) {
          // If storage deletion fails, log but don't block account deletion
          console.warn("Failed to delete profile picture from storage:", storageError);
        }
      }

      // Delete the user account
      await deleteUser(currentUser);

      // Sign out after deletion
      await signOut(auth);
    } catch (error: any) {
      console.error("Error deactivating account:", error);
      if (error.code === "auth/wrong-password") {
        throw new Error("Password is incorrect");
      } else if (error.code === "auth/requires-recent-login") {
        throw new Error("Please log out and log back in before deactivating your account");
      }
      throw new Error(`Failed to deactivate account: ${error.message}`);
    }
  }

  useEffect(() => {
    let mounted = true;
    
    // If Firebase auth is not available, just set loading to false
    if (!auth) {
      console.warn("Firebase auth not initialized - running without authentication");
      setLoading(false);
      return;
    }

    // Don't leave the UI blank forever if auth never resolves (e.g. missing Firebase config)
    const loadingTimeout = setTimeout(() => {
      if (mounted) {
        console.warn("Auth state timed out — rendering UI without a signed-in user");
        setLoading(false);
      }
    }, 3000);

    try {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!mounted) return;
        
        setCurrentUser(user);
        if (user) {
          try {
            await fetchUserProfile(user);
          } catch (error) {
            console.error("Error in auth state change:", error);
            setUserProfile({ accountType: "investor" });
          }
        } else {
          setUserProfile(null);
        }
        clearTimeout(loadingTimeout);
        setLoading(false);
      });

      return () => {
        mounted = false;
        clearTimeout(loadingTimeout);
        unsubscribe();
      };
    } catch (error) {
      console.error("Auth initialization error:", error);
      clearTimeout(loadingTimeout);
      setLoading(false);
      return () => {
        mounted = false;
      };
    }
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    logout,
    signInWithGoogle,
    resetPassword,
    updateProfilePicture,
    updateProfile,
    refreshUserProfile,
    changePassword,
    changeEmail,
    deactivateAccount,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

