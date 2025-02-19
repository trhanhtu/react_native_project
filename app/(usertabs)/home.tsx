// HomeScreen.tsx
import * as eva from '@eva-design/eva';
import {
    ApplicationProvider,
    Avatar,
    Button,
    Icon,
    Input,
    Layout,
    Text
} from '@ui-kitten/components';
import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTailwind } from 'tailwind-rn';

// ---------------------- TYPES & INTERFACES ----------------------

// Cập nhật giao diện cho Product theo API (sử dụng imageUrl thay vì reactLogo)
interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  viewCount: number;
}

// Props cho CategoryList Component
interface CategoryListProps {
  onSelectCategory: (category: string) => void;
}

// Props cho SlideShow Component
interface SlideShowProps {
  slides: Product[];
}

// Props cho Top10Popular Component
interface Top10PopularProps {
  products: Product[];
}

// Props cho AllProduct Component
interface AllProductProps {
  selectedCategory: string | null;
  products: Product[];
  loadMore: () => void;
  loading: boolean;
  hasMore: boolean;
}

// Props cho Bottom Navigation Component
interface AppBottomNavigationProps {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
}

// ---------------------- CONSTANTS ----------------------

// Danh mục sản phẩm (giả sử API trả về các danh mục này)
const categories: string[] = [
  'Niên đại',
  'Chu kỳ',
  'Nhóm',
  'Nhiệt độ',
  'Phân loại',
  'Phân lớp',
  'Khác',
];

// ---------------------- COMPONENTS ----------------------

// TopBar Component: bao gồm BackButton, SearchBar, NotiBell và Avatar
const TopBar: React.FC = () => {
  const tailwind = useTailwind();
  return (
    <View style={tailwind('flex-row items-center justify-between p-4 bg-gray-200')}>
      {/* Nút Back */}
      <TouchableOpacity>
        <Icon name="arrow-back" width={24} height={24} fill="#000" />
      </TouchableOpacity>
      {/* Thanh tìm kiếm */}
      <Input placeholder="Search" style={tailwind('flex-1 mx-2')} />
      {/* Biểu tượng thông báo */}
      <TouchableOpacity>
        <Icon name="bell" width={24} height={24} fill="#000" />
      </TouchableOpacity>
      {/* Avatar: sử dụng UI Kitten Avatar với ảnh từ URL */}
      <TouchableOpacity>
        <Avatar
          size="small"
          source={{ uri: 'https://img.freepik.com/free-vector/cute-detective-bear-cartoon-character_138676-2911.jpg' }}
        />
      </TouchableOpacity>
    </View>
  );
};

// SlideShow Component: carousel tự động chuyển slide
const SlideShow: React.FC<SlideShowProps> = ({ slides }) => {
  const tailwind = useTailwind();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const { width } = Dimensions.get('window');

  useEffect(() => {
    // Nếu không có slide nào, không thiết lập interval
    if (slides.length === 0) return;

    const interval = setInterval(() => {
      let nextSlide = currentSlide + 1;
      if (nextSlide >= slides.length) {
        nextSlide = 0;
      }
      setCurrentSlide(nextSlide);
      // Chuyển trang tự động
      scrollViewRef.current?.scrollTo({ x: nextSlide * width, animated: true });
    }, 3000); // chuyển slide mỗi 3 giây

    return () => clearInterval(interval);
  }, [currentSlide, slides.length, width]);

  return (
    <ScrollView
      horizontal
      pagingEnabled
      ref={scrollViewRef}
      showsHorizontalScrollIndicator={false}
      style={tailwind('p-2')}
    >
      {slides.map((slide) => (
        <Image
          key={slide.id}
          source={{ uri: slide.imageUrl }}
          style={{ width: width, height: 150, borderRadius: 10 }}
        />
      ))}
    </ScrollView>
  );
};

// CategoryList Component: danh sách nút danh mục theo chiều ngang
const CategoryList: React.FC<CategoryListProps> = ({ onSelectCategory }) => {
  const tailwind = useTailwind();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tailwind('p-2')}>
      {categories.map((category, index) => (
        <Button key={index} style={tailwind('mx-1')} onPress={() => onSelectCategory(category)}>
          {category}
        </Button>
      ))}
    </ScrollView>
  );
};

// Top10Popular Component: hiển thị top 10 sản phẩm phổ biến theo lượt xem
const Top10Popular: React.FC<Top10PopularProps> = ({ products }) => {
  const tailwind = useTailwind();
  // Sắp xếp và lấy 10 sản phẩm có lượt xem cao nhất
  const top10 = [...products].sort((a, b) => b.viewCount - a.viewCount).slice(0, 10);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tailwind('p-2')}>
      {top10.map((product) => (
        <View key={product.id} style={tailwind('mr-4')}>
          <Image
            source={{ uri: product.imageUrl }}
            style={{ width: 100, height: 100, borderRadius: 10 }}
          />
          <Text style={tailwind('text-center mt-1')}>{product.name}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

// AllProduct Component: hiển thị tất cả sản phẩm theo danh mục đã chọn, với lazy loading
const AllProduct: React.FC<AllProductProps> = ({
  selectedCategory,
  products,
  loadMore,
  loading,
  hasMore,
}) => {
  const tailwind = useTailwind();

  // Lọc sản phẩm theo danh mục nếu có
  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : products;

  // Sắp xếp theo lượt xem giảm dần
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


// ---------------------- MAIN SCREEN ----------------------

// HomeScreen: màn hình chính của ứng dụng
const HomeScreen: React.FC = () => {
  const tailwind = useTailwind();

  // State quản lý dữ liệu sản phẩm
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const fetchProducts = async (page: number) => {
    try {
      setLoading(true);
      const response = await fetch(`https://raw.githubusercontent.com/trhanhtu/react_native_project/refs/heads/tab-bottom-navigation/api/dummy/products_${page}_10.json`);
      const json = await response.json();
      // Giả sử API trả về cấu trúc: { data: Product[], page: number, totalPages: number }
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

  // Load dữ liệu ban đầu
  useEffect(() => {
    fetchProducts(1);
  }, []);

  // Hàm load thêm sản phẩm khi cuộn đến cuối danh sách
  const loadMoreProducts = () => {
    if (!loading && currentPage <= totalPages) {
      fetchProducts(currentPage);
    }
  };

  // Xác định xem còn sản phẩm để load thêm không
  const hasMore = currentPage <= totalPages;

  // SlideShow sử dụng một tập hợp slide từ sản phẩm; có thể dùng 5 sản phẩm đầu tiên
  const slideShowSlides = products.slice(0, 5);

  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <SafeAreaView style={{ flex: 1 }}>
        <Layout style={{ flex: 1 }}>
          {/* TopBar */}
          <TopBar />
          <ScrollView style={tailwind('flex-1')}>
            {/* SlideShow với auto slide */}
            <SlideShow slides={slideShowSlides} />
            {/* Danh sách Category */}
            <CategoryList onSelectCategory={setSelectedCategory} />
            {/* Top 10 sản phẩm phổ biến */}
            <Top10Popular products={products} />
            {/* All sản phẩm với lazy loading */}
            <AllProduct
              selectedCategory={selectedCategory}
              products={products}
              loadMore={loadMoreProducts}
              loading={loading}
              hasMore={hasMore}
            />
          </ScrollView>
        </Layout>
      </SafeAreaView>
    </ApplicationProvider>
  );
};

export default HomeScreen;
