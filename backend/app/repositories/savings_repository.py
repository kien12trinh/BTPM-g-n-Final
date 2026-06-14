from .base import BaseRepository
from ..models.savings_goal import SavingsGoal
from ..models.savings_deposit import SavingsDeposit


class SavingsGoalRepository(BaseRepository):
    def __init__(self):
        super().__init__(SavingsGoal)

    def get_all_ordered(self):
        return SavingsGoal.query.order_by(SavingsGoal.created_at.desc()).all()

    def get_with_deposits(self, goal_id):
        return SavingsGoal.query.get(goal_id)


class SavingsDepositRepository(BaseRepository):
    def __init__(self):
        super().__init__(SavingsDeposit)

    def get_by_goal(self, goal_id):
        return (
            SavingsDeposit.query
            .filter_by(goal_id=goal_id)
            .order_by(SavingsDeposit.date.desc())
            .all()
        )

    def get_by_goal_and_id(self, goal_id, deposit_id):
        return SavingsDeposit.query.filter_by(
            id=deposit_id, goal_id=goal_id
        ).first()
