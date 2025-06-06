from sqlalchemy.orm import Session
import logging
from typing import List

from database import get_db
from ml.services.spark_service import SparkMLService
from model.enable_banking.transaction import Transaction

logger = logging.getLogger(__name__)

def classify_transactions(transaction_ids: List[str]) -> None:
    """Classify a batch of transactions."""
    try:
        # Get database session
        db: Session = next(get_db())
        
        # Get transactions
        transactions = db.query(Transaction).filter(Transaction.id.in_(transaction_ids)).all()
        
        if not transactions:
            logger.warning(f"No transactions found for IDs: {transaction_ids}")
            return
        
        # Convert to dict for ML service
        transaction_dicts = [t.to_dict() for t in transactions]
        
        for transaction in transaction_dicts:
            logger.debug(f"Processing transaction: {transaction}")
        
        # Initialize ML service
        ml_service = SparkMLService()
        
        # Get predictions
        categories = ml_service.classify_transactions(transaction_dicts)
        
        # Update transactions with categories
        for transaction, category in zip(transactions, categories):
            logger.info(f"Classifying transaction {transaction.remittance_information} as {category}")
            transaction.category = category
        
        # Commit changes
        db.commit()
        
        logger.info(f"Successfully classified {len(transactions)} transactions")
        
    except Exception as e:
        logger.error(f"Error in classify_transactions task: {str(e)}")
        raise
    finally:
        db.close()