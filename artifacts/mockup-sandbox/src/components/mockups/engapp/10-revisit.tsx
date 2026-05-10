import { PhoneFrame } from "./_components/phone-frame";
import { RevisitPage } from "./_pages/lists";
import { EngappStoreProvider } from "./_lib/store";

export default function Mockup() {
  return (
    <EngappStoreProvider>
      <PhoneFrame label="10 · Revisit">
        <RevisitPage />
      </PhoneFrame>
    </EngappStoreProvider>
  );
}
