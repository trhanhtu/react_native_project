import json
import random
import uuid

# List of image URLs to choose from
IMAGE_URLS = [
    "https://ibb.co/M5pr8P3h",
    "https://ibb.co/5hjqWRb6",
    "https://ibb.co/TBdRLM83",
    "https://ibb.co/G32dpbhn",
    "https://ibb.co/p6hD8hr9",
    "https://ibb.co/21q96ZM2",
    "https://ibb.co/nsKTbyjT"
]

# Optional list of categories
CATEGORIES = [
    "Electronics",
    "Books",
    "Clothing",
    "Toys",
    "Home",
    "Sports",
    "Outdoors"
]

def generate_product(file_index, product_index):
    """
    Generates a product dictionary following the structure:
      - id: string
      - name: string
      - description: string
      - imageUrl: string
      - category: string
      - viewCount: number
    """
    return {
        "id": str(uuid.uuid4()),
        "name": f"Product {file_index}-{product_index}",
        "description": f"This is the description for product {file_index}-{product_index}.",
        "imageUrl": random.choice(IMAGE_URLS),
        "category": random.choice(CATEGORIES),
        "viewCount": random.randint(0, 1000)
    }

def main():
    # Create 10 JSON files
    for index in range(1, 11):
        products = []
        # Generate 10 products per file
        for prod_index in range(1, 11):
            product = generate_product(index, prod_index)
            products.append(product)
        
        file_name = f"products_{index}_10.json"
        with open(file_name, "w", encoding="utf-8") as f:
            json.dump(products, f, ensure_ascii=False, indent=2)
        print(f"Created {file_name}")

if __name__ == "__main__":
    main()
