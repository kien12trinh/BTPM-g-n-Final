from ..extensions import db


class BaseRepository:
    """Generic CRUD repository — extend per model."""

    def __init__(self, model):
        self._model = model

    # ── Read ──────────────────────────────────────────────────────
    def get_by_id(self, record_id):
        return self._model.query.get(record_id)

    def get_all(self):
        return self._model.query.all()

    # ── Write ─────────────────────────────────────────────────────
    def add(self, entity):
        db.session.add(entity)
        db.session.flush()   # get PK without committing
        return entity

    def delete(self, entity):
        db.session.delete(entity)

    def commit(self):
        db.session.commit()

    def rollback(self):
        db.session.rollback()
