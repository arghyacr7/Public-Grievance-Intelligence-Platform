from ultralytics import YOLO

print("\n=== EVALUATING POTHOLE MODEL ===")
pothole_model = YOLO("grievance_models/pothole_seg_model.pt")
p_metrics = pothole_model.val(data="grievance_models/pothole_seg_dataset/Pothole_Segmentation_YOLOv8/data.yaml")
print(f"Pothole mAP50 (Accuracy): {p_metrics.box.map50:.4f}")
print(f"Pothole mAP50-95: {p_metrics.box.map:.4f}")

print("\n=== EVALUATING GARBAGE MODEL ===")
garbage_model = YOLO("grievance_models/garbage_model.pt")
g_metrics = garbage_model.val(data="grievance_models/garbage_split")
print(f"Garbage Top-1 Accuracy: {g_metrics.top1:.4f}")
print(f"Garbage Top-5 Accuracy: {g_metrics.top5:.4f}")
