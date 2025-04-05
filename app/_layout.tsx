import { LayoutProvider } from '@/src/context/ApplicationLayoutProvider';
import { ToastProvider } from '@/src/context/ToastProvider';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, Icon, IconProps, IconRegistry, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { Stack, useRouter } from "expo-router";
import { TailwindProvider } from 'tailwind-rn';
import utilities from '../tailwind.json';


const BackIcon = (props: IconProps) => <Icon {...props} name="arrow-back" />

const BackButton = () => {
  const router = useRouter()
  return (
    <TopNavigation
      title="Chi tiết nguyên tố"
      alignment="center"
      accessoryLeft={() => (
        <TopNavigationAction
          icon={BackIcon}
          onPress={() => router.back()}
        />
      )}
    />
  )
}

export default function RootLayout() {
  return (
    <TailwindProvider utilities={utilities}>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={eva.light}>
        <LayoutProvider>
          <ToastProvider>
            <Stack >
              <Stack.Screen name='index' options={{ headerShown: false }} />
              <Stack.Screen name='main' options={{ headerShown: false }} />
              <Stack.Screen name='onboard' options={{ headerShown: false }} />
              <Stack.Screen name='login' options={{ headerShown: false }} />
              <Stack.Screen name='signup' options={{ headerShown: false }} />
              <Stack.Screen name='verify' options={{ headerShown: false }} />
              <Stack.Screen name='detailelement/[elementId]' options={{
                header: () => <BackButton />,
              }} />
              <Stack.Screen name='forgotpassword' options={{ headerShown: false }} />
            </Stack>
          </ToastProvider>
        </LayoutProvider>
      </ApplicationProvider>
    </TailwindProvider>
  )
}
