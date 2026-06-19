# backend/app/routes/auth.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from ..models.user import User
from ..extensions import db

# Import CategoryService để tạo danh mục mặc định
from ..services.category_service import CategoryService

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"msg": "Vui lòng nhập đầy đủ tài khoản và mật khẩu"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "Tài khoản đã tồn tại"}), 400

    # Tạo user mới
    new_user = User(username=username)
    new_user.set_password(password)
    
    db.session.add(new_user)
    db.session.commit()

    # TỰ ĐỘNG TẠO DANH MỤC MẶC ĐỊNH CHO USER VỪA ĐĂNG KÝ
    try:
        CategoryService().seed_defaults(new_user.id)
    except Exception as e:
        print(f"Lỗi khi tạo danh mục mặc định cho user {new_user.id}: {e}")
        # Vẫn trả về thành công vì tài khoản đã được tạo, 
        # danh mục có thể tạo sau nếu lỗi.

    return jsonify({"msg": "Đăng ký thành công"}), 201

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user is None or not user.check_password(password):
        return jsonify({"msg": "Tài khoản hoặc mật khẩu không chính xác"}), 401

    # Tạo JWT token hợp lệ, lưu identity là user.id
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        "msg": "Đăng nhập thành công",
        "access_token": access_token,
        "user": user.to_dict()
    }), 200