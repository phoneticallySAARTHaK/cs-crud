import { Box, Heading, Stack } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "./routes";

export const Component = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const parent = parentRef.current;
    if (!parent) return;

    window.googleScriptLoaded.then((val) => {
      if (val) {
        window.handleCredentialResponseTrap = new Promise<void>(
          (r) => void (window.handleCredentialResponseTrapResolver = r),
        );

        google.accounts.id.renderButton(parent, {
          type: "standard",
          shape: "rectangular",
          theme: "outline",
          text: "signin_with",
          size: "large",
          logo_alignment: "left",
        });

        window.handleCredentialResponseTrap.then(() =>
          navigate(`/${routes.home}`, { replace: true }),
        );
      }
    });
  }, []);

  return (
    <Stack align="center" p={6} spacing={4}>
      <Heading>Sign to access</Heading>
      <Box ref={parentRef} maxW="20rem"></Box>
    </Stack>
  );
};
