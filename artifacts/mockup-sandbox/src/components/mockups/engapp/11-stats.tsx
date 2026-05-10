import { PhoneFrame } from "./_components/phone-frame";
import { StatsPage } from "./_pages/stats";
import { EngappStoreProvider } from "./_lib/store";

export default function Mockup() {
  return (
    <EngappStoreProvider>
      <PhoneFrame label="11 · Stats / Progress">
        <StatsPage />
      </PhoneFrame>
    </EngappStoreProvider>
  );
}
