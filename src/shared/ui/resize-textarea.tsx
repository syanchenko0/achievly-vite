import { Textarea } from "@/shared/ui/textarea";
import { type TextareaHTMLAttributes, useEffect, useRef } from "react";
import { cn } from "@/app/lib/utils";

export function ResizeTextarea(
  props: TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref?.current?.scrollHeight) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + 2 + "px";
    }
  }, [ref?.current?.scrollHeight]);

  return (
    <Textarea
      {...props}
      ref={ref}
      onInput={(event) => {
        event.currentTarget.style.height = "auto";
        event.currentTarget.style.height =
          event.currentTarget.scrollHeight + 2 + "px";
      }}
      className={cn(
        "max-h-[300px] resize-none text-sm sm:text-base",
        props?.className,
      )}
    />
  );
}
