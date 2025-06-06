from pyspark.sql import SparkSession
from pyspark.sql.types import *
from pyspark.ml import PipelineModel
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class SparkService:
    def __init__(self):
        self.spark = SparkSession.builder \
            .appName("SmartSpendML") \
            .config("spark.sql.execution.arrow.pyspark.enabled", "true") \
            .getOrCreate()
            
    def create_transaction_df(self, transactions: List[Dict[str, Any]]) -> DataFrame:
        """
        Create a Spark DataFrame from transaction data
        
        Args:
            transactions: List of transaction dictionaries
            
        Returns:
            Spark DataFrame containing transaction data
        """
        # Define schema for transactions
        schema = StructType([
            StructField("id", StringType(), True),
            StructField("amount", DoubleType(), True),
            StructField("currency", StringType(), True),
            StructField("transaction_date", TimestampType(), True),
            StructField("description", StringType(), True),
            # Add more fields as needed
        ])
        
        return self.spark.createDataFrame(transactions, schema)
        
    def load_model(self, model_path: str) -> PipelineModel:
        """
        Load a Spark ML pipeline model
        
        Args:
            model_path: Path to the saved model
            
        Returns:
            Loaded Spark ML pipeline model
        """
        try:
            return PipelineModel.load(model_path)
        except Exception as e:
            logger.error(f"Error loading Spark model: {str(e)}")
            raise
            
    def process_batch(self, transactions: List[Dict[str, Any]], model_path: str) -> List[Dict[str, Any]]:
        """
        Process a batch of transactions using Spark
        
        Args:
            transactions: List of transaction dictionaries
            model_path: Path to the Spark ML model
            
        Returns:
            List of processed transactions with predictions
        """
        try:
            # Create DataFrame
            df = self.create_transaction_df(transactions)
            
            # Load model
            model = self.load_model(model_path)
            
            # Make predictions
            predictions = model.transform(df)
            
            # Convert back to list of dictionaries
            results = predictions.toPandas().to_dict('records')
            
            return results
        except Exception as e:
            logger.error(f"Error in batch processing: {str(e)}")
            raise
            
    def prepare_training_data(self, transactions: List[Dict[str, Any]]) -> DataFrame:
        """
        Prepare data for model training
        
        Args:
            transactions: List of transaction dictionaries
            
        Returns:
            Spark DataFrame ready for training
        """
        df = self.create_transaction_df(transactions)
        
        # Add feature engineering steps here
        # Example:
        # df = df.withColumn("amount_log", log(col("amount")))
        # df = df.withColumn("day_of_week", dayofweek(col("transaction_date")))
        
        return df
        
    def save_model(self, model: PipelineModel, model_path: str):
        """
        Save a Spark ML pipeline model
        
        Args:
            model: The model to save
            model_path: Path where to save the model
        """
        try:
            model.save(model_path)
        except Exception as e:
            logger.error(f"Error saving Spark model: {str(e)}")
            raise
            
    def __del__(self):
        """
        Cleanup Spark session
        """
        if hasattr(self, 'spark'):
            self.spark.stop() 