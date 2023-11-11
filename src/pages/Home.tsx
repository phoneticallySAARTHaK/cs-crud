import {
  Box,
  Button,
  ChakraProps,
  Flex,
  Grid,
  GridItem,
  Icon,
  IconButton,
  Input,
  Tooltip,
} from "@chakra-ui/react";
import { ChangeEvent, useEffect } from "react";
import { BiPlusMedical } from "react-icons/bi";
import { MdOutlineAccountCircle } from "react-icons/md";
import {
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
import { OrderCard } from "../components/OrderCard/OrderCard";
import { Pagination } from "../components/Pagination/Pagination";
import { autoTemplateCols, debounce } from "../utils";

export const Component = () => {
  const [data, { count }] = useLoaderData() as HomeLoaderData;

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

  const handleInputChange = debounce((e: ChangeEvent<HTMLInputElement>) => {
    const formData = new FormData(e.target.form!);
    const isFirstSearch = !searchParams.has("q");

    const query = formData.get("q");

    // prevent empty search
    if (isFirstSearch && !query) return;

    submit(formData, { replace: !isFirstSearch });
  }, 250);

  useEffect(() => {
    const input = document.querySelector(
      'input[name="q"]',
    ) as HTMLInputElement | null;
    if (input) input.value = q;
  }, []);

  const gap = "1.5rem";
  const minW = "350px";
  const maxCols = 3;

  const navigate = useNavigate();
  const location = useLocation();

  const search = location.search;

  return (
    <>
      <Flex
        as="header"
        zIndex={1}
        {...commonProps}
        top={{ base: "0.75rem", md: "1rem" }}
        gap={4}
        flexWrap="wrap"
        align="center"
      >
        <Tooltip label="Account">
          <IconButton
            as={NavLink}
            to="/account"
            aria-label="Account"
            alignSelf="center"
            colorScheme="blue"
            variant="ghost"
            size="sm"
            icon={<Icon as={MdOutlineAccountCircle} w="100%" h="100%" />}
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
          to={`/home/add${search}`}
          size={{ base: "xs", sm: "md" }}
          colorScheme="blue"
        >
          Add new
        </Button>
      </Flex>

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
              onDelete={() => navigate(`/home/delete/${d.id}${search}`)}
              onEdit={() => navigate(`/home/edit/${d.id}${search}`)}
            />
          ))
        ) : (
          <GridItem placeSelf="center" textAlign="center">
            No orders found matching the query. <br /> Go to{" "}
            <Button variant="link" as={Link} to="/home">
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

export type HomeLoaderData = [api.Order[], api.CountResponse];

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
    api.fetchOrders(q, page, perPage),
    api.fetchPageCount(q, perPage),
  ]);
};
