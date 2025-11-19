from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import numpy as np

app = FastAPI()

# Mobil uygulamadan gelecek isteklere izin ver
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Basit açı sınıflandırıcı (model yok, heuristik)
ANGLE_LABELS = ["front", "right", "left", "top", "back"]


def simple_angle_classifier(image: Image.Image):
    """
    Çok basit bir heuristik:
    - Sol / sağ parlaklık farkına göre RIGHT / LEFT
    - En-boy oranına göre FRONT / BACK / TOP
    """
    w, h = image.size

    # 1) Sağ / sol farkı → RIGHT / LEFT
    gray = image.convert("L")
    np_gray = np.array(gray)

    left_region = np_gray[:, : w // 2]
    right_region = np_gray[:, w // 2 :]

    left_mean = left_region.mean()
    right_mean = right_region.mean()

    # fark yeterince büyükse (deneme eşiği)
    if abs(left_mean - right_mean) > 10:
        if left_mean < right_mean:
            # sol taraf daha koyu → yüz daha çok sola kaymış → kullanıcı SAĞA bakıyor
            return "right"
        else:
            # sağ taraf daha koyu → kullanıcı SOLA bakıyor
            return "left"

    # 2) En-boy oranına göre front / back / top
    if h > w * 1.2:
        return "front"

    if w > h * 1.25:
        return "back"

    if abs(w - h) < 40:
        return "top"

    # emin olamıyorsak default olarak front
    return "front"


@app.post("/predict-angle")
async def predict_angle(file: UploadFile = File(...)):
    # 1) Dosyayı oku ve PIL image'e çevir
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")

    # 2) Basit sınıflandırıcıyı çalıştır
    raw_label = simple_angle_classifier(image)  # 'front', 'right', 'left', 'top', 'back'

    # 3) Etiketleri FRONT / SIDE / TOP / BACK olarak normalize et
    if raw_label in ["right", "left"]:
        normalized = "SIDE"
    elif raw_label == "front":
        normalized = "FRONT"
    elif raw_label == "top":
        normalized = "TOP"
    elif raw_label == "back":
        normalized = "BACK"
    else:
        # emin olamazsak güvenli tarafta kal → FRONT
        normalized = "FRONT"

    return {
        "predicted_angle": normalized,
        "status": "ok",
    }
