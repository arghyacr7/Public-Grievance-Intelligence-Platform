import os
from ultralytics import YOLO

def main():
    # Load the pre-trained YOLOv8 nano segmentation model
    print("Loading pre-trained YOLOv8n-seg.pt model...")
    model = YOLO('yolov8n-seg.pt') 

    # Paths
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dataset_yaml = os.path.join(base_dir, "grievance_models", "pothole_seg_dataset", "Pothole_Segmentation_YOLOv8", "data.yaml")
    
    print(f"Starting training on dataset: {dataset_yaml}")
    
    # Train the model
    results = model.train(
        data=dataset_yaml,
        epochs=5,            # Very fast run for Proof of Concept
        imgsz=160,           # Extremely small image size for speed
        batch=16,
        optimizer='auto',
        lr0=0.001,
        patience=10,
        device='cpu',        # Change to 0 if CUDA is available
        seed=42
    )

    print("Training complete! Model saved to runs/segment/train/weights/best.pt")
    
    # Copy best.pt to grievance_models/pothole_seg_model.pt
    import shutil
    from pathlib import Path
    
    # Ultralytics saves the last run in runs/segment/train (or train2, train3, etc.)
    # We can just get the model's trainer save_dir
    save_dir = getattr(model.trainer, 'save_dir', 'runs/segment/train')
    best_pt = Path(save_dir) / "weights" / "best.pt"
    target_pt = Path(base_dir) / "grievance_models" / "pothole_seg_model.pt"
    
    if best_pt.exists():
        shutil.copy(best_pt, target_pt)
        print(f"Copied model to {target_pt}")
    else:
        print(f"Could not find {best_pt} to copy.")

if __name__ == "__main__":
    main()
