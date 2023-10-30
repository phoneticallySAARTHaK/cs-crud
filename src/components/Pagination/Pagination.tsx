import {
  Button,
  ButtonGroup,
  ButtonProps,
  Flex,
  IconButton,
  Text,
} from "@chakra-ui/react";
import { FC } from "react";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
import { useSearchParams } from "react-router-dom";

export type PaginationProps = { page_count: number };

export const Pagination: FC<PaginationProps> = ({ page_count }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const displayedPage = parseInt(searchParams.get("page") ?? "");

  const isInvalidPage =
    isNaN(displayedPage) || displayedPage < 1 || displayedPage > page_count;

  const page = displayedPage - 1;

  function navigate(target: number) {
    setSearchParams((prev) => {
      return {
        ...Object.fromEntries(prev.entries()),
        page: `${target}`,
      };
    });
  }

  return (
    <Flex wrap="wrap">
      <Text>
        {isInvalidPage ? "?" : displayedPage} of {page_count}
      </Text>

      <ButtonGroup flexWrap="wrap" rowGap={2} size="xs" ml="auto">
        <DirectionButton
          direction="backward"
          isDisabled={displayedPage === 1}
          onClick={() => navigate(displayedPage - 1)}
        />
        {Array(10)
          .fill(0)
          .map((_, i) => (
            <Button
              colorScheme={page === i ? "blue" : undefined}
              key={i}
              onClick={() => navigate(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
        <DirectionButton
          direction="forward"
          onClick={() => navigate(displayedPage + 1)}
          isDisabled={displayedPage === page_count}
        />
      </ButtonGroup>
    </Flex>
  );
};

type DirectionButtonProps = { direction: "forward" | "backward" } & ButtonProps;
function DirectionButton({ direction, ...props }: DirectionButtonProps) {
  return (
    <IconButton aria-label={direction} {...props}>
      {direction === "backward" ? (
        <AiOutlineArrowLeft />
      ) : (
        <AiOutlineArrowRight />
      )}
    </IconButton>
  );
}
