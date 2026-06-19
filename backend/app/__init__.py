from flask import Flask
from .config import get_config
from .extensions import db, migrate, cors, jwt

def create_app():
    app = Flask(__name__)
    app.config.from_object(get_config())

    # Extensions
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})
    jwt.init_app(app)

    # Import models so Flask-Migrate can detect them
    from .models import savings_goal, savings_deposit, category, transaction, user, budget  # noqa: F401

    # Blueprints
    from .routes import savings, categories, transactions, dashboard, analytics, auth, budgets
    app.register_blueprint(savings.bp)
    app.register_blueprint(categories.bp)
    app.register_blueprint(transactions.bp)
    app.register_blueprint(dashboard.bp)
    app.register_blueprint(analytics.bp)
    app.register_blueprint(auth.bp)
    app.register_blueprint(budgets.bp)

    # Seed default categories on first run
    with app.app_context():
        from .services.category_service import CategoryService
        try:
            CategoryService().seed_defaults()
        except Exception:
            pass  # table may not exist yet during migration

    return app