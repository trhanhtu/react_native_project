import { useLayout } from '@/src/context/ApplicationLayoutProvider';
import authCheck from '@/src/utils/authCheck';
import { useRouter } from 'expo-router';
import { /*useLayoutEffect*/ useEffect } from 'react';

const LOGIN_KEY = 'isLoggedIn';

export default function useLogin() {
    const router = useRouter();
    const { lockLandscape, lockPortrait } = useLayout();
    /*useLayoutEffect*/useEffect(() => {
        lockPortrait();
    }, [])
    function handleExitAccount() {
        lockPortrait();
        authCheck.logout().then(() => router.replace("/login"));
    }
    return {
        handleExitAccount
    }
}
