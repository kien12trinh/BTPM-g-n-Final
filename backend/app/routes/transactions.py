import re
from PIL import Image
import pytesseract
from flask import Blueprint, request, jsonify
from ..services.transaction_service import TransactionService

bp = Blueprint("transactions", __name__, url_prefix="/api/transactions")
_svc = TransactionService()


def _ok(data, status=200):
    return jsonify({"success": True, "data": data}), status

def _err(msg, status=400):
    return jsonify({"success": False, "error": msg}), status


@bp.get("")
def list_transactions():
    return _ok([tx.to_dict() for tx in _svc.list(
        date_from=request.args.get("date_from"),
        date_to=request.args.get("date_to"),
        tx_type=request.args.get("type"),
        limit=request.args.get("limit", type=int),
    )])


@bp.post("")
def create_transaction():
    body = request.get_json(silent=True) or {}
    try:
        tx = _svc.create(
            tx_type=body.get("type", ""),
            amount=body.get("amount", 0),
            tx_date=body.get("date"),
            category_id=body.get("category_id"),
            note=body.get("note"),
        )
        return _ok(tx.to_dict(), 201)
    except ValueError as e:
        return _err(str(e))


@bp.delete("/<int:tx_id>")
def delete_transaction(tx_id):
    try:
        _svc.delete(tx_id)
        return _ok({"id": tx_id})
    except ValueError as e:
        return _err(str(e), 404)


# ── TÍNH NĂNG QUÉT HÓA ĐƠN (OCR) ──────────────────────────────────
@bp.post("/ocr")
def ocr_receipt():
    # 1. Kiểm tra xem file ảnh có được gửi lên không
    if 'receipt' not in request.files:
        return _err("Không tìm thấy file ảnh hóa đơn")

    file = request.files['receipt']
    
    try:
        # 2. Mở ảnh và cho Tesseract đọc chữ (dùng ngôn ngữ 'vie' - tiếng Việt)
        img = Image.open(file.stream)
        text = pytesseract.image_to_string(img, lang='vie')

        # 3. Quét tìm số tiền
        # Biểu thức này tìm các chuỗi như: 100.000, 1.250.000, 50,000...
        amounts = re.findall(r'\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{2})?', text)
        
        scanned_amount = 0
        if amounts:
            # Làm sạch dấu chấm, phẩy và ép kiểu về số nguyên
            clean_amounts = [int(re.sub(r'[.,]', '', a)) for a in amounts]
            scanned_amount = max(clean_amounts) # Lấy số to nhất làm tổng tiền

        return _ok({
            "amount": scanned_amount,
            "note": "Quét từ hóa đơn"
        })

    except Exception as e:
        return _err(f"Lỗi khi đọc ảnh: {str(e)}", 500)