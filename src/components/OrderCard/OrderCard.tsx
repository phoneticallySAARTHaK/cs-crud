import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardProps,
  Divider,
  Heading,
  ListItem,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import { FC, useEffect, useRef } from "react";
import { RiDeleteBin6Line, RiEdit2Line } from "react-icons/ri";
import { useLocation } from "react-router-dom";
import { api } from "../../api";

export type OrderCardProps = {
  data: api.Order;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
} & CardProps;

/**
 * OrderCard Component
 * @param props
 * @returns
 */
export const OrderCard: FC<OrderCardProps> = ({
  data,
  onDelete,
  onEdit,
  ...props
}) => {
  const { customer_email, customer_name, id, product, quantity } = data;
  const dataFields = {
    quantity,
    customer_name,
    customer_email,
    order_ID: id,
  } as const;

  const location = useLocation();

  const valRef = useRef<HTMLParagraphElement[]>([]);

  useEffect(() => {
    const arr = valRef.current;
    const searchParams = new URLSearchParams(location.search);
    const q = searchParams.get("q");
    if (!q) return arr.forEach((el) => (el.innerHTML = el.textContent ?? ""));
    const regex = new RegExp(`(${q})`, "ig");
    arr.forEach((el) => {
      el.innerHTML = (el.textContent ?? "").replace(regex, "<mark>$1</mark>");
    });
  }, [location]);

  return (
    <Card
      bg="gray.100"
      boxShadow="lg"
      data-id={id}
      maxW="lg"
      {...props}
      h="fit-content"
    >
      <CardBody>
        <Heading size="md">{product}</Heading>

        <UnorderedList
          listStyleType="none"
          display="grid"
          gridTemplateColumns={{ base: "1fr", sm: "1fr 1fr" }}
          m={0}
          mt={2}
          alignContent="start"
          gap={2}
        >
          {Object.entries(dataFields).map(([key, val]) => (
            <ListItem
              gridColumn={
                key === "customer_email" || key === "order_ID"
                  ? "1 / -1"
                  : undefined
              }
            >
              <Text
                fontWeight={600}
                _firstLetter={{ textTransform: "uppercase" }}
              >
                {key.replace("_", " ")}
              </Text>
              <Text ref={(a) => void (a && valRef.current.push(a))}>{val}</Text>
            </ListItem>
          ))}
        </UnorderedList>
      </CardBody>

      <Divider borderColor="gray" />

      <CardFooter justify="space-between">
        <Button
          colorScheme="blue"
          leftIcon={<RiEdit2Line />}
          onClick={() => onEdit(id)}
        >
          Edit
        </Button>

        <Button
          colorScheme="red"
          leftIcon={<RiDeleteBin6Line />}
          onClick={() => onDelete(id)}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};
