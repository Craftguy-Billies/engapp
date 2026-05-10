import { PhoneFrame } from "./_components/phone-frame";
import { EmptyStatePage } from "./_pages/states";
import { EngappStoreProvider } from "./_lib/store";

export default function Mockup() {
  return (
    <EngappStoreProvider>
      <PhoneFrame label="19 · Empty / All-caught-up">
        <EmptyStatePage />
      </PhoneFrame>
    </EngappStoreProvider>
  );
}
