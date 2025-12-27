/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
import * as React from "react";

/**
 * ReactDOM and ReactThreeFiber cannot share Contexts :(
 * We need to bridge the context!
 * @source https://github.com/pmndrs/drei/blob/418a9ac0491e72cbfa1076cdd8d4ad483d216f66/src/useContextBridge.tsx#L1-L13
 */
export function useContextBridge(...contexts: Array<React.Context<any>>) {
  if (contexts.some((c) => !c)) {
    console.error(
      "useContextBridge received an undefined or null context",
      contexts
    );
  }
  const cRef = React.useRef<Array<React.Context<any>>>([]);
  cRef.current = contexts.map((context) =>
    context ? React.useContext(context) : null
  );
  return React.useMemo(
    () =>
      ({ children }: { children: React.ReactElement<any> }) =>
        contexts.reduceRight((acc, Context, i) => {
          if (!Context) {
            console.error(
              "useContextBridge skipping undefined or null context in reduceRight",
              contexts
            );
            return acc;
          }
          return <Context.Provider value={cRef.current[i]} children={acc} />;
        }, children),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
}
