import { Fragment } from "react";

import { HomeHeader } from "./components/home-header";

export default function HomeLayout({ children }: React.PropsWithChildren) {
  return (
    <Fragment>
      <HomeHeader />

      {children}
    </Fragment>
  );
}
