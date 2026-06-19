FROM python:3.12-slim
# Cài đặt công cụ Tesseract OCR và gói ngôn ngữ tiếng Việt
RUN apt-get update && apt-get install -y tesseract-ocr tesseract-ocr-vie
WORKDIR /app

# Install deps first (layer cache)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chmod +x entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["./entrypoint.sh"]
