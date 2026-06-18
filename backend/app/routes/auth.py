# backend/app/routes/auth.py
from flask import Blueprint, request, jsonify
from ..models.user import User
from ..extensions import db
from flask_jwt_extended import create_access_token

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

    new_user = User(username=username)
    new_user.set_password(password)
    
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "Đăng ký thành công"}), 201

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user is None or not user.check_password(password):
        return jsonify({"msg": "Tài khoản hoặc mật khẩu không chính xác"}), 401

    # Tạo JWT token hợp lệ
    access_token = create_access_token(identity=user.id)
    return jsonify({
        "msg": "Đăng nhập thành công",
        "access_token": access_token,
        "user": user.to_dict()
    }), 200