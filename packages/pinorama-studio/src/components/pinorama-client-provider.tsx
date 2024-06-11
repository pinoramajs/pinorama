import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  PinoramaClient,
  type PinoramaClientOptions,
} from "pinorama-client/browser";
import { createContext, useContext } from "react";

type PinoramaClientProviderProps = {
  options: Partial<PinoramaClientOptions>;
  children: React.ReactNode;
};

const PinoramaClientContext = createContext<PinoramaClient | null>(null);

export function PinoramaClientProvider({
  options,
  children,
}: PinoramaClientProviderProps) {
  const queryClient = new QueryClient();
  const pinoramaClient = new PinoramaClient(options);

  return (
    <QueryClientProvider client={queryClient}>
      <PinoramaClientContext.Provider value={pinoramaClient}>
        {children}
      </PinoramaClientContext.Provider>
    </QueryClientProvider>
  );
}

export const usePinoramaClient = () => {
  const context = useContext(PinoramaClientContext);

  if (context === undefined) {
    throw new Error(
      "usePinoramaClient must be used within a PinoramaClientProvider"
    );
  }

  return context;
};
