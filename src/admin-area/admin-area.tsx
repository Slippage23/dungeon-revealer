import * as React from "react";
import useAsyncEffect from "@n1ru4l/use-async-effect";
import { buildApiUrl } from "../public-url";
import { AuthenticationScreen } from "../authentication-screen";
import { SplashScreen } from "../splash-screen";
import { useSocket } from "../socket";
import { usePersistedState } from "../hooks/use-persisted-state";
import { AccessTokenProvider } from "../hooks/use-access-token";
import { FetchContext } from "../dm-area/fetch-context";
import { AdminLayout } from "./admin-layout";
import { sendRequest } from "../http-request";
import { createEnvironment } from "../relay-environment";
import { RelayEnvironmentProvider } from "relay-hooks";
import { useStaticRef } from "../hooks/use-static-ref";
import { Socket } from "socket.io-client";

const useAdminPassword = () =>
  usePersistedState<string>("adminPassword", {
    encode: (value) => JSON.stringify(value),
    decode: (value) => {
      try {
        if (typeof value === "string") {
          const parsedValue = JSON.parse(value);
          if (typeof parsedValue === "string") {
            return parsedValue;
          }
        }
        // eslint-disable-next-line no-empty
      } catch (e) {}
      return "";
    },
  });

type ConnectionMode =
  | "connecting"
  | "connected"
  | "authenticating"
  | "authenticated"
  | "disconnected";

const AdminContent = ({
  socket,
  password: adminPassword,
}: {
  socket: Socket;
  password: string;
}): React.ReactElement => {
  const relayEnvironment = useStaticRef(() => createEnvironment(socket));

  const [connectionMode, setConnectionMode] =
    React.useState<ConnectionMode>("connecting");

  // Define localFetch BEFORE any hooks/returns (rules of hooks)
  const localFetch = React.useCallback(
    (input, init = {}) => {
      return fetch(buildApiUrl(input), {
        ...init,
        headers: {
          Authorization: adminPassword ? `Bearer ${adminPassword}` : undefined,
          ...init.headers,
        },
      }).then((res) => {
        if (res.status === 401) {
          console.error("Unauthenticated access.");
          throw new Error("Unauthenticated access.");
        }
        return res;
      });
    },
    [adminPassword]
  );

  // Socket authentication - mirror of AuthenticatedAppShell
  React.useEffect(() => {
    const authenticate = () => {
      socket.emit("authenticate", {
        password: adminPassword,
        desiredRole: "admin",
      });
    };

    socket.on("connect", () => {
      setConnectionMode("connected");
      authenticate();
    });

    socket.on("authenticated", () => {
      setConnectionMode("authenticated");
    });

    socket.on("reconnect", () => {
      setConnectionMode("authenticating");
      authenticate();
    });

    socket.on("disconnect", () => {
      setConnectionMode("disconnected");
    });

    if (socket.connected) {
      setConnectionMode("connected");
      authenticate();
    }

    return () => {
      socket.off("connect");
      socket.off("authenticated");
      socket.off("reconnect");
      socket.off("disconnect");
    };
  }, [socket, adminPassword]);

  if (connectionMode !== "authenticated") {
    return <SplashScreen text={connectionMode} />;
  }

  return (
    <RelayEnvironmentProvider environment={relayEnvironment}>
      <FetchContext.Provider value={localFetch}>
        <AdminLayout />
      </FetchContext.Provider>
    </RelayEnvironmentProvider>
  );
};

const AdminRenderer = ({
  password,
}: {
  password: string;
}): React.ReactElement => {
  const socket = useSocket();

  return (
    <AccessTokenProvider value={password}>
      <AdminContent socket={socket} password={password} />
    </AccessTokenProvider>
  );
};

export const AdminArea: React.FC = () => {
  const [adminPassword, setAdminPassword] = useAdminPassword();
  const [mode, setMode] = React.useState("loading");

  const localFetch = React.useCallback(
    (input, init = {}) => {
      return fetch(buildApiUrl(input), {
        ...init,
        headers: {
          Authorization: adminPassword ? `Bearer ${adminPassword}` : undefined,
          ...init.headers,
        },
      }).then((res) => {
        if (res.status === 401) {
          console.error("Unauthenticated access.");
          throw new Error("Unauthenticated access.");
        }
        return res;
      });
    },
    [adminPassword]
  );

  useAsyncEffect(
    function* (_, c) {
      const result: { data: { role: string } } = yield* c(
        localFetch("/auth").then((res) => res.json())
      );
      if (!result.data.role || result.data.role !== "DM") {
        setMode("authenticate");
        return;
      }
      setMode("authenticated");
    },
    [localFetch]
  );

  if (mode === "loading") {
    return <SplashScreen text="Loading...." />;
  } else if (mode === "authenticate") {
    return (
      <AuthenticationScreen
        onAuthenticate={(password) => {
          setAdminPassword(password);
          setMode("authenticated");
        }}
        fetch={localFetch}
        requiredRole="DM"
      />
    );
  } else if (mode === "authenticated") {
    return <AdminRenderer password={adminPassword} />;
  }
  return null;
};
