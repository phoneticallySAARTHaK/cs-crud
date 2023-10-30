export function debounce<T extends (...args: any[]) => unknown>(
  func: T,
  delay: number,
) {
  let timeoutId: NodeJS.Timeout;

  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

export function autoTemplateCols({
  gap,
  maxCols,
  minW,
}: {
  minW: string;
  gap: string;
  maxCols: number;
}) {
  return `repeat(auto-fill, minmax(max(${minW}, calc((100% - ${
    maxCols - 1
  } * ${gap}) / ${maxCols})), 1fr))` as const;
}

// export function useHistoryModal() {
//   const { isOpen, onClose: close, onOpen: open } = useDisclosure();

//   const [params] = useSearchParams();

//   const navigate

//   const onClose = () =>

// }
