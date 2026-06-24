import re
from PIL import Image
import pytesseract
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services.transaction_service import TransactionService

bp = Blueprint("transactions", __name__, url_prefix="/api/transactions")
_svc = TransactionService()

def _ok(data, status=200):
    return jsonify({"success": True, "data": data}), status

def _err(msg, status=400):
    return jsonify({"success": False, "error": msg}), status

@bp.get("")
@jwt_required()
def list_transactions():
    user_id = get_jwt_identity()
    return _ok([tx.to_dict() for tx in _svc.list(
        user_id=user_id,
        date_from=request.args.get("date_from"),
        date_to=request.args.get("date_to"),
        tx_type=request.args.get("type"),
        limit=request.args.get("limit", type=int),
    )])

@bp.post("")
@jwt_required()
def create_transaction():
    user_id = get_jwt_identity()
    body = request.get_json(silent=True) or {}
    try:
        tx = _svc.create(
            user_id=user_id,
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
@jwt_required()
def delete_transaction(tx_id):
    user_id = get_jwt_identity()
    try:
        _svc.delete(tx_id, user_id)
        return _ok({"id": tx_id})
    except ValueError as e:
        return _err(str(e), 404)

# Tính năng OCR không chạm DB nên chỉ cần chặn xác thực
@bp.post("/ocr")
@jwt_required()
def ocr_receipt():
    if 'receipt' not in request.files:
        return _err("Không tìm thấy file ảnh hóa đơn")
    file = request.files['receipt']
    try:
        img = Image.open(file.stream)
        text = pytesseract.image_to_string(img, lang='vie')
        amounts = re.findall(r'\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{2})?', text)
        scanned_amount = 0
        if amounts:
            clean_amounts = [int(re.sub(r'[.,]', '', a)) for a in amounts]
            scanned_amount = max(clean_amounts)
        return _ok({"amount": scanned_amount, "note": "Quét từ hóa đơn"})
    except Exception as e:
        return _err(f"Lỗi khi đọc ảnh: {str(e)}", 500)