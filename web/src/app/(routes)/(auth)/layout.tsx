import { Fragment } from "react";

import { AuthHeader } from "@/client/modules/identity/features/auth-flow/components/auth-header";

export default function AuthLayout({ children }: React.PropsWithChildren) {
  return (
    <Fragment>
      <AuthHeader />

      {children}
    </Fragment>
  );
}
