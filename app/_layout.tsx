import 'react-native-url-polyfill/auto';
import 'text-encoding-polyfill';

import { LayoutProvider } from '@/src/context/ApplicationLayoutProvider';
import { ToastProvider } from '@/src/context/ToastProvider';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, Icon, IconProps, IconRegistry, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { Stack, useRouter } from "expo-router";
import React from 'react';
import Toast from 'react-native-toast-message';
import { TailwindProvider } from 'tailwind-rn';
import utilities from '../tailwind.json';

const BackIcon = (props: IconProps) => <Icon {...props} name="arrow-back" />

const BackButton: React.FC<{ page_title: string }> = ({ page_title }) => {
  const router = useRouter()
  return (
    <TopNavigation
      title={page_title}
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
  // const { isConnected, isLoadingToken } = useNotificationSocket();

  return (
    <TailwindProvider utilities={utilities}>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={eva.light}>
        <LayoutProvider>
          <ToastProvider>
            <Toast />
            <Stack >
              <Stack.Screen name='index' options={{ headerShown: false }} />
              <Stack.Screen name='main' options={{ headerShown: false }} />
              <Stack.Screen name='onboard' options={{ headerShown: false }} />
              <Stack.Screen name='login' options={{ headerShown: false }} />
              <Stack.Screen name='signup' options={{ headerShown: false }} />
              <Stack.Screen name='verify' options={{ headerShown: false }} />
              <Stack.Screen name='podcastlist/[elementName]' options={{ headerShown: false }} />
              <Stack.Screen name='detailelement/[elementId]' options={{
                header: () => <BackButton page_title='Chi tiết nguyên tố' />,
              }} />
              <Stack.Screen name='detailpodcast/[podcastId]' options={{
                headerShown: false
              }} />
              <Stack.Screen name='forgotpassword' options={{ headerShown: false }} />
            </Stack>
          </ToastProvider>
        </LayoutProvider>
      </ApplicationProvider>
    </TailwindProvider>
  )
}
