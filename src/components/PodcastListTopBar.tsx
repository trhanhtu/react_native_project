
import { useNavigation } from '@react-navigation/native';
import { Avatar, Icon, Input } from '@ui-kitten/components';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { useUserAvatar } from '../hooks/useUserAvatar';

interface TopBarProps {
    onSearch?: (query: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({ onSearch }) => {
    const tailwind = useTailwind();
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const { avatarUrl } = useUserAvatar();

    const handleSearch = () => {
        if (onSearch) {
            onSearch(searchQuery);
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const handleNotifications = () => {
        // Navigate to notifications screen
        console.log('Navigate to notifications');
    };

    const handleProfile = () => {
        // Navigate to profile screen
        console.log('Navigate to profile');
    };

    return (
        <View style={tailwind('flex-row items-center justify-between p-4 bg-gray-100/100')}>
            <TouchableOpacity onPress={handleBack}>
                <Icon name="arrow-back" width={24} height={24} fill="#000000FF" />
            </TouchableOpacity>

            <Input
                placeholder="Search podcasts..."
                style={tailwind('flex-1 mx-2')}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                accessoryRight={(props) => (
                    <TouchableOpacity onPress={handleSearch}>
                        <Icon {...props} name='search' />
                    </TouchableOpacity>
                )}
            />

            <TouchableOpacity onPress={handleNotifications} style={tailwind('mr-2')}>
                <Icon name="bell" width={24} height={24} fill="#000000FF" />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleProfile}>
                <Avatar
                    size="small"
                    source={{ uri: avatarUrl }}
                />
            </TouchableOpacity>
        </View>
    );
};

export default TopBar;