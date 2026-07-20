import { forwardRef, type ElementRef, type ComponentProps } from "react";

export const defaultTag = "label";

export const Label = forwardRef<
  ElementRef<typeof defaultTag>,
  ComponentProps<typeof defaultTag>
>((props, ref) => {
  const { for: htmlFor, ...rest } = props as any;
  return <label {...rest} htmlFor={htmlFor || props.htmlFor} ref={ref} />;
});

Label.displayName = "Label";
