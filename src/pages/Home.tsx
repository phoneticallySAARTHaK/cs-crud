import {
  Box,
  Button,
  ChakraProps,
  Grid,
  GridItem,
  IconButton,
  Image,
  Input,
  Tooltip,
} from "@chakra-ui/react";
import { ChangeEvent, useEffect, useRef } from "react";
import { BiPlusMedical } from "react-icons/bi";
import {
  ActionFunction,
  Form,
  Link,
  LoaderFunction,
  NavLink,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
  useSearchParams,
  useSubmit,
} from "react-router-dom";
import { api } from "../api";
import { Header } from "../components/Header/Header";
import { OrderCard } from "../components/OrderCard/OrderCard";
import { Pagination } from "../components/Pagination/Pagination";
import { UserData } from "../types";
import { autoTemplateCols, debounce } from "../utils";
import { loaderMiddleware } from "./loaderMiddleware";
import { routes } from "./routes";

export const Component = () => {
  const [user, data, { count }] = useLoaderData() as HomeLoaderData;

  const commonProps: ChakraProps = {
    position: "sticky",
    p: 2,
    boxShadow: "xl",
    borderRadius: "xl",
    backdropFilter: "blur(25px)",
  } as const;

  const submit = useSubmit();
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = debounce((e: ChangeEvent<HTMLInputElement>) => {
    const formData = new FormData(e.target.form!);
    const isFirstSearch = !searchParams.has("q");

    const query = formData.get("q");

    // prevent empty search
    if (isFirstSearch && !query) return;

    submit(formData, { replace: !isFirstSearch });
  }, 250);

  useEffect(() => {
    const input = searchInputRef.current;
    if (input) input.value = q;
  }, []);

  useEffect(() => {
    const input = searchInputRef.current;
    if (input && !q) input.value = "";
  }, [q]);

  const gap = "1.5rem";
  const minW = "350px";
  const maxCols = 3;

  const navigate = useNavigate();
  const location = useLocation();

  const search = location.search;

  return (
    <>
      <Header>
        <Tooltip label="Account">
          <IconButton
            as={NavLink}
            to={`/${routes.account}`}
            aria-label="Account"
            alignSelf="center"
            colorScheme="blue"
            variant="ghost"
            size="sm"
            icon={
              <Image src={user.picture} w="100%" h="100%" borderRadius="50%" />
            }
          />
        </Tooltip>
        <Box
          as={Form}
          display="flex"
          flex="1"
          onSubmit={(e: any) => (e as Event).preventDefault()}
        >
          <Input
            type="search"
            minW="10ch"
            borderRadius="3xl"
            variant="filled"
            backgroundColor="gray.50 !important"
            defaultValue={searchParams.get("q") ?? ""}
            onChange={handleInputChange}
            name="q"
            aria-label="Search Query"
            maxW="calc(20rem + 10vw)"
            ref={searchInputRef}
          />
          <input type="hidden" name="page" value="1" />
          <input
            type="hidden"
            name="perPage"
            value={searchParams.get("perPage") ?? "10"}
          />
        </Box>

        <Button
          ml="auto"
          leftIcon={<BiPlusMedical />}
          as={Link}
          to={`/${routes.home}/${routes.add}${search}`}
          size={{ base: "xs", sm: "md" }}
          colorScheme="blue"
        >
          Add new
        </Button>
      </Header>

      <Grid
        templateColumns={autoTemplateCols({ gap, maxCols, minW })}
        gap={gap}
        p={{ base: 4, md: 6 }}
        mt={4}
        as="main"
        flex="1"
      >
        {data.length ? (
          data.map((d) => (
            <OrderCard
              data={d}
              onDelete={() =>
                navigate(`/${routes.home}/${routes.delete}/${d.id}${search}`)
              }
              onEdit={() =>
                navigate(`/${routes.home}/${routes.edit}/${d.id}${search}`)
              }
            />
          ))
        ) : (
          <GridItem placeSelf="center" textAlign="center" gridColumn="1 / -1">
            No orders found matching the query. <br /> Go to{" "}
            <Button variant="link" as={Link} to={`/${routes.home}`}>
              Home
            </Button>
          </GridItem>
        )}
      </Grid>

      <Box
        as="footer"
        mb={4}
        bottom={{ base: "0.75rem", md: "1rem" }}
        {...commonProps}
      >
        {count !== 0 ? <Pagination page_count={count} /> : null}
      </Box>
      <Outlet />
    </>
  );
};

export type HomeLoaderData = [UserData, api.Order[], api.CountResponse];

export const loader: LoaderFunction = async ({
  request,
}): Promise<HomeLoaderData | Response> => {
  const url = new URL(request.url);
  const params = url.searchParams;

  const q = params.get("q") ?? "";
  const parsedPage = parseInt(params.get("page") ?? "");
  const page = isNaN(parsedPage) ? 1 : parsedPage;
  const parpsedPerPage = parseInt(params.get("perPage") ?? "");
  const perPage =
    isNaN(parpsedPerPage) || parpsedPerPage === 0 ? 10 : parpsedPerPage;

  return Promise.all([
    loaderMiddleware(),
    api.fetchOrders(q, page, perPage),
    api.fetchPageCount(q, perPage),
  ]);
};

export const action: ActionFunction = async ({ request }) => {
  const body = await request.json();

  switch (request.method) {
    case "DELETE":
      await api.deleteOrderByID(body);
      break;

    case "PUT":
      await api.updateOrder(body);
      break;

    case "POST":
      await api.createOrder(body);
  }

  return null;
};
