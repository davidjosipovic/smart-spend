from pyspark.sql import SparkSession
from pyspark.sql.types import StructType, StructField, StringType
from pyspark.ml import PipelineModel
from datetime import datetime, timedelta
import logging
from typing import List, Dict, Any
import os

logger = logging.getLogger(__name__)

class SparkMLService:
    def __init__(self):
        # Get Spark configuration from environment variables
        spark_master = os.getenv('SPARK_MASTER_URL', 'local[*]')
        driver_host = os.getenv('SPARK_DRIVER_HOST', 'localhost')
        driver_port = os.getenv('SPARK_DRIVER_PORT', '4040')
        
        self.spark = SparkSession.builder \
            .appName("SmartSpendML") \
            .master(spark_master) \
            .config("spark.driver.memory", "2g") \
            .config("spark.executor.memory", "2g") \
            .config("spark.driver.host", driver_host) \
            .config("spark.driver.port", driver_port) \
            .config("spark.driver.bindAddress", "0.0.0.0") \
            .config("spark.ui.port", "4040") \
            .getOrCreate()
        
        # Load models
        try:
            #Commented out for now, assuming models are not available
            self.classification_model = PipelineModel.load("models/transaction_classifier")
            #self.prediction_model = PipelineModel.load("models/spending_predictor")
            logger.info("Successfully loaded ML models")
        except Exception as e:
            logger.error(f"Error loading ML models: {str(e)}")
            raise
        
    def _prepare_transaction_features(self, transaction: Dict[str, Any]) -> Dict[str, Any]:
        """Prepare transaction features for classification."""
        logger.info(f"Preparing features for transaction: {transaction}")
        return {
            "remittance_information": str(transaction.get("remittance_information", "")),
        }
    
    def classify_transactions(self, transactions: List[Dict[str, Any]]) -> List[str]:
        """Classify multiple transactions in batch."""
        try:
            # Prepare features for all transactions
            features_list = [self._prepare_transaction_features(t) for t in transactions]

            for f in features_list:
                logger.debug(f"Prepared features: {f}")
            
            transaction_schema = StructType([
                StructField("remittance_information", StringType(), True),
            ])
            
            # Create DataFrame
            df = self.spark.createDataFrame(features_list, schema=transaction_schema)
            
            # Make predictions
            predictions = self.classification_model.transform(df)
            
            # Get predicted categories
            categories = [row[0] for row in predictions.select("prediction").collect()]
            
            labels = self.classification_model.stages[-2].labels
            categories = [labels[int(cat)] for cat in categories]
            
            return categories
            
        except Exception as e:
            logger.error(f"Error in batch classification: {str(e)}")
            raise
    
    def __del__(self):
        """Clean up Spark session."""
        if hasattr(self, 'spark'):
            self.spark.stop() 