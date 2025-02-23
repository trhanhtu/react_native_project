// HomeScreen.tsx
import { useLayout } from '@/src/context/ApplicationLayoutProvider';
import {
    Avatar,
    Button,
    Icon,
    Input,
    Layout,
    Text
} from '@ui-kitten/components';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, SafeAreaView, TouchableOpacity, View, } from 'react-native';
import { useTailwind } from 'tailwind-rn';

// ---------------------- TYPES & INTERFACES ----------------------

// Updated Product interface using imageUrl
interface Product {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    category: string;
    viewCount: number;
}

// Props for CategoryList Component
interface CategoryListProps {
    onSelectCategory: (category: string) => void;
}

// Props for SlideShow Component
interface SlideShowProps {
    slides: Product[];
}

// Props for Top10Popular Component
interface Top10PopularProps {
    products: Product[];
}

// Props for AllProduct Component
interface AllProductProps {
    selectedCategory: string | null;
    products: Product[];
    loadMore: () => void;
    loading: boolean;
    hasMore: boolean;
}


// ---------------------- COMPONENTS ----------------------

// TopBar Component: includes BackButton, SearchBar, NotiBell and Avatar
const TopBar: React.FC = () => {
    const tailwind = useTailwind();
    return (
        <View style={tailwind('flex-row items-center justify-between p-4 bg-gray-200')}>
            {/* Back Button */}
            <TouchableOpacity>
                <Icon name="arrow-back" width={24} height={24} fill="#000" />
            </TouchableOpacity>
            {/* Search Bar */}
            <Input placeholder="Search" style={tailwind('flex-1 mx-2')} />
            {/* Notification Bell */}
            <TouchableOpacity>
                <Icon name="bell" width={24} height={24} fill="#000" />
            </TouchableOpacity>
            {/* Avatar with updated URI */}
            <TouchableOpacity>
                <Avatar
                    size="small"
                    source={{ uri: 'https://img.freepik.com/free-vector/cute-detective-bear-cartoon-character_138676-2911.jpg' }}
                />
            </TouchableOpacity>
        </View>
    );
};

// SlideShow Component: auto-sliding carousel using FlatList
const SlideShow: React.FC<SlideShowProps> = ({ slides }) => {
    const tailwind = useTailwind();
    const { windowDimensions } = useLayout();
    const scrollViewRef = useRef<FlatList<Product>>(null);
    const [currentSlide, setCurrentSlide] = useState<number>(0);

    useEffect(() => {
        if (slides.length === 0) return;
        const interval = setInterval(() => {
            let nextSlide = currentSlide + 1;
            if (nextSlide >= slides.length) {
                nextSlide = 0;
            }
            setCurrentSlide(nextSlide);
            // Auto scroll to the next slide using windowDimensions.width
            scrollViewRef.current?.scrollToOffset({
                offset: nextSlide * windowDimensions.width,
                animated: true,
            });
        }, 3000); // slide every 3 seconds

        return () => clearInterval(interval);
    }, [currentSlide, slides.length, windowDimensions.width]);

    return (
        <FlatList
            data={slides}
            horizontal
            pagingEnabled
            ref={scrollViewRef}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <Image
                    source={{ uri: item.imageUrl }}
                    style={{ width: windowDimensions.width, height: 150, borderRadius: 10 }}
                />
            )}
        />
    );
};

// CategoryList Component: horizontal list of category buttons
const CategoryList: React.FC<CategoryListProps> = ({ onSelectCategory }) => {
    const tailwind = useTailwind();
    // Predefined categories
    const categories: string[] = ['Niên đại', 'Chu kỳ', 'Nhóm', 'Nhiệt độ', 'Phân loại', 'Phân lớp', 'Khác'];

    return (
        <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={tailwind('p-2')}
            renderItem={({ item }) => (
                <Button style={tailwind('mx-1')} onPress={() => onSelectCategory(item)}>
                    {item}
                </Button>
            )}
        />
    );
};

// Top10Popular Component: displays top 10 popular products based on viewCount
const Top10Popular: React.FC<Top10PopularProps> = ({ products }) => {
    const tailwind = useTailwind();
    const top10 = [...products]
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, 10);

    return (
        <FlatList
            data={top10}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => "top_"+item.id.toString()}
            contentContainerStyle={tailwind('p-2')}
            renderItem={({ item }) => (
                <View style={tailwind('mr-4')}>
                    <Image
                        source={{ uri: item.imageUrl }}
                        style={{ width: 100, height: 100, borderRadius: 10 }}
                    />
                    <Text style={tailwind('text-center mt-1')}>{item.name}</Text>
                </View>
            )}
        />
    );
};

// AllProduct Component: displays all products with lazy loading
const AllProduct: React.FC<AllProductProps> = ({ selectedCategory, products, loadMore, loading, hasMore }) => {
    const tailwind = useTailwind();

    // Filter products by selected category if provided
    const filteredProducts = selectedCategory
        ? products.filter((product) => product.category === selectedCategory)
        : products;

    // Sort products by viewCount descending
    const sortedProducts = [...filteredProducts].sort((a, b) => b.viewCount - a.viewCount);

    return (
        <FlatList
            data={sortedProducts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <View style={tailwind('p-4 border-b border-gray-300 flex-row')}>
                    <Image
                        source={{ uri: item.imageUrl }}
                        style={{ width: 80, height: 80, borderRadius: 10 }}
                    />
                    <View style={tailwind('ml-4 flex-1')}>
                        <Text category="s1">{item.name}</Text>
                        <Text appearance="hint">{item.description}</Text>
                    </View>
                </View>
            )}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() =>
                loading && hasMore ? (
                    <View style={tailwind('p-4')}>
                        <Text>Loading more...</Text>
                    </View>
                ) : null
            }
        />
    );
};

// ---------------------- MAIN SCREEN: HomeScreen ----------------------
const HomeScreen: React.FC = () => {
    const tailwind = useTailwind();

    // State management for products and pagination
    const [products, setProducts] = useState<Product[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Updated fetchProducts function
    const fetchProducts = async (page: number) => {
        try {
            setLoading(true);
            const response = await fetch(
                `https://raw.githubusercontent.com/trhanhtu/react_native_project/refs/heads/integrate-with-dummy-json/api/dummy/products_${page}_10.json`
            );
            const json = await response.json();
            const newProducts: Product[] = json;
            setProducts((prev) => [...prev, ...newProducts]);
            setCurrentPage(page + 1);
            setTotalPages(10);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load initial products
    useEffect(() => {
        fetchProducts(1);
    }, []);

    // Load more products when reaching end
    const loadMoreProducts = () => {
        if (!loading && currentPage <= totalPages) {
            fetchProducts(currentPage);
        }
    };

    // ListHeaderComponent containing SlideShow, CategoryList, and Top10Popular
    const ListHeaderComponent = () => {
        const slideShowSlides = products.slice(0, 5);
        return (
            <View>
                <SlideShow slides={slideShowSlides} />
                <CategoryList onSelectCategory={setSelectedCategory} />
                <Top10Popular products={products} />
            </View>
        );
    };

    // Filter and sort products for the main list
    const filteredProducts = selectedCategory
        ? products.filter((product) => product.category === selectedCategory)
        : products;
    const sortedProducts = [...filteredProducts].sort((a, b) => b.viewCount - a.viewCount);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Layout style={{ flex: 1 }}>
                {/* TopBar */}
                <TopBar />
                {/* Main FlatList with header and products */}
                <FlatList
                    data={sortedProducts}
                    keyExtractor={(item, index) => item.id + index.toString()}
                    renderItem={({ item }) => (
                        <View style={tailwind('p-4 border-b border-gray-300 flex-row')}>
                            <Image
                                source={{ uri: item.imageUrl }}
                                style={{ width: 80, height: 80, borderRadius: 10 }}
                            />
                            <View style={tailwind('ml-4 flex-1')}>
                                <Text category="s1">{item.name}</Text>
                                <Text appearance="hint">{item.description}</Text>
                            </View>
                        </View>
                    )}
                    ListHeaderComponent={ListHeaderComponent}
                    onEndReached={loadMoreProducts}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={() =>
                        loading && currentPage <= totalPages ? (
                            <View style={tailwind('p-4')}>
                                <Text>Loading more...</Text>
                            </View>
                        ) : null
                    }
                />
            </Layout>
        </SafeAreaView>
    );
};

export default HomeScreen;
