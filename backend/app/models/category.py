from ..extensions import db

class Category(db.Model):
    __tablename__ = "categories"

    id   = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    icon = db.Column(db.String(60), nullable=False, default="label")
    type = db.Column(db.Enum("income", "expense"), nullable=False)
    
    # THÊM CỘT NÀY: Liên kết danh mục với một user cụ thể
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    transactions = db.relationship("Transaction", backref="category", lazy="dynamic")

    def to_dict(self):
        return {
            "id": self.id, 
            "name": self.name, 
            "icon": self.icon, 
            "type": self.type,
            "user_id": self.user_id # Trả về thêm user_id khi gọi API
        }
