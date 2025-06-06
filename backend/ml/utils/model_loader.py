from pathlib import Path
import joblib
from typing import Any, Dict, Optional
import logging

logger = logging.getLogger(__name__)

class ModelLoader:
    def __init__(self, model_dir: str = "models"):
        self.model_dir = Path(model_dir)
        self._models: Dict[str, Any] = {}
        
    def load_model(self, model_name: str, version: str) -> Any:
        """
        Load a model from disk
        
        Args:
            model_name: Name of the model (e.g., 'classifier', 'predictor')
            version: Version of the model to load
            
        Returns:
            Loaded model object
        """
        model_path = self.model_dir / model_name / f"v{version}.joblib"
        
        if not model_path.exists():
            raise FileNotFoundError(f"Model not found at {model_path}")
            
        try:
            model = joblib.load(model_path)
            self._models[model_name] = model
            logger.info(f"Successfully loaded model {model_name} version {version}")
            return model
        except Exception as e:
            logger.error(f"Error loading model {model_name}: {str(e)}")
            raise
            
    def get_model(self, model_name: str) -> Optional[Any]:
        """
        Get a loaded model by name
        
        Args:
            model_name: Name of the model to retrieve
            
        Returns:
            Loaded model object or None if not loaded
        """
        return self._models.get(model_name)
        
    def validate_model(self, model: Any, model_type: str) -> bool:
        """
        Validate a loaded model
        
        Args:
            model: The model to validate
            model_type: Type of model ('classifier' or 'predictor')
            
        Returns:
            True if model is valid, False otherwise
        """
        # Add specific validation logic based on model type
        if model_type == 'classifier':
            # Validate classifier-specific attributes
            return hasattr(model, 'predict') and hasattr(model, 'predict_proba')
        elif model_type == 'predictor':
            # Validate predictor-specific attributes
            return hasattr(model, 'predict')
        return False 