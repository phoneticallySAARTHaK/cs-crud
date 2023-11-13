import { Button, Grid, Text } from "@chakra-ui/react";
import { Link as RLink, useRouteError } from "react-router-dom";
import { routes } from "./routes";

export const ErrorBoundary = () => {
  const error = useRouteError();
  console.log(error);
  const content =
    typeof error === "string" ? (
      <Text textAlign="center">
        {error} <br /> Go to{" "}
        <Button as={RLink} to={routes.root} variant="link" colorScheme="blue">
          Home
        </Button>
      </Text>
    ) : (
      "Error"
    );

  return (
    <Grid placeContent="center" flex="1">
      {content}
    </Grid>
  );
};
