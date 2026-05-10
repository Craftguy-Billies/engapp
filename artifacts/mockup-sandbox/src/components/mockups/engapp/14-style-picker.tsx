import { PhoneFrame } from "./_components/phone-frame";
import { StylePickerPage } from "./_pages/style-picker";
import { EngappStoreProvider } from "./_lib/store";

export default function Mockup() {
  return (
    <EngappStoreProvider>
      <PhoneFrame label="14 · Style Picker (in-app)">
        <StylePickerPage />
      </PhoneFrame>
    </EngappStoreProvider>
  );
}
