import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { registerServices } from "../di/ServiceRegistry";

import { SupabaseUserRepository } from "../../../backend/infrastructure/repositories/SupabaseUserRepository";
import { SupabaseSessionRepository } from "../../../backend/infrastructure/repositories/SupabaseSessionRepository";
import { SupabaseProductRepository } from "../../../backend/infrastructure/repositories/SupabaseProductRepository";
import { SupabaseSupplierRepository } from "../../../backend/infrastructure/repositories/SupabaseSupplierRepository";
import { SupabaseEmailRepository } from "../../../backend/infrastructure/repositories/SupabaseEmailRepository";

import {
  SessionRepository,
  ProductRepository,
  SupplierRepository,
  EmailRepository,
  UserRepository,
} from "../../domain/interfaces";

interface RepositoryContextValue {
  userRepository: UserRepository | null;
  sessionRepository: SessionRepository | null;
  productRepository: ProductRepository | null;
  supplierRepository: SupplierRepository | null;
  emailRepository: EmailRepository | null;
  isSupabaseReady: boolean;
  isUserContextSet: boolean;
}

const RepositoryContext = createContext<RepositoryContextValue | null>(null);

export const SupabaseHooksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userId, isLoaded, isSignedIn } = useAuth();
  const [repositories, setRepositories] = useState<RepositoryContextValue | null>(null);

  // react to auth state
  useEffect(() => {
    if (isLoaded && isSignedIn && userId) {
      console.log("[SupabaseHP] 🔑 Auth ready, building repos for", userId);

      const repos: RepositoryContextValue = {
        userRepository: new SupabaseUserRepository(),
        sessionRepository: new SupabaseSessionRepository(),
        productRepository: new SupabaseProductRepository(),
        supplierRepository: new SupabaseSupplierRepository(),
        emailRepository: new SupabaseEmailRepository(),
        isSupabaseReady: true,
        isUserContextSet: true,
      };

      // inject userId into repos that need it
      repos.sessionRepository!.setUserId(userId);
      repos.productRepository!.setUserId(userId);
      repos.supplierRepository!.setUserId(userId);
      repos.emailRepository!.setUserId(userId);

      try {
        registerServices();
        console.log("[SupabaseHP] ✅ Services registered");
      } catch (e) {
        console.error("[SupabaseHP] ❌ Failed to register services", e);
      }

      setRepositories(repos);
    } else {
      if (repositories) {
        console.log("[SupabaseHP] 🚪 Auth ended, clearing repos");
        try {
          
        } catch (e) {
          console.warn("[SupabaseHP] ⚠️ Failed to unregister services", e);
        }
      }
      setRepositories(null);
    }
  }, [isLoaded, isSignedIn, userId]);

  return (
    <RepositoryContext.Provider
      value={
        repositories ?? {
          userRepository: null,
          sessionRepository: null,
          productRepository: null,
          supplierRepository: null,
          emailRepository: null,
          isSupabaseReady: false,
          isUserContextSet: false,
        }
      }
    >
      {children}
    </RepositoryContext.Provider>
  );
};

export const useRepositories = (): RepositoryContextValue => {
  const ctx = useContext(RepositoryContext);
  if (!ctx) throw new Error("useRepositories must be used within SupabaseHooksProvider");
  return ctx;
};

const createRepositoryHook = <T extends object>(
  selector: (ctx: RepositoryContextValue) => T | null
) => {
  return () => {
    const context = useRepositories();
    const repo = selector(context);
    return {
      ...repo,
      isReady: context.isSupabaseReady,
      isUserContextSet: context.isUserContextSet,
    };
  };
};

export const useUserRepository = createRepositoryHook((ctx) => ctx.userRepository);
export const useSessionRepository = createRepositoryHook((ctx) => ctx.sessionRepository);
export const useProductRepository = createRepositoryHook((ctx) => ctx.productRepository);
export const useSupplierRepository = createRepositoryHook((ctx) => ctx.supplierRepository);
export const useEmailRepository = createRepositoryHook((ctx) => ctx.emailRepository);
