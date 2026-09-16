import { Logo } from "@client/components/branding/logo";
import {
  Header,
  HeaderContainer,
  HeaderMedia,
} from "@client/components/layouts/header";

export function AuthHeader() {
  return (
    <Header>
      <HeaderContainer>
        <HeaderMedia>
          <Logo size="lg" />
        </HeaderMedia>
      </HeaderContainer>
    </Header>
  );
}
