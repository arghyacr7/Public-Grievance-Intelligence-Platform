import os
import yaml
import shutil
import glob
from pathlib import Path
from ultralytics import YOLO

def main():
    print("📥 Locating datasets...")

    # Define paths based on your inputs
    pothole_ds1 = "/kaggle/input/datasets/arghyadeep07/pothole-detection"
    pothole_ds2 = "/kaggle/input/datasets/arghyadeep07/potholes-2"
    
    # Fallbacks in case Kaggle mounted them directly by dataset name
    if not os.path.exists(pothole_ds1): pothole_ds1 = "/kaggle/input/pothole-detection"
    if not os.path.exists(pothole_ds2): pothole_ds2 = "/kaggle/input/potholes-2"

    merged_dir = "/kaggle/working/pothole_smart_dataset"
    print(f"🔄 Creating merged dataset folder at {merged_dir}...")
    
    if os.path.exists(merged_dir):
        shutil.rmtree(merged_dir) # Clean up old runs
        
    os.makedirs(os.path.join(merged_dir, 'train', 'images'))
    os.makedirs(os.path.join(merged_dir, 'train', 'labels'))
    os.makedirs(os.path.join(merged_dir, 'valid', 'images'))
    os.makedirs(os.path.join(merged_dir, 'valid', 'labels'))

    def copy_dataset(src_dir, split_type):
        """Finds images/labels in a dataset and copies them to the merged folder"""
        # Map 'val' to 'valid' for our destination folder so it doesn't crash
        target_split = 'valid' if split_type == 'val' else split_type
        
        for root, dirs, files in os.walk(src_dir):
            if 'images' in root.lower() and split_type in root.lower():
                label_dir = root.replace('images', 'labels')
                if os.path.exists(label_dir):
                    print(f"Copying {split_type} data from {root}...")
                    for img in glob.glob(os.path.join(root, '*.*')):
                        img_name = os.path.basename(img)
                        shutil.copy(img, os.path.join(merged_dir, target_split, 'images', img_name))
                        
                        # Copy corresponding label
                        label_name = os.path.splitext(img_name)[0] + '.txt'
                        label_src = os.path.join(label_dir, label_name)
                        if os.path.exists(label_src):
                            shutil.copy(label_src, os.path.join(merged_dir, target_split, 'labels', label_name))

    # 1. Merge the two pothole datasets
    print("Merging Dataset 1 (pothole-detection)...")
    copy_dataset(pothole_ds1, 'train')
    copy_dataset(pothole_ds1, 'valid')
    copy_dataset(pothole_ds1, 'val') 

    print("Merging Dataset 2 (potholes-2)...")
    copy_dataset(pothole_ds2, 'train')
    copy_dataset(pothole_ds2, 'valid')
    copy_dataset(pothole_ds2, 'val')

    # 2. Inject Plain Roads as Background Images
    plain_train_dir = "/kaggle/input/datasets/arghyadeep07/plain-and-potholes/My Dataset/train/Plain"
    plain_test_dir = "/kaggle/input/datasets/arghyadeep07/plain-and-potholes/My Dataset/test/Plain"
    
    if not os.path.exists(plain_train_dir):
        plain_train_dir = "/kaggle/input/plain-and-potholes/My Dataset/train/Plain"
        plain_test_dir = "/kaggle/input/plain-and-potholes/My Dataset/test/Plain"

    print("💉 Injecting Plain Road images as Backgrounds (to reduce false positives)...")
    added_train = 0
    if os.path.exists(plain_train_dir):
        for img_path in glob.glob(os.path.join(plain_train_dir, '*.*')):
            shutil.copy(img_path, os.path.join(merged_dir, 'train', 'images'))
            added_train += 1

    added_val = 0
    if os.path.exists(plain_test_dir):
        for img_path in glob.glob(os.path.join(plain_test_dir, '*.*')):
            shutil.copy(img_path, os.path.join(merged_dir, 'valid', 'images'))
            added_val += 1

    print(f"✅ Added {added_train} plain roads to Training set.")
    print(f"✅ Added {added_val} plain roads to Validation set.")

    # 3. Create data.yaml
    merged_yaml = os.path.join(merged_dir, 'data.yaml')
    yaml_data = {
        'train': os.path.join(merged_dir, 'train', 'images'),
        'val': os.path.join(merged_dir, 'valid', 'images'),
        'nc': 1,
        'names': ['Pothole']
    }
    with open(merged_yaml, 'w') as f:
        yaml.dump(yaml_data, f)
        
    print(f"✅ Created unified data.yaml at {merged_yaml}")

    # 4. Train the Model
    print("\n🚀 Starting Training...\n")
    # Using medium segmentation model for better accuracy than nano
    model = YOLO('yolov8m-seg.pt') 

    results = model.train(
        data=merged_yaml,  
        epochs=150,        
        imgsz=640,
        batch=16,
        device=0,          
        seed=42
    )

    # 5. Save the super-smart model
    save_dir = getattr(model.trainer, 'save_dir', 'runs/segment/train')
    best_pt = Path(save_dir) / "weights" / "best.pt"
    target_pt = Path("/kaggle/working/pothole_seg_model_smart.pt")

    if best_pt.exists():
        shutil.copy(best_pt, target_pt)
        print(f"\n🎉 Success! Super-smart combined model saved to {target_pt}")
        print("Download this and put it in your local backend as 'pothole_seg_model.pt'!")

if __name__ == "__main__":
    main()
