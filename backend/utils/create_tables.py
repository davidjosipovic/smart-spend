from model.common.entity import Entity  # Import your base class or models
from database import engine

# Create all tables
Entity.metadata.create_all(bind=engine)

print("Database tables created successfully!")