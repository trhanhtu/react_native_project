import { useLayout } from '@/src/context/ApplicationLayoutProvider';
import authCheck from '@/src/utils/authCheck';
import { useRouter } from 'expo-router';
import { useLayoutEffect } from 'react';

const LOGIN_KEY = 'isLoggedIn';

export default function useLogin() {
    const router = useRouter();
    const { lockLandscape } = useLayout();
    useLayoutEffect(() => {
        lockLandscape();
    }, [])
    function handleExitAccount() {
        authCheck.logout().then(() => router.replace("/login"));
    }
    return {
        handleExitAccount
    }
}
