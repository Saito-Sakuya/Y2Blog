import OceanEnvironment from '@/components/space/OceanEnvironment';
import WindowManager from '@/components/ui/WindowManager';
import Spotlight from '@/components/ui/Spotlight';
import Desktop from '@/components/ui/Desktop';

export default function Home() {
  return (
    <main>
      <OceanEnvironment />
      <Desktop />
      <WindowManager />
      <Spotlight />
    </main>
  );
}
