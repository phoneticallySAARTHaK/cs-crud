import { Button, Grid, Text } from "@chakra-ui/react";
import { Link as RLink, useRouteError } from "react-router-dom";

export const ErrorBoundary = () => {
  const error = useRouteError();
  console.log(error);
  const content =
    typeof error === "string" ? (
      <Text textAlign="center">
        {error} <br /> Go to{" "}
        <Button as={RLink} to="/" variant="link" colorScheme="blue">
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
