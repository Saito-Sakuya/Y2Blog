import OceanEnvironment from '@/components/space/OceanEnvironment';
import WindowManager from '@/components/ui/WindowManager';
import Spotlight from '@/components/ui/Spotlight';
import Desktop from '@/components/ui/Desktop';
import SetupCheck from './SetupCheck';

export default function Home() {
  return (
    <main>
      <SetupCheck />
      <OceanEnvironment />
      <Desktop />
      <WindowManager />
      <Spotlight />
    </main>
  );
}
