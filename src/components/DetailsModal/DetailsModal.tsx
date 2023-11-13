import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
} from "@chakra-ui/react";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { api } from "../../api";

export type DetailsModalProps = {
  order?: api.Order;
  onSubmit: (data: api.Order) => void;
} & Pick<ModalProps, "isOpen" | "onClose">;

export const DetailsModal: FC<DetailsModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  order,
}) => {
  const formId = "formID";

  const { register, handleSubmit } = useForm<api.Order>({
    defaultValues: order,
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent
        maxW="90vw"
        maxH="90vh"
        w="clamp(0rem, 100%, 30rem)"
        containerProps={{ overflow: "hidden" }}
      >
        <ModalHeader>Edit Order Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6} overflow="auto">
          <Box
            as="form"
            id={formId}
            onSubmit={handleSubmit((data) => onSubmit(data))}
          >
            <FormControl>
              <FormLabel>Order ID</FormLabel>
              <Input
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                {...register("id", { required: "Order ID is required" })}
              />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Product Name</FormLabel>
              <Input
                {...register("product", {
                  required: "Product Name is required",
                })}
              />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Quantity</FormLabel>
              <Input
                type="number"
                {...register("quantity", {
                  required: "Quantity is required",
                })}
              />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Customer Name</FormLabel>
              <Input
                {...register("customer_name", {
                  required: "Customer Name is required",
                })}
              />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Customer Email</FormLabel>
              <Input
                type="email"
                {...register("customer_email", {
                  required: "Customer Email is required",
                })}
              />
            </FormControl>
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} type="submit" form={formId}>
            Save
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
