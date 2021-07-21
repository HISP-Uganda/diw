import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { D2Shim } from "@dhis2/app-runtime-adapter-d2";
import { QueryClient, QueryClientProvider } from "react-query";
import App from "./components/App";
import { Loading } from "./components/Loading";
import { D2Context } from "./Context";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const d2Config = {};

const theme = extendTheme({
  components: { Button: { baseStyle: { _focus: { boxShadow: "none" } } } },
});

const AppWrapper = () => (
  <D2Shim d2Config={d2Config} i18nRoot="./i18n">
    {({ d2, error }) => {
      return (
        <ChakraProvider theme={theme}>
          {error && <div>{error.message}</div>}
          {!d2 && <Loading />}
          {!!d2 && (
            <QueryClientProvider client={queryClient}>
              <D2Context.Provider value={d2}>
                <App />
              </D2Context.Provider>
            </QueryClientProvider>
          )}
        </ChakraProvider>
      );
    }}
  </D2Shim>
);

export default AppWrapper;
