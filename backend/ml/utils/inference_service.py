from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
from .model_loader import ModelLoader
import logging

logger = logging.getLogger(__name__)

class InferenceService:
    def __init__(self, model_loader: ModelLoader):
        self.model_loader = model_loader
        
    def preprocess_transaction(self, transaction: Dict[str, Any]) -> np.ndarray:
        """
        Preprocess a single transaction for model inference
        
        Args:
            transaction: Dictionary containing transaction data
            
        Returns:
            Preprocessed features as numpy array
        """
        # TODO: Implement preprocessing logic based on model requirements
        # This should match the preprocessing used during training
        features = []
        
        # Example preprocessing (modify based on actual model requirements)
        features.extend([
            float(transaction.get('amount', 0)),
            # Add more feature extraction logic here
        ])
        
        return np.array(features).reshape(1, -1)
        
    def classify_transaction(self, transaction: Dict[str, Any]) -> Dict[str, Any]:
        """
        Classify a transaction using the classification model
        
        Args:
            transaction: Dictionary containing transaction data
            
        Returns:
            Dictionary containing classification results
        """
        try:
            model = self.model_loader.get_model('classifier')
            if model is None:
                raise ValueError("Classifier model not loaded")
                
            features = self.preprocess_transaction(transaction)
            prediction = model.predict(features)[0]
            probabilities = model.predict_proba(features)[0]
            
            return {
                'category': prediction,
                'confidence': float(max(probabilities)),
                'probabilities': probabilities.tolist()
            }
        except Exception as e:
            logger.error(f"Error classifying transaction: {str(e)}")
            raise
            
    def predict_transaction(self, transaction: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict future transaction amount using the prediction model
        
        Args:
            transaction: Dictionary containing transaction data
            
        Returns:
            Dictionary containing prediction results
        """
        try:
            model = self.model_loader.get_model('predictor')
            if model is None:
                raise ValueError("Predictor model not loaded")
                
            features = self.preprocess_transaction(transaction)
            prediction = model.predict(features)[0]
            
            return {
                'predicted_amount': float(prediction),
                'confidence': 0.0  # Add confidence if available from model
            }
        except Exception as e:
            logger.error(f"Error predicting transaction: {str(e)}")
            raise
            
    def process_batch(self, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Process a batch of transactions
        
        Args:
            transactions: List of transaction dictionaries
            
        Returns:
            List of processed transactions with classifications and predictions
        """
        results = []
        for transaction in transactions:
            try:
                classification = self.classify_transaction(transaction)
                prediction = self.predict_transaction(transaction)
                
                result = {
                    **transaction,
                    'classification': classification,
                    'prediction': prediction
                }
                results.append(result)
            except Exception as e:
                logger.error(f"Error processing transaction: {str(e)}")
                # Add error information to result
                results.append({
                    **transaction,
                    'error': str(e)
                })
                
        return results 