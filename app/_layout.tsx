import { LayoutProvider } from '@/src/context/ApplicationLayoutProvider';
import * as eva from '@eva-design/eva';
import { ApplicationProvider } from '@ui-kitten/components';
import { Stack } from "expo-router";
import { TailwindProvider } from 'tailwind-rn';
import utilities from '../tailwind.json';

export default function RootLayout() {
  return (
    <TailwindProvider utilities={utilities}>
      <ApplicationProvider {...eva} theme={eva.light}>
        <LayoutProvider>
          <Stack >
            <Stack.Screen name='index' options={{ headerShown: false }} />
            <Stack.Screen name='onboard' options={{ headerShown: false }} />
            <Stack.Screen name='about' options={{ headerShown: false }} />
            <Stack.Screen name='login' options={{ headerShown: false }} />
          </Stack>
        </LayoutProvider>
      </ApplicationProvider>
    </TailwindProvider>
  )
    ;
}
