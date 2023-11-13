import {
  Box,
  Button,
  IconButton,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Tr,
} from "@chakra-ui/react";
import { BiHome } from "react-icons/bi";
import { Form, useLoaderData, useNavigate } from "react-router-dom";
import { api } from "../api";
import { Header } from "../components/Header/Header";
import { UserData } from "../types";
import { loaderMiddleware } from "./loaderMiddleware";
import { routes } from "./routes";

export const Component = () => {
  const navigate = useNavigate();
  const user = useLoaderData() as AccountLoaderData;

  return (
    <>
      <Header>
        <IconButton
          aria-label="Back"
          onClick={() => navigate(`/${routes.home}`)}
          icon={<BiHome />}
        />

        <Box ml="auto" as={Form} action={`/${routes.logout}`} method="POST">
          <input type="hidden" name="hint" value={user.email} />
          <input
            name="redirectOnError"
            type="hidden"
            value={`/${routes.account}`}
          />
          <Button aria-label="Unlink google account" type="submit">
            Unlink
          </Button>
        </Box>
      </Header>

      <Box as="main">
        <Table mx="auto" maxW="30rem">
          <Tbody>
            {Object.entries(user).map((row) => (
              <Tr>
                <Th scope="row">{row[0]}</Th>
                <Td>
                  <Box overflow="auto" maxW="15rem" className="allow-scroll">
                    <Text as="span" w="max-content" display="inline-block">
                      {row[1]}
                    </Text>
                  </Box>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </>
  );
};

type AccountLoaderData = UserData & { totalOrders: number };
export async function loader(): Promise<AccountLoaderData> {
  const user = loaderMiddleware();
  const { count } = await api.fetchPageCount("", 1);
  return { ...user, totalOrders: count };
}
