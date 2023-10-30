import { IconButton, IconButtonProps } from "@chakra-ui/react";
import { FC } from "react";
import { AiOutlineHeart } from "react-icons/ai";
import { BsFillHeartbreakFill } from "react-icons/bs";
export type LikeButtonProps = Omit<IconButtonProps, "aria-label"> & {
  isFavorite?: boolean;
};

/**
 * Like Button
 * @param props - ButtonProps
 * @param props.isFavorite - Button state
 * @returns IconButton
 */
export const LikeButton: FC<LikeButtonProps> = ({ isFavorite, ...props }) => {
  return (
    <IconButton
      aria-label={isFavorite ? "un-favorite" : "favorite"}
      title={isFavorite ? "un-favorite" : "favorite"}
      color={isFavorite ? "red" : undefined}
      icon={isFavorite ? <BsFillHeartbreakFill /> : <AiOutlineHeart />}
      colorScheme="blue"
      variant="outline"
      size="sm"
      {...props}
    />
  );
};
