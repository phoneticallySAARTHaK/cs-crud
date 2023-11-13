import { Flex, FlexProps } from "@chakra-ui/react";
import { FC } from "react";

export const Header: FC<FlexProps> = (props) => {
  return (
    <Flex
      as="header"
      zIndex={1}
      position="sticky"
      p={2}
      boxShadow="xl"
      borderRadius="xl"
      backdropFilter="blur(25px)"
      top={{ base: "0.75rem", md: "1rem" }}
      gap={4}
      flexWrap="wrap"
      align="center"
      {...props}
    />
  );
};
