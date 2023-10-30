import { extendTheme } from "@chakra-ui/react";

export const theme = extendTheme({
  styles: {
    global: () => ({
      body: {
        bg: "gray.200",
        px: "0.5rem !important",
      },
    }),
  },
});
