import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  ModalProps,
  Text,
} from "@chakra-ui/react";
import { FC, useRef } from "react";
import { api } from "../../api";

export type DeleteModalProps = Pick<ModalProps, "isOpen" | "onClose"> & {
  onSubmit: (data: { id: string }) => void;
  order: api.Order;
};

export const DeleteModal: FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  order,
}) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent maxW="90vw" w="fit-content">
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete Order
          </AlertDialogHeader>

          <AlertDialogBody>
            You are about to delete <Text as="strong">{order.product}</Text>{" "}
            Order. Are you sure?
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button
              colorScheme="red"
              onClick={() => onSubmit({ id: order.id })}
              mr={3}
            >
              Delete
            </Button>
            <Button ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
