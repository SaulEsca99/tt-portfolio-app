import type { ComponentProps } from "react";

import { Button } from "@client/components/ui/button";

import { useFormContext } from "./form-context";

export function SubscribeButton({
  children,
  ...props
}: ComponentProps<typeof Button>) {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button {...props} type="submit" disabled={isSubmitting}>
          {children}
        </Button>
      )}
    </form.Subscribe>
  );
}
