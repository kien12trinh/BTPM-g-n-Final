import sys
import argparse
from app import create_app
from app.extensions import db
from app.models.user import User

# Khởi tạo app context để có thể tương tác với Database
app = create_app()

def list_users():
    with app.app_context():
        users = User.query.all()
        print(f"{'ID':<5} | {'Username':<30}")
        print("-" * 40)
        for u in users:
            print(f"{u.id:<5} | {u.username:<30}")

def add_user(username, password):
    with app.app_context():
        # Kiểm tra xem user đã tồn tại chưa
        if User.query.filter_by(username=username).first():
            print(f"❌ Lỗi: Username '{username}' đã tồn tại trong hệ thống!")
            return

        try:
            # Tạo user mới theo đúng model User (chỉ có username và password_hash)
            new_user = User(username=username)
            new_user.set_password(password) 
            
            db.session.add(new_user)
            db.session.commit()
            print(f"✅ Đã thêm thành công user: {username}")
        except Exception as e:
            db.session.rollback()
            print(f"❌ Lỗi khi thêm user: {e}")

def delete_user(username):
    with app.app_context():
        user = User.query.filter_by(username=username).first()
        if user:
            try:
                db.session.delete(user)
                db.session.commit()
                print(f"✅ Đã xóa thành công user: {username}")
            except Exception as e:
                db.session.rollback()
                print(f"❌ Lỗi khi xóa user: {e}")
        else:
            print(f"⚠️ Không tìm thấy user nào với username: {username}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Admin Tool quản lý User qua CMD")
    subparsers = parser.add_subparsers(dest="command", help="Các lệnh có sẵn")

    # Lệnh List
    subparsers.add_parser("list", help="Danh sách tất cả users")

    # Lệnh Add
    parser_add = subparsers.add_parser("add", help="Thêm user mới")
    parser_add.add_argument("username", type=str, help="Username của user")
    parser_add.add_argument("password", type=str, help="Mật khẩu")

    # Lệnh Delete
    parser_delete = subparsers.add_parser("delete", help="Xóa user")
    parser_delete.add_argument("username", type=str, help="Username của user cần xóa")

    args = parser.parse_args()

    if args.command == "list":
        list_users()
    elif args.command == "add":
        add_user(args.username, args.password)
    elif args.command == "delete":
        delete_user(args.username)
    else:
        parser.print_help()