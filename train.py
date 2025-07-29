from ultralytics import YOLO

model = YOLO("yolov8n.pt")

model.train(data = "data_custom.yaml", batch=8, imgsz=320, epochs=100, api=1)