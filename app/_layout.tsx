import { LayoutProvider } from '@/src/context/ApplicationLayoutProvider';
import { ToastProvider } from '@/src/context/ToastProvider';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { Stack } from "expo-router";
import { TailwindProvider } from 'tailwind-rn';
import utilities from '../tailwind.json';
export default function RootLayout() {
  return (
    <TailwindProvider utilities={utilities}>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={eva.light}>
        <LayoutProvider>
          <ToastProvider>
            <Stack >
              {/* <Stack.Screen name="(usertabs)" options={{ headerShown: false }} /> */}
              <Stack.Screen name='index' options={{ headerShown: false }} />
              <Stack.Screen name='main' options={{ headerShown: false }} />
              <Stack.Screen name='onboard' options={{ headerShown: false }} />
              <Stack.Screen name='login' options={{ headerShown: false }} />
              <Stack.Screen name='signup' options={{ headerShown: false }} />
              <Stack.Screen name='sendemail' options={{ headerShown: false }} />
              <Stack.Screen name='forgotpassword' options={{ headerShown: false }} />
            </Stack>
          </ToastProvider>
        </LayoutProvider>
      </ApplicationProvider>
    </TailwindProvider>
  )
    ;
}
