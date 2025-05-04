import os

def rename_images():
    # Get the current working directory
    current_dir = os.getcwd()
    
    # Supported image extensions
    image_extensions = {".jpg", ".jpeg", ".png"}
    
    # List all image files in the directory
    image_files = [f for f in os.listdir(current_dir) 
                   if os.path.isfile(f) and os.path.splitext(f)[1].lower() in image_extensions]
    
    # Sort files to ensure sequential naming
    image_files.sort()
    
    # Rename files sequentially
    for index, filename in enumerate(image_files):
        ext = os.path.splitext(filename)[1]  # Get file extension
        new_name = f"image{index}{ext}"
        os.rename(filename, new_name)
        print(f'Renamed: {filename} -> {new_name}')

if __name__ == "__main__":
    rename_images()

"""
https://ibb.co/M5pr8P3h
https://ibb.co/5hjqWRb6
https://ibb.co/TBdRLM83
https://ibb.co/G32dpbhn
https://ibb.co/p6hD8hr9
https://ibb.co/21q96ZM2
https://ibb.co/nsKTbyjT
"""